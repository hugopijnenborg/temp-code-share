   );
    const sigBytes = Uint8Array.from(atob(b64plain(signature)), (c) =>
      c.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const data = JSON.parse(b64text(payload));
    return Number(data?.exp) > Date.now() ? data : null;
  } catch {
    return null;
  }
}
const readToken = (request, name, env) =>
  verifySignedToken(cookieValue(request, name), env);
const mobileRequest = (request) =>
  /iPhone|iPad|iPod|Android|Mobile/i.test(
    request.headers.get("user-agent") || "",
  );
async function mobileSessionMinutes(env) {
  const row = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key='mobile_session_minutes'",
  ).first();
  const value = Number(row?.value || 30);
  return [15, 30, 60, 120, 240].includes(value) ? value : 30;
}
const signSession = async (user, env, request) => {
  const mobile = mobileRequest(request);
  const minutes = mobile ? await mobileSessionMinutes(env) : 43200;
  return {
    token: await signToken(
      {
        name: user.name,
        device: mobile ? "mobile" : "desktop",
        exp: Date.now() + minutes * 60000,
      },
      env,
    ),
    minutes,
  };
};
async function authorized(request, env) {
  const user = (await readToken(request, "__Host-dus_session", env)) || (await readToken(request, "dus_session", env));
  return user?.name && (await knownUser(user.name, env, env.DB)) ? { name: user.name } : null;
}
async function adminAuthorized(request, env) {
  const header = String(request.headers.get("authorization") || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const access = await verifySignedToken(token, env);
  if (access?.kind !== "admin" || !access.name || !access.organization_id)
    return null;
  const membership = await env.DB.prepare(
    "SELECT role_key FROM admin_memberships WHERE organization_id=? AND user_name=? COLLATE NOCASE AND active=1",
  )
    .bind(access.organization_id, access.name)
    .first();
  return membership
    ? {
        name: access.name,
        organization_id: access.organization_id,
        role: membership.role_key,
      }
    : null;
}
const isSuperAdmin = (admin) => admin?.role === "super_admin";
const sessionCookie = (value, request, minutes = 30) => {
  const base =
    "__Host-dus_session=" + value + "; Path=/; HttpOnly; Secure; SameSite=Strict";
  return mobileRequest(request)
    ? base + "; Max-Age=" + Math.round(minutes * 60)
    : base;
};
const challengeCookie = (value) =>
  "__Host-dus_webauthn=" +
  value +
  "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300";
const clearChallengeCookie =
  "__Host-dus_webauthn=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
function jsonWithCookies(data, cookies, status = 200) {
  const headers = new Headers({
    "content-type": "application/json;charset=utf-8",
    "cache-control": "no-store",
  });
  cookies.forEach((cookie) => headers.append("set-cookie", cookie));
  return new Response(JSON.stringify(data), { status, headers });
}
async function vapidToken(endpoint, env) {
  const aud = new URL(endpoint).origin,
    now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = b64url(
    JSON.stringify({ aud, exp: now + 43200, sub: "mailto:svu@dusbv.nl" }),
  );
  const input = header + "." + payload;
  const key = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(env.VAPID_PRIVATE_JWK),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(input),
  );
  return input + "." + b64url(signature);
}
async function sendPushes(env, submitter, jobId) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_JWK) return;
  const automation = await organizationSection(env.DB, "automation"),
    nowParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date()),
    timeMap = Object.fromEntries(
      nowParts.map((part) => [part.type, part.value]),
    ),
    currentTime = String(timeMap.hour || "00") + ":" + String(timeMap.minute || "00"),
    quietStart = String(automation.quiet_hours_start || "22:00"),
    quietEnd = String(automation.quiet_hours_end || "07:00"),
    inQuietHours =
      quietStart === quietEnd
        ? false
        : quietStart < quietEnd
          ? currentTime >= quietStart && currentTime < quietEnd
          : currentTime >= quietStart || currentTime < quietEnd;
  if (inQuietHours) return;
  const [subscriptions, settings] = await env.DB.batch([
      env.DB.prepare("SELECT id,endpoint FROM push_subscriptions"),
      env.DB.prepare(
        "SELECT key,value FROM app_settings WHERE key IN ('notification_title','notification_body')",
      ),
    ]),
    rows = subscriptions,
    values = Object.fromEntries(
      (settings.results || []).map((row) => [row.key, row.value]),
    ),
    replaceSubmitter = (value) =>
      String(value || "").replace(
        /\{indiener\}/gi,
        String(submitter || "onbekend"),
      ),
    title = replaceSubmitter(
      values.notification_title || "Nieuwe DUS-aanvraag",
    ),
    message = replaceSubmitter(
      values.notification_body ||
        "Er is een nieuwe klus geplaatst door {indiener}. Tik om de aanvraag te bekijken.",
    );
  await Promise.all(
    (rows.results || []).map(async (sub) => {
      try {
        await env.DB.batch([
          env.DB.prepare(
            "DELETE FROM push_messages WHERE subscription_id=?",
          ).bind(sub.id),
          env.DB.prepare(
            "INSERT INTO push_messages(subscription_id,title,body,job_id) VALUES (?,?,?,?)",
          ).bind(sub.id, title, message, jobId),
        ]);
        const token = await vapidToken(sub.endpoint, env);
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            TTL: "86400",
            Urgency: "high",
            Authorization: "vapid t=" + token + ", k=" + env.VAPID_PUBLIC_KEY,
          },
        });
        if (response.status === 404 || response.status === 410)
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE id=?")
            .bind(sub.id)
            .run();
      } catch {}
    }),
  );
}
async function sendReactionPushes(env, actor, job, option, config) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_JWK || !job) return;
  const automation = await organizationSection(env.DB, "automation"),
    parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()),
    time = Object.fromEntries(parts.map(part => [part.type, part.value])),
    current = String(time.hour || "00") + ":" + String(time.minute || "00"),
    start = String(automation.quiet_hours_start || "22:00"),
    end = String(automation.quiet_hours_end || "07:00"),
    quiet = start === end ? false : start < end ? current >= start && current < end : current >= start || current < end;
  if (quiet) return;
  const subscriptions = await env.DB.prepare("SELECT id,endpoint FROM push_subscriptions WHERE COALESCE(lower(user_name),'')<>lower(?)").bind(actor).all(),
    templateValues = {emoji:option.emoji,naam:actor,reactie:option.label,opdrachtgever:job.client||"Aanvraag",locatie:job.location||""},
    title = fillReactionTemplate(config.push_title_template, templateValues).trim(),
    message = fillReactionTemplate(config.push_body_template, templateValues).replace(/\s+·\s+\./,".").trim();
  await Promise.all((subscriptions.results || []).map(async sub => {
    try {
      await env.DB.prepare("INSERT INTO push_messages(subscription_id,title,body,job_id) VALUES (?,?,?,?)").bind(sub.id,title,message,job.id).run();
      const token = await vapidToken(sub.endpoint, env),response = await fetch(sub.endpoint,{method:"POST",headers:{TTL:"86400",Urgency:"high",Authorization:"vapid t="+token+", k="+env.VAPID_PUBLIC_KEY}});
      if (response.status === 404 || response.status === 410) await env.DB.prepare("DELETE FROM push_subscriptions WHERE id=?").bind(sub.id).run();
    } catch {}
  }));
}
async function saveAppSettings(db, values) {
  const statements = Object.entries(values).map(([key, value]) =>
    db
      .prepare(
        "INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
      )
      .bind(key, String(value)),
  );
  statements.push(
    db.prepare(
      "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
    ),
  );
  await db.batch(statements);
}
async function geocodeAddress(db, rawAddress) {
  const address = String(rawAddress || "").trim().replace(/\s+/g, " ").slice(0, 220),
    key = address.toLocaleLowerCase("nl-NL");
  if (!address) return { found: false };
  const cached = await db
    .prepare(
      "SELECT latitude,longitude,display_name,found FROM geocode_cache WHERE query=? AND ((found=1 AND datetime(updated_at)>=datetime('now','-365 days')) OR (found=0 AND datetime(updated_at)>=datetime('now','-1 hour')))",
    )
    .bind(key)
    .first();
  if (cached)
    return {
      found: Boolean(cached.found),
      latitude: cached.latitude,
      longitude: cached.longitude,
      display_name: cached.display_name,
      cached: true,
    };
  const cleaned = address
      .replace(/\([^)]*\)/g, " ")
      .replace(/\b(locatie|bouwplaats|projectadres)\s*:\s*/gi, " ")
      .replace(/\s+/g, " ")
      .trim(),
    parts = cleaned.split(/\s+[|;]\s+|\s+-\s+/).map((part) => part.trim()).filter(Boolean),
    variants = [
      address,
      cleaned,
      parts.length > 1 ? parts.slice(-2).join(", ") : "",
      parts.length > 1 ? parts.at(-1) : "",
    ].filter((value, index, values) => value && values.indexOf(value) === index),
    headers = {
      accept: "application/json",
      "user-agent": "DUS-Bemiddeling/1.0 (svu@dusbv.nl)",
    };
  let first = null,
    lastStatus = 200;
  for (let index = 0; index < variants.length; index++) {
    const endpoint =
        "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0&accept-language=nl&countrycodes=nl,be&q=" +
        encodeURIComponent(variants[index]),
      response = await fetch(endpoint, { headers });
    lastStatus = response.status;
    if (!response.ok) {
      if (response.status === 429) break;
      continue;
    }
    const rows = await response.json();
    first = Array.isArray(rows) ? rows[0] : null;
    if (first) break;
    if (index < variants.length - 1)
      await new Promise((resolve) => setTimeout(resolve, 1050));
  }
  if (!first && lastStatus === 429)
    throw new Error("De adresdienst vraagt tijdelijk om langzamer zoeken. Probeer het over één minuut opnieuw.");
  if (!first && lastStatus >= 500)
    throw new Error("De adresdienst is tijdelijk niet bereikbaar.");
  const
    latitude = first ? Number(first.lat) : null,
    longitude = first ? Number(first.lon) : null,
    found = Number.isFinite(latitude) && Number.isFinite(longitude);
  await db
    .prepare(
      "INSERT INTO geocode_cache(query,latitude,longitude,display_name,found,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(query) DO UPDATE SET latitude=excluded.latitude,longitude=excluded.longitude,display_name=excluded.display_name,found=excluded.found,updated_at=CURRENT_TIMESTAMP",
    )
    .bind(
      key,
      found ? latitude : null,
      found ? longitude : null,
      found ? String(first.display_name || address).slice(0, 500) : null,
      found ? 1 : 0,
    )
    .run();
  return {
    found,
    latitude: found ? latitude : null,
    longitude: found ? longitude : null,
    display_name: found ? String(first.display_name || address) : null,
    cached: false,
  };
}
const jsonValue = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
async function organizationSection(db, section) {
  const defaults = MANAGED_DEFAULTS[section] || {},
    rows = await db
      .prepare(
        "SELECT setting_key,value_json FROM organization_settings WHERE organization_id='dus' AND section=?",
      )
      .bind(section)
      .all(),
    values = { ...defaults };
  for (const row of rows.results || [])
    values[row.setting_key] = jsonValue(row.value_json, row.value_json);
  return values;
}
async function reactionConfiguration(db) {
  const stored = await organizationSection(db, "reactions"), defaults = MANAGED_DEFAULTS.reactions,
    supplied = Array.isArray(stored.items) ? stored.items : [], byKey = new Map(supplied.map(item => [String(item.key), item]));
  return {
    ...defaults,
    ...stored,
    items: defaults.items.map(fallback => ({ ...fallback, ...(byKey.get(fallback.key) || {}), key: fallback.key })).sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)),
  };
}
const fillReactionTemplate = (template, values) => String(template || "").replace(/\{(emoji|naam|reactie|opdrachtgever|locatie)\}/g, (_, key) => String(values[key] || ""));
async function managementData(db, organizationId = "dus") {
  const [settings, statuses, fields, widgets, roles, logs] = await Promise.all([
      db
        .prepare(
          "SELECT section,setting_key,value_json FROM organization_settings WHERE organization_id=?",
        )
        .bind(organizationId)
        .all(),
      db
        .prepare(
          "SELECT status_key,label,color,sort_order,active,locked FROM application_statuses WHERE organization_id=? ORDER BY sort_order",
        )
        .bind(organizationId)
        .all(),
      db
        .prepare(
          "SELECT id,field_key,label,field_type,options_json,required,visible,sort_order,archived FROM application_form_fields WHERE organization_id=? ORDER BY archived,sort_order,label",
        )
        .bind(organizationId)
        .all(),
      db
        .prepare(
          "SELECT widget_key,label,enabled,sort_order FROM dashboard_widgets WHERE organization_id=? ORDER BY sort_order",
        )
        .bind(organizationId)
        .all(),
      db
        .prepare(
          "SELECT user_name,role_key,permissions_json FROM user_roles WHERE organization_id=? ORDER BY CASE role_key WHEN 'beheerder' THEN 0 ELSE 1 END,user_name",
        )
        .bind(organizationId)
        .all(),
      db
        .prepare(
          "SELECT section,setting_key,old_value_json,new_value_json,changed_by,changed_at FROM settings_change_log WHERE organization_id=? ORDER BY id DESC LIMIT 100",
        )
        .bind(organizationId)
        .all(),
    ]),
    config = {
      branding: {
        primary_color: "#125B32",
        accent_color: "#F47B35",
        lime_color: "#9BD54B",
      },
      texts: {},
      messages: {},
      reactions: { ...MANAGED_DEFAULTS.reactions },
      navigation: { ...MANAGED_DEFAULTS.navigation },
      automation: { ...MANAGED_DEFAULTS.automation },
      ai: { ...MANAGED_DEFAULTS.ai },
    };
  for (const row of settings.results || []) {
    config[row.section] ??= {};
    config[row.section][row.setting_key] = jsonValue(
      row.value_json,
      row.value_json,
    );
  }
  return {
    config,
    statuses: statuses.results || [],
    fields: (fields.results || []).map((row) => ({
      ...row,
      options: jsonValue(row.options_json, []),
    })),
    widgets: widgets.results || [],
    roles: (roles.results || []).map((row) => ({
      ...row,
      permissions: jsonValue(row.permissions_json, []),
    })),
    logs: (logs.results || []).map((row) => ({
      ...row,
      old_value: jsonValue(row.old_value_json, row.old_value_json),
      new_value: jsonValue(row.new_value_json, row.new_value_json),
    })),
  };
}
async function saveManagedSection(
  db,
  section,
  values,
  user,
  organizationId = "dus",
) {
  const statements = [];
  for (const [key, value] of Object.entries(values)) {
    const old = await db
        .prepare(
          "SELECT value_json FROM organization_settings WHERE organization_id=? AND section=? AND setting_key=?",
        )
        .bind(organizationId, section, key)
        .first(),
      next = JSON.stringify(value);
    statements.push(
      db
        .prepare(
          "INSERT INTO organization_settings(organization_id,section,setting_key,value_json,updated_by,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,section,setting_key) DO UPDATE SET value_json=excluded.value_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP",
        )
        .bind(organizationId, section, key, next, user),
    );
    statements.push(
      db
        .prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,?,?,?,?,?)",
        )
        .bind(
          organizationId,
          section,
          key,
          old?.value_json ?? null,
          next,
          user,
        ),
    );
  }
  statements.push(
    db.prepare(
      "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
    ),
  );
  await db.batch(statements);
}
const sw = `self.addEventListener("install",()=>self.skipWaiting());self.addEventListener("activate",event=>event.waitUntil(clients.claim()));self.addEventListener("push",event=>{event.waitUntil(self.registration.pushManager.getSubscription().then(sub=>fetch("/api/push-message",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({endpoint:sub&&sub.endpoint})})).then(r=>r.json()).catch(()=>({})).then(s=>{const url=s.open_token?"/?melding="+encodeURIComponent(s.open_token):(s.job_id?"/?aanvraag="+encodeURIComponent(s.job_id):"/");return self.registration.showNotification(s.title||"Nieuwe DUS-aanvraag",{body:s.body||"Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",icon:"/icon.svg",badge:"/icon.svg",tag:"nieuwe-aanvraag-"+(s.id||Date.now()),renotify:true,data:{url}})}))});self.addEventListener("notificationclick",event=>{event.notification.close();const target=event.notification.data&&event.notification.data.url||"/";event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(async list=>{for(const client of list){if("navigate"in client){const next=await client.navigate(target);return next.focus()}if("focus"in client){client.postMessage({type:"open-aanvraag",url:target});return client.focus()}}return clients.openWindow(target)}))});`;
const manifest = {
  name: "DUS Aanvraagbord",
  short_name: "DUS Aanvragen",
  start_url: "/",
  display: "standalone",
  background_color: "#f4f5f1",
  theme_color: "#125b32",
  icons: [
    {
      src: "/icon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ],
};
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#125b32"/><g transform="translate(59 25) scale(5.7)">${brandPaths}</g></svg>`;
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url),
    p = url.pathname;
  if (p === "/")
    return new Response(page, {
      headers: {
        "content-type": "text/html;charset=utf-8",
        "cache-control": "no-store",
      },
    });
  if (p === "/sw.js")
    return new Response(sw, {
      headers: {
        "content-type": "application/javascript;charset=utf-8",
        "cache-control": "no-store",
        "service-worker-allowed": "/",
      },
    });
  if (p === "/manifest.webmanifest")
    return new Response(JSON.stringify(manifest), {
      headers: {
        "content-type": "application/manifest+json;charset=utf-8",
        "cache-control": "public,max-age=3600",
      },
    });
  if (p === "/icon.svg")
    return new Response(icon, {
      headers: {
        "content-type": "image/svg+xml;charset=utf-8",
        "cache-control": "public,max-age=86400",
      },
    });
  if (p === "/favicon.ico")
    return new Response(icon, {
      headers: {
        "content-type": "image/svg+xml;charset=utf-8",
        "cache-control": "public,max-age=86400",
      },
    });
  if (!p.startsWith("/api/"))
    return new Response("Niet gevonden", { status: 404 });
  const requestOrigin = request.headers.get("origin") || "",
    adminCrossOrigin =
      p.startsWith("/api/admin/") &&
      requestOrigin &&
      requestOrigin === String(env.ADMIN_PORTAL_ORIGIN || "");
  const appCrossOrigin =
  requestOrigin === "https://dus-aanvraagbord.vercel.app";
  if (request.method === "OPTIONS" && p.startsWith("/api/admin/")) {
    if (!adminCrossOrigin) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": requestOrigin,
        "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers": "authorization,content-type",
        "access-control-max-age": "86400",
        vary: "Origin",
      },
    });
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin"),
      fetchSite = request.headers.get("sec-fetch-site");
   if (
  !adminCrossOrigin &&
  !appCrossOrigin &&
  (fetchSite === "cross-site" || (origin && origin !== url.origin))
)
      return json(
        { error: "Dit verzoek is om veiligheidsredenen geblokkeerd." },
        403,
      );
    if (
      request.method !== "OPTIONS" &&
      !String(request.headers.get("content-type") || "")
        .toLowerCase()
        .startsWith("application/json")
    )
      return json(
        { error: "Alleen beveiligde JSON-verzoeken zijn toegestaan." },
        415,
      );
  }
  if (!env.DB) return json({ error: "Database is nog niet gekoppeld." }, 503);
  try {
    if (p === "/api/admin/login" && request.method === "POST") {
      const fingerprint = await loginFingerprint(request, env, "admin");
      if ((await loginAttemptCount(env.DB, fingerprint)) >= 5)
        return json(
          { error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." },
          429,
        );
      const d = await body(request),
        user = await userForPin(String(d.pin || ""), env, env.DB);
      if (!user) {
        await recordLoginFailure(env.DB, fingerprint);
        return json({ error: "Onjuiste beheerderscode." }, 401);
      }
      const membership = await env.DB.prepare(
        "SELECT organization_id,role_key FROM admin_memberships WHERE user_name=? COLLATE NOCASE AND active=1 ORDER BY CASE role_key WHEN 'super_admin' THEN 0 ELSE 1 END LIMIT 1",
      )
        .bind(user.name)
        .first();
      if (!membership) {
        await recordLoginFailure(env.DB, fingerprint);
        return json({ error: "Dit account heeft geen toegang tot beheer." }, 403);
      }
      await clearLoginFailures(env.DB, fingerprint);
      const token = await signToken(
        {
          kind: "admin",
          name: user.name,
          organization_id: membership.organization_id,
          exp: Date.now() + 60 * 60 * 1000,
        },
        env,
      );
      return json({
        token,
        user: {
          name: user.name,
          role: membership.role_key,
          organization_id: membership.organization_id,
        },
      });
    }
    if (p.startsWith("/api/admin/")) {
      const admin = await adminAuthorized(request, env);
      if (!admin)
        return json({ error: "De beheersessie is verlopen." }, 401);
      const organizationId = String(
        url.searchParams.get("organization_id") || admin.organization_id,
      );
      if (organizationId !== admin.organization_id && !isSuperAdmin(admin))
        return json({ error: "Geen toegang tot deze organisatie." }, 403);
      if (p === "/api/admin/session" && request.method === "GET")
        return json({ user: admin });
      if (p === "/api/admin/overview" && request.method === "GET") {
        const [organization, counts, flags, errors, backups] =
          await env.DB.batch([
            env.DB.prepare(
              "SELECT id,name,slug,active,created_at,updated_at FROM organizations WHERE id=?",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT (SELECT COUNT(*) FROM jobs WHERE organization_id=?) AS jobs,(SELECT COUNT(*) FROM workers WHERE organization_id=?) AS workers,(SELECT COUNT(*) FROM companies WHERE organization_id=?) AS companies,(SELECT COUNT(*) FROM admin_memberships WHERE organization_id=? AND active=1) AS admins",
            ).bind(
              organizationId,
              organizationId,
              organizationId,
              organizationId,
            ),
            env.DB.prepare(
              "SELECT COUNT(*) AS total,SUM(enabled) AS enabled FROM feature_flags WHERE organization_id=?",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT COUNT(*) AS total FROM system_events WHERE organization_id=? AND severity IN ('error','critical') AND datetime(created_at)>=datetime('now','-7 days')",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT COUNT(*) AS total,MAX(created_at) AS latest FROM backup_snapshots WHERE organization_id=?",
            ).bind(organizationId),
          ]);
        return json({
          organization: organization.results?.[0] || null,
          counts: counts.results?.[0] || {},
          flags: flags.results?.[0] || {},
          recent_errors: Number(errors.results?.[0]?.total || 0),
          backups: backups.results?.[0] || {},
        });
      }
      if (p === "/api/admin/config" && request.method === "GET") {
        const [organizations, memberships, flags, events, backups, trades, managed] =
          await Promise.all([
            isSuperAdmin(admin)
              ? env.DB.prepare(
                  "SELECT id,name,slug,active,created_at,updated_at FROM organizations ORDER BY name",
                ).all()
              : env.DB.prepare(
                  "SELECT id,name,slug,active,created_at,updated_at FROM organizations WHERE id=?",
                )
                  .bind(organizationId)
                  .all(),
            env.DB.prepare(
              "SELECT organization_id,user_name,role_key,active,updated_by,updated_at FROM admin_memberships WHERE organization_id=? ORDER BY user_name",
            )
              .bind(organizationId)
              .all(),
            env.DB.prepare(
              "SELECT flag_key,label,enabled,updated_by,updated_at FROM feature_flags WHERE organization_id=? ORDER BY label",
            )
              .bind(organizationId)
              .all(),
            env.DB.prepare(
              "SELECT id,severity,event_type,message,request_id,metadata_json,created_at FROM system_events WHERE organization_id=? ORDER BY id DESC LIMIT 100",
            )
              .bind(organizationId)
              .all(),
            env.DB.prepare(
              "SELECT id,label,checksum,created_by,created_at,restored_by,restored_at FROM backup_snapshots WHERE organization_id=? ORDER BY id DESC LIMIT 30",
            )
              .bind(organizationId)
              .all(),
            env.DB.prepare(
              "SELECT name,fee_rate,created_at,updated_at FROM trade_settings ORDER BY name COLLATE NOCASE",
            ).all(),
            managementData(env.DB, organizationId),
          ]);
        return json({
          current_user: admin,
          login_users: (await applicationUsers(env, env.DB)).map((item) => String(item.name || "")).filter(Boolean),
          organizations: organizations.results || [],
          memberships: memberships.results || [],
          flags: flags.results || [],
          events: events.results || [],
          backups: backups.results || [],
          trades: trades.results || [],
          ...managed,
        });
      }
      if (p === "/api/admin/system-health" && request.method === "GET") {
        const [counts, pushes, latestJob, latestChange, errors] = await env.DB.batch([
          env.DB.prepare(
            "SELECT (SELECT COUNT(*) FROM jobs WHERE organization_id=?) AS jobs,(SELECT COUNT(*) FROM workers WHERE organization_id=?) AS workers,(SELECT COUNT(*) FROM companies WHERE organization_id=?) AS companies",
          ).bind(organizationId, organizationId, organizationId),
          env.DB.prepare("SELECT COUNT(*) AS total FROM push_subscriptions"),
          env.DB.prepare("SELECT MAX(updated_at) AS latest FROM jobs WHERE organization_id=?").bind(organizationId),
          env.DB.prepare("SELECT MAX(changed_at) AS latest FROM settings_change_log WHERE organization_id=?").bind(organizationId),
          env.DB.prepare("SELECT COUNT(*) AS total FROM system_events WHERE organization_id=? AND severity IN ('error','critical') AND datetime(created_at)>=datetime('now','-24 hours')").bind(organizationId),
        ]);
        return json({
          ok: true,
          database: "connected",
          server_time: new Date().toISOString(),
          ai_configured: Boolean(env.OPENAI_API_KEY),
          push_configured: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
          push_subscriptions: Number(pushes.results?.[0]?.total || 0),
          recent_errors: Number(errors.results?.[0]?.total || 0),
          latest_job_update: latestJob.results?.[0]?.latest || null,
          latest_settings_change: latestChange.results?.[0]?.latest || null,
          counts: counts.results?.[0] || {},
        });
      }
      if (p === "/api/admin/data-quality" && request.method === "GET") {
        const [duplicateWorkers, duplicateCompanies, incompleteWorkers, incompleteJobs, orphanLinks, invalidDates] =
          await env.DB.batch([
            env.DB.prepare(
              "SELECT lower(trim(name)) AS normalized_name,replace(replace(replace(phone,' ',''),'-',''),'+','') AS normalized_phone,COUNT(*) AS total,GROUP_CONCAT(id) AS ids,GROUP_CONCAT(name,' | ') AS names,GROUP_CONCAT(phone,' | ') AS phones FROM workers WHERE organization_id=? GROUP BY normalized_name,normalized_phone HAVING COUNT(*)>1",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT lower(trim(name)) AS normalized_name,COUNT(*) AS total,GROUP_CONCAT(id) AS ids FROM companies WHERE organization_id=? GROUP BY normalized_name HAVING COUNT(*)>1",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT id,name,phone,trade FROM workers WHERE organization_id=? AND (trim(name)='' OR trim(phone)='' OR trim(trade)='') ORDER BY name LIMIT 100",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT id,client,location,trade,start_date,work FROM jobs WHERE organization_id=? AND (trim(client)='' OR trim(location)='' OR trim(trade)='' OR trim(start_date)='' OR trim(work)='') ORDER BY id DESC LIMIT 100",
            ).bind(organizationId),
            env.DB.prepare(
              "SELECT jw.job_id,jw.worker_id FROM job_workers jw LEFT JOIN jobs j ON j.id=jw.job_id LEFT JOIN workers w ON w.id=jw.worker_id WHERE j.id IS NULL OR w.id IS NULL LIMIT 100",
            ),
            env.DB.prepare(
              "SELECT id,client,start_date,end_date FROM jobs WHERE organization_id=? AND end_date IS NOT NULL AND end_date<>'' AND date(end_date)<date(start_date) ORDER BY id DESC LIMIT 100",
            ).bind(organizationId),
          ]);
        const issues = {
          duplicate_workers: duplicateWorkers.results || [],
          duplicate_companies: duplicateCompanies.results || [],
          incomplete_workers: incompleteWorkers.results || [],
          incomplete_jobs: incompleteJobs.results || [],
          orphan_links: orphanLinks.results || [],
          invalid_dates: invalidDates.results || [],
        };
        return json({
          checked_at: new Date().toISOString(),
          total_issues: Object.values(issues).reduce((sum, rows) => sum + rows.length, 0),
          issues,
        });
      }
      if (p === "/api/admin/export" && request.method === "GET") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om gegevens te exporteren." }, 403);
        const scopedQueries = {
          jobs: ["SELECT * FROM jobs WHERE organization_id=?", organizationId],
          workers: ["SELECT * FROM workers WHERE organization_id=?", organizationId],
          companies: ["SELECT * FROM companies WHERE organization_id=?", organizationId],
          members: ["SELECT * FROM members WHERE organization_id=?", organizationId],
          comments: ["SELECT * FROM comments WHERE organization_id=?", organizationId],
          reactions: ["SELECT r.* FROM job_reactions r JOIN jobs j ON j.id=r.job_id WHERE j.organization_id=?", organizationId],
          settings: ["SELECT * FROM organization_settings WHERE organization_id=?", organizationId],
          statuses: ["SELECT * FROM application_statuses WHERE organization_id=?", organizationId],
          fields: ["SELECT * FROM application_form_fields WHERE organization_id=?", organizationId],
          widgets: ["SELECT * FROM dashboard_widgets WHERE organization_id=?", organizationId],
          flags: ["SELECT * FROM feature_flags WHERE organization_id=?", organizationId],
          memberships: ["SELECT * FROM admin_memberships WHERE organization_id=?", organizationId],
          job_workers: ["SELECT jw.* FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE j.organization_id=?", organizationId],
          foremen: ["SELECT f.* FROM company_foremen f JOIN companies c ON c.id=f.company_id WHERE c.organization_id=?", organizationId],
          field_values: ["SELECT v.* FROM job_field_values v JOIN jobs j ON j.id=v.job_id WHERE j.organization_id=?", organizationId],
        };
        const data = {};
        for (const [key, [sql, binding]] of Object.entries(scopedQueries))
          data[key] = (await env.DB.prepare(sql).bind(binding).all()).results || [];
        return new Response(JSON.stringify({
          metadata: { organization_id: organizationId, exported_at: new Date().toISOString(), exported_by: admin.name, format_version: 1 },
          data,
        }, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "content-disposition": `attachment; filename="dus-export-${new Date().toISOString().slice(0,10)}.json"`,
            "cache-control": "no-store",
          },
        });
      }
      if (p === "/api/admin/user-security" && request.method === "PATCH") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag pincodes wijzigen." }, 403);
        const d = await body(request),
          userName = String(d.user_name || "").trim(),
          pin = String(d.pin || "");
        if (!(await applicationUsers(env, env.DB)).some((user) => String(user.name || "").toLowerCase() === userName.toLowerCase()))
          return json({ error: "Gebruiker niet gevonden." }, 404);
        if (!/^\d{6}$/.test(pin))
          return json({ error: "De pincode moet uit precies 6 cijfers bestaan." }, 400);
        const collision = await userForPin(pin, env, env.DB);
        if (collision && String(collision.name || "").toLowerCase() !== userName.toLowerCase())
          return json({ error: "Deze pincode is al bij een andere gebruiker in gebruik." }, 409);
        const old = await env.DB.prepare("SELECT updated_at FROM user_pins WHERE name=? COLLATE NOCASE").bind(userName).first(),
          pinHash = await secretHash(pin);
        await env.DB.batch([
          env.DB.prepare("INSERT INTO user_pins(name,pin_hash,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET pin_hash=excluded.pin_hash,updated_at=CURRENT_TIMESTAMP").bind(userName,pinHash),
          env.DB.prepare("DELETE FROM passkeys WHERE user_name=? COLLATE NOCASE").bind(userName),
          env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'security',?,?,?,?)").bind(organizationId,"pin:"+userName,JSON.stringify({updated_at:old?.updated_at||null}),JSON.stringify({pin_changed:true,passkeys_revoked:true}),admin.name),
        ]);
        return json({ ok: true, passkeys_revoked: true });
      }
      if (p === "/api/admin/users/name" && request.method === "PATCH") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag gebruikersnamen wijzigen." }, 403);
        const d = await body(request),
          oldName = String(d.old_name || "").trim().replace(/\s+/g, " "),
          newName = String(d.new_name || "").trim().replace(/\s+/g, " "),
          users = await applicationUsers(env, env.DB),
          current = users.find((item) => String(item.name || "").toLowerCase() === oldName.toLowerCase());
        if (!current) return json({ error: "Gebruiker niet gevonden." }, 404);
        if (newName.length < 2 || newName.length > 60)
          return json({ error: "Vul een geldige naam van 2 tot 60 tekens in." }, 400);
        if (oldName.toLowerCase() === newName.toLowerCase())
          return json({ error: "De nieuwe naam is gelijk aan de huidige naam." }, 400);
        if (users.some((item) => String(item.name || "").toLowerCase() === newName.toLowerCase()))
          return json({ error: "Er bestaat al een gebruiker met deze naam." }, 409);
        const storedPin = await env.DB.prepare("SELECT pin_hash FROM user_pins WHERE name=? COLLATE NOCASE").bind(oldName).first(),
          pinHash = storedPin?.pin_hash || (current.pin ? await secretHash(current.pin) : ""),
          sourceName = String(current.source_name || "").trim(),
          statements = [];
        if (!pinHash) return json({ error: "De beveiligde pincode van deze gebruiker kon niet worden behouden." }, 409);
        statements.push(
          env.DB.prepare("INSERT INTO user_pins(name,pin_hash,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)").bind(newName,pinHash),
          env.DB.prepare("DELETE FROM user_pins WHERE name=? COLLATE NOCASE").bind(oldName),
          env.DB.prepare("UPDATE passkeys SET user_name=? WHERE user_name=? COLLATE NOCASE").bind(newName,oldName),
          env.DB.prepare("UPDATE members SET name=? WHERE name=? COLLATE NOCASE AND organization_id=?").bind(newName,oldName,organizationId),
          env.DB.prepare("UPDATE jobs SET assignee=? WHERE assignee=? COLLATE NOCASE AND organization_id=?").bind(newName,oldName,organizationId),
          env.DB.prepare("UPDATE jobs SET created_by=? WHERE created_by=? COLLATE NOCASE AND organization_id=?").bind(newName,oldName,organizationId),
          env.DB.prepare("UPDATE comments SET author=? WHERE author=? COLLATE NOCASE AND organization_id=?").bind(newName,oldName,organizationId),
          env.DB.prepare("UPDATE job_reactions SET user_name=?,updated_at=CURRENT_TIMESTAMP WHERE user_name=? COLLATE NOCASE AND job_id IN (SELECT id FROM jobs WHERE organization_id=?)").bind(newName,oldName,organizationId),
          env.DB.prepare("UPDATE settings_change_log SET changed_by=? WHERE changed_by=? COLLATE NOCASE AND organization_id=?").bind(newName,oldName,organizationId),
          env.DB.prepare("INSERT INTO user_roles(organization_id,user_name,role_key,permissions_json,updated_by,updated_at) SELECT organization_id,?,role_key,permissions_json,?,CURRENT_TIMESTAMP FROM user_roles WHERE organization_id=? AND user_name=? COLLATE NOCASE ON CONFLICT(organization_id,user_name) DO UPDATE SET role_key=excluded.role_key,permissions_json=excluded.permissions_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP").bind(newName,admin.name,organizationId,oldName),
          env.DB.prepare("DELETE FROM user_roles WHERE organization_id=? AND user_name=? COLLATE NOCASE").bind(organizationId,oldName),
          env.DB.prepare("INSERT INTO admin_memberships(organization_id,user_name,role_key,active,updated_by,updated_at) SELECT organization_id,?,role_key,active,?,CURRENT_TIMESTAMP FROM admin_memberships WHERE organization_id=? AND user_name=? COLLATE NOCASE ON CONFLICT(organization_id,user_name) DO UPDATE SET role_key=excluded.role_key,active=excluded.active,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP").bind(newName,admin.name,organizationId,oldName),
          env.DB.prepare("DELETE FROM admin_memberships WHERE organization_id=? AND user_name=? COLLATE NOCASE").bind(organizationId,oldName)
        );
        if (sourceName)
          statements.push(env.DB.prepare("INSERT INTO user_aliases(source_name,new_name,updated_by,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(source_name) DO UPDATE SET new_name=excluded.new_name,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP").bind(sourceName,newName,admin.name));
        statements.push(
          env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'security','user_name',?,?,?)").bind(organizationId,JSON.stringify(oldName),JSON.stringify(newName),oldName.toLowerCase()===admin.name.toLowerCase()?newName:admin.name),
          env.DB.prepare("UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'")
        );
        await env.DB.batch(statements);
        return json({ ok:true, old_name:oldName, new_name:newName, renamed_current_user:oldName.toLowerCase()===admin.name.toLowerCase() });
      }
      if (p === "/api/admin/users" && request.method === "POST") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag gebruikers toevoegen." }, 403);
        const d = await body(request),
          userName = String(d.user_name || "").trim().replace(/\s+/g, " "),
          pin = String(d.pin || ""),
          role = String(d.role_key || "planner"),
          roles = {
            beheerder: ["manage_jobs", "manage_planning", "manage_workers", "manage_settings", "manage_security"],
            planner: ["manage_jobs", "manage_planning", "manage_workers"],
            lezer: [],
          };
        if (userName.length < 2 || userName.length > 60)
          return json({ error: "Vul een geldige naam van 2 tot 60 tekens in." }, 400);
        if (!/^\d{6}$/.test(pin))
          return json({ error: "De pincode moet uit precies 6 cijfers bestaan." }, 400);
        if (!roles[role])
          return json({ error: "Kies een geldige gebruikersrol." }, 400);
        if ((await applicationUsers(env, env.DB)).some((user) => String(user.name || "").toLowerCase() === userName.toLowerCase()))
          return json({ error: "Deze gebruiker bestaat al." }, 409);
        if (await userForPin(pin, env, env.DB))
          return json({ error: "Deze pincode is al bij een andere gebruiker in gebruik." }, 409);
        const pinHash = await secretHash(pin);
        await env.DB.batch([
          env.DB.prepare("INSERT INTO user_pins(name,pin_hash,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)").bind(userName, pinHash),
          env.DB.prepare("INSERT INTO user_roles(organization_id,user_name,role_key,permissions_json,updated_by,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)").bind(organizationId, userName, role, JSON.stringify(roles[role]), admin.name),
          env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'security',?,NULL,?,?)").bind(organizationId, "user:"+userName, JSON.stringify({ user_created: true, role_key: role }), admin.name),
          env.DB.prepare("UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'"),
        ]);
        return json({ ok: true, user_name: userName, role_key: role }, 201);
      }
      const revokePasskeys = p.match(/^\/api\/admin\/passkeys\/([^/]+)$/);
      if (revokePasskeys && request.method === "DELETE") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag Face ID intrekken." }, 403);
        const userName = decodeURIComponent(revokePasskeys[1]),
          result = await env.DB.prepare("DELETE FROM passkeys WHERE user_name=? COLLATE NOCASE").bind(userName).run();
        await env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'security',?,NULL,?,?)").bind(organizationId,"passkeys:"+userName,JSON.stringify({revoked:Number(result.meta.changes||0)}),admin.name).run();
        return json({ ok: true, revoked: Number(result.meta.changes || 0) });
      }
      if (p === "/api/admin/operations" && request.method === "GET") {
        const [jobs, workers, companies, foremen, links] = await env.DB.batch([
          env.DB.prepare(
            "SELECT id,client,foreman,location,trade,start_date,end_date,people,priority,purchase_rate,work,status,assignee,created_by,created_at,updated_at FROM jobs WHERE organization_id=? ORDER BY datetime(updated_at) DESC,id DESC LIMIT 750",
          ).bind(organizationId),
          env.DB.prepare(
            "SELECT id,name,phone,trade,location,manual_available,notes,created_at,updated_at FROM workers WHERE organization_id=? ORDER BY name COLLATE NOCASE",
          ).bind(organizationId),
          env.DB.prepare(
            "SELECT id,name,created_at FROM companies WHERE organization_id=? ORDER BY name COLLATE NOCASE",
          ).bind(organizationId),
          env.DB.prepare(
            "SELECT f.id,f.company_id,f.name FROM company_foremen f JOIN companies c ON c.id=f.company_id WHERE c.organization_id=? ORDER BY f.name COLLATE NOCASE",
          ).bind(organizationId),
          env.DB.prepare(
            "SELECT jw.job_id,jw.worker_id,jw.system_planned,jw.address_sent,jw.hourly_rate,jw.fee,w.name FROM job_workers jw JOIN jobs j ON j.id=jw.job_id JOIN workers w ON w.id=jw.worker_id WHERE j.organization_id=? ORDER BY jw.job_id,w.name",
          ).bind(organizationId),
        ]);
        const foremenByCompany = new Map();
        for (const person of foremen.results || []) {
          const key = Number(person.company_id);
          if (!foremenByCompany.has(key)) foremenByCompany.set(key, []);
          foremenByCompany.get(key).push(person);
        }
        const workersByJob = new Map();
        for (const link of links.results || []) {
          const key = Number(link.job_id);
          if (!workersByJob.has(key)) workersByJob.set(key, []);
          workersByJob.get(key).push(link);
        }
        return json({
          jobs: (jobs.results || []).map((job) => ({
            ...job,
            workers: workersByJob.get(Number(job.id)) || [],
          })),
          workers: workers.results || [],
          companies: (companies.results || []).map((company) => ({
            ...company,
            foremen: foremenByCompany.get(Number(company.id)) || [],
          })),
        });
      }
      const adminJob = p.match(/^\/api\/admin\/jobs\/(\d+)$/);
      if (adminJob && request.method === "PATCH") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om aanvragen te wijzigen." }, 403);
        const id = Number(adminJob[1]),
          previous = await env.DB.prepare(
            "SELECT id,client,foreman,location,trade,start_date,end_date,people,priority,purchase_rate,work,status,assignee FROM jobs WHERE id=? AND organization_id=?",
          ).bind(id, organizationId).first();
        if (!previous) return json({ error: "Aanvraag niet gevonden." }, 404);
        const d = await body(request),
          next = {
            client: String(d.client ?? previous.client).trim().slice(0, 100),
            foreman: String(d.foreman ?? previous.foreman ?? "").trim().slice(0, 100) || null,
            location: String(d.location ?? previous.location).trim().slice(0, 120),
            trade: validTrade(d.trade ?? previous.trade),
            start_date: String(d.start_date ?? previous.start_date),
            end_date: String(d.end_date ?? previous.end_date ?? d.start_date ?? previous.start_date),
            people: Math.max(1, Math.min(100, Number(d.people ?? previous.people) || 1)),
            priority: String(d.priority ?? previous.priority).trim().slice(0, 30),
            purchase_rate: Number.isFinite(Number(d.purchase_rate)) ? Number(d.purchase_rate) : previous.purchase_rate,
            work: String(d.work ?? previous.work).trim().slice(0, 5000),
            status: String(d.status ?? previous.status),
            assignee: String(d.assignee ?? previous.assignee ?? "").trim().slice(0, 80) || null,
          };
        if (!next.client || !next.location || !next.trade || !next.work || !/^\d{4}-\d{2}-\d{2}$/.test(next.start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(next.end_date))
          return json({ error: "Controleer opdrachtgever, locatie, vakgroep, datums en werkzaamheden." }, 400);
        if (!["Nieuw", "In behandeling", "Ingevuld", "Geannuleerd"].includes(next.status))
          return json({ error: "Kies een geldige status." }, 400);
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE jobs SET client=?,foreman=?,location=?,trade=?,start_date=?,end_date=?,people=?,priority=?,purchase_rate=?,work=?,status=?,assignee=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?",
          ).bind(next.client,next.foreman,next.location,next.trade,next.start_date,next.end_date,next.people,next.priority,next.purchase_rate,next.work,next.status,next.assignee,id,organizationId),
          env.DB.prepare(
            "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'operations',?,?,?,?)",
          ).bind(organizationId,"job:"+id,JSON.stringify(previous),JSON.stringify(next),admin.name),
        ]);
        return json({ ok: true });
      }
      const adminWorker = p.match(/^\/api\/admin\/workers\/(\d+)$/);
      if (adminWorker && request.method === "PATCH") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om vakmensen te wijzigen." }, 403);
        const id = Number(adminWorker[1]),
          previous = await env.DB.prepare(
            "SELECT id,name,phone,trade,location,manual_available,notes FROM workers WHERE id=? AND organization_id=?",
          ).bind(id,organizationId).first();
        if (!previous) return json({ error: "Vakman niet gevonden." }, 404);
        const d=await body(request),next={
          name:String(d.name??previous.name).trim().slice(0,100),
          phone:String(d.phone??previous.phone).trim().slice(0,40),
          trade:String(d.trade??previous.trade).trim().slice(0,250),
          location:String(d.location??previous.location??"").trim().slice(0,120)||null,
          manual_available:d.manual_available===false||Number(d.manual_available)===0?0:1,
          notes:String(d.notes??previous.notes??"").trim().slice(0,2000)||null,
        };
        if(!next.name||!next.phone||!next.trade)return json({error:"Naam, telefoonnummer en vakgroep zijn verplicht."},400);
        await env.DB.batch([
          env.DB.prepare("UPDATE workers SET name=?,phone=?,trade=?,location=?,available=?,manual_available=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?").bind(next.name,next.phone,next.trade,next.location,next.manual_available,next.manual_available,next.notes,id,organizationId),
          env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'operations',?,?,?,?)").bind(organizationId,"worker:"+id,JSON.stringify(previous),JSON.stringify(next),admin.name),
        ]);
        return json({ok:true});
      }
      if (p === "/api/admin/workers/merge" && request.method === "POST") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om vakmensen samen te voegen." }, 403);
        const d = await body(request),
          keepId = Number(d.keep_id),
          removeId = Number(d.remove_id);
        if (!keepId || !removeId || keepId === removeId)
          return json({ error: "Kies twee verschillende registraties." }, 400);
        const [keep, remove] = await Promise.all([
          env.DB.prepare("SELECT id,name,phone,trade,manual_available,notes FROM workers WHERE id=? AND organization_id=?").bind(keepId, organizationId).first(),
          env.DB.prepare("SELECT id,name,phone,trade,manual_available,notes FROM workers WHERE id=? AND organization_id=?").bind(removeId, organizationId).first(),
        ]);
        if (!keep || !remove) return json({ error: "Een van de vakmensen is niet gevonden." }, 404);
        const mergedTrades = [...new Set(
          [keep.trade, remove.trade].flatMap((value) => String(value || "").split(",")).map((value) => value.trim()).filter(Boolean),
        )].join(", "),
          mergedNotes = [...new Set([keep.notes, remove.notes].map((value) => String(value || "").trim()).filter(Boolean))].join("\n");
        const merged = {
          name: String(d.name || keep.name).trim().slice(0,100),
          phone: String(d.phone || keep.phone).trim().slice(0,40),
          trade: String(d.trade || mergedTrades).trim().slice(0,250),
          notes: String(d.notes ?? mergedNotes).trim().slice(0,2000) || null,
          manual_available: Number(keep.manual_available) && Number(remove.manual_available) ? 1 : 0,
        };
        if (!merged.name || !merged.phone || !merged.trade)
          return json({ error: "Naam, telefoonnummer en vakgroep zijn verplicht." }, 400);
        await env.DB.batch([
          env.DB.prepare(
            "INSERT OR IGNORE INTO job_workers(job_id,worker_id,linked_by,linked_at,system_planned,address_sent,hourly_rate,fee) SELECT job_id,?,linked_by,linked_at,system_planned,address_sent,hourly_rate,fee FROM job_workers WHERE worker_id=?",
          ).bind(keepId, removeId),
          env.DB.prepare("DELETE FROM job_workers WHERE worker_id=?").bind(removeId),
          env.DB.prepare("UPDATE rate_changes SET worker_id=? WHERE worker_id=?").bind(keepId, removeId),
          env.DB.prepare("UPDATE workers SET name=?,phone=?,trade=?,available=?,manual_available=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?").bind(merged.name,merged.phone,merged.trade,merged.manual_available,merged.manual_available,merged.notes,keepId,organizationId),
          env.DB.prepare("DELETE FROM workers WHERE id=? AND organization_id=?").bind(removeId, organizationId),
          env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'data_quality',?,?,?,?)").bind(organizationId,"worker_merge:"+removeId,JSON.stringify({keep,remove}),JSON.stringify({kept_id:keepId,removed_id:removeId,merged}),admin.name),
        ]);
        return json({ ok: true, kept_id: keepId, removed_id: removeId });
      }
      if (p === "/api/admin/companies" && request.method === "POST") {
        if (!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om opdrachtgevers toe te voegen."},403);
        const d=await body(request),name=String(d.name||"").trim().slice(0,100);
        if(!name)return json({error:"Vul een bedrijfsnaam in."},400);
        const result=await env.DB.prepare("INSERT INTO companies(name,organization_id) VALUES(?,?) ON CONFLICT(name) DO NOTHING").bind(name,organizationId).run();
        return json({ok:true,id:result.meta.last_row_id||null},201);
      }
      const adminForemen=p.match(/^\/api\/admin\/companies\/(\d+)\/foremen$/);
      if(adminForemen&&request.method==="POST"){
        if(!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om uitvoerders toe te voegen."},403);
        const companyId=Number(adminForemen[1]),company=await env.DB.prepare("SELECT id FROM companies WHERE id=? AND organization_id=?").bind(companyId,organizationId).first(),d=await body(request),name=String(d.name||"").trim().slice(0,100);
        if(!company)return json({error:"Opdrachtgever niet gevonden."},404);
        if(!name)return json({error:"Vul een naam van de uitvoerder in."},400);
        const result=await env.DB.prepare("INSERT OR IGNORE INTO company_foremen(company_id,name) VALUES(?,?)").bind(companyId,name).run();
        return json({ok:true,id:result.meta.last_row_id||null},201);
      }
      if (p === "/api/admin/organizations" && request.method === "POST") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag organisaties toevoegen." }, 403);
        const d = await body(request),
          name = String(d.name || "").trim().slice(0,80),
          slug = String(d.slug || "").trim().toLowerCase();
        if (!name || !/^[a-z][a-z0-9-]{2,39}$/.test(slug))
          return json({ error: "Vul een geldige organisatienaam en slug in." }, 400);
        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO organizations(id,name,slug,active) VALUES(?,?,?,1)",
        ).bind(id,name,slug).run();
        await env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'organizations',?,NULL,?,?)",
        ).bind(id,id,JSON.stringify({name,slug,active:true}),admin.name).run();
        return json({ok:true,id},201);
      }
      if (p === "/api/admin/statuses" && request.method === "PATCH") {
        if (!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om statussen te wijzigen."},403);
        const d=await body(request),items=Array.isArray(d.items)?d.items:[];
        if(!items.length||items.some(item=>!String(item.status_key||"")||!String(item.label||"").trim()||!/^#[0-9A-Fa-f]{6}$/.test(String(item.color||""))))
          return json({error:"Controleer de statusnamen en kleuren."},400);
        const old=await env.DB.prepare("SELECT status_key,label,color,sort_order,active FROM application_statuses WHERE organization_id=? ORDER BY sort_order").bind(organizationId).all(),statements=items.map((item,index)=>env.DB.prepare("INSERT INTO application_statuses(organization_id,status_key,label,color,sort_order,active,locked,updated_by,updated_at) VALUES(?,?,?,?,?,?,1,?,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,status_key) DO UPDATE SET label=excluded.label,color=excluded.color,sort_order=excluded.sort_order,active=excluded.active,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP").bind(organizationId,String(item.status_key),String(item.label).trim().slice(0,40),String(item.color).toUpperCase(),index+1,item.active===false?0:1,admin.name));
        statements.push(env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'statuses','all',?,?,?)").bind(organizationId,JSON.stringify(old.results||[]),JSON.stringify(items),admin.name));await env.DB.batch(statements);return json({ok:true});
      }
      if (p === "/api/admin/dashboard" && request.method === "PATCH") {
        if (!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om het dashboard te wijzigen."},403);
        const d=await body(request),items=Array.isArray(d.items)?d.items:[];
        if(!items.length)return json({error:"Geen widgets ontvangen."},400);
        const statements=items.map((item,index)=>env.DB.prepare("UPDATE dashboard_widgets SET enabled=?,sort_order=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE organization_id=? AND widget_key=?").bind(item.enabled?1:0,index+1,admin.name,organizationId,String(item.widget_key)));
        statements.push(env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'dashboard','widgets',NULL,?,?)").bind(organizationId,JSON.stringify(items),admin.name));await env.DB.batch(statements);return json({ok:true});
      }
      if (p === "/api/admin/trades" && request.method === "PATCH") {
        if (!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om vakgroepen te wijzigen."},403);
        const d=await body(request),items=Array.isArray(d.items)?d.items:[];
        if(!items.length||items.some(item=>!validTrade(item.name)||!Number.isFinite(Number(item.fee_percent))||Number(item.fee_percent)<0||Number(item.fee_percent)>100))
          return json({error:"Controleer de vakgroepen en feepercentages."},400);
        const statements=items.map(item=>env.DB.prepare("INSERT INTO trade_settings(name,fee_rate,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET fee_rate=excluded.fee_rate,updated_at=CURRENT_TIMESTAMP").bind(validTrade(item.name),Number(item.fee_percent)/100));
        statements.push(env.DB.prepare("INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'trades','all',NULL,?,?)").bind(organizationId,JSON.stringify(items),admin.name));await env.DB.batch(statements);return json({ok:true});
      }
      if (p === "/api/admin/fields" && request.method === "POST") {
        if (!["super_admin","organization_admin"].includes(admin.role))
          return json({error:"Geen rechten om formulieren te wijzigen."},403);
        const d=await body(request),label=String(d.label||"").trim().slice(0,60),type=String(d.field_type||""),types=["text","textarea","number","date","select","checkbox"],options=Array.isArray(d.options)?d.options.map(v=>String(v).trim()).filter(Boolean):[];
        if(!label||!types.includes(type)||type==="select"&&!options.length)return json({error:"Controleer veldnaam, type en keuzes."},400);
        const id=Number(d.id)||0;
        if(id){await env.DB.prepare("UPDATE application_form_fields SET label=?,field_type=?,options_json=?,required=?,visible=?,sort_order=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?").bind(label,type,JSON.stringify(options),d.required?1:0,d.visible===false?0:1,Math.max(1,Number(d.sort_order)||100),admin.name,id,organizationId).run();return json({ok:true,id})}
        const key=label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,40)+"_"+Date.now().toString(36),result=await env.DB.prepare("INSERT INTO application_form_fields(organization_id,field_key,label,field_type,options_json,required,visible,sort_order,created_by) VALUES(?,?,?,?,?,?,?,?,?)").bind(organizationId,key,label,type,JSON.stringify(options),d.required?1:0,d.visible===false?0:1,Math.max(1,Number(d.sort_order)||100),admin.name).run();return json({ok:true,id:result.meta.last_row_id},201);
      }
      const adminField=p.match(/^\/api\/admin\/fields\/(\d+)$/);
      if(adminField&&request.method==="DELETE"){if(!["super_admin","organization_admin"].includes(admin.role))return json({error:"Geen rechten om velden te archiveren."},403);await env.DB.prepare("UPDATE application_form_fields SET archived=1,visible=0,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?").bind(admin.name,Number(adminField[1]),organizationId).run();return json({ok:true})}
      const adminSettings = p.match(
        /^\/api\/admin\/settings\/(branding|texts|messages|defaults|notifications|security|navigation|automation|ai|map|reactions)$/,
      );
      if (adminSettings && request.method === "PATCH") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om instellingen te wijzigen." }, 403);
        const d = await body(request),
          values = d.values && typeof d.values === "object" ? d.values : {};
        if (!Object.keys(values).length || Object.keys(values).length > 50)
          return json({ error: "Geen geldige instellingen ontvangen." }, 400);
        if (adminSettings[1] === "automation") {
          const allowed = new Set([
            "notify_new_job",
            "auto_status_on_link",
            "block_overlapping_workers",
            "release_after_end_date",
            "quiet_hours_start",
            "quiet_hours_end",
          ]);
          if (
            Object.keys(values).some((key) => !allowed.has(key)) ||
            !/^\d{2}:\d{2}$/.test(String(values.quiet_hours_start || "")) ||
            !/^\d{2}:\d{2}$/.test(String(values.quiet_hours_end || ""))
          )
            return json({ error: "Controleer de automatiseringsinstellingen." }, 400);
          for (const key of [
            "notify_new_job",
            "auto_status_on_link",
            "block_overlapping_workers",
            "release_after_end_date",
          ])
            values[key] =
              values[key] === true ||
              values[key] === "true" ||
              values[key] === "1";
        }
        if (adminSettings[1] === "ai") {
          const allowed = new Set([
            "enabled",
            "model",
            "reasoning_effort",
            "instructions",
          ]);
          if (
            Object.keys(values).some((key) => !allowed.has(key)) ||
            !/^gpt-[a-zA-Z0-9._-]+$/.test(String(values.model || "")) ||
            !["low", "medium", "high"].includes(
              String(values.reasoning_effort || ""),
            ) ||
            !String(values.instructions || "").trim() ||
            String(values.instructions).length > 5000
          )
            return json({ error: "Controleer de AI-instellingen." }, 400);
          values.enabled =
            values.enabled === true ||
            values.enabled === "true" ||
            values.enabled === "1";
          values.instructions = String(values.instructions).trim();
        }
        if (adminSettings[1] === "navigation") {
          const allowed = new Set([
            "board_title",
            "planning_title",
            "workers_title",
            "clients_title",
            "settings_title",
            "team_title",
            "new_title",
          ]);
          if (
            Object.keys(values).some((key) => !allowed.has(key)) ||
            Object.values(values).some(
              (value) => !String(value || "").trim() || String(value).length > 40,
            )
          )
            return json({ error: "Controleer de paginatitels." }, 400);
          for (const key of Object.keys(values))
            values[key] = String(values[key]).trim();
        }
        if (adminSettings[1] === "map") {
          const allowed = new Set(["enabled","geocoding_enabled","default_zoom","center_lat","center_lng","road_factor","average_speed","show_unavailable","show_filled"]);
          if (Object.keys(values).some((key)=>!allowed.has(key)))
            return json({error:"Onbekende kaartinstelling."},400);
          for (const key of ["enabled","geocoding_enabled","show_unavailable","show_filled"])
            values[key]=values[key]===true||values[key]==="true"||values[key]==="1";
          values.default_zoom=Math.max(5,Math.min(16,Number(values.default_zoom)||8));
          values.center_lat=Math.max(-90,Math.min(90,Number(values.center_lat)||52.05));
          values.center_lng=Math.max(-180,Math.min(180,Number(values.center_lng)||4.48));
          values.road_factor=Math.max(1,Math.min(2.5,Number(values.road_factor)||1.25));
          values.average_speed=Math.max(10,Math.min(130,Number(values.average_speed)||65));
        }
        if (adminSettings[1] === "reactions") {
          const allowedKeys = ["seen","claim","looking","question"], items = Array.isArray(values.items) ? values.items : [];
          if (items.length !== allowedKeys.length || new Set(items.map(item=>String(item.key))).size !== allowedKeys.length || items.some(item=>!allowedKeys.includes(String(item.key))||!String(item.emoji||"").trim()||String(item.emoji).length>16||!String(item.label||"").trim()||String(item.label).length>40))
            return json({error:"Controleer de vier reacties, emoji’s en teksten."},400);
          values.items = items.map((item,index)=>({key:String(item.key),emoji:String(item.emoji).trim(),label:String(item.label).trim(),enabled:item.enabled===true||item.enabled==="true"||item.enabled==="1",notify:item.notify===true||item.notify==="true"||item.notify==="1",sort_order:index+1}));
          for (const key of ["panel_title","panel_help","push_title_template","push_body_template"]) values[key]=String(values[key]||"").trim();
          if (!values.panel_title||values.panel_title.length>60||!values.panel_help||values.panel_help.length>160||!values.push_title_template||values.push_title_template.length>120||!values.push_body_template||values.push_body_template.length>240)
            return json({error:"Controleer de reactieteksten en pushsjablonen."},400);
        }
        await saveManagedSection(
          env.DB,
          adminSettings[1],
          values,
          admin.name,
          organizationId,
        );
        return json({ ok: true });
      }
      if (p === "/api/admin/feature-flags" && request.method === "PATCH") {
        if (!["super_admin", "organization_admin"].includes(admin.role))
          return json({ error: "Geen rechten om functies te wijzigen." }, 403);
        const d = await body(request),
          key = String(d.flag_key || ""),
          enabled = d.enabled ? 1 : 0,
          current = await env.DB.prepare(
            "SELECT enabled FROM feature_flags WHERE organization_id=? AND flag_key=?",
          )
            .bind(organizationId, key)
            .first();
        if (!current) return json({ error: "Functie niet gevonden." }, 404);
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE feature_flags SET enabled=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE organization_id=? AND flag_key=?",
          ).bind(enabled, admin.name, organizationId, key),
          env.DB.prepare(
            "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES(?,'feature_flags',?,?,?,?)",
          ).bind(
            organizationId,
            key,
            JSON.stringify(Boolean(current.enabled)),
            JSON.stringify(Boolean(enabled)),
            admin.name,
          ),
        ]);
        return json({ ok: true });
      }
      if (p === "/api/admin/memberships" && request.method === "PATCH") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag rollen wijzigen." }, 403);
        const d = await body(request),
          userName = String(d.user_name || "").trim(),
          role = String(d.role_key || ""),
          allowed = ["super_admin", "organization_admin", "support", "read_only"];
        if (!userName || !allowed.includes(role))
          return json({ error: "Ongeldige gebruiker of rol." }, 400);
        await env.DB.prepare(
          "INSERT INTO admin_memberships(organization_id,user_name,role_key,active,updated_by,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,user_name) DO UPDATE SET role_key=excluded.role_key,active=excluded.active,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP",
        )
          .bind(
            organizationId,
            userName,
            role,
            d.active === false ? 0 : 1,
            admin.name,
          )
          .run();
        return json({ ok: true });
      }
      if (p === "/api/admin/backups" && request.method === "POST") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag back-ups maken." }, 403);
        const tables = [
            "jobs",
            "workers",
            "job_workers",
            "companies",
            "company_foremen",
            "members",
            "comments",
            "job_reactions",
            "trade_settings",
            "organization_settings",
            "application_statuses",
            "application_form_fields",
            "job_field_values",
            "dashboard_widgets",
            "feature_flags",
            "admin_memberships",
          ],
          snapshot = {};
        for (const table of tables) {
          const scoped = [
            "jobs",
            "workers",
            "companies",
            "members",
            "comments",
            "organization_settings",
            "application_statuses",
            "application_form_fields",
            "dashboard_widgets",
            "feature_flags",
            "admin_memberships",
          ].includes(table);
          const result = table === "job_reactions"
            ? await env.DB.prepare("SELECT r.* FROM job_reactions r JOIN jobs j ON j.id=r.job_id WHERE j.organization_id=?").bind(organizationId).all()
            : scoped
            ? await env.DB.prepare(
                `SELECT * FROM ${table} WHERE organization_id=?`,
              )
                .bind(organizationId)
                .all()
            : await env.DB.prepare(`SELECT * FROM ${table}`).all();
          snapshot[table] = result.results || [];
        }
        const payload = JSON.stringify(snapshot),
          checksum = await secretHash(payload),
          d = await body(request),
          label = String(d.label || "Handmatige back-up")
            .trim()
            .slice(0, 80);
        const result = await env.DB.prepare(
          "INSERT INTO backup_snapshots(organization_id,label,snapshot_json,checksum,created_by) VALUES(?,?,?,?,?)",
        )
          .bind(organizationId, label, payload, checksum, admin.name)
          .run();
        return json({ ok: true, id: result.meta.last_row_id, checksum }, 201);
      }
      const verifyBackup = p.match(/^\/api\/admin\/backups\/(\d+)\/verify$/);
      if (verifyBackup && request.method === "POST") {
        if (!isSuperAdmin(admin))
          return json({ error: "Alleen een Superbeheerder mag back-ups controleren." }, 403);
        const backup = await env.DB.prepare(
          "SELECT id,label,snapshot_json,checksum,created_at FROM backup_snapshots WHERE id=? AND organization_id=?",
        ).bind(Number(verifyBackup[1]), organizationId).first();
        if (!backup) return json({ error: "Back-up niet gevonden." }, 404);
        let parsed;
        try {
          parsed = JSON.parse(backup.snapshot_json);
        } catch {
          return json({ ok: false, valid: false, error: "De back-up bevat geen geldige gegevens." }, 422);
        }
        const calculated = await secretHash(backup.snapshot_json),
          tables = Object.keys(parsed || {}),
          records = tables.reduce((sum, table) => sum + (Array.isArray(parsed[table]) ? parsed[table].length : 0), 0),
          valid = await sameSecret(calculated, backup.checksum);
        return json({ ok: valid, valid, label: backup.label, created_at: backup.created_at, tables: tables.length, records }, valid ? 200 : 422);
      }
      return json({ error: "Beheerroute niet gevonden." }, 404);
    }
    if (p === "/api/public-settings" && request.method === "GET") {
      const rows = await env.DB.prepare(
          "SELECT key,value FROM app_settings WHERE key IN ('notification_title','notification_body')",
        ).all(),
        values = Object.fromEntries(
          (rows.results || []).map((row) => [row.key, row.value]),
        );
      return json({
        notification_title: values.notification_title || "Nieuwe DUS-aanvraag",
        notification_body:
          values.notification_body ||
          "Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",
      });
    }
    if (p === "/api/push-message" && request.method === "POST") {
      const d = await body(request),
        endpoint = String(d.endpoint || "");
      if (!endpoint.startsWith("https://"))
        return json({ error: "Ongeldige pushregistratie." }, 400);
      const message = await env.DB.prepare(
        "SELECT pm.id,pm.title,pm.body,pm.job_id,ps.user_name FROM push_messages pm JOIN push_subscriptions ps ON ps.id=pm.subscription_id WHERE ps.endpoint=? AND pm.delivered=0 ORDER BY pm.id LIMIT 1",
      )
        .bind(endpoint)
        .first();
      if (!message) return json({});
      await env.DB.prepare("UPDATE push_messages SET delivered=1 WHERE id=?")
        .bind(message.id)
        .run();
      const openToken =
        message.user_name && (await knownUser(message.user_name, env, env.DB))
          ? await signToken(
              {
                kind: "notification",
                message_id: message.id,
                job_id: message.job_id,
                name: message.user_name,
                exp: Date.now() + 86400000,
              },
              env,
            )
          : null;
      return json({
        id: message.id,
        title: message.title,
        body: message.body,
        job_id: message.job_id,
        open_token: openToken,
      });
    }
    if (p === "/api/notification-open" && request.method === "POST") {
      const d = await body(request),
        access = await verifySignedToken(String(d.token || ""), env);
      if (access?.kind !== "notification" || !(await knownUser(access.name, env, env.DB)))
        return json({ error: "Deze melding is verlopen." }, 401);
      const used = await env.DB.prepare(
        "UPDATE push_messages SET opened=1 WHERE id=? AND job_id=? AND opened=0",
      )
        .bind(Number(access.message_id), Number(access.job_id))
        .run();
      if (!Number(used.meta?.changes || 0))
        return json({ error: "Deze melding is al geopend of verlopen." }, 401);
      const job = await env.DB.prepare("SELECT id FROM jobs WHERE id=?")
        .bind(Number(access.job_id))
        .first();
      if (!job) return json({ error: "Deze aanvraag bestaat niet meer." }, 404);
      const session = await signSession({ name: access.name }, env, request),
        configured = !!(await env.DB.prepare(
          "SELECT 1 AS ok FROM app_settings WHERE key='openai_api_key'",
        ).first());
      return jsonWithCookies(
        {
          ok: true,
          user: { name: access.name },
          job_id: job.id,
          ai_configured: configured,
          login_users: (await applicationUsers(env, env.DB)).map((item) => item.name),
          ...(await bootstrapData(env.DB)),
        },
        [sessionCookie(session.token, request, session.minutes)],
      );
    }
    if (p === "/api/login" && request.method === "POST") {
      if (!env.USERS_JSON || !env.SESSION_SECRET)
        return json({ error: "De gebruikers zijn nog niet ingesteld." }, 503);
      const fingerprint = await loginFingerprint(request, env, "app");
      if ((await loginAttemptCount(env.DB, fingerprint)) >= 5)
        return json(
          { error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." },
          429,
        );
      const d = await body(request),
        pin = String(d.pin || "");
      if (!/^\d{6}$/.test(pin))
        return json({ error: "Voer een geldige 6-cijferige pincode in." }, 400);
      const user = await userForPin(pin, env, env.DB);
      if (!user) {
        await recordLoginFailure(env.DB, fingerprint);
        return json({ error: "De pincode is niet juist." }, 401);
      }
      await clearLoginFailures(env.DB, fingerprint);
      const session = await signSession({ name: user.name }, env, request);
      return jsonWithCookies({ ok: true, user: { name: user.name } }, [
        sessionCookie(session.token, request, session.minutes),
      ]);
    }
    if (p === "/api/passkeys/auth/options" && request.method === "POST") {
      if (!env.SESSION_SECRET)
        return json(
          { error: "Face ID is nog niet ingesteld op de server." },
          503,
        );
      const options = await generateAuthenticationOptions({
        rpID: url.hostname,
        timeout: 60000,
        userVerification: "required",
      });
      const token = await signToken(
        {
          kind: "authenticate",
          challenge: options.challenge,
          exp: Date.now() + 300000,
        },
        env,
      );
      return jsonWithCookies(options, [challengeCookie(token)]);
    }
    if (p === "/api/passkeys/auth/verify" && request.method === "POST") {
      if (!env.SESSION_SECRET)
        return json(
          { error: "Face ID is nog niet ingesteld op de server." },
          503,
        );
      const challenge = await readToken(request, "__Host-dus_webauthn", env);
      if (challenge?.kind !== "authenticate")
        return json(
          { error: "De Face ID-aanmelding is verlopen. Probeer opnieuw." },
          401,
        );
      const d = await body(request);
      const stored = await env.DB.prepare(
        "SELECT * FROM passkeys WHERE credential_id=?",
      )
        .bind(String(d.id || ""))
        .first();
      if (!stored)
        return json(
          {
            error:
              "Deze Face ID is nog niet gekoppeld. Log eerst in met je pincode.",
          },
          401,
        );
      const verification = await verifyAuthenticationResponse({
        response: d,
        expectedChallenge: challenge.challenge,
        expectedOrigin: url.origin,
        expectedRPID: url.hostname,
        credential: {
          id: stored.credential_id,
          publicKey: Uint8Array.from(atob(b64plain(stored.public_key)), (c) =>
            c.charCodeAt(0),
          ),
          counter: Number(stored.counter || 0),
          transports: stored.transports
            ? JSON.parse(stored.transports)
            : undefined,
        },
        requireUserVerification: true,
      });
      if (!verification.verified)
        return json({ error: "Face ID kon niet worden gecontroleerd." }, 401);
      if (!(await knownUser(stored.user_name, env, env.DB))) {
        await env.DB.prepare("DELETE FROM passkeys WHERE credential_id=?")
          .bind(stored.credential_id)
          .run();
        return json({ error: "Deze gebruiker heeft geen toegang meer." }, 403);
      }
      await env.DB.prepare(
        "UPDATE passkeys SET counter=?, device_type=?, backed_up=? WHERE credential_id=?",
      )
        .bind(
          verification.authenticationInfo.newCounter,
          verification.authenticationInfo.credentialDeviceType,
          verification.authenticationInfo.credentialBackedUp ? 1 : 0,
          stored.credential_id,
        )
        .run();
      const session = await signSession(
        { name: stored.user_name },
        env,
        request,
      );
      return jsonWithCookies({ ok: true, user: { name: stored.user_name } }, [
        sessionCookie(session.token, request, session.minutes),
        clearChallengeCookie,
      ]);
    }
    if (p === "/api/logout" && request.method === "POST")
      return jsonWithCookies(
        { ok: true },
        [
          "__Host-dus_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
          "dus_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
        ],
      );

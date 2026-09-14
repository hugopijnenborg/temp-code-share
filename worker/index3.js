 const user = await authorized(request, env);
    if (p === "/api/session" && request.method === "GET")
      return user
        ? json({ ok: true, user })
        : json({ error: "Voer eerst de pincode in." }, 401);
    if (p === "/api/boot" && request.method === "GET") {
      if (!user) return json({ error: "Voer eerst de pincode in." }, 401);
      const configured = !!(await env.DB.prepare(
        "SELECT 1 AS ok FROM app_settings WHERE key='openai_api_key'",
      ).first());
      return json({
        ok: true,
        user,
        ai_configured: configured,
        login_users: (await applicationUsers(env, env.DB)).map((item) => item.name),
        ...(await bootstrapData(env.DB)),
      });
    }
    if (!user)
      return json(
        { error: "Je sessie is verlopen. Open de app opnieuw." },
        401,
      );
    if (p === "/api/passkeys/register/options" && request.method === "POST") {
      const previous = await env.DB.prepare(
        "SELECT credential_id,webauthn_user_id,transports FROM passkeys WHERE user_name=?",
      )
        .bind(user.name)
        .all();
      const existing = previous.results || [];
      const userID =
        existing[0]?.webauthn_user_id ||
        b64url(crypto.getRandomValues(new Uint8Array(32)));
      const options = await generateRegistrationOptions({
        rpName: "DUS Aanvraagbord",
        rpID: url.hostname,
        userName: user.name,
        userDisplayName: user.name,
        userID: Uint8Array.from(atob(b64plain(userID)), (c) => c.charCodeAt(0)),
        timeout: 60000,
        attestationType: "none",
        excludeCredentials: existing.map((item) => ({
          id: item.credential_id,
          transports: item.transports ? JSON.parse(item.transports) : undefined,
        })),
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "required",
          userVerification: "required",
        },
      });
      const token = await signToken(
        {
          kind: "register",
          challenge: options.challenge,
          user: user.name,
          userID,
          exp: Date.now() + 300000,
        },
        env,
      );
      return jsonWithCookies(options, [challengeCookie(token)]);
    }
    if (p === "/api/passkeys/register/verify" && request.method === "POST") {
      const challenge = await readToken(request, "__Host-dus_webauthn", env);
      if (challenge?.kind !== "register" || challenge.user !== user.name)
        return json(
          { error: "De Face ID-instelling is verlopen. Probeer opnieuw." },
          401,
        );
      const d = await body(request);
      const verification = await verifyRegistrationResponse({
        response: d,
        expectedChallenge: challenge.challenge,
        expectedOrigin: url.origin,
        expectedRPID: url.hostname,
        requireUserVerification: true,
      });
      if (!verification.verified || !verification.registrationInfo)
        return json({ error: "Face ID kon niet worden ingesteld." }, 400);
      const info = verification.registrationInfo;
      await env.DB.prepare(
        "INSERT OR REPLACE INTO passkeys (credential_id,user_name,public_key,webauthn_user_id,counter,device_type,backed_up,transports,created_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)",
      )
        .bind(
          info.credential.id,
          user.name,
          b64url(info.credential.publicKey),
          challenge.userID,
          info.credential.counter,
          info.credentialDeviceType,
          info.credentialBackedUp ? 1 : 0,
          JSON.stringify(
            info.credential.transports || d.response?.transports || [],
          ),
        )
        .run();
      return jsonWithCookies({ ok: true }, [clearChallengeCookie], 201);
    }
    if (p === "/api/push-key" && request.method === "GET") {
      if (!env.VAPID_PUBLIC_KEY)
        return json({ error: "Pushmeldingen zijn nog niet ingesteld." }, 503);
      return json({ publicKey: env.VAPID_PUBLIC_KEY });
    }
    if (p === "/api/push-subscriptions" && request.method === "POST") {
      const d = await body(request);
      if (!d.endpoint || !String(d.endpoint).startsWith("https://"))
        return json({ error: "Ongeldige pushregistratie." }, 400);
      await env.DB.prepare(
        "INSERT INTO push_subscriptions (endpoint,user_name,created_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(endpoint) DO UPDATE SET user_name=excluded.user_name,created_at=CURRENT_TIMESTAMP",
      )
        .bind(d.endpoint, user.name)
        .run();
      return json({ ok: true }, 201);
    }
    if (p === "/api/ai/setup" && request.method === "POST") {
      if (String(user.name || "").toLowerCase() !== "swen")
        return json(
          { error: "Alleen Swen kan de AI-koppeling instellen." },
          403,
        );
      const d = await body(request),
        key = String(d.api_key || "").trim();
      if (!key.startsWith("sk-"))
        return json(
          { error: "Dit lijkt niet op een geldige OpenAI API-sleutel." },
          400,
        );
      try {
        await createPlanningWork(
          env,
          {
            work: "opruimen en bouwafval afvoeren",
            trade: "Bouwspecialist",
            location: "test",
            client: "DUS",
          },
          key,
        );
      } catch (error) {
        const message = String(error?.message || "");
        if (/quota|billing|credit/i.test(message))
          return json(
            {
              error:
                "De API-sleutel werkt, maar er is nog geen API-tegoed of betaalmethode ingesteld.",
            },
            400,
          );
        if (/incorrect api key|invalid.*key|401/i.test(message))
          return json(
            {
              error:
                "De API-sleutel wordt niet geaccepteerd. Controleer of je de volledige sleutel hebt gekopieerd.",
            },
            400,
          );
        return json(
          { error: "OpenAI kon niet worden gekoppeld: " + message },
          400,
        );
      }
      const encrypted = await encryptSetting(key, env);
      await env.DB.prepare(
        "INSERT INTO app_settings (key,value,updated_at) VALUES ('openai_api_key',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
      )
        .bind(encrypted)
        .run();
      ctx?.waitUntil(regenerateMissingPlanningWork(env));
      return json({ ok: true });
    }
    const admin = String(user.name || "").toLowerCase() === "swen";
    const roleRow = await env.DB.prepare(
        "SELECT role_key,permissions_json FROM user_roles WHERE organization_id='dus' AND user_name=? COLLATE NOCASE",
      )
        .bind(user.name)
        .first(),
      permissions = new Set(
        jsonValue(
          roleRow?.permissions_json,
          admin
            ? ["manage_settings", "manage_jobs", "manage_planning", "manage_workers"]
            : ["manage_jobs", "manage_planning", "manage_workers"],
        ),
      );
    if (
      !admin &&
      !["GET", "HEAD"].includes(request.method) &&
      roleRow?.role_key === "lezer" &&
      !p.startsWith("/api/push") &&
      !p.startsWith("/api/passkeys") &&
      p !== "/api/logout"
    )
      return json({ error: "Je account heeft alleen leesrechten." }, 403);
    if (p === "/api/settings/manage" && request.method === "GET") {
      if (!admin)
        return json({ error: "Alleen Swen kan App beheren openen." }, 403);
      return json(await managementData(env.DB));
    }
    const managedSection = p.match(
      /^\/api\/settings\/manage\/(branding|texts|messages)$/,
    );
    if (managedSection && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan App beheren wijzigen." }, 403);
      const section = managedSection[1],
        d = await body(request),
        reset = Boolean(d.reset),
        source = reset ? MANAGED_DEFAULTS[section] : d,
        values = {};
      if (section === "branding") {
        for (const key of ["primary_color", "accent_color", "lime_color"]) {
          const value = String(source[key] || "").toUpperCase();
          if (!/^#[0-9A-F]{6}$/.test(value))
            return json({ error: "Kies geldige kleuren." }, 400);
          values[key] = value;
        }
      }
      if (section === "texts") {
        values.title = String(source.title || "")
          .trim()
          .slice(0, 40);
        values.subtitle = String(source.subtitle || "")
          .trim()
          .slice(0, 80);
        values.start_intro = String(source.start_intro || "")
          .trim()
          .slice(0, 300);
        if (!values.title || !values.subtitle || !values.start_intro)
          return json({ error: "Vul alle teksten in." }, 400);
      }
      if (section === "messages") {
        values.notification_title = String(source.notification_title || "")
          .trim()
          .slice(0, 60);
        values.notification_body = String(source.notification_body || "")
          .trim()
          .slice(0, 160);
        values.whatsapp_job_template = String(
          source.whatsapp_job_template || "",
        )
          .trim()
          .slice(0, 2000);
        if (
          !values.notification_title ||
          !values.notification_body ||
          !values.whatsapp_job_template
        )
          return json({ error: "Vul alle berichtsjablonen in." }, 400);
      }
      await saveManagedSection(env.DB, section, values, user.name);
      if (section === "texts")
        await saveAppSettings(env.DB, {
          ui_title: values.title,
          ui_subtitle: values.subtitle,
          ui_start_intro: values.start_intro,
        });
      if (section === "messages") await saveAppSettings(env.DB, values);
      return json({ ok: true, values });
    }
    if (p === "/api/settings/manage/statuses" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan statussen wijzigen." }, 403);
      const d = await body(request),
        items = Array.isArray(d.items) ? d.items : [],
        allowed = ["Nieuw", "In behandeling", "Ingevuld", "Geannuleerd"];
      if (
        items.length !== 4 ||
        items.some(
          (item) =>
            !allowed.includes(String(item.status_key)) ||
            !String(item.label || "").trim() ||
            !/^#[0-9A-Fa-f]{6}$/.test(String(item.color || "")),
        )
      )
        return json({ error: "Controleer de vier statussen en kleuren." }, 400);
      const old = await env.DB.prepare(
          "SELECT status_key,label,color,sort_order,active FROM application_statuses WHERE organization_id='dus' ORDER BY sort_order",
        ).all(),
        statements = items.map((item, index) =>
          env.DB.prepare(
            "INSERT INTO application_statuses(organization_id,status_key,label,color,sort_order,active,locked,updated_at) VALUES('dus',?,?,?,?,?,1,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,status_key) DO UPDATE SET label=excluded.label,color=excluded.color,sort_order=excluded.sort_order,active=excluded.active,updated_at=CURRENT_TIMESTAMP",
          ).bind(
            item.status_key,
            String(item.label).trim().slice(0, 40),
            String(item.color).toUpperCase(),
            index + 1,
            item.active === false ? 0 : 1,
          ),
        );
      statements.push(
        env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','statuses','all',?,?,?)",
        ).bind(
          JSON.stringify(old.results || []),
          JSON.stringify(items),
          user.name,
        ),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
        ),
      );
      await env.DB.batch(statements);
      return json({ ok: true });
    }
    if (p === "/api/settings/manage/fields" && request.method === "POST") {
      if (!admin)
        return json(
          { error: "Alleen Swen kan formuliervelden wijzigen." },
          403,
        );
      const d = await body(request),
        label = String(d.label || "")
          .trim()
          .slice(0, 60),
        type = String(d.field_type || ""),
        types = ["text", "textarea", "number", "date", "select", "checkbox"],
        options = Array.isArray(d.options)
          ? d.options
              .map((value) => String(value).trim())
              .filter(Boolean)
              .slice(0, 50)
          : [];
      if (
        !label ||
        !types.includes(type) ||
        (type === "select" && !options.length)
      )
        return json(
          { error: "Vul een geldige veldnaam, type en eventuele keuzes in." },
          400,
        );
      const id = Number(d.id) || 0,
        key =
          label
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "")
            .slice(0, 40) +
          "_" +
          Date.now().toString(36);
      if (id) {
        const old = await env.DB.prepare(
          "SELECT * FROM application_form_fields WHERE id=? AND organization_id='dus'",
        )
          .bind(id)
          .first();
        if (!old) return json({ error: "Veld niet gevonden." }, 404);
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE application_form_fields SET label=?,field_type=?,options_json=?,required=?,visible=?,sort_order=?,archived=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id='dus'",
          ).bind(
            label,
            type,
            JSON.stringify(options),
            d.required ? 1 : 0,
            d.visible === false ? 0 : 1,
            Math.max(1, Number(d.sort_order) || 100),
            d.archived ? 1 : 0,
            id,
          ),
          env.DB.prepare(
            "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','fields',?,?,?,?)",
          ).bind(String(id), JSON.stringify(old), JSON.stringify(d), user.name),
          env.DB.prepare(
            "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='data_revision'",
          ),
        ]);
        return json({ ok: true, id });
      }
      const q = await env.DB.prepare(
        "INSERT INTO application_form_fields(organization_id,field_key,label,field_type,options_json,required,visible,sort_order,created_by) VALUES('dus',?,?,?,?,?,?,?,?)",
      )
        .bind(
          key,
          label,
          type,
          JSON.stringify(options),
          d.required ? 1 : 0,
          d.visible === false ? 0 : 1,
          Math.max(1, Number(d.sort_order) || 100),
          user.name,
        )
        .run();
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','fields',?,NULL,?,?)",
        ).bind(String(q.meta.last_row_id), JSON.stringify(d), user.name),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='data_revision'",
        ),
      ]);
      return json({ ok: true, id: q.meta.last_row_id }, 201);
    }
    const managedField = p.match(/^\/api\/settings\/manage\/fields\/(\d+)$/);
    if (managedField && request.method === "DELETE") {
      if (!admin)
        return json({ error: "Alleen Swen kan velden archiveren." }, 403);
      const id = Number(managedField[1]),
        old = await env.DB.prepare(
          "SELECT * FROM application_form_fields WHERE id=? AND organization_id='dus'",
        )
          .bind(id)
          .first();
      if (!old) return json({ error: "Veld niet gevonden." }, 404);
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE application_form_fields SET archived=1,visible=0,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        ).bind(id),
        env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','fields',?,?,?,?)",
        ).bind(
          String(id),
          JSON.stringify(old),
          JSON.stringify({ ...old, archived: 1, visible: 0 }),
          user.name,
        ),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='data_revision'",
        ),
      ]);
      return json({ ok: true });
    }
    if (p === "/api/settings/manage/dashboard" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan het dashboard wijzigen." }, 403);
      const d = await body(request),
        items = Array.isArray(d.items) ? d.items : [],
        allowed = ["new", "busy", "filled", "total", "analytics"];
      if (
        items.length !== 5 ||
        items.some((item) => !allowed.includes(String(item.widget_key)))
      )
        return json({ error: "Ongeldige dashboardindeling." }, 400);
      const old = await env.DB.prepare(
          "SELECT widget_key,label,enabled,sort_order FROM dashboard_widgets WHERE organization_id='dus' ORDER BY sort_order",
        ).all(),
        statements = items.map((item, index) =>
          env.DB.prepare(
            "UPDATE dashboard_widgets SET enabled=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE organization_id='dus' AND widget_key=?",
          ).bind(item.enabled ? 1 : 0, index + 1, item.widget_key),
        );
      statements.push(
        env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','dashboard','widgets',?,?,?)",
        ).bind(
          JSON.stringify(old.results || []),
          JSON.stringify(items),
          user.name,
        ),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='data_revision'",
        ),
      );
      await env.DB.batch(statements);
      return json({ ok: true });
    }
    if (p === "/api/settings/manage/roles" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan rechten wijzigen." }, 403);
      const d = await body(request),
        items = Array.isArray(d.items) ? d.items : [],
        known = new Set((await applicationUsers(env, env.DB)).map((item) => String(item.name))),
        roles = {
          beheerder: [
            "manage_settings",
            "manage_jobs",
            "manage_planning",
            "manage_workers",
          ],
          planner: ["manage_jobs", "manage_planning", "manage_workers"],
          lezer: [],
        };
      if (
        items.some(
          (item) => !known.has(String(item.user_name)) || !roles[item.role_key],
        )
      )
        return json({ error: "Ongeldige gebruiker of rol." }, 400);
      const statements = [];
      for (const item of items) {
        const role =
          String(item.user_name).toLowerCase() === "swen"
            ? "beheerder"
            : item.role_key;
        statements.push(
          env.DB.prepare(
            "INSERT INTO user_roles(organization_id,user_name,role_key,permissions_json,updated_by,updated_at) VALUES('dus',?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(organization_id,user_name) DO UPDATE SET role_key=excluded.role_key,permissions_json=excluded.permissions_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP",
          ).bind(item.user_name, role, JSON.stringify(roles[role]), user.name),
        );
      }
      statements.push(
        env.DB.prepare(
          "INSERT INTO settings_change_log(organization_id,section,setting_key,old_value_json,new_value_json,changed_by) VALUES('dus','roles','all',NULL,?,?)",
        ).bind(JSON.stringify(items), user.name),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key='data_revision'",
        ),
      );
      await env.DB.batch(statements);
      return json({ ok: true });
    }
    if (p === "/api/settings/app" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const d = await body(request),
        title = String(d.title || "")
          .trim()
          .slice(0, 40),
        subtitle = String(d.subtitle || "")
          .trim()
          .slice(0, 80),
        intro = String(d.start_intro || "")
          .trim()
          .slice(0, 300);
      if (!title || !subtitle || !intro)
        return json({ error: "Vul alle appteksten in." }, 400);
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO app_settings(key,value,updated_at) VALUES('ui_title',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
        ).bind(title),
        env.DB.prepare(
          "INSERT INTO app_settings(key,value,updated_at) VALUES('ui_subtitle',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
        ).bind(subtitle),
        env.DB.prepare(
          "INSERT INTO app_settings(key,value,updated_at) VALUES('ui_start_intro',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
        ).bind(intro),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
        ),
      ]);
      return json({ ok: true });
    }
    if (p === "/api/settings/workflow" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const d = await body(request),
        priority = String(d.default_priority || ""),
        people = Number(d.default_people),
        status = String(d.default_board_status ?? ""),
        ai = Number(d.default_ai),
        before = Number(d.planning_weeks_before),
        after = Number(d.planning_weeks_after);
      if (
        !["Normaal", "Hoog", "Spoed"].includes(priority) ||
        !Number.isInteger(people) ||
        people < 1 ||
        people > 100 ||
        !["Nieuw", "In behandeling", "Ingevuld", "Geannuleerd", ""].includes(
          status,
        ) ||
        ![0, 1].includes(ai) ||
        !Number.isInteger(before) ||
        before < 0 ||
        before > 26 ||
        !Number.isInteger(after) ||
        after < 1 ||
        after > 52
      )
        return json({ error: "Controleer de standaardwaarden." }, 400);
      await saveAppSettings(env.DB, {
        default_priority: priority,
        default_people: people,
        default_board_status: status,
        default_ai: ai,
        planning_weeks_before: before,
        planning_weeks_after: after,
      });
      return json({ ok: true });
    }
    if (p === "/api/settings/messages" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const d = await body(request),
        title = String(d.notification_title || "")
          .trim()
          .slice(0, 60),
        message = String(d.notification_body || "")
          .trim()
          .slice(0, 160),
        template = String(d.whatsapp_job_template || "")
          .trim()
          .slice(0, 2000);
      if (!title || !message || !template)
        return json({ error: "Vul alle berichtteksten in." }, 400);
      await saveAppSettings(env.DB, {
        notification_title: title,
        notification_body: message,
        whatsapp_job_template: template,
      });
      return json({ ok: true });
    }
    if (p === "/api/settings/security" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const d = await body(request),
        minutes = Number(d.mobile_session_minutes);
      if (![15, 30, 60, 120, 240].includes(minutes))
        return json({ error: "Kies een geldige sessieduur." }, 400);
      await saveAppSettings(env.DB, { mobile_session_minutes: minutes });
      return json({ ok: true });
    }
    if (p === "/api/settings/passkeys" && request.method === "DELETE") {
      if (!admin)
        return json(
          { error: "Alleen Swen kan Face ID-koppelingen verwijderen." },
          403,
        );
      await env.DB.prepare("DELETE FROM passkeys").run();
      return json({ ok: true });
    }
    if (p === "/api/settings/trades" && request.method === "POST") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const d = await body(request),
        name = validTrade(d.name),
        fee = Number(d.fee_percent) / 100;
      if (!name || !Number.isFinite(fee) || fee < 0 || fee > 1)
        return json({ error: "Vul een geldige vakgroep en fee in." }, 400);
      try {
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO trade_settings(name,fee_rate) VALUES(?,?)",
          ).bind(name, fee),
          env.DB.prepare(
            "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
          ),
        ]);
        return json({ ok: true }, 201);
      } catch (error) {
        if (/unique/i.test(String(error)))
          return json({ error: "Deze vakgroep bestaat al." }, 409);
        throw error;
      }
    }
    const tradeSetting = p.match(/^\/api\/settings\/trades\/(.+)$/);
    if (tradeSetting && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan instellingen wijzigen." }, 403);
      const oldName = decodeURIComponent(tradeSetting[1]),
        d = await body(request),
        name = validTrade(d.name),
        fee = Number(d.fee_percent) / 100;
      if (!name || !Number.isFinite(fee) || fee < 0 || fee > 1)
        return json({ error: "Vul een geldige vakgroep en fee in." }, 400);
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE trade_settings SET name=?,fee_rate=?,updated_at=CURRENT_TIMESTAMP WHERE name=? COLLATE NOCASE",
        ).bind(name, fee, oldName),
        env.DB.prepare(
          "UPDATE jobs SET trade=? WHERE trade=? COLLATE NOCASE",
        ).bind(name, oldName),
        env.DB.prepare(
          "UPDATE workers SET trade=replace(trade,?,?) WHERE instr(trade,?)>0",
        ).bind(oldName, name, oldName),
        env.DB.prepare(
          "UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'",
        ),
      ]);
      return json({ ok: true });
    }
    if (p === "/api/settings/pin" && request.method === "PATCH") {
      if (!admin)
        return json({ error: "Alleen Swen kan pincodes wijzigen." }, 403);
      const d = await body(request),
        name = String(d.name || ""),
        pin = String(d.pin || "");
      if (
        !(await applicationUsers(env, env.DB)).some(
          (item) => String(item.name).toLowerCase() === name.toLowerCase(),
        )
      )
        return json({ error: "Onbekende gebruiker." }, 404);
      if (!/^\d{6}$/.test(pin))
        return json({ error: "Gebruik precies zes cijfers." }, 400);
      const collision = await userForPin(pin, env, env.DB);
      if (
        collision &&
        String(collision.name).toLowerCase() !== name.toLowerCase()
      )
        return json(
          { error: "Deze pincode hoort al bij een andere gebruiker." },
          409,
        );
      const hash = await secretHash(pin);
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO user_pins(name,pin_hash,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(name) DO UPDATE SET pin_hash=excluded.pin_hash,updated_at=CURRENT_TIMESTAMP",
        ).bind(name, hash),
        env.DB.prepare(
          "DELETE FROM passkeys WHERE user_name=? COLLATE NOCASE",
        ).bind(name),
      ]);
      return json({ ok: true });
    }
    if (p === "/api/sync-state" && request.method === "GET") {
      const revision = await env.DB.prepare(
        "SELECT value||'-'||date('now') AS value FROM app_settings WHERE key='data_revision'",
      ).first();
      return json({ sync_token: String(revision?.value || "1") });
    }
    if (p === "/api/geocode" && request.method === "GET") {
      try {
        const settings = await organizationSection(env.DB, "map");
        if (settings.geocoding_enabled === false)
          return json({ error: "Adresherkenning is uitgeschakeld in Beheer." }, 403);
        return json(
          await geocodeAddress(env.DB, url.searchParams.get("address")),
        );
      } catch (error) {
        await logSystemEvent(env.DB, "warning", "geocoding", error.message, {
          address: String(url.searchParams.get("address") || "").slice(0, 120),
        }).catch(() => {});
        return json({ error: error.message }, 503);
      }
    }
    if (p === "/api/bootstrap" && request.method === "GET")
      return json({
        login_users: (await applicationUsers(env, env.DB)).map((item) => item.name),
        ...(await bootstrapData(env.DB)),
      });
    if (p === "/api/workers" && request.method === "GET") {
      await refreshWorkerAvailability(env.DB, organizationId);
      const r = await env.DB.prepare(
        "SELECT w.* FROM workers w WHERE organization_id=? ORDER BY available DESC,trade,name",
      ).bind(organizationId).all();
      return json({ workers: r.results });
    }
    if (p === "/api/workers" && request.method === "POST") {
      const d = await body(request),
        trades = normalizedTrades(d);
      if (
        !String(d.name || "").trim() ||
        !String(d.phone || "").trim() ||
        !trades.length
      )
        return json(
          {
            error:
              "Vul naam en telefoonnummer in en kies minimaal één functie.",
          },
          400,
        );
      const available = Number(d.available) === 0 ? 0 : 1,
        q = await env.DB.prepare(
          "INSERT INTO workers (name,phone,trade,available,manual_available,location,notes) VALUES (?,?,?,?,?,?,?)",
        )
          .bind(
            String(d.name).trim(),
            String(d.phone).trim(),
            trades.join(", "),
            available,
            available,
            String(d.location || "").trim().slice(0,120) || null,
            String(d.notes || "").trim() || null,
          )
          .run();
      return json({ id: q.meta.last_row_id }, 201);
    }
    const worker = p.match(/^\/api\/workers\/(\d+)$/);
    if (worker && request.method === "PATCH") {
      const id = Number(worker[1]),
        d = await body(request),
        trades = normalizedTrades(d);
      if (
        !String(d.name || "").trim() ||
        !String(d.phone || "").trim() ||
        !trades.length
      )
        return json(
          {
            error:
              "Vul naam en telefoonnummer in en kies minimaal één functie.",
          },
          400,
        );
      const linked = await env.DB.prepare(
          "SELECT 1 AS linked FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE jw.worker_id=? AND j.status<>'Geannuleerd' AND date(COALESCE(NULLIF(j.end_date,''),j.start_date))>=date(?) LIMIT 1",
        )
          .bind(id, netherlandsDateISO())
          .first(),
        manualAvailable = Number(d.available) === 0 ? 0 : 1,
        available = manualAvailable && !linked ? 1 : 0;
      await env.DB.prepare(
        "UPDATE workers SET name=?,phone=?,trade=?,available=?,manual_available=?,location=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
        .bind(
          String(d.name).trim(),
          String(d.phone).trim(),
          trades.join(", "),
          available,
          manualAvailable,
          String(d.location || "").trim().slice(0,120) || null,
          String(d.notes || "").trim() || null,
          id,
        )
        .run();
      return json({
        ok: true,
        available,
        manual_available: manualAvailable,
        linked: Boolean(linked),
      });
    }
    if (worker && request.method === "DELETE") {
      const id = Number(worker[1]);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM job_workers WHERE worker_id=?").bind(id),
        env.DB.prepare("DELETE FROM workers WHERE id=?").bind(id),
      ]);
      return new Response(null, { status: 204 });
    }
    if (p === "/api/companies" && request.method === "POST") {
      const d = await body(request),
        name = String(d.name || "").trim();
      if (!name) return json({ error: "Vul de bedrijfsnaam in." }, 400);
      try {
        const q = await env.DB.prepare(
          "INSERT INTO companies (name) VALUES (?)",
        )
          .bind(name)
          .run();
        return json({ id: q.meta.last_row_id }, 201);
      } catch (error) {
        if (/unique/i.test(String(error?.message || error)))
          return json({ error: "Deze opdrachtgever bestaat al." }, 409);
        throw error;
      }
    }
    const company = p.match(/^\/api\/companies\/(\d+)$/);
    if (company && request.method === "DELETE") {
      const id = Number(company[1]);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM company_foremen WHERE company_id=?").bind(
          id,
        ),
        env.DB.prepare("DELETE FROM companies WHERE id=?").bind(id),
      ]);
      return new Response(null, { status: 204 });
    }
    const companyForemen = p.match(/^\/api\/companies\/(\d+)\/foremen$/);
    if (companyForemen && request.method === "POST") {
      const companyId = Number(companyForemen[1]),
        d = await body(request),
        name = String(d.name || "").trim();
      if (!name)
        return json({ error: "Vul de naam van de uitvoerder in." }, 400);
      try {
        const q = await env.DB.prepare(
          "INSERT INTO company_foremen (company_id,name) VALUES (?,?)",
        )
          .bind(companyId, name)
          .run();
        return json({ id: q.meta.last_row_id }, 201);
      } catch (error) {
        if (/unique/i.test(String(error?.message || error)))
          return json(
            { error: "Deze uitvoerder staat al bij dit bedrijf." },
            409,
          );
        throw error;
      }
    }
    const foreman = p.match(/^\/api\/foremen\/(\d+)$/);
    if (foreman && request.method === "DELETE") {
      await env.DB.prepare("DELETE FROM company_foremen WHERE id=?")
        .bind(Number(foreman[1]))
        .run();
      return new Response(null, { status: 204 });
    }
    if (p === "/api/jobs" && request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT j.*, COALESCE((SELECT GROUP_CONCAT(w.name, ', ') FROM job_workers jw JOIN workers w ON w.id=jw.worker_id WHERE jw.job_id=j.id),'') AS worker_names FROM jobs j ORDER BY CASE j.status WHEN 'Nieuw' THEN 0 WHEN 'In behandeling' THEN 1 WHEN 'Ingevuld' THEN 2 ELSE 3 END, date(j.start_date), datetime(j.created_at) DESC",
      ).all();
      return json({ jobs: r.results });
    }
    if (p === "/api/jobs" && request.method === "POST") {
      const d = await body(request),
        endDate = String(d.end_date || "");
      if (
        !d.client ||
        !d.location ||
        !d.trade ||
        !d.start_date ||
        !endDate ||
        !d.work
      )
        return json(
          { error: "Vul alle verplichte velden in, inclusief de einddatum." },
          400,
        );
      if (endDate < String(d.start_date))
        return json(
          { error: "De einddatum mag niet vóór de startdatum liggen." },
          400,
        );
      const automation = await organizationSection(env.DB, "automation"),
        aiConfig = await organizationSection(env.DB, "ai"),
        client = String(d.client).trim(),
        foremanName = String(d.foreman || "").trim(),
        work = String(d.work).trim(),
        aiPlanning =
          aiConfig.enabled !== false &&
          (d.ai_planning === 1 || d.ai_planning === "1")
            ? 1
            : 0;
      await env.DB.prepare("INSERT OR IGNORE INTO companies (name) VALUES (?)")
        .bind(client)
        .run();
      if (foremanName) {
        const companyRow = await env.DB.prepare(
          "SELECT id FROM companies WHERE name=? COLLATE NOCASE",
        )
          .bind(client)
          .first();
        if (companyRow)
          await env.DB.prepare(
            "INSERT OR IGNORE INTO company_foremen (company_id,name) VALUES (?,?)",
          )
            .bind(companyRow.id, foremanName)
            .run();
      }
      const custom =
          d.custom_fields && typeof d.custom_fields === "object"
            ? d.custom_fields
            : {},
        definitions = await env.DB.prepare(
          "SELECT id,required FROM application_form_fields WHERE organization_id='dus' AND archived=0",
        ).all();
      for (const field of definitions.results || []) {
        const value = custom[String(field.id)];
        if (
          Number(field.required) &&
          (value == null || String(value).trim() === "")
        )
          return json({ error: "Vul alle verplichte extra velden in." }, 400);
      }
      const q = await env.DB.prepare(
          "INSERT INTO jobs (client,foreman,location,trade,start_date,end_date,people,priority,purchase_rate,work,ai_planning,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
          .bind(
            client,
            foremanName || null,
            d.location,
            d.trade,
            d.start_date,
            endDate,
            Math.max(1, Number(d.people) || 1),
            d.priority || "Normaal",
            parseFloat(String(d.purchase_rate || "").replace(",", ".")) || null,
            work,
            aiPlanning,
            d.notes || null,
            user.name,
          )
          .run(),
        background =
          automation.notify_new_job === false
            ? []
            : [sendPushes(env, user.name, q.meta.last_row_id)];
      const allowedFields = new Set((definitions.results || []).map((field) => String(field.id)));
      const valueStatements = Object.entries(custom)
        .filter(([fieldId]) => allowedFields.has(String(fieldId)))
        .map(([fieldId, value]) =>
          env.DB.prepare(
            "INSERT INTO job_field_values(job_id,field_id,value_json,updated_by,updated_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(job_id,field_id) DO UPDATE SET value_json=excluded.value_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP",
          ).bind(q.meta.last_row_id, Number(fieldId), JSON.stringify(value), user.name),
        );
      if (valueStatements.length) await env.DB.batch(valueStatements);
      if (aiPlanning)
        background.push(regeneratePlanningWork(env, q.meta.last_row_id, work));
      ctx?.waitUntil(Promise.all(background));
      return json({ id: q.meta.last_row_id }, 201);
    }
    const jobDetail = p.match(/^\/api\/jobs\/(\d+)\/detail$/);
    if (jobDetail && request.method === "GET") {
      const id = Number(jobDetail[1]);
      const [comments, linked, available, reactions] = await env.DB.batch([
        env.DB.prepare(
          "SELECT * FROM comments WHERE job_id=? ORDER BY datetime(created_at) DESC",
        ).bind(id),
        env.DB.prepare(
          "SELECT w.*,jw.system_planned,jw.address_sent,jw.hourly_rate,jw.fee,jw.linked_at FROM workers w JOIN job_workers jw ON jw.worker_id=w.id WHERE jw.job_id=? ORDER BY w.name",
        ).bind(id),
        env.DB.prepare(
          "SELECT w.* FROM workers w JOIN jobs target ON target.id=? WHERE w.manual_available=1 AND instr(','||lower(replace(replace(w.trade,'Zelfstandig ',''),' ',''))||',', ','||lower(replace(replace(target.trade,'Zelfstandig ',''),' ',''))||',')>0 AND NOT EXISTS (SELECT 1 FROM job_workers taken JOIN jobs active ON active.id=taken.job_id WHERE taken.worker_id=w.id AND active.id<>target.id AND active.status<>'Geannuleerd' AND date(COALESCE(NULLIF(taken.planning_start_date,''),active.start_date))<=date(COALESCE(NULLIF(target.end_date,''),target.start_date)) AND date(COALESCE(NULLIF(active.end_date,''),active.start_date))>=date(target.start_date)) ORDER BY w.name",
        ).bind(id),
        env.DB.prepare(
          "SELECT user_name,reaction,created_at,updated_at FROM job_reactions WHERE job_id=? ORDER BY datetime(updated_at),user_name COLLATE NOCASE",
        ).bind(id),
      ]);
      return json({
        comments: comments.results || [],
        reactions: reactions.results || [],
        staffing: {
          linked: linked.results || [],
          available: available.results || [],
        },
      });
    }
    const jobPlanning = p.match(/^\/api\/jobs\/(\d+)\/planning$/);
    if (jobPlanning && request.method === "PATCH") {
      const id = Number(jobPlanning[1]),
        d = await body(request),
        allowed = ["Nieuw", "In behandeling", "Ingevuld", "Geannuleerd"],
        endDate = String(d.end_date || "");
      if (!d.client || !d.location || !d.trade || !d.start_date || !endDate)
        return json(
          {
            error:
              "Vul alle verplichte planningsvelden in, inclusief de einddatum.",
          },
          400,
        );
      if (endDate < String(d.start_date))
        return json(
          { error: "De einddatum mag niet vóór de startdatum liggen." },
          400,
        );
      if (!allowed.includes(d.status))
        return json({ error: "Ongeldige status." }, 400);
      const rate = Number(d.purchase_rate) || null,
        fee =
          rate === null
            ? null
            : rate * (await databaseFeeRate(env.DB, d.trade)),
        workerId = Number(d.worker_id) || 0,
        statements = [
          env.DB.prepare(
            "UPDATE jobs SET client=?,location=?,trade=?,start_date=?,end_date=?,filled_at=CASE WHEN ?='Ingevuld' AND status<>'Ingevuld' THEN CURRENT_TIMESTAMP WHEN ?<>'Ingevuld' THEN NULL ELSE filled_at END,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
          ).bind(
            String(d.client).trim(),
            String(d.location).trim(),
            String(d.trade).trim(),
            d.start_date,
            endDate,
            d.status,
            d.status,
            d.status,
            id,
          ),
        ];
      if (workerId) {
        const linked = await env.DB.prepare(
          "SELECT 1 AS linked FROM job_workers WHERE job_id=? AND worker_id=?",
        )
          .bind(id, workerId)
          .first();
        if (!linked)
          return json(
            { error: "Deze vakman is niet meer aan deze aanvraag gekoppeld." },
            409,
          );
        statements.push(
          env.DB.prepare(
            "UPDATE job_workers SET hourly_rate=?,fee=? WHERE job_id=? AND worker_id=?",
          ).bind(rate, fee, id, workerId),
        );
      } else
        statements.push(
          env.DB.prepare(
            "UPDATE jobs SET purchase_rate=?,planning_fee=? WHERE id=?",
          ).bind(rate, fee, id),
        );
      await env.DB.batch(statements);
      return json({ ok: true, worker_id: workerId || null, fee });
    }
    const jobRate = p.match(/^\/api\/jobs\/(\d+)\/rate$/);
    if (jobRate && request.method === "PATCH") {
      const id = Number(jobRate[1]),
        d = await body(request),
        workerId = Number(d.worker_id),
        newRate = Number(d.new_rate),
        effectiveDate = String(d.effective_date || "");
      if (
        !workerId ||
        !Number.isFinite(newRate) ||
        newRate <= 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)
      )
        return json(
          {
            error:
              "Kies een ingeplande vakman, een geldig nieuw tarief en de ingangsdatum.",
          },
          400,
        );
      const assignment = await env.DB.prepare(
        "SELECT COALESCE(jw.hourly_rate,j.purchase_rate) AS purchase_rate,j.trade,j.client,j.start_date,w.name AS worker_name FROM jobs j JOIN job_workers jw ON jw.job_id=j.id JOIN workers w ON w.id=jw.worker_id WHERE j.id=? AND w.id=?",
      )
        .bind(id, workerId)
        .first();
      if (!assignment)
        return json(
          { error: "Deze vakman is niet meer aan dit project gekoppeld." },
          409,
        );
      const oldRate = Number(assignment.purchase_rate) || 0,
        newFee = newRate * (await databaseFeeRate(env.DB, assignment.trade)),
        dateText = effectiveDate.split("-").reverse().join("-"),
        oldDateText = String(assignment.start_date || "")
          .split("-")
          .reverse()
          .join("-"),
        note =
          "Tariefwijziging voor " +
          assignment.worker_name +
          " op " +
          assignment.client +
          ": planning verplaatst van " +
          oldDateText +
          " naar " +
          dateText +
          " en tarief € " +
          oldRate.toFixed(2).replace(".", ",") +
          " → € " +
          newRate.toFixed(2).replace(".", ",");
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE jobs SET start_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        ).bind(effectiveDate, id),
        env.DB.prepare(
          "UPDATE job_workers SET hourly_rate=?,fee=? WHERE job_id=? AND worker_id=?",
        ).bind(newRate, newFee, id, workerId),
        env.DB.prepare(
          "INSERT INTO rate_changes (job_id,worker_id,old_rate,new_rate,effective_date,changed_by) VALUES (?,?,?,?,?,?)",
        ).bind(id, workerId, oldRate, newRate, effectiveDate, user.name),
        env.DB.prepare(
          "INSERT INTO comments (job_id,author,text) VALUES (?,?,?)",
        ).bind(id, user.name, note),
      ]);
      return json({
        ok: true,
        old_rate: oldRate,
        new_rate: newRate,
        new_fee: newFee,
        effective_date: effectiveDate,
      });
    }
    const jobAddress = p.match(/^\/api\/jobs\/(\d+)\/address$/);
    if (jobAddress && request.method === "PATCH") {
      const id = Number(jobAddress[1]),
        d = await body(request),
        workerId = Number(d.worker_id),
        newAddress = String(d.new_address || "").trim(),
        effectiveDate = String(d.effective_date || "");
      if (!workerId || newAddress.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate))
        return json({ error: "Kies een ingeplande vakman en vul een geldig nieuw adres en een ingangsdatum in." }, 400);
      const assignment = await env.DB.prepare(
        "SELECT j.id,j.client,j.location,j.start_date,j.end_date,j.status,w.name AS worker_name,COALESCE(jw.planning_location,j.location) AS current_address,COALESCE(jw.planning_start_date,j.start_date) AS current_start_date FROM jobs j JOIN job_workers jw ON jw.job_id=j.id JOIN workers w ON w.id=jw.worker_id WHERE j.id=? AND jw.worker_id=? AND j.organization_id='dus'",
      ).bind(id,workerId).first();
      if (!assignment) return json({ error: "Deze vakman is niet meer aan dit project gekoppeld." }, 409);
      if (assignment.status === "Geannuleerd")
        return json({ error: "Een geannuleerde aanvraag kan geen adreswijziging krijgen." }, 409);
      if (effectiveDate < String(assignment.current_start_date || effectiveDate))
        return json({ error: "De ingangsdatum kan niet vóór de huidige planningsdatum liggen." }, 400);
      if (newAddress.toLocaleLowerCase("nl-NL") === String(assignment.current_address || "").trim().toLocaleLowerCase("nl-NL"))
        return json({ error: "Het nieuwe adres is gelijk aan het huidige adres." }, 400);
      const dateText = effectiveDate.split("-").reverse().join("-"),
        note = "Adreswijziging voor " + assignment.worker_name + " op " + assignment.client + " per " + dateText + ": " + assignment.current_address + " → " + newAddress;
      await env.DB.batch([
        env.DB.prepare("UPDATE job_workers SET planning_location=?,planning_start_date=? WHERE job_id=? AND worker_id=?").bind(newAddress,effectiveDate,id,workerId),
        env.DB.prepare("UPDATE jobs SET updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id='dus'").bind(id),
        env.DB.prepare("INSERT INTO address_changes (job_id,worker_id,old_address,new_address,old_start_date,effective_date,changed_by) VALUES (?,?,?,?,?,?,?)").bind(id,workerId,assignment.current_address,newAddress,assignment.current_start_date,effectiveDate,user.name),
        env.DB.prepare("INSERT INTO comments (job_id,author,text) VALUES (?,?,?)").bind(id,user.name,note),
      ]);
      return json({ ok:true, worker_id:workerId, worker_name:assignment.worker_name, old_address:assignment.current_address, new_address:newAddress, old_start_date:assignment.current_start_date, effective_date:effectiveDate });
    }
    const jobPlanningWork = p.match(/^\/api\/jobs\/(\d+)\/planning-work$/);
    if (jobPlanningWork && request.method === "PATCH") {
      const id = Number(jobPlanningWork[1]),
        d = await body(request),
        text = String(d.planning_work || "").trim();
      if (!text)
        return json({ error: "De planningstekst mag niet leeg zijn." }, 400);
      const current = await env.DB.prepare(
        "SELECT ai_planning FROM jobs WHERE id=?",
      )
        .bind(id)
        .first();
      if (!current) return json({ error: "Aanvraag niet gevonden." }, 404);
      if (Number(current.ai_planning) !== 0)
        await env.DB.prepare(
          "UPDATE jobs SET planning_work=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
          .bind(text, id)
          .run();
      else
        await env.DB.prepare(
          "UPDATE jobs SET work=?,planning_work=NULL,planning_work_source=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
          .bind(text, id)
          .run();
      return json({ ok: true });
    }
    const job = p.match(/^\/api\/jobs\/(\d+)$/);
    if (job && request.method === "PATCH") {
      const id = Number(job[1]),
        d = await body(request),
        allowed = ["Nieuw", "In behandeling", "Ingevuld", "Geannuleerd"];
      if (!allowed.includes(d.status))
        return json({ error: "Ongeldige status." }, 400);
      const current = await env.DB.prepare(
          "SELECT work,ai_planning,people,(SELECT COUNT(*) FROM job_workers WHERE job_id=jobs.id) AS linked_workers FROM jobs WHERE id=?",
        )
          .bind(id)
          .first(),
        work = String(d.work ?? current?.work ?? "").trim(),
        people = Number(d.people ?? current?.people ?? 1),
        aiPlanning = d.ai_planning === 1 || d.ai_planning === "1" ? 1 : 0;
      if (!work) return json({ error: "Vul de werkzaamheden in." }, 400);
      if (!Number.isInteger(people) || people < 1 || people > 100)
        return json({ error: "Aantal personen moet tussen 1 en 100 liggen." }, 400);
      if (people < Number(current?.linked_workers || 0))
        return json({ error: "Er zijn al "+Number(current.linked_workers)+" vakmensen gekoppeld. Koppel eerst iemand los voordat je het aantal verlaagt." }, 409);
      const changed = work !== current?.work,
        enabledNow = aiPlanning === 1 && Number(current?.ai_planning) === 0,
        resetAI = changed || enabledNow;
      await env.DB.prepare(
        "UPDATE jobs SET filled_at=CASE WHEN ?='Ingevuld' AND status<>'Ingevuld' THEN CURRENT_TIMESTAMP WHEN ?<>'Ingevuld' THEN NULL ELSE filled_at END,status=?,assignee=?,people=?,work=?,ai_planning=?,planning_work=CASE WHEN ? THEN NULL ELSE planning_work END,planning_work_source=CASE WHEN ? THEN NULL ELSE planning_work_source END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
        .bind(
          d.status,
          d.status,
          d.status,
          d.assignee || null,
          people,
          work,
          aiPlanning,
          resetAI ? 1 : 0,
          resetAI ? 1 : 0,
          id,
        )
        .run();
      if (aiPlanning && resetAI)
        ctx?.waitUntil(regeneratePlanningWork(env, id, work));
      return json({
        ok: true,
        planning_regenerated: Boolean(aiPlanning && resetAI),
      });
    }
    if (job && request.method === "DELETE") {
      const id = Number(job[1]),
        linked = await env.DB.prepare(
          "SELECT worker_id FROM job_workers WHERE job_id=?",
        )
          .bind(id)
          .all();
      await env.DB.batch([
        env.DB.prepare("DELETE FROM comments WHERE job_id=?").bind(id),
        env.DB.prepare("DELETE FROM job_reactions WHERE job_id=?").bind(id),
        env.DB.prepare("DELETE FROM job_workers WHERE job_id=?").bind(id),
        env.DB.prepare("DELETE FROM jobs WHERE id=?").bind(id),
      ]);
      await Promise.all(
        (linked.results || []).map((row) =>
          env.DB.prepare(
            "UPDATE workers SET available=manual_available,updated_at=CURRENT_TIMESTAMP WHERE id=? AND NOT EXISTS (SELECT 1 FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE jw.worker_id=? AND j.status<>'Geannuleerd' AND date(COALESCE(NULLIF(j.end_date,''),j.start_date))>=date(?))",
          )
            .bind(row.worker_id, row.worker_id, netherlandsDateISO())
            .run(),
        ),
      );
      return new Response(null, { status: 204 });
    }
    const jobWorkers = p.match(/^\/api\/jobs\/(\d+)\/workers$/);
    if (jobWorkers && request.method === "GET") {
      const id = Number(jobWorkers[1]);
      const [linked, available] = await Promise.all([
        env.DB.prepare(
          "SELECT w.*,jw.system_planned,jw.address_sent,jw.hourly_rate,jw.fee,jw.linked_at FROM workers w JOIN job_workers jw ON jw.worker_id=w.id WHERE jw.job_id=? ORDER BY w.name",
        )
          .bind(id)
          .all(),
        env.DB.prepare(
          "SELECT w.* FROM workers w JOIN jobs target ON target.id=? WHERE w.manual_available=1 AND instr(','||lower(replace(replace(w.trade,'Zelfstandig ',''),' ',''))||',', ','||lower(replace(replace(target.trade,'Zelfstandig ',''),' ',''))||',')>0 AND NOT EXISTS (SELECT 1 FROM job_workers taken JOIN jobs active ON active.id=taken.job_id WHERE taken.worker_id=w.id AND active.id<>target.id AND active.status<>'Geannuleerd' AND date(COALESCE(NULLIF(taken.planning_start_date,''),active.start_date))<=date(COALESCE(NULLIF(target.end_date,''),target.start_date)) AND date(COALESCE(NULLIF(active.end_date,''),active.start_date))>=date(target.start_date)) ORDER BY w.name",
        )
          .bind(id)
          .all(),
      ]);
      return json({ linked: linked.results, available: available.results });
    }
    if (jobWorkers && request.method === "POST") {
      const id = Number(jobWorkers[1]),
        d = await body(request),
        workerId = Number(d.worker_id);
      if (!workerId) return json({ error: "Kies eerst een vakman." }, 400);
      const same = await env.DB.prepare(
        "SELECT 1 AS linked FROM job_workers WHERE job_id=? AND worker_id=?",
      )
        .bind(id, workerId)
        .first();
      if (same)
        return json({
          ok: true,
          status: "Ingevuld",
          worker_id: workerId,
          already_linked: true,
        });
      const existing = await env.DB.prepare(
        "SELECT active.id AS job_id FROM jobs target JOIN job_workers jw ON jw.worker_id=? JOIN jobs active ON active.id=jw.job_id WHERE target.id=? AND active.id<>target.id AND active.status<>'Geannuleerd' AND date(COALESCE(NULLIF(jw.planning_start_date,''),active.start_date))<=date(COALESCE(NULLIF(target.end_date,''),target.start_date)) AND date(COALESCE(NULLIF(active.end_date,''),active.start_date))>=date(target.start_date) LIMIT 1",
      )
        .bind(workerId, id)
        .first();
      if (existing)
        return json(
          {
            error:
              "Deze vakman is nog ingepland tot en met de einddatum van een andere aanvraag.",
          },
          409,
        );
      const selected = await env.DB.prepare(
        "SELECT id FROM workers WHERE id=? AND manual_available=1",
      )
        .bind(workerId)
        .first();
      if (!selected)
        return json(
          {
            error:
              "Deze vakman staat niet op beschikbaar. Vernieuw de aanvraag.",
          },
          409,
        );
      const defaults = await env.DB.prepare(
        "SELECT purchase_rate,COALESCE(planning_fee,purchase_rate*(SELECT fee_rate FROM trade_settings WHERE name=jobs.trade COLLATE NOCASE)) AS fee FROM jobs WHERE id=?",
      )
        .bind(id)
        .first();
      try {
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO job_workers (job_id,worker_id,linked_by,hourly_rate,fee) VALUES (?,?,?,?,?)",
          ).bind(
            id,
            workerId,
            user.name,
            defaults?.purchase_rate ?? null,
            defaults?.fee ?? null,
          ),
          env.DB.prepare(
            "UPDATE workers SET available=0,updated_at=CURRENT_TIMESTAMP WHERE id=?",
          ).bind(workerId),
          env.DB.prepare(
            "UPDATE jobs SET status='Ingevuld',filled_at=COALESCE(filled_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE id=?",
          ).bind(id),
        ]);
        return json({ ok: true, status: "Ingevuld", worker_id: workerId }, 201);
      } catch (error) {
        if (/unique/i.test(String(error?.message || error)))
          return json(
            {
              error: "Deze vakman is inmiddels al aan deze aanvraag gekoppeld.",
            },
            409,
          );
        throw error;
      }
    }
    const workerPlanned = p.match(
      /^\/api\/jobs\/(\d+)\/workers\/(\d+)\/planned$/,
    );
    if (workerPlanned && request.method === "PATCH") {
      const jobId = Number(workerPlanned[1]),
        workerId = Number(workerPlanned[2]),
        d = await body(request),
        planned = d.planned ? 1 : 0;
      const result = await env.DB.prepare(
        "UPDATE job_workers SET system_planned=? WHERE job_id=? AND worker_id=?",
      )
        .bind(planned, jobId, workerId)
        .run();
      if (!Number(result.meta?.changes || 0))
        return json(
          { error: "Deze vakman is niet meer aan deze aanvraag gekoppeld." },
          409,
        );
      return json({ ok: true, system_planned: planned });
    }
    const workerAddressSent = p.match(
      /^\/api\/jobs\/(\d+)\/workers\/(\d+)\/address-sent$/,
    );
    if (workerAddressSent && request.method === "PATCH") {
      const jobId = Number(workerAddressSent[1]),
        workerId = Number(workerAddressSent[2]),
        d = await body(request),
        sent = d.sent ? 1 : 0;
      const result = await env.DB.prepare(
        "UPDATE job_workers SET address_sent=? WHERE job_id=? AND worker_id=?",
      )
        .bind(sent, jobId, workerId)
        .run();
      if (!Number(result.meta?.changes || 0))
        return json(
          { error: "Deze vakman is niet meer aan deze aanvraag gekoppeld." },
          409,
        );
      return json({ ok: true, address_sent: sent });
    }
    const workerRate = p.match(/^\/api\/jobs\/(\d+)\/workers\/(\d+)\/rate$/);
    if (workerRate && request.method === "PATCH") {
      const jobId = Number(workerRate[1]),
        workerId = Number(workerRate[2]),
        d = await body(request),
        hourlyRate = Number(d.hourly_rate);
      if (!Number.isFinite(hourlyRate) || hourlyRate <= 0 || hourlyRate > 1000)
        return json({ error: "Vul een geldig uurtarief in." }, 400);
      const assignment = await env.DB.prepare(
        "SELECT j.trade FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE jw.job_id=? AND jw.worker_id=?",
      )
        .bind(jobId, workerId)
        .first();
      if (!assignment)
        return json(
          { error: "Deze vakman is niet meer aan deze aanvraag gekoppeld." },
          409,
        );
      const fee =
        hourlyRate * (await databaseFeeRate(env.DB, assignment.trade));
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE job_workers SET hourly_rate=?,fee=? WHERE job_id=? AND worker_id=?",
        ).bind(hourlyRate, fee, jobId, workerId),
        env.DB.prepare(
          "UPDATE jobs SET updated_at=CURRENT_TIMESTAMP WHERE id=?",
        ).bind(jobId),
      ]);
      return json({ ok: true, hourly_rate: hourlyRate, fee });
    }
    const linkedWorker = p.match(/^\/api\/jobs\/(\d+)\/workers\/(\d+)$/);
    if (linkedWorker && request.method === "DELETE") {
      const jobId = Number(linkedWorker[1]),
        workerId = Number(linkedWorker[2]);
      await env.DB.prepare(
        "DELETE FROM job_workers WHERE job_id=? AND worker_id=?",
      )
        .bind(jobId, workerId)
        .run();
      await env.DB.prepare(
        "UPDATE workers SET available=manual_available,updated_at=CURRENT_TIMESTAMP WHERE id=? AND NOT EXISTS (SELECT 1 FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE jw.worker_id=? AND j.status<>'Geannuleerd' AND date(COALESCE(NULLIF(j.end_date,''),j.start_date))>=date(?))",
      )
        .bind(workerId, workerId, netherlandsDateISO())
        .run();
      return new Response(null, { status: 204 });
    }
    const jobReaction = p.match(/^\/api\/jobs\/(\d+)\/reaction$/);
    if (jobReaction && request.method === "POST") {
      const jobId = Number(jobReaction[1]),d = await body(request),reaction = String(d.reaction || ""),config=await reactionConfiguration(env.DB),option=config.items.find(item=>item.key===reaction);
      if (!option||option.enabled===false) return json({ error: "Deze reactie is niet beschikbaar." }, 400);
      const [job,existing] = await env.DB.batch([
        env.DB.prepare("SELECT id,client,location FROM jobs WHERE id=? AND organization_id='dus'").bind(jobId),
        env.DB.prepare("SELECT reaction FROM job_reactions WHERE job_id=? AND user_name=? COLLATE NOCASE").bind(jobId,user.name),
      ]),jobRow=job.results?.[0],previous=existing.results?.[0]?.reaction||null;
      if (!jobRow) return json({ error: "Deze aanvraag bestaat niet meer." }, 404);
      const active=previous!==reaction;
      if (active) await env.DB.prepare("INSERT INTO job_reactions(job_id,user_name,reaction,created_at,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(job_id,user_name) DO UPDATE SET reaction=excluded.reaction,updated_at=CURRENT_TIMESTAMP").bind(jobId,user.name,reaction).run();
      else await env.DB.prepare("DELETE FROM job_reactions WHERE job_id=? AND user_name=? COLLATE NOCASE").bind(jobId,user.name).run();
      const rows=await env.DB.prepare("SELECT user_name,reaction,created_at,updated_at FROM job_reactions WHERE job_id=? ORDER BY datetime(updated_at),user_name COLLATE NOCASE").bind(jobId).all();
      if(active&&option.notify&&previous!==reaction)ctx?.waitUntil(sendReactionPushes(env,user.name,jobRow,option,config));
      return json({ok:true,active,reactions:rows.results||[]});
    }
    const comments = p.match(/^\/api\/jobs\/(\d+)\/comments$/);
    if (comments && request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT * FROM comments WHERE job_id=? ORDER BY datetime(created_at) DESC",
      )
        .bind(Number(comments[1]))
        .all();
      return json({ comments: r.results });
    }
    if (comments && request.method === "POST") {
      const d = await body(request),
        text = String(d.text || "").trim();
      if (!text) return json({ error: "Schrijf eerst een opmerking." }, 400);
      if (text.length > 4000)
        return json({ error: "De opmerking is te lang." }, 400);
      await env.DB.prepare(
        "INSERT INTO comments (job_id,author,text) VALUES (?,?,?)",
      )
        .bind(Number(comments[1]), user.name, text)
        .run();
      return json({ ok: true }, 201);
    }
    if (p === "/api/members" && request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT * FROM members ORDER BY name",
      ).all();
      return json({ members: r.results });
    }
    if (p === "/api/members" && request.method === "POST") {
      const d = await body(request);
      if (!d.name?.trim()) return json({ error: "Vul een naam in." }, 400);
      await env.DB.prepare("INSERT OR IGNORE INTO members (name) VALUES (?)")
        .bind(d.name.trim())
        .run();
      return json({ ok: true }, 201);
    }
    const member = p.match(/^\/api\/members\/(\d+)$/);
    if (member && request.method === "DELETE") {
      await env.DB.prepare("DELETE FROM members WHERE id=?")
        .bind(Number(member[1]))
        .run();
      return new Response(null, { status: 204 });
    }
    return json({ error: "Niet gevonden." }, 404);
  } catch (error) {
    if (error instanceof RequestError)
      return json({ error: error.message }, error.status);
    const requestId = crypto.randomUUID();
    console.error(
      "request-error",
      requestId,
      request.method,
      p,
      String(error?.message || error),
    );
    return json(
      { error: "De aanvraag kon niet worden verwerkt.", request_id: requestId },
      500,
    );
  }
}
export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env, ctx)
      .then((response) => {
        const origin = request.headers.get("origin") || "",
          url = new URL(request.url);
        if (
          url.pathname.startsWith("/api/admin/") &&
          origin &&
          origin === String(env.ADMIN_PORTAL_ORIGIN || "")
        ) {
          const headers = new Headers(response.headers);
          headers.set("access-control-allow-origin", origin);
          headers.set("access-control-allow-credentials", "false");
          headers.set("vary", "Origin");
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }
        return response;
      })
      .then(secureResponse);
  },
};

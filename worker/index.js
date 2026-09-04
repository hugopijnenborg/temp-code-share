import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

const brandPaths = `<path d="M68 47.2086C68 51.2095 66.1578 54.9875 63.0055 57.4513L42.5055 73.4738C37.8017 77.1503 31.1983 77.1503 26.4945 73.4738L5.99449 57.4513C2.84223 54.9875 1 51.2095 1 47.2086V14C1 6.82029 6.8203 1 14 1H55C62.1797 1 68 6.8203 68 14V47.2086Z" stroke="white" stroke-width="2"/><path d="M53.823 20.8866C50.6602 19.719 48.6012 19.391 48.6012 17.7856C48.6012 16.1801 54.1912 15.5241 54.1912 19.6827H59.5238V12.5088H54.441L54.2494 14.9314C54.2494 14.9314 52.5877 12 48.5505 12C44.5133 12 44.5349 13.0734 44.5349 13.107V12.5013H36.0114V16.4046H37.5632V24.215C37.5632 25.6406 36.9517 27.9058 34.6681 27.9058C32.3846 27.9058 31.7741 25.5819 31.7741 24.1367V16.2984H33.3437V12.5097H24.1026V14.1357C24.1026 14.1357 22.9218 12.5227 16.6424 12.5227C10.363 12.5227 9 12.5088 9 12.5088V16.3981H10.7725V28.6662H9V32.5574H16.5344C21.1737 32.5574 23.5437 32.085 26.8106 28.8432C26.8106 28.8432 28.7081 33 34.5686 33C40.4291 33 40.9776 30.4758 40.9776 30.4758V32.5742H46.1158L46.3074 30.3257C46.3074 30.3257 48.2311 32.9991 52.5342 32.9991C56.8373 32.9991 60 30.4441 60 26.9414C60 23.4388 56.9847 22.0532 53.822 20.8857L53.823 20.8866ZM16.7955 28.7212V16.3189C18.6187 16.3189 22.144 16.5267 22.144 22.1604C22.144 27.794 19.5928 28.7212 16.7955 28.7212ZM50.0224 28.0726C46.158 28.0726 46.3844 25.2493 46.3844 25.2493H42.9483V22.1855C45.5437 24.4395 50.1089 25.3704 50.1089 25.3704C52.909 26.1214 53.4735 28.0726 50.0224 28.0726Z" fill="white"/><path d="M33.5554 47.7174C33.8667 46.8218 35.1333 46.8218 35.4446 47.7174L36.9753 52.1212C37.1127 52.5163 37.4814 52.7842 37.8995 52.7927L42.5609 52.8877C43.5088 52.907 43.9002 54.1116 43.1446 54.6844L39.4294 57.5011C39.0961 57.7538 38.9552 58.1872 39.0764 58.5875L40.4265 63.0501C40.701 63.9576 39.6764 64.702 38.8981 64.1605L35.0712 61.4975C34.7279 61.2586 34.2721 61.2586 33.9288 61.4975L30.1019 64.1605C29.3236 64.702 28.299 63.9576 28.5735 63.0501L29.9236 58.5875C30.0448 58.1872 29.9039 57.7538 29.5706 57.5011L25.8554 54.6844C25.0998 54.1116 25.4912 52.907 26.4391 52.8877L31.1005 52.7927C31.5186 52.7842 31.8873 52.5163 32.0247 52.1212L33.5554 47.7174Z" fill="#EE7B08"/>`;
const brandMark = `<svg viewBox="0 0 69 81" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${brandPaths}</svg>`;
const page = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#125b32">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="DUS Aanvragen">
  <meta name="format-detection" content="telephone=no">
  <link rel="icon" href="/favicon.ico">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/icon.svg">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <title>DUS Aanvraagbord</title>
  <style>
    :root{--ink:#132019;--green:#125b32;--lime:#9bd54b;--orange:#f47b35;--paper:#f4f5f1;--muted:#6b746d;--line:#dfe4dd;--white:#fff;--shadow:0 12px 35px rgba(23,45,31,.09)}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html{min-height:100%;background:var(--paper);-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}body{margin:0;min-height:100dvh;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overscroll-behavior-y:none;-webkit-font-smoothing:antialiased}
    button,input,select,textarea{font:inherit}button,a{touch-action:manipulation}button{cursor:pointer}button:disabled{cursor:wait;opacity:.62}.hidden{display:none!important}@media(hover:none) and (pointer:coarse){.card:hover{transform:none;box-shadow:0 5px 20px rgba(24,49,33,.05)}button:active,.open:active,.navbtn:active{transform:scale(.98)}}
    .top{position:sticky;top:0;z-index:20;background:linear-gradient(95deg,#07551c,#4a965a 48%,#f8fbf6);border-bottom:1px solid rgba(0,0,0,.08)}
    .topin{height:74px;max-width:1240px;margin:auto;padding:0 22px;display:flex;align-items:center;gap:18px}.brand{width:48px;height:58px;display:grid;place-items:center;flex:0 0 auto}.brand svg{display:block;width:100%;height:100%}.brandHome,.titleHome{border:0;background:transparent;padding:0;text-align:left}.titleHome{color:inherit}
    .title{font-size:20px;font-weight:850;color:#fff}.sub{font-size:12px;color:#eaf7e9}.topspacer{flex:1}.welcome{color:#154a28;font-size:13px;font-weight:850;background:rgba(255,255,255,.66);border-radius:999px;padding:8px 12px;white-space:nowrap}.iconbtn{border:0;border-radius:14px;padding:11px 14px;background:rgba(255,255,255,.9);color:var(--green);font-weight:800;display:flex;align-items:center;gap:8px}.badge{background:var(--orange);color:#fff;border-radius:999px;padding:2px 7px;font-size:11px}
    .shell{max-width:1240px;margin:auto;padding:28px 22px 100px}.hero{display:grid;grid-template-columns:1.5fr .9fr;gap:20px;margin-bottom:22px}.heroMain{border-radius:26px;background:var(--green);color:#fff;padding:32px;min-height:220px;position:relative;overflow:hidden}.heroMain:after{content:"DUS";position:absolute;right:-18px;bottom:-64px;font-size:170px;font-weight:950;color:rgba(255,255,255,.07);letter-spacing:-12px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--lime);font-weight:900}.hero h1{font-size:clamp(32px,5vw,56px);line-height:.94;letter-spacing:-.045em;margin:10px 0 14px;text-transform:uppercase;max-width:700px}.hero p{max-width:580px;color:#dce9df;margin:0 0 22px}.primary{border:0;border-radius:999px;background:var(--orange);color:#fff;font-weight:900;padding:14px 19px;box-shadow:0 6px 0 #c95a22}.primary:active{transform:translateY(3px);box-shadow:0 3px 0 #c95a22}
    .stats{display:grid;grid-template-columns:1fr 1fr;gap:12px}.stat{background:#fff;border:1px solid var(--line);border-radius:20px;padding:19px;box-shadow:var(--shadow)}.stat b{display:block;font-size:34px;color:var(--green)}.stat span{font-size:13px;color:var(--muted)}
    .toolbar{display:flex;gap:12px;align-items:center;margin:22px 0 14px;flex-wrap:wrap}.toolbar h2{margin:0 auto 0 0;font-size:25px}.search{flex:1;max-width:360px;min-width:210px}.field{width:100%;min-height:48px;border:1px solid #ccd4cb;background:#fff;border-radius:13px;padding:13px 14px;color:var(--ink);outline:none;appearance:none;-webkit-appearance:none}.field:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(18,91,50,.12)}textarea.field{resize:vertical}
    .tabs{display:flex;gap:8px;overflow:auto;padding-bottom:8px}.tab{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 14px;font-weight:750;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}.tab.active{background:var(--ink);color:#fff;border-color:var(--ink)}.tabBadge{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:var(--orange);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;line-height:1}.tabBadge.hidden{display:none}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:0 5px 20px rgba(24,49,33,.05);transition:transform .16s ease,box-shadow .16s ease;content-visibility:auto;contain-intrinsic-size:260px}.card:hover{transform:translateY(-2px);box-shadow:var(--shadow)}.cardhead{display:flex;align-items:start;gap:12px}.num{font-size:11px;font-weight:900;color:var(--muted);letter-spacing:.08em}.card h3{margin:4px 0 5px;font-size:19px;line-height:1.15}.pill{margin-left:auto;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;background:#eef4ee;color:var(--green)}.pill.high{background:#fff0e8;color:#c64e12}.meta{display:grid;gap:7px;margin:16px 0;color:#4e5952;font-size:13px}.meta div{display:flex;gap:8px}.cardfoot{border-top:1px solid var(--line);padding-top:14px;display:flex;align-items:center;gap:9px}.status{font-size:12px;font-weight:850}.status:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--orange);margin-right:6px}.status.done:before{background:var(--green)}.open{margin-left:auto;border:0;background:transparent;color:var(--green);font-weight:900}
    .empty{grid-column:1/-1;text-align:center;background:#fff;border:1px dashed #bdc9bd;border-radius:22px;padding:55px 20px}.empty b{font-size:22px;display:block;margin-bottom:7px}.empty span{color:var(--muted)}
    .modal{position:fixed;inset:0;background:rgba(6,20,12,.62);z-index:50;display:grid;place-items:center;padding:16px}.modal:not(.hidden){animation:fadeIn .14s ease-out}.modal:not(.hidden) .panel{animation:panelIn .18s cubic-bezier(.2,.8,.2,1)}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes panelIn{from{opacity:.75;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}.panel{background:#fff;border-radius:26px;width:min(720px,100%);max-height:92vh;overflow:auto;box-shadow:0 30px 90px rgba(0,0,0,.3);will-change:transform}.panelhead{padding:22px 24px;border-bottom:1px solid var(--line);display:flex;align-items:center}.panelhead h2{margin:0;font-size:24px}.close{margin-left:auto;border:0;background:#edf1ed;border-radius:50%;width:38px;height:38px;font-size:20px}.panelbody{padding:24px}.loadingState{display:grid;place-items:center;gap:12px;min-height:260px;color:var(--muted);font-weight:800}.loadingDot{width:34px;height:34px;border:3px solid #dce4dc;border-top-color:var(--green);border-radius:50%;animation:spin .65s linear infinite}.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.full{grid-column:1/-1}.label{display:block;font-size:12px;font-weight:850;margin:0 0 6px}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}.secondary{border:1px solid var(--line);border-radius:999px;background:#fff;padding:13px 17px;font-weight:800}
    .danger{border:1px solid #f0b7a3;border-radius:999px;background:#fff1eb;color:#b73f14;padding:13px 17px;font-weight:850;margin-right:auto}.danger:hover{background:#b73f14;color:#fff}
    .detailTop{background:var(--green);color:#fff;border-radius:18px;padding:20px;margin-bottom:18px}.detailTop h3{font-size:27px;margin:5px 0}.detailTop p{margin:0;color:#dce9df}.detailgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detailbox{background:#f5f7f4;border-radius:14px;padding:13px}.detailbox small{display:block;color:var(--muted);margin-bottom:4px}.detailbox b{word-break:break-word}.comments{margin-top:20px}.comment{background:#f5f7f4;border-radius:13px;padding:12px;margin:9px 0}.comment small{color:var(--muted)}.comment p{margin:5px 0 0}.row{display:flex;gap:9px}.row .field{flex:1}.teamrow{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:12px 0}.avatar{width:40px;height:40px;border-radius:50%;background:#e2f0df;color:var(--green);font-weight:900;display:grid;place-items:center}.remove{margin-left:auto;border:0;background:#fff0ea;color:#bd4310;border-radius:9px;padding:7px 9px;font-weight:800}
    .workerAvailabilityOverview{margin-bottom:16px}.workerAvailabilityStats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:11px}.workerAvailabilityStats article{background:#f3f7f2;border:1px solid #dde7dc;border-radius:15px;padding:12px}.workerAvailabilityStats b{display:block;color:var(--green);font-size:24px;line-height:1}.workerAvailabilityStats span{display:block;color:var(--muted);font-size:10px;font-weight:800;margin-top:6px}.workerAvailabilityTabs{display:flex;gap:7px;margin-bottom:11px}.workerAvailabilityTabs button{border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--green);padding:9px 13px;font-weight:850}.workerAvailabilityTabs button.active{background:var(--green);border-color:var(--green);color:#fff}.workerTradeSummary{display:flex;gap:8px;overflow-x:auto;padding:1px 1px 8px;scrollbar-width:thin}.workerTradeSummary button{flex:0 0 auto;min-width:150px;text-align:left;border:1px solid var(--line);border-radius:13px;background:#fff;padding:10px 11px;color:var(--green)}.workerTradeSummary button.active{background:#edf6ea;border-color:#86b98c;box-shadow:inset 0 0 0 1px #86b98c}.workerTradeSummary b,.workerTradeSummary span{display:block}.workerTradeSummary b{font-size:11px}.workerTradeSummary span{font-size:9px;color:var(--muted);margin-top:4px}.workerToolbar{display:flex;align-items:center;gap:9px;margin-bottom:14px}.workerToolbar .field{flex:1}#workersModal .panel{width:min(1180px,100%)}.workerList{display:grid;gap:11px}.workerMatrix{border:1px solid var(--line);border-radius:17px;overflow:hidden;background:#fff}.workerMatrix>header,.workerMatrixRow{display:grid;grid-template-columns:210px minmax(0,1fr) minmax(0,1fr)}.workerMatrix>header{background:var(--green);color:#fff;padding:10px 12px;font-size:11px}.workerMatrix>header b:not(:first-child){padding-left:12px}.workerMatrixRow{border-top:1px solid var(--line);min-height:68px}.workerMatrixTrade{background:#f3f7f2;padding:11px 12px}.workerMatrixTrade b,.workerMatrixTrade span{display:block}.workerMatrixTrade b{color:var(--green);font-size:12px}.workerMatrixTrade span{color:var(--muted);font-size:9px;margin-top:5px}.workerMatrixCell{display:flex;align-content:flex-start;align-items:flex-start;gap:6px;flex-wrap:wrap;padding:9px 10px}.workerMatrixCell+.workerMatrixCell{border-left:1px solid var(--line)}.workerNameChip{border:1px solid transparent;border-radius:10px;padding:7px 9px;text-align:left;line-height:1.15;cursor:pointer}.workerNameChip b,.workerNameChip small{display:block}.workerNameChip b{font-size:11px}.workerNameChip small{font-size:8px;font-weight:650;margin-top:3px;opacity:.72}.workerNameChip.isAvailable{background:#e8f5e3;color:#145d31;border-color:#c8e4c1}.workerNameChip.isUnavailable{background:#f1f2f0;color:#69716b;border-color:#e0e2df}.workerNameChip:hover,.workerNameChip:focus-visible{outline:2px solid var(--orange);outline-offset:1px}.workerNone{font-size:10px;color:#98a099;padding:7px}.workerAvailabilityStats{display:block;margin:0}.workerSummaryLine{display:flex;align-items:center;gap:5px;color:#617067;font-size:12px;padding:3px 1px}.workerSummaryLine strong{color:var(--green);font-size:19px}.workerSummaryLine span{margin-left:auto;color:#8a928c}.workerMatrix{border-radius:12px}.workerMatrix>header,.workerMatrixRow{grid-template-columns:180px minmax(0,1.2fr) minmax(0,1fr)}.workerMatrix>header{padding:9px 11px;background:#f2f5f1;color:#526158;border-bottom:1px solid var(--line)}.workerMatrixRow{min-height:52px}.workerMatrixTrade{background:#fff;padding:10px 11px;border-right:1px solid var(--line)}.workerMatrixTrade b{font-size:11px}.workerMatrixTrade span{font-size:8px;margin-top:3px}.workerMatrixCell{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 8px;padding:6px 9px;align-items:start}.workerNameChip{display:flex;align-items:center;gap:7px;border:0;border-radius:0;background:transparent!important;padding:6px 2px;color:#31443a!important;min-width:0}.workerNameChip i{width:7px;height:7px;border-radius:50%;flex:0 0 auto;background:#a4aaa6}.workerNameChip.isAvailable i{background:#2b9b53}.workerNameChip b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.workerNameChip:hover,.workerNameChip:focus-visible{outline:0;background:#f3f6f2!important}.workerNone{padding:6px 2px}.workerCard{border:1px solid var(--line);border-radius:17px;padding:15px;background:#fff}.workerHead{display:flex;align-items:flex-start;gap:10px}.workerHead h3{margin:0 0 3px;font-size:18px}.workerMeta{color:var(--muted);font-size:12px}.availability{margin-left:auto;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;background:#e6f4df;color:var(--green);white-space:nowrap}.availability.off{background:#f0f1ef;color:#727a74}.workerNote{margin:12px 0 0;color:#4e5952;font-size:13px;line-height:1.45}.contactActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.contactBtn{min-height:42px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--green);font-weight:850;padding:10px 13px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.contactBtn.whatsapp{background:#e8f7e7;border-color:#cce8c8}.contactBtn.edit{margin-left:auto}.workerInvite{border:1px solid #b9dbb9;background:#eef8eb;border-radius:16px;padding:15px}.workerInvite h3{margin:0 0 6px;font-size:17px}.workerInvite p{margin:0 0 12px;color:#4e6754;font-size:12px;line-height:1.45}.inviteToggle,.aiChoice{display:flex;align-items:flex-start;gap:10px;font-weight:800}.inviteToggle input,.aiChoice input{width:21px;height:21px;flex:0 0 auto;margin:0;accent-color:var(--green)}.aiChoice{border:1px solid #b9dbb9;background:#eef8eb;border-radius:16px;padding:14px}.aiChoice small{display:block;color:#4e6754;font-weight:500;line-height:1.4;margin-top:4px}.staffing{margin-top:20px;border-top:1px solid var(--line);padding-top:19px}.staffing h3{margin:0 0 11px}.linkedWorker{display:grid;grid-template-columns:minmax(150px,1fr) minmax(260px,1.2fr) auto;align-items:center;gap:12px;background:#f5f7f4;border-radius:14px;padding:12px;margin:8px 0}.linkedWorker.noPersonalRate{grid-template-columns:1fr auto}.linkedWorker strong{display:block}.linkedWorker small{color:var(--muted)}.linkedWorkerRate{display:grid;grid-template-columns:1fr 1fr auto;align-items:end;gap:7px}.linkedWorkerRate label{min-width:0}.linkedWorkerRate .label{font-size:10px;margin-bottom:3px}.linkedWorkerRate .field{min-height:40px;padding:8px 10px}.linkedWorkerRate output{display:flex;align-items:center;min-height:40px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:8px 10px;font-weight:850}.linkedWorkerRate button{min-height:40px;padding:8px 11px}.linkedWorker .contactActions{margin:0;flex-wrap:nowrap}.linkedWorker .contactBtn{min-height:38px;padding:8px 10px}.unlink{border:0;background:#fff0ea;color:#bd4310;border-radius:999px;min-height:38px;padding:8px 10px;font-weight:900}
    #planningPage{max-width:1600px;padding-left:14px;padding-right:14px}.planningHero{background:linear-gradient(120deg,#0b5428,#397d43);color:#fff;border-radius:24px;padding:26px 28px;margin-bottom:18px;display:flex;align-items:end;gap:20px}.planningHero h1{margin:5px 0 6px;font-size:38px;line-height:1;text-transform:uppercase;letter-spacing:-.035em}.planningHero p{margin:0;color:#dce9df}.planningHeroActions{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.planningHeroActions .primary{white-space:nowrap}.weekTabs{display:flex;gap:8px;overflow-x:auto;padding:1px 1px 12px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}.weekTab{border:1px solid #b8c7b5;background:#fff;color:var(--green);border-radius:999px;padding:10px 15px;font-weight:900;white-space:nowrap}.weekTab.active{background:var(--green);color:#fff;border-color:var(--green)}.planningToolbar{display:flex;align-items:center;gap:10px;margin:0 0 13px}.planningToolbar .field{max-width:300px}.planningCount{margin-left:auto;color:var(--muted);font-size:13px;font-weight:800}.planningTableWrap{overflow-x:hidden;overflow-y:visible;border:1px solid #8ca875;border-radius:4px;background:#fff;box-shadow:var(--shadow)}.excelTable{border-collapse:collapse;table-layout:fixed;width:100%;min-width:0;font-size:clamp(12px,.9vw,14px)}.excelTable th{background:#f2f2f2;color:#111;font-weight:850;text-align:left;padding:7px 8px;border:1px solid #a9a9a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.excelTable td{background:#fff;border:1px solid #c8cec7;height:47px;padding:8px;color:#172014;vertical-align:top;overflow:hidden;transition:background-color .14s ease,border-color .14s ease}.excelTable tbody tr.dateBreak td{border-top:8px solid #111!important}.excelTable tbody tr.isPlanned td{background:#91d247;border-color:#80bb3e}.excelTable tbody tr.isPlanned:nth-child(even) td{background:#9bda52}.excelCell[contenteditable="true"]{outline:none;cursor:text;white-space:pre-wrap}.excelCell[contenteditable="true"]:hover{background:#f5f7f4}.excelTable tbody tr.isPlanned .excelCell[contenteditable="true"]:hover{background:#a7df67}.excelCell[contenteditable="true"]:focus{background:#fff!important;box-shadow:inset 0 0 0 2px #176b38}.excelWorker{font-weight:800}.plannedWorker{display:flex;align-items:flex-start;gap:6px;line-height:1.25}.plannedWorker input{width:18px;height:18px;flex:0 0 auto;margin:0;accent-color:var(--green);cursor:pointer}.plannedWorker input:disabled{cursor:wait}.plannedWorker span,.planningWorkerLink{min-width:0;overflow:hidden;text-overflow:ellipsis}.planningWorkerLink{display:inline-block;border:0;background:transparent;color:var(--green);font:inherit;font-weight:850;text-align:left;text-decoration:underline;text-underline-offset:2px;padding:0;cursor:pointer}.planningWorkerLink:hover{color:var(--orange)}.excelSelect{width:100%;border:0;background:transparent;color:#172014;outline:none;padding:0;font-size:inherit}.excelSelect:focus{background:#fff;box-shadow:0 0 0 2px #176b38}.planningEmpty{padding:24px!important;background:#fff!important;color:#27411f;font-weight:750}.sheetInput,.sheetSelect,.sheetTextarea{width:100%;min-width:0;border:1px solid #ccd4cb;border-radius:8px;background:#fff;color:#172014;padding:8px;outline:none}.sheetInput:focus,.sheetSelect:focus,.sheetTextarea:focus{border-color:#176b38;box-shadow:0 0 0 2px rgba(23,107,56,.12)}.sheetTextarea{resize:vertical;min-height:48px}.sheetMoney{min-width:0}.planningCards{display:none}.planningCard{background:#fff;border:1px solid var(--line);border-left:6px solid #cfd6ce;border-radius:17px;padding:15px;box-shadow:0 5px 18px rgba(24,49,33,.06);transition:background-color .14s ease,border-color .14s ease}.planningCard.dateBreak{border-top:8px solid #111}.planningCard.isPlanned{background:#91d247;border-color:#80bb3e}.planningCardTop{display:flex;align-items:flex-start;gap:10px}.planningCard h3{margin:0 0 4px;font-size:19px}.planningCardGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.planningCardGrid label{background:#f4f7f2;border-radius:11px;padding:10px}.planningCard.isPlanned .planningCardGrid label{background:rgba(255,255,255,.45)}.planningCardGrid small{display:block;color:var(--muted);font-size:11px;margin-bottom:5px}.planningCardGrid .wide{grid-column:1/-1}.planActions{display:grid;gap:6px;min-width:100px}.planEdit{border:0;border-radius:9px;background:#fff;color:var(--green);font-weight:900;padding:8px 10px;white-space:nowrap}.planEdit.save{background:var(--green);color:#fff}.planningCard .planActions{grid-template-columns:1fr 1fr}.planningCard .planEdit{width:100%;min-height:46px;background:#edf5ea}.planningCard .planEdit.save{background:var(--green);color:#fff}
    .appManager{border:1px solid #b9d1bd;border-radius:22px;background:#f7faf6;padding:18px}.appManagerHead{display:flex;align-items:flex-start;gap:14px}.appManagerHead>div{flex:1}.appManagerHead h3{font-size:24px;margin:4px 0}.appManagerHead p,.managePanel>p,.manageHint{color:var(--muted);font-size:12px;line-height:1.45}.manageTabs{display:flex;gap:7px;overflow-x:auto;padding:15px 0 10px;scrollbar-width:thin}.manageTab{border:1px solid #c7d4c8;border-radius:999px;background:#fff;color:var(--green);padding:10px 13px;font-weight:850;white-space:nowrap}.manageTab.active{background:var(--green);color:#fff}.manageLoading{padding:28px;text-align:center;color:var(--muted);font-weight:800}.managePanel{display:none;border-top:1px solid #dce5dc;padding-top:16px}.managePanel.active{display:block}.manageActions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}.colorField{padding:6px;height:52px}.brandPreview{border-radius:18px;background:var(--green);color:#fff;padding:20px;display:grid;gap:7px}.brandPreview b{font-size:22px}.brandPreview span{color:#e0eee2}.brandPreview button{justify-self:start;border:0;border-radius:999px;background:var(--orange);color:#fff;padding:10px 14px;font-weight:900}.managePreview{border:1px solid var(--line);border-radius:15px;background:#fff;padding:15px;white-space:pre-wrap}.sortableList{display:grid;gap:8px;margin-top:12px}.sortableItem,.statusManageRow,.roleManageRow{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;border:1px solid var(--line);border-radius:14px;background:#fff;padding:11px}.sortableItem[draggable="true"]{cursor:grab}.dragHandle{font-size:18px;color:var(--muted)}.itemActions{display:flex;gap:6px;flex-wrap:wrap}.itemActions button{border:0;border-radius:9px;padding:7px 9px;font-weight:800}.checkSetting{display:flex;align-items:center;gap:9px;min-height:48px}.checkSetting input,.sortableItem input,.statusManageRow input,.roleManageRow input{width:20px;height:20px;accent-color:var(--green)}.statusManageRow{grid-template-columns:1fr 110px 80px}.statusManageRow .field{min-height:42px;padding:8px}.roleManageRow{grid-template-columns:1fr 150px}.changeLog{margin-top:16px}.changeLog summary{cursor:pointer;color:var(--green);font-weight:850}.logRow{border-bottom:1px solid var(--line);padding:10px 0;font-size:12px}.logRow small{display:block;color:var(--muted);margin-top:3px}
    .toast{position:fixed;z-index:80;left:50%;bottom:25px;transform:translateX(-50%) translateY(120px);opacity:0;background:#102018;color:#fff;border-radius:999px;padding:12px 17px;font-weight:750;box-shadow:var(--shadow);pointer-events:none}.toast.show{animation:toastLife 1.8s ease both}@keyframes toastLife{0%{transform:translateX(-50%) translateY(40px);opacity:0}10%,72%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(24px);opacity:0}}
    .login{position:fixed;inset:0;z-index:100;background:linear-gradient(135deg,#08441c,#176b38 58%,#8fcf49);display:grid;place-items:center;padding:20px}.loginCard{width:min(420px,100%);background:#fff;border-radius:28px;padding:30px;box-shadow:0 35px 100px rgba(0,0,0,.28)}.loginLogo{width:82px;height:92px;border-radius:22px;background:#125b32;display:grid;place-items:center;padding:9px;margin-bottom:22px}.loginLogo svg{display:block;width:100%;height:100%}.login h1{font-size:34px;line-height:1;margin:0 0 10px;text-transform:uppercase;letter-spacing:-.04em}.login p{color:var(--muted);margin:0 0 22px}.pin{font-size:25px!important;letter-spacing:.28em;text-align:center;font-weight:850}.loginError{min-height:20px;color:#bd4310;font-size:13px;font-weight:750;margin-top:10px}.login .primary{width:100%;margin-top:5px}.faceLogin{width:100%;margin-top:13px;min-height:50px;color:var(--green);border-color:#b9cbbd}.loginDivider{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;margin:17px 0 0}.loginDivider:before,.loginDivider:after{content:"";height:1px;background:var(--line);flex:1}.securityBlock{background:#f3f7f2;border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:14px}.securityBlock p{margin:8px 0 0;color:var(--muted);font-size:12px;line-height:1.45}
    .launch{position:fixed;inset:0;z-index:110;background:linear-gradient(145deg,#06491c,#126333 58%,#8fcf49);display:grid;place-items:center;color:#fff;padding:24px}.launchInner{text-align:center;animation:launchIn .25s ease-out both}.launchLogo{width:82px;height:98px;margin:0 auto 18px}.launchLogo svg{width:100%;height:100%}.launch b{display:block;font-size:22px;text-transform:uppercase;letter-spacing:.02em}.launch span{display:block;color:#e1f0e2;font-size:13px;margin-top:6px}.launchSpinner{width:28px;height:28px;border:3px solid rgba(255,255,255,.28);border-top-color:#fff;border-radius:50%;margin:22px auto 0;animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes launchIn{from{opacity:.5;transform:scale(.98)}to{opacity:1;transform:none}}
    .start{position:fixed;inset:0;z-index:95;overflow:auto;background:radial-gradient(circle at 88% 15%,rgba(155,213,75,.4),transparent 32%),linear-gradient(145deg,#06491c 0%,#126333 55%,#0a3f20 100%);color:#fff;padding:max(22px,env(safe-area-inset-top)) 18px max(22px,env(safe-area-inset-bottom));display:grid;place-items:center}.startCard{width:min(720px,100%);position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:32px;background:rgba(7,55,26,.45);box-shadow:0 28px 80px rgba(0,0,0,.28);padding:34px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:startRise .34s ease-out both}@keyframes startRise{from{opacity:.7;transform:translateY(9px) scale(.995)}to{opacity:1;transform:none}}.startCard:after{content:"DUS";position:absolute;right:-24px;top:-38px;font-size:150px;font-weight:950;letter-spacing:-.1em;color:rgba(255,255,255,.055);pointer-events:none}.startHead{display:flex;align-items:center;gap:17px;position:relative;z-index:1}.startLogo{width:64px;height:76px;flex:0 0 auto}.startLogo svg{width:100%;height:100%}.startBrand{font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--lime)}.startDate{font-size:13px;color:#d9eadc;margin-top:5px}.start h1{position:relative;z-index:1;font-size:clamp(38px,8vw,66px);line-height:.95;letter-spacing:-.045em;text-transform:uppercase;margin:36px 0 12px;max-width:620px}.startIntro{position:relative;z-index:1;color:#dceade;font-size:16px;line-height:1.5;margin:0 0 25px;max-width:540px}.startStats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:25px}.startStat{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.13);border-radius:17px;padding:14px}.startStat b{display:block;font-size:27px}.startStat span{color:#d7e7da;font-size:11px}.startActions{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:10px}.startActions button{min-height:54px}.startBoard{background:#fff;color:var(--green);border:0;border-radius:999px;font-weight:900;padding:14px 18px}.startNew{border:0;border-radius:999px;background:var(--orange);color:#fff;font-weight:900;padding:14px 18px;box-shadow:0 5px 0 #c95a22}.startWorkers,.startPlanning{border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(255,255,255,.1);color:#fff;font-weight:900;padding:14px 18px}.startSwitch{position:relative;z-index:1;display:block;margin:18px auto 0;border:0;background:transparent;color:#d9eadc;text-decoration:underline;font-weight:750;padding:10px}.dailyQuote{position:relative;z-index:1;margin:14px auto 0;padding:15px 18px;max-width:590px;text-align:center;border-top:1px solid rgba(255,255,255,.18);color:#f2f8f3}.dailyQuote q{display:block;font-size:15px;line-height:1.45;font-weight:700}.dailyQuote cite{display:block;margin-top:6px;color:var(--lime);font-size:12px;font-style:normal;font-weight:900;letter-spacing:.04em}
    .bottom{display:none}
    @media(max-width:860px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:1fr 1fr}.heroMain{min-height:240px}.topin{height:66px}.title{font-size:17px}.sub{display:none}}
    @media(max-width:600px){
      body{padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
      button,.tab,.open,.close,.navbtn{min-height:44px}.shell{padding:14px 12px calc(94px + env(safe-area-inset-bottom))}.top{top:env(safe-area-inset-top)}.topin{height:62px;padding:0 12px;gap:8px}.brand{width:37px;height:46px}.title{font-size:16px}.welcome{font-size:11px;padding:7px 9px;max-width:100px;overflow:hidden;text-overflow:ellipsis}.iconbtn{min-width:44px;justify-content:center;padding:10px}.iconbtn .hideMobile,.workersTop,.planningTop,.clientsTop,.dailyQuote{display:none}
      .hero{gap:12px;margin-bottom:17px}.heroMain{padding:22px 20px 24px;border-radius:20px;min-height:228px}.heroMain:after{font-size:120px;bottom:-44px}.hero h1{font-size:37px;line-height:.96;margin-top:8px}.hero p{font-size:14px;line-height:1.45;margin-bottom:18px}.primary{min-height:48px;padding:13px 18px}
      .stats{grid-template-columns:repeat(4,1fr);gap:7px}.stat{padding:11px 5px;text-align:center;border-radius:14px}.stat b{font-size:24px;line-height:1.1}.stat span{font-size:9px;white-space:nowrap}
      .toolbar{gap:9px;margin:18px 0 10px}.toolbar h2{font-size:23px}.toolbar .search{order:3;max-width:none;flex-basis:100%}.toolbar select{flex:1;width:auto!important;max-width:165px}.field{font-size:16px!important;min-height:50px;padding:13px 14px}.tabs{margin:0 -12px;padding:2px 12px 10px;scroll-padding:12px;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}.tab{padding:10px 14px}
      .grid{grid-template-columns:1fr;gap:11px}.card{padding:17px;border-radius:17px;box-shadow:0 4px 14px rgba(24,49,33,.05)}.card:hover{transform:none}.card h3{font-size:20px}.meta{font-size:14px;gap:9px;margin:15px 0}.open{padding:8px 0 8px 12px}.cardfoot{min-height:48px}
      .planningHero{padding:21px 18px;border-radius:19px;display:block}.planningHero h1{font-size:34px}.planningHero p{font-size:13px;line-height:1.4}.planningHero .primary{width:100%;margin:16px 0 0}.planningToolbar{display:grid;grid-template-columns:1fr 1fr}.planningToolbar .field{max-width:none}.planningToolbar .search{grid-column:1/-1;min-width:0}.planningCount{grid-column:1/-1;margin:0}.planningTableWrap{display:none}.planningCards{display:grid;gap:11px}.planningCardGrid{grid-template-columns:1fr 1fr}.plannedWorker input{width:22px;height:22px}.plannedWorker{align-items:center;min-height:32px}
      .modal{align-items:end;padding:0;background:rgba(6,20,12,.52);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}.panel{width:100%;max-height:94dvh;border-radius:24px 24px 0 0;padding-bottom:env(safe-area-inset-bottom);overscroll-behavior:contain}.panel:before{content:"";display:block;width:42px;height:5px;border-radius:99px;background:#cbd2cc;margin:9px auto 1px}.panelhead{position:sticky;top:0;z-index:3;background:#fff;padding:13px 17px 14px}.panelhead h2{font-size:21px}.close{width:44px;height:44px}.panelbody{padding:17px 16px calc(22px + env(safe-area-inset-bottom))}.formgrid,.detailgrid{grid-template-columns:1fr;gap:13px}.full{grid-column:auto}.actions{position:sticky;bottom:calc(-22px - env(safe-area-inset-bottom));z-index:2;background:linear-gradient(transparent 0,#fff 20%);padding:20px 0 calc(14px + env(safe-area-inset-bottom));margin-top:8px;flex-wrap:wrap}.actions .primary{flex:1}.danger{min-height:48px;order:2;width:100%;margin:0}.detailTop{padding:18px;border-radius:16px}.detailTop h3{font-size:23px}.row{align-items:stretch}.row .secondary,.row .primary{min-width:96px}.teamrow{min-height:58px}.workerAvailabilityOverview{background:#fff;padding:0}.workerMatrix>header{display:none}.workerMatrixRow{grid-template-columns:1fr}.workerMatrixTrade{padding:9px 10px}.workerMatrixCell{padding:8px}.workerMatrixCell+.workerMatrixCell{border-left:0;border-top:1px dashed var(--line)}.workerMatrixCell:before{width:100%;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.availableCell:before{content:"Beschikbaar";color:var(--green)}.unavailableCell:before{content:"Niet beschikbaar";color:#737b75}.workerNameChip{padding:7px 8px}.workerNameChip b{font-size:12px}.workerSummaryLine{font-size:11px}.workerSummaryLine span{font-size:9px}.workerMatrixRow{grid-template-columns:1fr 1fr}.workerMatrixTrade{grid-column:1/-1;display:flex;align-items:center;border-right:0;border-bottom:1px solid var(--line)}.workerMatrixTrade span{margin:0 0 0 auto}.workerMatrixCell{grid-template-columns:1fr;padding:5px 8px}.workerMatrixCell+.workerMatrixCell{border-left:1px solid var(--line);border-top:1px solid var(--line)}.workerMatrixCell:first-of-type{border-top:1px solid var(--line)}.workerMatrixCell:before{font-size:8px}.workerAvailabilityStats article{padding:10px}.workerAvailabilityStats b{font-size:21px}.workerAvailabilityTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.workerAvailabilityTabs button{padding:9px 5px;font-size:10px}.workerTradeSummary button{min-width:138px}.workerToolbar{align-items:stretch}.workerToolbar .primary{padding:12px 14px}.workerHead{gap:8px}.workerCard{padding:14px}.contactActions{display:grid;grid-template-columns:1fr 1fr}.contactBtn.edit{margin-left:0}.linkedWorker,.linkedWorker.noPersonalRate{grid-template-columns:1fr;align-items:stretch}.linkedWorkerRate{grid-template-columns:1fr 1fr}.linkedWorkerRate button{grid-column:1/-1}.linkedWorker .contactActions{width:100%;margin:4px 0 0;display:flex}.linkedWorker .contactBtn,.unlink{flex:1}.staffing .row{display:grid;grid-template-columns:1fr}.staffing .row .primary{width:100%}
      .login{padding:max(20px,env(safe-area-inset-top)) 16px max(20px,env(safe-area-inset-bottom))}.loginCard{padding:26px 21px;border-radius:24px}.login h1{font-size:31px}.pin{font-size:25px!important}.toast{bottom:calc(82px + env(safe-area-inset-bottom));max-width:calc(100vw - 28px);white-space:normal;text-align:center;border-radius:16px}
      .start{place-items:stretch;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom))}.startCard{min-height:calc(100dvh - max(24px,env(safe-area-inset-top)) - max(24px,env(safe-area-inset-bottom)));border-radius:24px;padding:24px 20px;display:flex;flex-direction:column;justify-content:center}.startCard:after{font-size:118px;top:-25px}.startHead{gap:13px}.startLogo{width:50px;height:61px}.start h1{font-size:45px;margin:30px 0 11px}.startIntro{font-size:14px;margin-bottom:20px}.startStats{gap:7px;margin-bottom:20px}.startStat{padding:12px 8px;border-radius:14px}.startStat b{font-size:24px}.startStat span{font-size:10px}.startActions{grid-template-columns:1fr}.startActions button{min-height:54px}.startSwitch{margin-top:10px}
      .bottom{position:fixed;z-index:30;bottom:0;left:0;right:0;padding:7px 5px calc(7px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid var(--line);display:flex;justify-content:space-around;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.navbtn{border:0;background:transparent;color:var(--muted);font-size:9px;font-weight:800;display:grid;gap:2px;place-items:center;min-width:56px;padding:2px}.navbtn i{font-style:normal;font-size:20px}.navbtn.active{color:var(--green)}
    }
    .excelWork{cursor:pointer;white-space:nowrap;text-overflow:ellipsis;line-height:27px}.excelWork:hover{background:#a7df67!important}.aiPending{font-style:italic;color:#42633b}.planningWorkPreview{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;line-height:1.4;cursor:pointer}.tradeChoices{border:1px solid #ccd4cb;border-radius:14px;padding:12px 14px;margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tradeChoices legend{padding:0 6px}.tradeChoices legend small{font-weight:500;color:var(--muted);margin-left:5px}.tradeChoices label{display:flex;align-items:center;gap:8px;min-height:40px;background:#f4f7f2;border-radius:10px;padding:8px 10px;font-weight:750}.tradeChoices input{width:20px;height:20px;accent-color:var(--green)}.tradeSettingsEditor{display:grid;gap:12px;margin-top:34px;padding-top:4px}.tradeSettingsEditor>label{display:block}.tradeSettingsEditor>label>.label{margin-bottom:8px}.tradeSettingsEditor .companyCard{margin-top:0}.companyList{display:grid;gap:12px;margin-top:18px}.companyCard{border:1px solid var(--line);border-radius:17px;padding:15px;background:#fff}.companyHead{display:flex;align-items:center;gap:10px}.companyHead h3{margin:0;font-size:18px}.companyHead .remove{margin-left:auto}.foremen{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.foremanChip{display:flex;align-items:center;gap:6px;background:#edf5ea;color:var(--green);border-radius:999px;padding:7px 9px;font-size:12px;font-weight:800}.foremanChip button{border:0;background:transparent;color:#a43e1b;font-weight:900;padding:0}.foremanForm{display:flex;gap:8px}.foremanForm .field{min-height:42px;padding:9px 11px}.foremanForm .secondary{padding:9px 13px}@media(max-width:520px){.tradeChoices{grid-template-columns:1fr}.tradeSettingsEditor{margin-top:38px}.foremanForm{display:grid}.appManager{padding:13px}.appManagerHead{display:block}.appManagerHead .secondary{margin-top:10px}.statusManageRow,.roleManageRow{grid-template-columns:1fr}.manageActions>*{flex:1}.sortableItem{grid-template-columns:auto 1fr}.sortableItem .itemActions{grid-column:1/-1}}
    .workerToolbar{flex-wrap:wrap}.workerToolbar .field{min-width:170px}.workerToolbar .workerSearch{flex:2}.weekTab{border-radius:18px;padding:11px 19px;min-height:60px;font-size:15px;line-height:1.15}.weekTab small{display:block;font-size:10px;font-weight:750;opacity:.78;margin-top:4px}.clientLinkCell{cursor:pointer;font-weight:850;color:var(--green)!important;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}.clientLinkCell:hover{background:#edf6ea!important}
    .planningCardToggle{width:100%;border:0;background:transparent;color:inherit;padding:0;display:flex;align-items:center;gap:11px;text-align:left}.planningCardToggleText{min-width:0;flex:1}.planningCardToggleText h3{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.planningCardSummary{display:flex;gap:7px;flex-wrap:wrap;color:var(--muted);font-size:12px}.planningCardSummary span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.planningCardChevron{width:38px;height:38px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;background:#edf5ea;color:var(--green);font-size:20px;font-weight:900;transition:transform .16s ease}.planningCard.isPlanned .planningCardChevron{background:rgba(255,255,255,.52)}.planningCard.isCollapsed .planningCardGrid{display:none}.planningCard:not(.isCollapsed) .planningCardChevron{transform:rotate(180deg)}[data-plan-field="end_date"]{font-weight:850;border-color:#f27a32;background:#fff9f4}.excelTable th.endDateHead{background:#fff0e5;color:#9d3e0d}.planningAddressField{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;border-radius:8px;transition:background .15s ease}.planningAddressField .sheetInput{min-width:0}.planningAddressCheck{display:inline-flex;align-items:center;justify-content:center;gap:5px;flex:0 0 auto;font-size:10px;font-weight:900;color:var(--green);cursor:pointer}.planningAddressCheck input{width:20px;height:20px;accent-color:var(--green);cursor:pointer}.excelAddressCell{display:grid!important;grid-template-columns:minmax(0,1fr) 20px;align-items:center;gap:4px;padding:4px 6px!important}.excelAddressText{min-width:0;outline:0;padding:5px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.excelAddressCell .planningAddressCheck span{display:none}.excelTable tbody tr.isPlanned td.excelAddressCell{background:#fff!important}.excelTable tbody tr.isPlanned td.excelAddressCell.addressSent{background:#91d247!important}.excelTable tbody tr.isPlanned:nth-child(even) td.excelAddressCell.addressSent{background:#9bda52!important}.planningCard.isPlanned .planningCardGrid label.planningAddressWrap{background:#fff}.planningCard.isPlanned .planningCardGrid label.planningAddressWrap.addressSent{background:#91d247}.planningCard.isPlanned .planningAddressField{background:transparent}
    .analytics{margin-top:34px;padding-top:28px;border-top:1px solid var(--line)}.analyticsHead{display:flex;align-items:end;gap:18px;margin-bottom:17px}.analyticsHead h2{font-size:30px;letter-spacing:-.025em;margin:0;color:var(--green)}.analyticsHead p{margin:4px 0 0;color:var(--muted);font-size:13px}.analyticsFilters{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.analyticsFilters .field{width:auto;min-width:145px;min-height:42px;padding:9px 11px}.filterReset{min-height:42px;padding:9px 13px}.activeFilters{display:flex;gap:7px;flex-wrap:wrap;min-height:27px;margin:-4px 0 14px}.filterChip{background:#edf5ea;color:var(--green);border-radius:999px;padding:6px 10px;font-size:11px;font-weight:850}.analyticsLoading,.analyticsError,.analyticsEmpty{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;text-align:center;color:var(--muted);box-shadow:var(--shadow)}.analyticsError{color:#a43e1b;border-color:#efc3b2}.analyticsContent{display:grid;gap:16px}.metricGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.metricCard,.chartCard,.monthCard,.insightCard{background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow)}.metricCard{padding:17px}.metricCard small{display:block;color:var(--muted);font-weight:750;min-height:32px}.metricValue{display:block;color:var(--green);font-size:28px;line-height:1.05;margin:7px 0 8px}.metricDelta{display:flex;gap:6px;align-items:flex-start;font-size:11px;font-weight:800;line-height:1.35}.metricDelta.positive{color:#168143}.metricDelta.negative{color:#c3551d}.metricDelta.neutral{color:#768078}.analyticsMain{display:grid;grid-template-columns:1fr 1fr;gap:16px}.chartCard,.monthCard{padding:19px}.chartCard h3,.monthCard h3{margin:0 0 14px;font-size:18px;color:#173c27}.ringGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ringItem{text-align:center;min-width:0}.ring{--ring:0;width:112px;aspect-ratio:1;border-radius:50%;margin:0 auto 10px;background:conic-gradient(var(--ring-color,var(--green)) calc(var(--ring)*1%),#e6ece6 0);display:grid;place-items:center;position:relative;transition:background .5s ease}.ring:before{content:"";position:absolute;inset:10px;border-radius:50%;background:#fff}.ring b{position:relative;z-index:1;font-size:20px;color:var(--green);max-width:86px}.ringItem span{display:block;font-size:11px;color:var(--muted);font-weight:750;line-height:1.35}.monthSelectRow{display:flex;align-items:center;gap:10px;margin-bottom:14px}.monthSelectRow .field{margin-left:auto;width:auto}.monthSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.monthMetric{background:#f3f7f2;border-radius:13px;padding:11px}.monthMetric b{display:block;color:var(--green);font-size:21px}.monthMetric span{font-size:10px;color:var(--muted);line-height:1.25}.chartWide{grid-column:1/-1}.rangeTabs{display:flex;gap:6px;flex-wrap:wrap;margin:-3px 0 14px}.rangeTab{border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--green);padding:8px 11px;font-size:11px;font-weight:850}.rangeTab.active{background:var(--green);color:#fff;border-color:var(--green)}.lineChart{width:100%;height:auto;display:block;overflow:visible}.lineChartStacked{min-height:360px}.chartLane>rect{fill:#f7f9f6;stroke:#e1e8e1;stroke-width:1}.chartSeriesLabel{font-size:13px;font-weight:900}.chartSeriesLabel.new{fill:var(--green)}.chartSeriesLabel.filled{fill:var(--orange)}.chartSeriesLabel.placed{fill:#2878b5}.chartSeriesMax{fill:#7a847c;font-size:10px;font-weight:750}.chartScale{fill:#7a847c;font-size:9px}.chartLegendStacked{align-items:center}.chartLegendStacked small{margin-left:auto;color:#7a847c}.chartGridLine{stroke:#dfe6df;stroke-width:1}.chartLabel{fill:#7a847c;font-size:10px}.chartLineNew{fill:none;stroke:var(--green);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.chartLineFilled{fill:none;stroke:var(--orange);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.chartLinePlaced{fill:none;stroke:#2878b5;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.lineChart polyline{stroke-dasharray:1800;stroke-dashoffset:1800;animation:drawChart .58s ease-out forwards}.chartPoint{cursor:pointer;outline:none;animation:fadePoint .35s .2s both}.chartPoint.new{fill:var(--green)}.chartPoint.filled{fill:var(--orange)}.chartPoint.placed{fill:#2878b5}.chartPoint:focus{stroke:#111;stroke-width:2}.chartLegend{display:flex;gap:16px;flex-wrap:wrap;margin:8px 0 0;color:var(--muted);font-size:11px;font-weight:750}.legendDot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.lineTooltip,.barTooltip{min-height:22px;margin-top:8px;color:#294535;font-size:12px;font-weight:750}.barChart{display:grid;grid-template-columns:repeat(3,1fr);align-items:end;gap:16px;min-height:190px}.barGroup{display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:6px;height:155px;position:relative;padding-top:16px}.bar{border:0;border-radius:9px 9px 3px 3px;min-height:3px;position:relative;cursor:pointer;transform-origin:bottom;animation:growBar .45s ease-out both}.bar.current{background:var(--green)}.bar.previous{background:#f49a63}.bar span{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:900;color:#33473a}.barGroupLabel{text-align:center;font-size:10px;color:var(--muted);font-weight:800;margin-top:7px}.insightCard{grid-column:1/-1;padding:20px;border-left:6px solid var(--orange)}.insightCard h3{margin:0 0 7px;color:var(--green)}.insightCard p{margin:0;color:#384d3e;line-height:1.55}.chartEmpty{min-height:180px;display:grid;place-items:center;color:var(--muted);text-align:center}.analytics svg *{vector-effect:non-scaling-stroke}@keyframes drawChart{to{stroke-dashoffset:0}}@keyframes fadePoint{from{opacity:0}to{opacity:1}}@keyframes growBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}@media(prefers-reduced-motion:reduce){.lineChart polyline,.chartPoint,.bar{animation:none}.ring{transition:none}}
    .analyticsBodyHead{margin-left:auto}.analyticsToggle{order:3;border:1px solid #b9cbbd;border-radius:999px;background:#fff;color:var(--green);min-height:42px;padding:9px 14px;font-weight:900;display:flex;align-items:center;gap:8px;white-space:nowrap}.analyticsToggle i{font-style:normal;font-size:20px;line-height:1;transition:transform .16s ease}.analytics:not(.isCollapsed) .analyticsToggle i{transform:rotate(180deg)}.analytics.isCollapsed .analyticsBody,.analytics.isCollapsed .analyticsBodyHead{display:none}.analytics.isCollapsed .analyticsHead{margin-bottom:0;align-items:center}.analyticsBody{animation:fadeIn .16s ease-out}
    @media(max-width:900px){.analyticsHead{display:flex;align-items:center;flex-wrap:wrap}.analyticsHead>div:first-child{flex:1;min-width:220px}.analyticsBodyHead{width:100%;order:4;margin:0}.analyticsFilters{margin:14px 0 0;justify-content:flex-start}.metricGrid{grid-template-columns:1fr 1fr}.analyticsMain{grid-template-columns:1fr}.chartWide{grid-column:auto}}
    @media(max-width:600px){.analytics{margin-top:26px;padding-top:22px}.analyticsHead h2{font-size:25px}.analyticsFilters{display:grid;grid-template-columns:1fr 1fr}.analyticsFilters .field,.analyticsFilters .secondary{width:100%;min-width:0}.metricGrid{grid-template-columns:1fr 1fr;gap:9px}.metricCard{padding:14px}.metricCard small{font-size:10px;min-height:29px}.metricValue{font-size:23px}.ringGrid{grid-template-columns:1fr 1fr}.ringItem:last-child{grid-column:1/-1}.ring{width:104px}.monthSummary{grid-template-columns:1fr 1fr}.chartCard,.monthCard{padding:15px}.barChart{gap:9px}.barGroup{gap:4px}.analyticsMain,.analyticsContent{min-width:0}.lineChart{max-width:100%}.lineChartStacked{min-height:0}.chartLegendStacked small{width:100%;margin-left:0}}
    .mapPanel{width:min(1180px,100%);height:min(92vh,900px);overflow:hidden;display:flex;flex-direction:column}.mapBody{padding:16px;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;min-height:0;flex:1}.mapMain{min-height:0;display:flex;flex-direction:column;gap:10px}.mapFilters{display:grid;grid-template-columns:repeat(4,minmax(125px,1fr));gap:8px}.mapFilters .field{min-height:42px;padding:9px 11px}.mapLegend{display:flex;gap:13px;flex-wrap:wrap;font-size:12px;color:var(--muted);font-weight:750}.mapLegend span{display:flex;align-items:center;gap:5px}.mapDot{width:11px;height:11px;border-radius:50%;display:inline-block}.mapCanvas{flex:1;min-height:460px;border-radius:17px;border:1px solid var(--line);overflow:hidden;background:#e9eee8}.mapResults{overflow:auto;border:1px solid var(--line);border-radius:17px;background:#f7f9f6;padding:10px}.mapResult{border:1px solid var(--line);background:#fff;border-radius:13px;padding:11px;margin-bottom:8px}.mapResult:last-child{margin-bottom:0}.mapResult b{display:block;color:var(--green);margin-bottom:3px}.mapResult small{color:var(--muted);line-height:1.35;display:block}.mapPopup{min-width:210px;line-height:1.4}.mapPopup b{color:var(--green)}.mapPopup .contactBtn{margin:8px 5px 0 0;min-height:34px;padding:6px 9px}.mapNotice{border-radius:11px;background:#fff6e9;color:#8a4a14;padding:9px 11px;font-size:12px;font-weight:750}.leaflet-container{font-family:inherit}.leaflet-popup-content{margin:13px 15px}.workerLocation{display:block;margin-top:3px;color:#536057}
    @media(max-width:760px){.mapPanel{height:96dvh;border-radius:20px}.mapBody{grid-template-columns:1fr;padding:10px}.mapFilters{grid-template-columns:1fr 1fr}.mapCanvas{min-height:52dvh}.mapResults{max-height:24dvh}.mapPanel .panelhead{padding:15px 16px}}
    .excelAddressCell{display:table-cell!important;position:relative;padding:4px 32px 4px 6px!important;vertical-align:middle!important}
    .excelAddressText{display:block}
    .excelAddressCell .planningAddressCheck{position:absolute;right:6px;top:50%;transform:translateY(-50%)}
    .excelTable tbody tr:not(.isPlanned) td.excelAddressCell.addressSent{background:#91d247!important;border-color:#80bb3e!important}.planningCard .planningCardGrid label.planningAddressWrap.addressSent{background:#91d247;border-color:#80bb3e}
    .planningDateRow td{height:auto!important;padding:0!important;background:#0c4f2a!important;border:0!important;border-top:4px solid #071d10!important;color:#fff!important}.planningDateToggle{width:100%;min-height:48px;border:0;background:transparent;color:#fff;padding:10px 13px;display:flex;align-items:center;gap:10px;text-align:left;font:inherit;font-weight:900;cursor:pointer}.planningDateToggle strong{font-size:15px}.planningDateToggle span{margin-left:auto;font-size:12px;color:#dce9df}.planningDateToggle i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.14);font-style:normal;font-size:18px;transition:transform .16s ease}.planningDateRow.isOpen .planningDateToggle i{transform:rotate(180deg)}.planningDateItem.isDateCollapsed{display:none}.planningDateGroup{display:grid;gap:10px}.planningDateGroup+.planningDateGroup{margin-top:12px}.planningDateGroupHead{width:100%;min-height:54px;border:0;border-radius:15px;background:#0c4f2a;color:#fff;padding:11px 14px;display:flex;align-items:center;gap:10px;text-align:left;font:inherit;font-weight:900;box-shadow:0 4px 12px rgba(12,79,42,.12)}.planningDateGroupHead strong{font-size:16px}.planningDateGroupHead span{margin-left:auto;color:#dce9df;font-size:12px}.planningDateGroupHead i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.14);font-style:normal;font-size:20px;transition:transform .16s ease}.planningDateGroup.isOpen .planningDateGroupHead i{transform:rotate(180deg)}.planningDateGroup:not(.isOpen) .planningDateGroupBody{display:none}.planningDateGroupBody{display:grid;gap:11px}.planningDateGroup .planningCard.dateBreak{border-top-width:1px}
    .reactionBar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:12px 0 2px}.reactionButton{min-height:36px;border:1px solid #d8e1d7;border-radius:999px;background:#f7f9f6;color:#24422f;padding:7px 10px;display:inline-flex;align-items:center;gap:5px;font:inherit;font-size:12px;font-weight:850;cursor:pointer;transition:background .12s ease,border-color .12s ease,transform .12s ease}.reactionButton:hover{border-color:#8eb796;background:#edf5ea}.reactionButton:active{transform:scale(.97)}.reactionButton.isMine{background:var(--green);border-color:var(--green);color:#fff}.reactionButton[disabled]{opacity:.6;cursor:wait}.reactionEmoji{font-size:17px;line-height:1}.reactionCount{min-width:15px;text-align:center}.reactionNames{width:100%;color:var(--muted);font-size:11px;line-height:1.45;margin-top:2px}.reactionPanel{border:1px solid #dce6da;border-radius:17px;background:#f7faf6;padding:13px 14px;margin:0 0 16px}.reactionPanel h3{margin:0 0 4px;font-size:15px}.reactionPanel p{margin:0;color:var(--muted);font-size:11px}.reactionPanel .reactionBar{margin-top:10px}.card .reactionBar{margin-top:4px;margin-bottom:13px}.card .reactionButton{min-height:34px;padding:6px 9px}.card .reactionLabel{display:none}@media(max-width:520px){.reactionButton{min-height:44px;padding:9px 12px}.reactionPanel{padding:12px}.reactionPanel .reactionBar{display:grid;grid-template-columns:1fr 1fr}.reactionPanel .reactionButton{justify-content:center}.card .reactionBar{gap:6px}.card .reactionButton{min-height:38px}}
  </style>
</head>
<body>
  <section class="launch" id="launchScreen"><div class="launchInner"><div class="launchLogo" aria-label="DUS">${brandMark}</div><b>DUS is doen.</b><span>Je aanvraagbord wordt geopend</span><div class="launchSpinner" aria-hidden="true"></div></div></section>
  <section class="login hidden" id="loginScreen"><form class="loginCard" id="loginForm"><div class="loginLogo" aria-label="DUS">${brandMark}</div><div class="eyebrow" style="color:var(--green)">Intern aanvraagbord</div><h1>DUS is doen.</h1><p>Log veilig in met Face ID of gebruik je persoonlijke pincode.</p><label><span class="label">6-cijferige pincode</span><input class="field pin" name="pin" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="••••••"></label><div class="loginError" id="loginError"></div><button class="primary" type="submit">Inloggen met pincode</button><div class="loginDivider">of</div><button class="secondary faceLogin" id="faceLogin" type="button">◉ Inloggen met Face ID</button><div id="faceHint" style="color:var(--muted);font-size:11px;text-align:center;margin-top:9px">Stel Face ID na je eerste pincode-login één keer in.</div></form></section>
  <section class="start hidden" id="startScreen"><div class="startCard"><div class="startHead"><div class="startLogo" aria-label="DUS">${brandMark}</div><div><div class="startBrand">DUS Bemiddeling</div><div class="startDate" id="startDate"></div></div></div><h1 id="startWelcome">Welkom.</h1><p class="startIntro" id="startIntro">Klaar om snel te schakelen?</p><div class="startStats"><div class="startStat"><b id="startNewCount">0</b><span>Nieuwe aanvragen</span></div><div class="startStat"><b id="startBusyCount">0</b><span>In behandeling</span></div><div class="startStat"><b id="startTotalCount">0</b><span>Totaal actief</span></div></div><div class="startActions"><button class="startBoard" id="startBoard">Naar het aanvraagbord</button><button class="startNew" id="startNew">＋ Nieuwe aanvraag</button><button class="startPlanning" id="startPlanning">▦ Planning</button><button class="startWorkers" id="startWorkers">👷 Beschikbare vakmensen</button></div><button class="startSwitch" id="startLogout">Andere gebruiker</button><div class="dailyQuote" id="dailyQuote"><q id="dailyQuoteText"></q><cite id="dailyQuoteSource">— Denzel Washington</cite></div></div></section>
  <header class="top"><div class="topin"><button class="brand brandHome" id="logoHome" aria-label="Naar aanvraagbord">${brandMark}</button><button class="titleHome" id="titleHome" aria-label="Naar aanvraagbord"><div class="title">Aanvraagbord</div><div class="sub">Samen snel schakelen</div></button><div class="topspacer"></div><div class="welcome" id="userWelcome">Welkom</div><button class="iconbtn" id="notifyBtn">🔔 <span class="hideMobile">Meldingen</span><span class="badge hidden" id="notifyCount">0</span></button><button class="iconbtn planningTop" id="planningBtn">▦ <span class="hideMobile">Planning</span></button><button class="iconbtn workersTop" id="workersBtn">👷 <span class="hideMobile">Vakmensen</span></button><button class="iconbtn clientsTop" id="clientsBtn">🏢 <span class="hideMobile">Opdrachtgevers</span></button><button class="iconbtn hidden" id="settingsBtn">⚙️ <span class="hideMobile">Instellingen</span></button><button class="iconbtn" id="teamBtn">👥 <span class="hideMobile">Collega’s</span></button></div></header>
  <main class="shell" id="boardPage">
    <section class="hero"><div class="heroMain"><div class="eyebrow">DUS is doen</div><h1>Van aanvraag naar aanpakker.</h1><p>Voer een nieuwe klus in, verdeel hem binnen het team en houd samen de voortgang bij.</p><button class="primary" id="newBtn">＋ Nieuwe aanvraag</button></div><div class="stats"><div class="stat" data-widget-key="new"><b id="sNew">0</b><span>Nieuw</span></div><div class="stat" data-widget-key="busy"><b id="sBusy">0</b><span>Bezig</span></div><div class="stat" data-widget-key="filled"><b id="sDone">0</b><span>Ingevuld</span></div><div class="stat" data-widget-key="total"><b id="sAll">0</b><span>Totaal</span></div></div></section>
    <section><div class="toolbar"><h2>Aanvragen</h2><input class="field search" id="search" placeholder="Zoek op plaats, klant of werkzaamheden"><select class="field" id="tradeFilter" style="width:auto"><option value="">Alle vakgroepen</option><option value="Timmerman">Zelfstandig Timmerman</option><option value="Bouwspecialist">Zelfstandig Bouwspecialist</option><option value="Betontimmerman">Zelfstandig Betontimmerman</option><option value="Poortwachter">Zelfstandig Poortwachter</option><option value="Infraspecialist">Zelfstandig Infraspecialist</option><option value="Overig">Zelfstandig Overig</option></select></div>
    <div class="tabs" id="tabs"><button class="tab active" data-status="Nieuw">Nieuw <span class="tabBadge hidden" id="newTabCount">0</span></button><button class="tab" data-status="In behandeling">In behandeling <span class="tabBadge hidden" id="busyTabCount">0</span></button><button class="tab" data-status="Ingevuld">Ingevuld</button><button class="tab" data-status="Geannuleerd">Geannuleerd</button><button class="tab" data-status="">Alles</button></div><div class="grid" id="jobs"></div></section>
    <section class="analytics isCollapsed" id="analyticsSection" data-widget-key="analytics" aria-labelledby="analyticsTitle">
      <div class="analyticsHead"><div><h2 id="analyticsTitle">Voortgang &amp; statistieken</h2><p>Werkelijke prestaties op werkdagen (maandag t/m vrijdag), automatisch vergeleken met eerdere periodes.</p></div><button class="analyticsToggle" id="analyticsToggle" aria-expanded="false" aria-controls="analyticsBody"><span>Statistieken tonen</span><i aria-hidden="true">⌄</i></button>
        <div class="analyticsBodyHead">
        <div class="analyticsFilters">
          <select class="field" id="analyticsTrade" aria-label="Filter op vakgroep"><option value="">Alle vakgroepen</option></select>
          <select class="field" id="analyticsClient" aria-label="Filter op opdrachtgever"><option value="">Alle opdrachtgevers</option></select>
          <select class="field" id="analyticsPerson" aria-label="Filter op gebruiker of uitvoerder"><option value="">Alle gebruikers en uitvoerders</option></select>
          <button class="secondary filterReset" id="analyticsReset">Filters wissen</button>
        </div>
        </div>
      </div>
      <div class="analyticsBody" id="analyticsBody">
      <div class="activeFilters" id="analyticsActiveFilters" aria-live="polite"></div>
      <div class="analyticsLoading" id="analyticsLoading">Statistieken worden berekend…</div>
      <div class="analyticsError hidden" id="analyticsError">De statistieken konden niet worden berekend.</div>
      <div class="analyticsEmpty hidden" id="analyticsEmpty">Er zijn voor deze selectie nog geen aanvragen om te analyseren.</div>
      <div class="analyticsContent hidden" id="analyticsContent">
        <div class="metricGrid" id="analyticsMetrics"></div>
        <div class="analyticsMain">
          <article class="chartCard"><h3>Dynamische ontwikkeling</h3><div class="ringGrid" id="analyticsRings"></div></article>
          <article class="monthCard"><div class="monthSelectRow"><h3>Maandoverzicht</h3><select class="field" id="analyticsMonth" aria-label="Kies maand"></select></div><div class="monthSummary" id="analyticsMonthSummary"></div></article>
          <article class="chartCard chartWide"><h3>Aanvragen door de tijd</h3><div class="rangeTabs" id="analyticsRanges"><button class="rangeTab active" data-analytics-range="month">Deze maand</button><button class="rangeTab" data-analytics-range="previous">Vorige maand</button><button class="rangeTab" data-analytics-range="quarter">Laatste 3 maanden</button><button class="rangeTab" data-analytics-range="year">Dit jaar</button></div><div id="analyticsLine"></div><div class="lineTooltip" id="analyticsLineTooltip">Tik op een punt voor de exacte waarden.</div></article>
          <article class="chartCard"><h3>Deze week tegenover vorige week</h3><div id="analyticsBars"></div><div class="barTooltip" id="analyticsBarTooltip">Tik op een staaf voor de exacte waarde.</div></article>
          <article class="insightCard"><h3>Automatisch inzicht</h3><p id="analyticsInsight"></p></article>
        </div>
      </div>
      </div>
    </section>
  </main>
  <main class="shell hidden" id="planningPage">
    <section class="planningHero"><div><div class="eyebrow">DUS-planning</div><h1 id="planningWeekTitle">Planning</h1><p>Pas de regels direct aan en sla iedere wijziging meteen op.</p></div><div class="planningHeroActions"><button class="primary" id="planningNew">＋ Nieuwe aanvraag</button><button class="primary" id="planningRate">€ Tariefwijziging</button><button class="primary" id="planningAddress">⌖ Adreswijziging</button></div></section>
    <section><div class="weekTabs" id="planningWeeks" aria-label="Kies een planningsweek"></div><div class="planningToolbar"><input class="field search" id="planningSearch" placeholder="Zoek in deze week"><select class="field" id="planningStatus"><option value="">Alle statussen</option><option>Nieuw</option><option>In behandeling</option><option>Ingevuld</option><option>Geannuleerd</option></select><span class="planningCount" id="planningCount"></span></div>
      <div class="planningTableWrap" id="planningSheet"></div>
      <div class="planningCards" id="planningCards"></div>
    </section>
  </main>
  <nav class="bottom"><button class="navbtn active" id="homeNav"><i>⌂</i>Overzicht</button><button class="navbtn" id="planningNav"><i>▦</i>Planning</button><button class="navbtn" id="newNav"><i>＋</i>Nieuw</button><button class="navbtn" id="workersNav"><i>👷</i>Vakmensen</button><button class="navbtn" id="clientsNav"><i>🏢</i>Opdrachtgevers</button></nav>
  <div class="modal hidden" id="jobModal"><div class="panel"><div class="panelhead"><h2>Nieuwe aanvraag</h2><button class="close" data-close="jobModal">×</button></div><form class="panelbody" id="jobForm"><div class="formgrid">
    <label><span class="label">Opdrachtgever *</span><select class="field" name="client" id="clientSelect" required></select><input class="field hidden" id="clientCustom" name="client_custom" autocomplete="organization" placeholder="Typ de naam van de opdrachtgever" style="margin-top:8px"></label>
    <label><span class="label">Uitvoerder</span><select class="field" name="foreman" id="foremanSelect"></select><input class="field hidden" id="foremanCustom" name="foreman_custom" autocomplete="name" placeholder="Typ de naam van de uitvoerder" style="margin-top:8px"></label>
    <label><span class="label">Locatie *</span><input class="field" name="location" required placeholder="Bijv. Amsterdam"></label>
    <label><span class="label">Vakgroep *</span><select class="field" name="trade" id="jobTrade" required></select></label>
    <label><span class="label">Startdatum *</span><input class="field" name="start_date" type="date" required></label>
    <label><span class="label">Einddatum werkzaamheden *</span><input class="field" name="end_date" type="date" required></label>
    <label><span class="label">Aantal mensen</span><input class="field" name="people" type="number" min="1" value="1"></label>
    <label><span class="label">Prioriteit</span><select class="field" name="priority"><option>Normaal</option><option>Hoog</option><option>Spoed</option></select></label>
    <label><span class="label">Uurtarief</span><input class="field" name="purchase_rate" inputmode="decimal" placeholder="0,00"></label>
    <label class="full"><span class="label">Werkzaamheden *</span><textarea class="field" name="work" rows="3" required placeholder="Wat moet er gebeuren?"></textarea></label>
    <div class="full formgrid" id="customJobFields"></div>
    <label class="full aiChoice"><input type="checkbox" name="ai_planning" value="1"><span>Werkzaamheden automatisch met AI uitwerken<small>Aangevinkt: de planning krijgt een professionele, uitgebreide AI-tekst. Uitgevinkt: de planning toont precies wat je hierboven invult.</small></span></label>
    <label class="full"><span class="label">Bijzonderheden</span><textarea class="field" name="notes" rows="2" placeholder="Bouwpas, gereedschap, werktijden..."></textarea></label>
  </div><div class="actions"><button type="button" class="secondary" data-close="jobModal">Annuleren</button><button class="primary" type="submit">Aanvraag publiceren</button></div></form></div></div>
  <div class="modal hidden" id="detailModal"><div class="panel"><div class="panelhead"><h2>Aanvraag</h2><button class="close" data-close="detailModal">×</button></div><div class="panelbody" id="detailBody"></div></div></div>
  <div class="modal hidden" id="workersModal"><div class="panel"><div class="panelhead"><h2>Beschikbare vakmensen</h2><button class="close" data-close="workersModal">×</button></div><div class="panelbody"><section class="workerAvailabilityOverview"><div class="workerAvailabilityStats" id="workerAvailabilityStats"></div></section><div class="workerToolbar"><input class="field workerSearch" id="workerSearch" type="search" autocomplete="off" placeholder="Zoek op naam, telefoon of functie"><button class="primary" id="addWorker">＋ Toevoegen</button></div><div id="workersList" class="workerList"></div></div></div></div>
  <div class="modal hidden" id="workerFormModal"><div class="panel"><div class="panelhead"><h2 id="workerFormTitle">Vakman toevoegen</h2><button class="close" data-close="workerFormModal">×</button></div><form class="panelbody" id="workerForm"><input type="hidden" name="id"><div class="formgrid"><label><span class="label">Naam *</span><input class="field" name="name" required autocomplete="name" placeholder="Naam vakman"></label><label><span class="label">Telefoonnummer *</span><input class="field" name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78"></label><label class="full"><span class="label">Woonplaats</span><input class="field" name="location" autocomplete="address-level2" placeholder="Bijvoorbeeld Rotterdam"></label><fieldset class="full tradeChoices" id="workerTradeChoices"><legend class="label">Functies * <small>Kies één of meerdere</small></legend></fieldset><label><span class="label">Beschikbaarheid</span><select class="field" name="available"><option value="1">Beschikbaar</option><option value="0">Niet beschikbaar</option></select></label><label class="full"><span class="label">Interne notitie</span><textarea class="field" name="notes" rows="3" placeholder="Ervaring, regio, vervoer of andere bijzonderheden"></textarea></label><section class="full workerInvite" id="workerInvite"><h3>WhatsAppbericht sturen</h3><p id="workerInviteHint">Kies een functie. De juiste WhatsAppgroep wordt automatisch toegevoegd.</p><label class="inviteToggle"><input type="checkbox" name="send_invite" value="1" checked><span>Na opslaan WhatsApp openen met de groepsuitnodiging</span></label></section></div><div class="actions"><button type="button" class="danger hidden" id="deleteWorker">Vakman verwijderen</button><button type="button" class="secondary" data-close="workerFormModal">Annuleren</button><button class="primary" type="submit">Opslaan</button></div></form></div></div>
  <div class="modal hidden" id="settingsModal"><div class="panel"><div class="panelhead"><h2>Instellingen</h2><button class="close" data-close="settingsModal">×</button></div><div class="panelbody">
    <p style="color:var(--muted);margin-top:0">Alleen Swen heeft toegang. Wijzig hier de dagelijkse werking van het aanvraagbord.</p>
    <section class="appManager">
      <div class="appManagerHead"><div><div class="eyebrow">Centraal beheer</div><h3>App beheren</h3><p>Instellingen worden centraal opgeslagen en gelden voor de hele DUS-organisatie.</p></div><button class="secondary" id="refreshAppManager" type="button">↻ Vernieuwen</button></div>
      <div class="manageTabs" id="manageTabs">
        <button type="button" class="manageTab active" data-manage-tab="branding">Huisstijl</button>
        <button type="button" class="manageTab" data-manage-tab="texts">Teksten</button>
        <button type="button" class="manageTab" data-manage-tab="trades">Vakgroepen</button>
        <button type="button" class="manageTab" data-manage-tab="statuses">Statussen</button>
        <button type="button" class="manageTab" data-manage-tab="fields">Formuliervelden</button>
        <button type="button" class="manageTab" data-manage-tab="messages">Berichtsjablonen</button>
        <button type="button" class="manageTab" data-manage-tab="dashboard">Dashboard</button>
        <button type="button" class="manageTab" data-manage-tab="roles">Gebruikersrechten</button>
      </div>
      <div class="manageLoading" id="manageLoading">Beheerinstellingen laden…</div>
      <div id="managePanels" class="hidden">
        <section class="managePanel active" data-manage-panel="branding"><form class="formgrid manageForm" data-manage-section="branding"><label><span class="label">Donkergroen</span><input class="field colorField" name="primary_color" type="color"></label><label><span class="label">Oranje accent</span><input class="field colorField" name="accent_color" type="color"></label><label><span class="label">Limegroen</span><input class="field colorField" name="lime_color" type="color"></label><div class="full brandPreview" id="brandPreview"><b>DUS Bemiddeling</b><span>Voorbeeld van de ingestelde huisstijl</span><button type="button">Voorbeeldknop</button></div><div class="full manageActions"><button type="button" class="secondary manageCancel">Annuleren</button><button type="button" class="secondary manageReset">Herstellen naar standaard</button><button class="primary">Opslaan</button></div></form></section>
        <section class="managePanel" data-manage-panel="texts"><form class="formgrid manageForm" data-manage-section="texts"><label><span class="label">Naam aanvraagbord</span><input class="field" name="title" maxlength="40" required></label><label><span class="label">Ondertitel</span><input class="field" name="subtitle" maxlength="80" required></label><label class="full"><span class="label">Welkomsttekst</span><textarea class="field" name="start_intro" maxlength="300" rows="3" required></textarea></label><div class="full managePreview" id="textsPreview"></div><div class="full manageActions"><button type="button" class="secondary manageCancel">Annuleren</button><button type="button" class="secondary manageReset">Herstellen naar standaard</button><button class="primary">Opslaan</button></div></form></section>
        <section class="managePanel" data-manage-panel="trades"><p>Namen en feepercentages staan centraal en worden direct gebruikt in aanvragen, vakmensen en planning.</p><form class="formgrid" id="tradeSettingsForm"><label><span class="label">Nieuwe vakgroep</span><input class="field" name="name" required placeholder="Bijv. Schilder"></label><label><span class="label">Feepercentage</span><input class="field" name="fee_percent" type="number" min="0" max="100" step="0.1" value="14" required></label><div class="full"><button class="primary">Vakgroep toevoegen</button></div></form><div class="tradeSettingsEditor"><label><span class="label">Bestaande vakgroep aanpassen</span><select class="field" id="tradeSettingsSelect"></select></label><form class="formgrid companyCard" id="tradeSettingsList" data-trade-setting=""><label><span class="label">Naam vakgroep</span><input class="field" name="name" required></label><label><span class="label">Feepercentage</span><input class="field" name="fee_percent" type="number" min="0" max="100" step="0.1" required></label><div class="full"><button class="secondary">Wijzigingen opslaan</button></div></form></div></section>
        <section class="managePanel" data-manage-panel="statuses"><div id="statusManager"></div><div class="manageActions"><button type="button" class="secondary" data-reset-list="statuses">Herstellen naar standaard</button><button type="button" class="primary" data-save-list="statuses">Statussen opslaan</button></div></section>
        <section class="managePanel" data-manage-panel="fields"><form class="formgrid" id="fieldBuilderForm"><input type="hidden" name="id"><label><span class="label">Veldnaam</span><input class="field" name="label" maxlength="60" required></label><label><span class="label">Type</span><select class="field" name="field_type"><option value="text">Korte tekst</option><option value="textarea">Lange tekst</option><option value="number">Getal</option><option value="date">Datum</option><option value="select">Keuzelijst</option><option value="checkbox">Ja/nee</option></select></label><label class="full"><span class="label">Keuzes, één per regel</span><textarea class="field" name="options" rows="3"></textarea></label><label><span class="label">Volgorde</span><input class="field" name="sort_order" type="number" min="1" max="999" value="100"></label><label class="checkSetting"><input type="checkbox" name="required" value="1"><span>Verplicht</span></label><label class="checkSetting"><input type="checkbox" name="visible" value="1" checked><span>Zichtbaar</span></label><div class="full manageActions"><button type="button" class="secondary" id="cancelFieldEdit">Annuleren</button><button class="primary">Veld opslaan</button></div></form><div class="sortableList" id="fieldManager"></div><p class="manageHint">Archiveren verbergt een veld maar verwijdert historische waarden nooit.</p></section>
        <section class="managePanel" data-manage-panel="messages"><form class="formgrid manageForm" data-manage-section="messages"><label><span class="label">Titel pushmelding</span><input class="field" name="notification_title" maxlength="60" required></label><label><span class="label">Tekst pushmelding</span><input class="field" name="notification_body" maxlength="160" required></label><label class="full"><span class="label">WhatsApp-sjabloon</span><textarea class="field" name="whatsapp_job_template" rows="7" required></textarea></label><div class="full managePreview" id="messagesPreview"></div><div class="full manageActions"><button type="button" class="secondary manageCancel">Annuleren</button><button type="button" class="secondary manageReset">Herstellen naar standaard</button><button class="primary">Opslaan</button></div></form></section>
        <section class="managePanel" data-manage-panel="dashboard"><p>Sleep widgets in de gewenste volgorde en schakel onderdelen aan of uit.</p><div class="sortableList" id="dashboardManager"></div><div class="manageActions"><button type="button" class="secondary" data-reset-list="dashboard">Herstellen naar standaard</button><button type="button" class="primary" data-save-list="dashboard">Dashboard opslaan</button></div></section>
        <section class="managePanel" data-manage-panel="roles"><p>Alleen Swen ziet App beheren. Rollen bepalen welke dagelijkse onderdelen collega’s mogen beheren.</p><div id="rolesManager"></div><div class="manageActions"><button type="button" class="secondary" data-reset-list="roles">Herstellen naar standaard</button><button type="button" class="primary" data-save-list="roles">Rechten opslaan</button></div></section>
      </div>
      <details class="changeLog"><summary>Wijzigingslog bekijken</summary><div id="changeLogList"></div></details>
    </section>
    <hr style="border:0;border-top:1px solid var(--line);margin:28px 0">
    <h3>Aanvullende instellingen</h3>
    <h4>Standaardwaarden nieuwe aanvraag</h4>
    <form class="formgrid" id="workflowSettingsForm">
      <label><span class="label">Standaard prioriteit</span><select class="field" name="default_priority"><option>Normaal</option><option>Hoog</option><option>Spoed</option></select></label>
      <label><span class="label">Standaard aantal mensen</span><input class="field" name="default_people" type="number" min="1" max="100" required></label>
      <label><span class="label">Aanvraagbord opent op</span><select class="field" name="default_board_status"><option value="Nieuw">Nieuwe aanvragen</option><option>In behandeling</option><option>Ingevuld</option><option>Geannuleerd</option><option value="">Alles</option></select></label>
      <label><span class="label">AI-tekst standaard</span><select class="field" name="default_ai"><option value="0">Uit</option><option value="1">Aan</option></select></label>
      <label><span class="label">Weken vóór huidige week</span><input class="field" name="planning_weeks_before" type="number" min="0" max="26" required></label>
      <label><span class="label">Weken ná huidige week</span><input class="field" name="planning_weeks_after" type="number" min="1" max="52" required></label>
      <div class="full"><button class="primary">Werkproces opslaan</button></div>
    </form>
    <hr style="border:0;border-top:1px solid var(--line);margin:24px 0">
    <h4>Beveiliging en gebruikers</h4>
    <form class="formgrid" id="securitySettingsForm">
      <label><span class="label">Opnieuw inloggen op iPhone na</span><select class="field" name="mobile_session_minutes"><option value="15">15 minuten</option><option value="30">30 minuten</option><option value="60">1 uur</option><option value="120">2 uur</option><option value="240">4 uur</option></select></label>
      <div style="display:flex;align-items:end"><button class="secondary" id="revokeFaceIds" type="button">Alle Face ID-koppelingen verwijderen</button></div>
      <div class="full"><button class="primary">Beveiliging opslaan</button></div>
    </form>
    <p style="color:var(--muted);font-size:12px">Op een laptop blijft de sessie actief totdat de browser volledig wordt gesloten.</p>
    <form class="formgrid" id="pinSettingsForm"><label><span class="label">Gebruiker</span><select class="field" name="name" id="pinUser" required></select></label><label><span class="label">Nieuwe pincode</span><input class="field pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="••••••"></label><div class="full"><button class="primary">Pincode wijzigen</button></div></form>
    <hr style="border:0;border-top:1px solid var(--line);margin:24px 0">
    <h4>Gegevens</h4>
    <p style="color:var(--muted);font-size:12px">Download een volledige back-up van aanvragen, planning, vakmensen, opdrachtgevers en instellingen.</p>
    <button class="secondary" id="exportBackup" type="button">↓ Back-up downloaden</button>
  </div></div></div>
  <div class="modal hidden" id="teamModal"><div class="panel"><div class="panelhead"><h2>Collega’s</h2><button class="close" data-close="teamModal">×</button></div><div class="panelbody"><p style="color:var(--muted);margin-top:0">Voeg de namen toe van collega’s aan wie aanvragen kunnen worden toegewezen.</p><form class="row" id="memberForm"><input class="field" name="name" required placeholder="Naam collega"><button class="primary">Toevoegen</button></form><div id="members" style="margin-top:15px"></div><hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><button class="secondary" id="enableNotify">🔔 Browsermeldingen inschakelen</button><p style="color:var(--muted);font-size:12px">Browsermeldingen verschijnen wanneer deze web-app op het apparaat actief is. Nieuwe aanvragen blijven altijd in het meldingenoverzicht staan.</p><div class="securityBlock"><b>Veilig inloggen op deze iPhone</b><p>Koppel Face ID één keer nadat je met je persoonlijke pincode bent ingelogd. Daarna kun je binnen enkele seconden opnieuw aanmelden.</p><button class="secondary" id="enableFace" style="margin-top:12px">◉ Face ID instellen</button></div><button class="secondary" id="logoutBtn" style="margin-top:12px">Uitloggen / gebruiker wisselen</button></div></div></div>
  <div class="modal hidden" id="clientsModal"><div class="panel"><div class="panelhead"><h2>Opdrachtgevers</h2><button class="close" data-close="clientsModal">×</button></div><div class="panelbody"><p style="color:var(--muted);margin-top:0">Typ een bedrijfsnaam om bestaande opdrachtgevers direct te vinden. Bestaat hij nog niet, dan kun je hem meteen toevoegen.</p><form class="row" id="companyForm"><input class="field" id="companySearch" name="name" required autocomplete="organization" placeholder="Zoek of voeg een bedrijf toe"><button class="primary">Bedrijf toevoegen</button></form><div id="companiesList" class="companyList"></div></div></div></div>
  <div class="modal hidden" id="notifyModal"><div class="panel"><div class="panelhead"><h2>Meldingen</h2><button class="close" data-close="notifyModal">×</button></div><div class="panelbody" id="notifications"></div></div></div>
  <div class="modal hidden" id="planningWorkModal"><div class="panel"><div class="panelhead"><h2>Werkzaamheden planning</h2><button class="close" data-close="planningWorkModal">×</button></div><form class="panelbody" id="planningWorkForm"><input type="hidden" name="id"><p id="planningWorkHelp" style="color:var(--muted);margin-top:0"></p><textarea class="field" name="planning_work" rows="12" required></textarea><div class="actions"><button type="button" class="secondary" data-close="planningWorkModal">Annuleren</button><button class="primary">Planningstekst opslaan</button></div></form></div></div>
  <div class="modal hidden" id="rateModal"><div class="panel"><div class="panelhead"><h2>Tariefwijziging</h2><button class="close" data-close="rateModal">×</button></div><form class="panelbody" id="rateForm"><p style="color:var(--muted);margin-top:0">Kies een ingeplande vakman en wijzig het uurtarief voor zijn project.</p><label><span class="label">Vakman en project *</span><select class="field" name="assignment" id="rateAssignment" required></select></label><div class="detailgrid" id="rateSummary" style="margin-top:18px"><div class="detailbox"><small>Project</small><b id="rateProject">—</b></div><div class="detailbox"><small>Oud uurtarief</small><b id="rateOld">—</b></div></div><div class="formgrid" style="margin-top:18px"><label><span class="label">Nieuw uurtarief *</span><input class="field" name="new_rate" inputmode="decimal" required placeholder="0,00"></label><label><span class="label">Ingangsdatum nieuw tarief *</span><input class="field" name="effective_date" type="date" required></label></div><div class="actions"><button type="button" class="secondary" data-close="rateModal">Annuleren</button><button class="primary">Tarief wijzigen</button></div></form></div></div>
  <div class="modal hidden" id="addressModal"><div class="panel"><div class="panelhead"><h2>Adreswijziging</h2><button class="close" data-close="addressModal">×</button></div><form class="panelbody" id="addressForm"><p style="color:var(--muted);margin-top:0">Kies één ingeplande vakman en het bijbehorende project. Alleen de planning van deze vakman krijgt het nieuwe adres.</p><label><span class="label">Vakman en project *</span><select class="field" name="assignment" id="addressAssignment" required></select></label><div class="detailgrid" style="margin-top:18px"><div class="detailbox"><small>Vakman</small><b id="addressWorker">—</b></div><div class="detailbox"><small>Project</small><b id="addressProject">—</b></div><div class="detailbox"><small>Huidig adres</small><b id="addressOld">—</b></div><div class="detailbox"><small>Huidige planningsdatum</small><b id="addressOldDate">—</b></div></div><div class="formgrid" style="margin-top:18px"><label><span class="label">Nieuw adres *</span><input class="field" name="new_address" id="addressNew" required autocomplete="street-address" placeholder="Straat, huisnummer, plaats"></label><label><span class="label">Ingangsdatum adreswijziging *</span><input class="field" name="effective_date" type="date" required></label></div><div class="actions"><button type="button" class="secondary" data-close="addressModal">Annuleren</button><button class="primary">Adres wijzigen</button></div></form></div></div>
  <div class="modal hidden" id="aiSetupModal"><div class="panel"><div class="panelhead"><h2>AI activeren</h2><button class="close" data-close="aiSetupModal">×</button></div><form class="panelbody" id="aiSetupForm"><p style="color:var(--muted);margin-top:0">Voer de OpenAI API-sleutel hier één keer in. De sleutel wordt versleuteld opgeslagen en is alleen voor de server bereikbaar.</p><label><span class="label">OpenAI API-sleutel</span><input class="field" type="password" name="api_key" required autocomplete="off" placeholder="sk-…"></label><div class="actions"><button type="button" class="secondary" data-close="aiSetupModal">Annuleren</button><button class="primary">Veilig opslaan en testen</button></div></form></div></div>
  <div class="modal hidden" id="mapModal"><div class="panel mapPanel"><div class="panelhead"><div><h2 id="mapHeading">Kaartweergave</h2><small style="color:var(--muted)">Vakmensen, klussen en geschatte reistijden</small></div><button class="close" data-close="mapModal">×</button></div><div class="mapBody"><div class="mapMain"><div class="mapFilters"><select class="field" id="mapType"><option value="">Alles tonen</option><option value="workers">Vakmensen</option><option value="jobs">Klussen</option></select><select class="field" id="mapAvailability"><option value="">Alle beschikbaarheid</option><option value="available">Beschikbaar / open</option><option value="unavailable">Niet beschikbaar / ingevuld</option></select><select class="field" id="mapTrade"><option value="">Alle vakgroepen</option></select><button type="button" class="secondary" id="mapReset">Filters wissen</button></div><div class="mapLegend"><span><i class="mapDot" style="background:#159447"></i>Beschikbare vakman</span><span><i class="mapDot" style="background:#778078"></i>Niet beschikbaar</span><span><i class="mapDot" style="background:#f47b35"></i>Open klus</span><span><i class="mapDot" style="background:#125b32"></i>Ingevulde klus</span></div><div id="mapNotice" class="mapNotice hidden"></div><div id="dusMap" class="mapCanvas"></div></div><div id="mapResults" class="mapResults"></div></div></div></div>
  <div class="toast" id="toast"></div>
<script>
window.setTimeout(function(){
  var launch=document.getElementById("launchScreen"),login=document.getElementById("loginScreen");
  if(launch&&!launch.classList.contains("hidden")){
    launch.classList.add("hidden");
    if(login)login.classList.remove("hidden");
  }
},6000);
</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const defaultWhatsAppTemplate="Hoi {naam},\\n\\nHierbij de gegevens voor de opdracht:\\nStartdatum: {datum}\\nOpdrachtgever: {opdrachtgever}\\nUitvoerder: {uitvoerder}\\nLocatie: {locatie}\\nVakgroep: {vakgroep}\\n\\nDenk eraan om je geldige VCA, ID en PBM’s mee te nemen.\\n\\nMet vriendelijke groet,\\nDUS";
const defaultReactionOptions=[{key:"seen",emoji:"👍",label:"Gezien",enabled:true,notify:false,sort_order:10},{key:"claim",emoji:"✅",label:"Ik pak hem op",enabled:true,notify:true,sort_order:20},{key:"looking",emoji:"👀",label:"Ik kijk ernaar",enabled:true,notify:false,sort_order:30},{key:"question",emoji:"❓",label:"Vraag",enabled:true,notify:false,sort_order:40}];
const managedDefaults={branding:{primary_color:"#125B32",accent_color:"#F47B35",lime_color:"#9BD54B"},texts:{title:"Aanvraagbord",subtitle:"Samen snel schakelen",start_intro:"Klaar om snel te schakelen? Bekijk de lopende aanvragen of zet direct een nieuwe klus uit voor het team."},messages:{notification_title:"Nieuwe DUS-aanvraag",notification_body:"Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",whatsapp_job_template:defaultWhatsAppTemplate},map:{enabled:true,geocoding_enabled:true,default_zoom:8,center_lat:52.05,center_lng:4.48,road_factor:1.25,average_speed:65,show_unavailable:true,show_filled:true}};
const state={jobs:[],members:[],workers:[],companies:[],trades:[{name:"Timmerman",fee_rate:.14},{name:"Bouwspecialist",fee_rate:.14},{name:"Betontimmerman",fee_rate:.14},{name:"Poortwachter",fee_rate:.14},{name:"Infraspecialist",fee_rate:.12},{name:"Overig",fee_rate:.12}],appSettings:{title:"Aanvraagbord",subtitle:"Samen snel schakelen",start_intro:"Klaar om snel te schakelen? Bekijk de lopende aanvragen of zet direct een nieuwe klus uit voor het team.",default_priority:"Normaal",default_people:1,default_board_status:"Nieuw",default_ai:0,planning_weeks_before:0,planning_weeks_after:12,notification_title:"Nieuwe DUS-aanvraag",notification_body:"Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",whatsapp_job_template:defaultWhatsAppTemplate,mobile_session_minutes:30},managedRuntime:{branding:{},texts:{},messages:{},navigation:{},map:{},reactions:{}},statuses:[],formFields:[],dashboardWidgets:[],adminManage:null,analytics:{trade:"",client:"",person:"",month:"",range:"month",signature:""},user:null,filter:"",trade:"",status:"Nieuw",workerTrade:"",workerAvailability:"available",workerSearch:"",companySearch:"",planningFilter:"",planningStatus:"",planningWeek:"",page:"board",lastSeen:Number(localStorage.getItem("dus-last-seen")||0),current:null,loadPromise:null,dataSignature:"",syncToken:"",savePromises:new Map(),syncTimer:null,uiFrames:new Map()};
let requestedJob=Number(new URL(location.href).searchParams.get("aanvraag"))||0;
let notificationToken=new URL(location.href).searchParams.get("melding")||"";
const planningOpenStorage="dus-planning-open-cards";
const planningClosedDatesStorage="dus-planning-closed-dates";
const contractUrl="https://dusbemiddeling.dk.software/v4.7/content.php?SITE=verhuur_contract";
let planningOpenCards;try{const saved=JSON.parse(localStorage.getItem(planningOpenStorage)||"[]");planningOpenCards=new Set(Array.isArray(saved)?saved.map(String):[])}catch{planningOpenCards=new Set()}
let planningClosedDates;try{const saved=JSON.parse(localStorage.getItem(planningClosedDatesStorage)||"[]");planningClosedDates=new Set(Array.isArray(saved)?saved.map(String):[])}catch{planningClosedDates=new Set()}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const analyticsOpenStorage="dus-analytics-open";
function setAnalyticsExpanded(open){const section=$("#analyticsSection"),button=$("#analyticsToggle");section.classList.toggle("isCollapsed",!open);button.setAttribute("aria-expanded",String(open));button.querySelector("span").textContent=open?"Statistieken verbergen":"Statistieken tonen";try{localStorage.setItem(analyticsOpenStorage,String(open))}catch{}if(open){state.analytics.signature="";renderAnalyticsSafe()}}
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const api=async(url,opts={})=>{const method=String(opts.method||"GET").toUpperCase(),attempts=method==="GET"?2:1;let lastError;for(let attempt=0;attempt<attempts;attempt++){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),attempt?20000:14000);let r;try{r=await fetch(url,{headers:{"content-type":"application/json"},...opts,signal:controller.signal})}catch(error){lastError=error;if(attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,250));continue}if(error.name==="AbortError")throw new Error("De verbinding duurt te lang. Probeer opnieuw.");throw error}finally{clearTimeout(timer)}if(!r.ok){const message=(await r.json().catch(()=>({}))).error||"Er ging iets mis";if(r.status===401&&!["/api/login","/api/notification-open"].includes(url)){clearTimeout(state.syncTimer);state.syncTimer=null;state.syncToken="";state.loadPromise=null;setUser(null);hideStart();show("loginScreen")}if(r.status>=500&&attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,250));continue}throw new Error(message)}return r.status===204?null:r.json()}throw lastError||new Error("Er ging iets mis")};
const dateNL=d=>d?new Date(d+"T12:00:00").toLocaleDateString("nl-NL",{day:"2-digit",month:"short",year:"numeric"}):"—";
const dateExcel=d=>{const match=String(d||"").match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);return match?match[3]+"-"+match[2]+"-"+match[1]:""};
const parseExcelDate=value=>{const text=String(value||"").trim(),match=text.match(/^(\\d{1,2})[-\\/.](\\d{1,2})[-\\/.](\\d{4})$/);return match?match[3]+"-"+match[2].padStart(2,"0")+"-"+match[1].padStart(2,"0"):text};
const money=v=>v?("€ "+Number(v).toFixed(2).replace(".",",")):"—";
const tradeLabel=trade=>{const value=String(trade||"").trim();return value?(/^Zelfstandig\\s/i.test(value)?value:"Zelfstandig "+value):""};
function toast(msg){const t=$("#toast");clearTimeout(toast.timer);t.classList.remove("show");void t.offsetWidth;t.textContent=msg;t.classList.add("show");t.onanimationend=()=>t.classList.remove("show");toast.timer=setTimeout(()=>t.classList.remove("show"),2000)}
function show(id){const el=$("#"+id);el.classList.remove("hidden");if(el.classList.contains("modal"))document.body.style.overflow="hidden"} function hide(id){const el=$("#"+id);el.classList.add("hidden");if(!document.querySelector(".modal:not(.hidden)"))document.body.style.overflow=""}
function busy(form,on,label){const button=form.querySelector('[type="submit"]');if(!button)return;button.disabled=on;if(on){button.dataset.label=button.textContent;button.textContent=label||"Even wachten…"}else button.textContent=button.dataset.label||button.textContent}
function setUser(user){state.user=user;$("#userWelcome").textContent=user?"Welkom, "+user.name:"Welkom";$("#settingsBtn").classList.add("hidden")}
const dailyQuotes=["Dreams without goals are just dreams.","Do what you have to do, to do what you want to do.","Ease is a greater threat to progress than hardship.","Fall forward.","Goals on the road to achievement cannot be reached without discipline.","Nothing in life is worthwhile unless you take risks.","Every failed experiment is one step closer to success.","Don’t be afraid to fail big, to dream big.","You pray for rain, you gotta deal with the mud too.","Without commitment, you’ll never start. Without consistency, you’ll never finish."];
const christianDailyJokes=[
  "Ze zei: ‘Trek iets spannends aan.’ Dus ik kwam binnen met alleen een stropdas en werkschoenen.",
  "Mijn date vroeg of ik goed ben in bed. Zeker: ik kan er zonder wekker twaalf uur in blijven liggen.",
  "Ze fluisterde: ‘Praat vies tegen me.’ Ik zei: ‘De lakens zijn al drie weken niet verschoond.’",
  "Ze wilde een wilde avond. Nu zoeken we nog steeds wie de handboeien aan het bed heeft vastgemaakt.",
  "Mijn vriendin vroeg of ik van voorspel houd. Zeker, vooral als er bitterballen bij zijn.",
  "Ze zei dat lengte niet belangrijk is. Toch kocht ze gordijnen tot op de vloer.",
  "Mijn date vroeg om bescherming. Ik zette mijn bouwhelm op; veiligheid eerst.",
  "Ze zei: ‘Doe het licht uit, dan voel ik me sexy.’ Nu heb ik al drie keer de kast gekust.",
  "Mijn vriendin wilde rollenspellen. Ik speel nu de loodgieter, maar de kraan lekt nog steeds.",
  "Ze vroeg of ik haar kon opwarmen. Ik wees naar de thermostaat; romantiek is teamwork.",
  "Mijn date zei: ‘Laat zien wat je met je handen kunt.’ De Ikea-kast stond in twintig minuten.",
  "Ze wilde iets ondeugends proberen. We hebben pizza met ananas besteld.",
  "Mijn vriendin zei dat ik meer initiatief in bed moest tonen. Ik heb zelf het dekbed verschoond.",
  "Ze vroeg of ik een grote verrassing had. Ik liet de rekening van het hotel zien.",
  "Mijn date wilde dat ik haar vastbond. Ik heb eerst een tutorial over knopen bekeken.",
  "Ze zei: ‘Geef me alles wat je hebt.’ Nu heeft zij mijn hoodie, oplader en helft van het bed.",
  "Mijn vriendin wilde een massage met happy ending. Ik heb daarna de afwas gedaan; ze was dolgelukkig.",
  "Ze vroeg of ik dominant ben. Ik kies thuis soms zelf wat we op Netflix kijken.",
  "Mijn date zei dat ze op uniformen valt. Gelukkig lag mijn bouwbroek nog in de auto.",
  "Ze wilde een hete douche samen. Nu hebben we ruzie over wie onder de straal mag.",
  "Mijn vriendin zei: ‘Gebruik je fantasie.’ Sindsdien heet de slaapkamer ‘vergaderruimte B’.",
  "Ze vroeg om iets langs en stevigs. Ik kwam terug met een nieuwe ladder.",
  "Mijn date zei dat ze van mannen met uithoudingsvermogen houdt. Ik heb twee seizoenen achter elkaar gekeken.",
  "Ze fluisterde dat ze geen ondergoed droeg. Ik zei dat de wasmachine morgen vrij is.",
  "Mijn vriendin vroeg of ik haar plekjes kende. Natuurlijk: bank, bed en voor de koelkast.",
  "Ze wilde dat ik de spanning langzaam opbouwde. Dus ik heb eerst drie kwartier naar een updatebalk gekeken.",
  "Mijn date vroeg of ik stout was geweest. Ik heb ooit gereedschap niet teruggelegd.",
  "Ze zei: ‘Kom boven.’ Ik vroeg of de trap al gekeurd was; veiligheid blijft belangrijk.",
  "Mijn vriendin wilde iets met slagroom in bed. Nu plakt het hoeslaken en is niemand meer opgewonden.",
  "Ze vroeg of ik haar kon laten trillen. Ik gaf haar mijn telefoon met de wekker op trilstand.",
  "Mijn date zei dat ze van een stevige aanpak houdt. Ik heb eindelijk die losse deurklink vastgezet."
];
function dutchDayNumber(){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()),value=Object.fromEntries(parts.map(part=>[part.type,part.value]));return Math.floor(Date.UTC(Number(value.year),Number(value.month)-1,Number(value.day))/86400000)}
function showStart(){if(!state.user)return;const hour=new Date().getHours(),greeting=hour<12?"Goedemorgen":hour<18?"Goedemiddag":"Goedenavond",christian=/^christia+n$/i.test(String(state.user.name||"").trim()),dailyItems=christian?christianDailyJokes:dailyQuotes;$("#startWelcome").textContent=greeting+", "+state.user.name+".";$("#startDate").textContent=new Intl.DateTimeFormat("nl-NL",{weekday:"long",day:"numeric",month:"long"}).format(new Date());$("#startIntro").textContent=state.appSettings.start_intro;$("#dailyQuoteText").textContent=dailyItems[dutchDayNumber()%dailyItems.length];$("#dailyQuoteSource").textContent=christian?"— Mop van de dag":"— Denzel Washington";const newCount=state.jobs.filter(job=>job.status==="Nieuw").length,busyCount=state.jobs.filter(job=>job.status==="In behandeling").length;$("#startNewCount").textContent=newCount;$("#startBusyCount").textContent=busyCount;$("#startTotalCount").textContent=newCount+busyCount;["#startBoard","#startNew","#startPlanning","#startWorkers","#startLogout"].forEach(selector=>$(selector).disabled=false);$("#startScreen").classList.remove("hidden");document.body.style.overflow="hidden"}
function hideStart(){$("#startScreen").classList.add("hidden");if(!document.querySelector(".modal:not(.hidden)"))document.body.style.overflow=""}
const dataSignature=data=>[...(data.jobs||[]).map(x=>[x.id,x.updated_at,x.status,x.location,x.worker_names,x.work,x.planning_work,x.ai_planning,x.planning_sort_order,(x.planning_workers||[]).map(w=>w.id+":"+w.system_planned+":"+w.address_sent+":"+(w.planning_start_date||"")+":"+(w.planning_sort_order||0)).join(","),(x.reactions||[]).map(r=>r.user_name+":"+r.reaction+":"+r.updated_at).join(",")].join(":")),...(data.workers||[]).map(x=>["w",x.id,x.updated_at,x.available,x.location].join(":")),...(data.members||[]).map(x=>["m",x.id,x.name].join(":")),...(data.companies||[]).map(x=>["c",x.id,x.name,(x.foremen||[]).map(f=>f.id+":"+f.name).join(",")].join(":"))].join("|");
const isEditing=()=>!!document.activeElement?.closest?.('input,select,textarea,[contenteditable="true"]');
function scheduleUI(key,callback){const previous=state.uiFrames.get(key);if(previous)cancelAnimationFrame(previous);state.uiFrames.set(key,requestAnimationFrame(()=>{state.uiFrames.delete(key);callback()}))}
function applyManagedAppearance(){const brand={...managedDefaults.branding,...(state.managedRuntime.branding||{})};document.documentElement.style.setProperty("--green",brand.primary_color);document.documentElement.style.setProperty("--orange",brand.accent_color);document.documentElement.style.setProperty("--lime",brand.lime_color)}
const pageTitleDefaults={board_title:"Aanvraagbord",planning_title:"Planning",workers_title:"Vakmensen",clients_title:"Opdrachtgevers",settings_title:"Instellingen",team_title:"Collega’s",new_title:"Nieuwe aanvraag"};
function pageTitles(){return {...pageTitleDefaults,...(state.managedRuntime.navigation||{})}}
function applyPageTitles(){const titles=pageTitles(),labels={planningBtn:titles.planning_title,workersBtn:titles.workers_title,clientsBtn:titles.clients_title,settingsBtn:titles.settings_title,teamBtn:titles.team_title};for(const [id,label] of Object.entries(labels)){const target=$("#"+id+" .hideMobile");if(target)target.textContent=label}const navLabels={homeNav:titles.board_title,planningNav:titles.planning_title,newNav:titles.new_title,workersNav:titles.workers_title,clientsNav:titles.clients_title};for(const [id,label] of Object.entries(navLabels)){const button=$("#"+id),icon=button?.querySelector("i");if(button&&icon)button.replaceChildren(icon,document.createTextNode(label))}const modalTitles={"#clientsModal .panelhead h2":titles.clients_title,"#teamModal .panelhead h2":titles.team_title,"#workersModal .panelhead h2":titles.workers_title};for(const [selector,label] of Object.entries(modalTitles)){const heading=$(selector);if(heading)heading.textContent=label}}
function applyDashboardWidgets(){const widgets=[...(state.dashboardWidgets||[])].sort((a,b)=>Number(a.sort_order)-Number(b.sort_order)),stats=document.querySelector(".stats");for(const widget of widgets){const node=document.querySelector('[data-widget-key="'+widget.widget_key+'"]');if(!node)continue;node.classList.toggle("hidden",!Number(widget.enabled));if(stats&&node.parentElement===stats)stats.appendChild(node)}}
function renderCustomJobFields(){const host=$("#customJobFields");if(!host)return;host.innerHTML=(state.formFields||[]).filter(field=>Number(field.visible)).map(field=>{const name="custom_"+field.id,required=Number(field.required)?" required":"",label='<span class="label">'+esc(field.label)+(required?" *":"")+'</span>';if(field.field_type==="textarea")return '<label class="full">'+label+'<textarea class="field" name="'+name+'" rows="3"'+required+'></textarea></label>';if(field.field_type==="select")return '<label>'+label+'<select class="field" name="'+name+'"'+required+'><option value="">Kies…</option>'+(field.options||[]).map(option=>'<option>'+esc(option)+'</option>').join("")+'</select></label>';if(field.field_type==="checkbox")return '<label class="checkSetting"><input type="checkbox" name="'+name+'" value="1"><span>'+esc(field.label)+'</span></label>';const type=["number","date"].includes(field.field_type)?field.field_type:"text";return '<label>'+label+'<input class="field" type="'+type+'" name="'+name+'"'+required+'></label>'}).join("")}
function applyData(data,silent=false){if(data.sync_token!=null)state.syncToken=String(data.sync_token);const signature=dataSignature(data)+"|"+JSON.stringify(data.trades||[])+"|"+JSON.stringify(data.app_settings||{})+"|"+JSON.stringify(data.managed_config||{})+"|"+JSON.stringify(data.form_fields||[])+"|"+JSON.stringify(data.dashboard_widgets||[]);if(signature===state.dataSignature)return;const old=state.jobs,firstLoad=!state.dataSignature;state.dataSignature=signature;state.jobs=data.jobs;state.members=data.members;state.workers=data.workers;state.companies=data.companies||[];state.trades=data.trades||state.trades;state.managedRuntime=data.managed_config||state.managedRuntime;state.statuses=data.statuses||state.statuses;state.formFields=data.form_fields||state.formFields;state.dashboardWidgets=data.dashboard_widgets||state.dashboardWidgets;state.appSettings={...state.appSettings,...(data.app_settings||{}),...(state.managedRuntime.texts||{}),...(state.managedRuntime.messages||{})};if(firstLoad)state.status=String(state.appSettings.default_board_status??"Nieuw");state.loginUsers=data.login_users||state.loginUsers;applyManagedAppearance();applyPageTitles();refreshTradeControls();renderCustomJobFields();$$(".tab").forEach(tab=>tab.classList.toggle("active",tab.dataset.status===state.status));document.querySelector(".title").textContent=state.page==="planning"?pageTitles().planning_title:pageTitles().board_title;document.querySelector(".sub").textContent=state.appSettings.subtitle;render();applyDashboardWidgets();refreshClientOptions();if(silent){const fresh=data.jobs.filter(x=>new Date(x.created_at).getTime()>state.lastSeen&&!old.some(o=>o.id===x.id));if(fresh.length)toast(fresh.length+" nieuwe aanvraag"+(fresh.length>1?"en":""))}}
function prepareNewJob(){const form=$("#jobForm");form.elements.people.value=String(Math.max(1,Number(state.appSettings.default_people)||1));form.elements.priority.value=state.appSettings.default_priority||"Normaal";form.elements.ai_planning.checked=Number(state.appSettings.default_ai)===1;show("jobModal")}
function startSync(){clearTimeout(state.syncTimer);const tick=async()=>{if(!document.hidden&&state.user&&!isEditing())await load(true);state.syncTimer=setTimeout(tick,14000+Math.random()*8000)};state.syncTimer=setTimeout(tick,12000+Math.random()*6000)}
async function openRequestedJob(){if(!requestedJob)return false;const id=requestedJob;requestedJob=0;history.replaceState({},"",location.pathname);hideStart();showPage("board");await openDetail(id);return true}
async function boot(){try{let data;if(notificationToken){try{data=await api("/api/notification-open",{method:"POST",body:JSON.stringify({token:notificationToken})});requestedJob=Number(data.job_id)||requestedJob;notificationToken=""}catch{data=await api("/api/boot")}}else data=await api("/api/boot");setUser(data.user);applyData(data);hide("loginScreen");if(!await openRequestedJob())showStart();startSync();restoreNotifications().catch(()=>{});if(data.user?.name?.toLowerCase()==="swen"&&!data.ai_configured)setTimeout(()=>show("aiSetupModal"),500)}catch{setUser(null);hideStart();show("loginScreen")}finally{$("#launchScreen").classList.add("hidden")}try{if(!await passkeySupported()){$("#faceLogin").classList.add("hidden");$("#faceHint").textContent="Face ID wordt op dit apparaat of in deze browser niet ondersteund."}}catch{}}
async function load(silent=false){if(state.loadPromise)return state.loadPromise;state.loadPromise=(async()=>{try{if(silent&&state.syncToken){const current=await api("/api/sync-state");if(String(current.sync_token)===state.syncToken)return}applyData(await api("/api/bootstrap"),silent)}catch(e){if(!silent)toast(e.message)}})().finally(()=>state.loadPromise=null);return state.loadPromise}
async function refreshData(silent=false){if(state.loadPromise)await state.loadPromise;state.syncToken="";return load(silent)}
function createdDate(value){const text=String(value||"");return new Date(text.includes("T")?text:text.replace(" ","T")+"Z")}
function currentMonthJobs(){const now=new Date();return state.jobs.filter(job=>{const created=createdDate(job.created_at);return !Number.isNaN(created.getTime())&&created.getFullYear()===now.getFullYear()&&created.getMonth()===now.getMonth()})}
const NL_TZ="Europe/Amsterdam",OPEN_STATUSES=new Set(["Nieuw","In behandeling"]);
const nlParts=value=>{const date=value instanceof Date?value:createdDate(value),parts=new Intl.DateTimeFormat("en-CA",{timeZone:NL_TZ,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date),map=Object.fromEntries(parts.map(part=>[part.type,part.value]));return map.year&&map.month&&map.day?{year:Number(map.year),month:Number(map.month),day:Number(map.day),key:map.year+"-"+map.month+"-"+map.day}:null};
const keyDate=key=>{const [year,month,day]=String(key).split("-").map(Number);return new Date(Date.UTC(year,month-1,day,12))};
const addKeyDays=(key,days)=>{const date=keyDate(key);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10)};
const monthKey=value=>nlParts(value)?.key.slice(0,7)||"";
const inKeyRange=(value,start,end)=>{const key=nlParts(value)?.key;return Boolean(key&&key>=start&&key<=end)};
const isWorkday=value=>{const key=nlParts(value)?.key;if(!key)return false;const day=keyDate(key).getUTCDay();return day>=1&&day<=5};
const inWorkdayRange=(value,start,end)=>inKeyRange(value,start,end)&&isWorkday(value);
const workdayDistance=(startValue,endValue)=>{const start=nlParts(startValue)?.key,end=nlParts(endValue)?.key;if(!start||!end||end<start)return null;let days=0;for(let key=start;key<=end;key=addKeyDays(key,1))if(isWorkday(key))days++;return Math.max(0,days-1)};
const mondayFor=key=>{const day=keyDate(key).getUTCDay()||7;return addKeyDays(key,1-day)};
const weekWindow=value=>{const current=nlParts(value)?.key||new Date().toISOString().slice(0,10),start=mondayFor(current),weekday=Math.min(5,keyDate(current).getUTCDay()||7),end=addKeyDays(start,weekday-1),previousStart=addKeyDays(start,-7);return {start,end,previousStart,previousEnd:addKeyDays(previousStart,weekday-1)}};
const monthWindow=key=>{const [year,month]=String(key).split("-").map(Number),start=year&&month?String(year).padStart(4,"0")+"-"+String(month).padStart(2,"0")+"-01":nlParts(new Date()).key.slice(0,7)+"-01",next=new Date(Date.UTC(year,month,1,12));return {start,end:addKeyDays(next.toISOString().slice(0,10),-1)}};
const average=values=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
const pct=(part,total)=>total>0?part/total*100:null;
const fmtNumber=value=>new Intl.NumberFormat("nl-NL",{maximumFractionDigits:1}).format(Number(value)||0);
const fmtPct=value=>value===null?"—":fmtNumber(value)+"%";
const fmtDays=value=>value===null?"—":fmtNumber(value)+" dag"+(Math.abs(value-1)<.001?"":"en");
const analyticsFilteredJobs=()=>state.jobs.filter(job=>(!state.analytics.trade||job.trade===state.analytics.trade)&&(!state.analytics.client||job.client===state.analytics.client)&&(!state.analytics.person||[job.created_by,job.assignee,job.foreman].includes(state.analytics.person)));
function periodMetrics(jobs,start,end){
  const incoming=jobs.filter(job=>inWorkdayRange(job.created_at,start,end)),filled=jobs.filter(job=>job.status==="Ingevuld"&&job.filled_at&&inWorkdayRange(job.filled_at,start,end)),cancelled=incoming.filter(job=>job.status==="Geannuleerd"),open=incoming.filter(job=>OPEN_STATUSES.has(job.status)),fillDurations=filled.map(job=>workdayDistance(job.created_at,job.filled_at)).filter(value=>Number.isFinite(value)&&value>=0);
  const placements=jobs.reduce((total,job)=>total+(job.planning_workers||[]).filter(worker=>worker.linked_at&&inWorkdayRange(worker.linked_at,start,end)).length,0);
  return {incoming:incoming.length,filled:filled.length,open:open.length,cancelled:cancelled.length,placements,fillRate:pct(filled.length,incoming.length),fillDays:average(fillDurations)};
}
function compareMetric(current,previous,kind="more"){
  if(current===null||previous===null)return {tone:"neutral",arrow:"—",text:"Onvoldoende vergelijkingsgegevens"};
  if(kind==="time"){const difference=previous-current;if(Math.abs(difference)<.05)return {tone:"neutral",arrow:"—",text:"Nagenoeg gelijk aan vorige week"};return {tone:difference>0?"positive":"negative",arrow:difference>0?"↑":"↓",text:fmtNumber(Math.abs(difference))+" dag "+(difference>0?"sneller":"langzamer")}}
  const difference=current-previous;if(Math.abs(difference)<.05)return {tone:"neutral",arrow:"—",text:"Gelijk aan vorige week"};
  if(previous===0)return {tone:difference>0?"positive":"negative",arrow:difference>0?"↑":"↓",text:fmtNumber(Math.abs(difference))+" "+(difference>0?"meer":"minder")+" dan vorige week"};
  const percent=Math.abs(difference/previous*100);return {tone:difference>0?"positive":"negative",arrow:difference>0?"↑":"↓",text:fmtNumber(percent)+"% "+(difference>0?"meer":"minder")+" dan vorige week"}
}
function chartBuckets(range,now){
  const today=nlParts(now).key,currentMonth=today.slice(0,7),previousDate=new Date(Date.UTC(Number(currentMonth.slice(0,4)),Number(currentMonth.slice(5,7))-2,1,12)),previousMonth=previousDate.toISOString().slice(0,7),buckets=[];
  const pushDays=month=>{const window=monthWindow(month),end=month===currentMonth?today:window.end;for(let key=window.start;key<=end;key=addKeyDays(key,1))if(isWorkday(key))buckets.push({start:key,end:key,label:String(Number(key.slice(8,10)))+" "+new Intl.DateTimeFormat("nl-NL",{month:"short",timeZone:"UTC"}).format(keyDate(key))})};
  if(range==="month")pushDays(currentMonth);
  else if(range==="previous")pushDays(previousMonth);
  else if(range==="quarter"){const startDate=new Date(Date.UTC(Number(currentMonth.slice(0,4)),Number(currentMonth.slice(5,7))-3,1,12)),start=startDate.toISOString().slice(0,10);for(let key=mondayFor(start);key<=today;key=addKeyDays(key,7)){const end=addKeyDays(key,6);buckets.push({start:key<start?start:key,end:end>today?today:end,label:"Week "+isoWeek(key).week})}}
  else{const year=today.slice(0,4);for(let month=1;month<=Number(today.slice(5,7));month++){const key=year+"-"+String(month).padStart(2,"0"),window=monthWindow(key);buckets.push({start:window.start,end:key===currentMonth?today:window.end,label:new Intl.DateTimeFormat("nl-NL",{month:"short",timeZone:"UTC"}).format(keyDate(window.start))})}}
  return buckets;
}
function calculateAnalytics(jobs,now=new Date()){
  const week=weekWindow(now),current=periodMetrics(jobs,week.start,week.end),previous=periodMetrics(jobs,week.previousStart,week.previousEnd),selectedMonth=state.analytics.month||nlParts(now).key.slice(0,7),month=periodMetrics(jobs,monthWindow(selectedMonth).start,monthWindow(selectedMonth).end),line=chartBuckets(state.analytics.range,now).map(bucket=>({...bucket,newCount:jobs.filter(job=>inWorkdayRange(job.created_at,bucket.start,bucket.end)).length,filledCount:jobs.filter(job=>job.status==="Ingevuld"&&job.filled_at&&inWorkdayRange(job.filled_at,bucket.start,bucket.end)).length,placedCount:jobs.reduce((total,job)=>total+(job.planning_workers||[]).filter(worker=>worker.linked_at&&inWorkdayRange(worker.linked_at,bucket.start,bucket.end)).length,0)})),growth=previous.incoming?((current.incoming-previous.incoming)/previous.incoming*100):(current.incoming?null:0);
  return {week,current,previous,month,selectedMonth,line,growth};
}
function analyticsOptions(){
  const trade=$("#analyticsTrade"),client=$("#analyticsClient"),person=$("#analyticsPerson"),months=new Set([nlParts(new Date()).key.slice(0,7)]),people=new Set(),clients=new Set(),trades=new Set();
  state.jobs.forEach(job=>{if(job.trade)trades.add(job.trade);if(job.client)clients.add(job.client);[job.created_by,job.assignee,job.foreman].filter(Boolean).forEach(name=>people.add(name));if(job.created_at)months.add(monthKey(job.created_at));(job.planning_workers||[]).forEach(worker=>{if(worker.linked_at)months.add(monthKey(worker.linked_at))})});
  const fill=(element,placeholder,values,current,label=value=>value)=>{element.innerHTML='<option value="">'+placeholder+'</option>'+[...values].sort((a,b)=>a.localeCompare(b,"nl")).map(value=>'<option value="'+esc(value)+'">'+esc(label(value))+'</option>').join("");element.value=[...element.options].some(option=>option.value===current)?current:""};
  fill(trade,"Alle vakgroepen",trades,state.analytics.trade,tradeLabel);fill(client,"Alle opdrachtgevers",clients,state.analytics.client);fill(person,"Alle gebruikers en uitvoerders",people,state.analytics.person);
  const monthSelect=$("#analyticsMonth"),monthValues=[...months].filter(Boolean).sort().reverse();monthSelect.innerHTML=monthValues.map(key=>'<option value="'+key+'">'+new Intl.DateTimeFormat("nl-NL",{month:"long",year:"numeric",timeZone:"UTC"}).format(keyDate(key+"-01"))+'</option>').join("");if(!monthValues.includes(state.analytics.month))state.analytics.month=monthValues[0]||nlParts(new Date()).key.slice(0,7);monthSelect.value=state.analytics.month;
}
function metricCard(label,value,comparison){return '<article class="metricCard"><small>'+label+'</small><b class="metricValue">'+value+'</b><div class="metricDelta '+comparison.tone+'"><span>'+comparison.arrow+'</span><span>'+comparison.text+'</span></div></article>'}
function lineChart(points){
  if(!points.some(point=>point.newCount||point.filledCount||point.placedCount))return '<div class="chartEmpty">Geen aanvragen of plaatsingen in deze periode.</div>';
  const compact=matchMedia("(max-width:600px)").matches,width=compact?500:900,height=470,left=compact?108:145,right=22,top=16,rowHeight=120,gap=18,plotWidth=width-left-right,x=index=>points.length===1?left+plotWidth/2:left+index*plotWidth/(points.length-1),series=[{key:"newCount",label:"Nieuwe aanvragen",line:"chartLineNew",point:"new"},{key:"filledCount",label:"Ingevulde aanvragen",line:"chartLineFilled",point:"filled"},{key:"placedCount",label:"Geplaatste vakmensen",line:"chartLinePlaced",point:"placed"}],tip=point=>esc(point.label)+': '+point.newCount+' nieuw, '+point.filledCount+' ingevuld, '+point.placedCount+' vakmensen geplaatst';
  const lanes=series.map((item,row)=>{const laneTop=top+row*(rowHeight+gap),values=points.map(point=>point[item.key]),max=Math.max(1,...values),total=values.reduce((sum,value)=>sum+value,0),y=value=>laneTop+14+(max-value)*(rowHeight-28)/max,poly=points.map((point,index)=>x(index)+","+y(point[item.key])).join(" "),grid=[0,.5,1].map(ratio=>{const value=Math.round(max*ratio),py=y(value);return '<line class="chartGridLine" x1="'+left+'" y1="'+py+'" x2="'+(width-right)+'" y2="'+py+'"/><text class="chartScale" x="'+(left-10)+'" y="'+(py+4)+'" text-anchor="end">'+value+'</text>'}).join(""),dots=points.map((point,index)=>'<circle tabindex="0" class="chartPoint '+item.point+'" cx="'+x(index)+'" cy="'+y(point[item.key])+'" r="4.5" data-chart-tip="'+tip(point)+'"><title>'+tip(point)+'</title></circle>').join("");return '<g class="chartLane"><rect x="0" y="'+laneTop+'" width="'+width+'" height="'+rowHeight+'" rx="14"/><text class="chartSeriesLabel '+item.point+'" x="12" y="'+(laneTop+27)+'">'+item.label+'</text><text class="chartSeriesMax" x="12" y="'+(laneTop+49)+'">totaal: '+total+'</text>'+grid+'<polyline class="'+item.line+'" points="'+poly+'"/>'+dots+'</g>'}).join("");
  const step=Math.max(1,Math.ceil(points.length/8)),labels=points.map((point,index)=>index%step===0||index===points.length-1?'<text class="chartLabel" x="'+x(index)+'" y="'+(height-10)+'" text-anchor="middle">'+esc(point.label)+'</text>':"").join("");
  return '<svg class="lineChart lineChartStacked" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Drie overzichtelijke lijngrafieken voor nieuwe aanvragen, ingevulde aanvragen en geplaatste vakmensen">'+lanes+labels+'</svg><div class="chartLegend chartLegendStacked"><span><i class="legendDot" style="background:var(--green)"></i>Nieuwe aanvragen</span><span><i class="legendDot" style="background:var(--orange)"></i>Ingevulde aanvragen</span><span><i class="legendDot" style="background:#2878b5"></i>Geplaatste vakmensen</span><small>Iedere lijn heeft een eigen schaal voor maximale leesbaarheid.</small></div>';
}
function barChart(current,previous){
  const rows=[["Nieuwe aanvragen","incoming"],["Ingevulde aanvragen","filled"],["Openstaande aanvragen","open"]],max=Math.max(1,...rows.flatMap(([,key])=>[current[key],previous[key]]));
  return '<div class="barChart">'+rows.map(([label,key])=>'<div><div class="barGroup"><button class="bar current" style="height:'+Math.max(3,current[key]/max*135)+'px" data-bar-tip="Deze week · '+label+': '+current[key]+'"><span>'+current[key]+'</span></button><button class="bar previous" style="height:'+Math.max(3,previous[key]/max*135)+'px" data-bar-tip="Vorige week · '+label+': '+previous[key]+'"><span>'+previous[key]+'</span></button></div><div class="barGroupLabel">'+label+'</div></div>').join("")+'</div><div class="chartLegend"><span><i class="legendDot" style="background:var(--green)"></i>Deze week</span><span><i class="legendDot" style="background:#f49a63"></i>Vorige week</span></div>';
}
function analyticsInsight(data){
  const sentences=[],incoming=compareMetric(data.current.incoming,data.previous.incoming),filled=compareMetric(data.current.filled,data.previous.filled),time=compareMetric(data.current.fillDays,data.previous.fillDays,"time");
  if(!/Onvoldoende/.test(incoming.text))sentences.push("Deze week kwamen "+incoming.text.replace(" dan vorige week","")+" binnen.");
  if(!/Onvoldoende/.test(filled.text))sentences.push("Het aantal ingevulde aanvragen was "+filled.text.replace(" dan vorige week","")+".");
  if(!/Onvoldoende/.test(time.text)&&data.current.fillDays!==null&&data.previous.fillDays!==null)sentences.push("De gemiddelde invultijd was "+time.text+".");
  sentences.push("In de geselecteerde maand "+(data.month.placements===1?"is 1 vakman":"zijn "+data.month.placements+" vakmensen")+" geplaatst.");
  return sentences.length?sentences.join(" "):"Er zijn nog onvoldoende gegevens om deze week betrouwbaar met de vorige week te vergelijken.";
}
function animateAnalyticsRings(signature){if(state.analytics.signature===signature)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{$$("#analyticsRings .ring").forEach(ring=>ring.style.setProperty("--ring",ring.dataset.ring||0))}))}
function renderAnalytics(){
  analyticsOptions();const jobs=analyticsFilteredJobs(),signature=state.dataSignature+"|"+JSON.stringify({trade:state.analytics.trade,client:state.analytics.client,person:state.analytics.person,month:state.analytics.month,range:state.analytics.range}),content=$("#analyticsContent"),loading=$("#analyticsLoading"),error=$("#analyticsError"),empty=$("#analyticsEmpty");if(state.analytics.signature===signature)return;loading.classList.add("hidden");error.classList.add("hidden");const active=[state.analytics.trade&&"Vakgroep: "+tradeLabel(state.analytics.trade),state.analytics.client&&"Opdrachtgever: "+state.analytics.client,state.analytics.person&&"Gebruiker/uitvoerder: "+state.analytics.person].filter(Boolean);$("#analyticsActiveFilters").innerHTML=active.length?active.map(value=>'<span class="filterChip">'+esc(value)+'</span>').join(""):'<span class="filterChip">Geen actieve filters</span>';if(!jobs.length){content.classList.add("hidden");empty.classList.remove("hidden");state.analytics.signature=signature;return}empty.classList.add("hidden");content.classList.remove("hidden");
  const data=calculateAnalytics(jobs),comparisons={incoming:compareMetric(data.current.incoming,data.previous.incoming),filled:compareMetric(data.current.filled,data.previous.filled),rate:compareMetric(data.current.fillRate,data.previous.fillRate),time:compareMetric(data.current.fillDays,data.previous.fillDays,"time")};
  $("#analyticsMetrics").innerHTML=metricCard("Nieuwe aanvragen deze week",String(data.current.incoming),comparisons.incoming)+metricCard("Ingevulde aanvragen deze week",String(data.current.filled),comparisons.filled)+metricCard("Invulpercentage deze week",fmtPct(data.current.fillRate),comparisons.rate)+metricCard("Gemiddelde invultijd",fmtDays(data.current.fillDays),comparisons.time);
  const monthRing=Math.max(0,Math.min(100,data.month.fillRate||0)),growthRing=data.growth===null?0:Math.max(0,Math.min(100,Math.abs(data.growth))),timeRing=data.month.fillDays===null?0:Math.max(4,100-Math.min(100,data.month.fillDays/14*100));
  $("#analyticsRings").innerHTML='<div class="ringItem"><div class="ring" data-ring="'+monthRing+'"><b>'+fmtPct(data.month.fillRate)+'</b></div><span>Invulpercentage deze maand</span></div><div class="ringItem"><div class="ring" data-ring="'+growthRing+'" style="--ring-color:'+(data.growth!==null&&data.growth<0?"#d56831":"var(--green)")+'"><b>'+(data.growth===null?"—":(data.growth>0?"+":"")+fmtPct(data.growth))+'</b></div><span>Groei in aanvragen t.o.v. vorige week</span></div><div class="ringItem"><div class="ring" data-ring="'+timeRing+'" style="--ring-color:var(--orange)"><b>'+fmtDays(data.month.fillDays)+'</b></div><span>Gemiddelde invultijd deze maand</span></div>';
  $("#analyticsMonthSummary").innerHTML=[["Binnengekomen",data.month.incoming],["Geplaatste vakmensen",data.month.placements],["Ingevuld",data.month.filled],["Openstaand",data.month.open],["Geannuleerd",data.month.cancelled],["Invulpercentage",fmtPct(data.month.fillRate)],["Gem. invultijd",fmtDays(data.month.fillDays)]].map(([label,value])=>'<div class="monthMetric"><b>'+value+'</b><span>'+label+'</span></div>').join("");
  $("#analyticsLine").innerHTML=lineChart(data.line);$("#analyticsBars").innerHTML=barChart(data.current,data.previous);$("#analyticsInsight").textContent=analyticsInsight(data);
  $$("#analyticsRanges .rangeTab").forEach(button=>button.classList.toggle("active",button.dataset.analyticsRange===state.analytics.range));animateAnalyticsRings(signature);state.analytics.signature=signature;
}
function renderAnalyticsSafe(){if($("#analyticsSection").classList.contains("isCollapsed")){state.analytics.signature="";return}try{renderAnalytics()}catch(error){console.error("analytics-render",error);$("#analyticsLoading").classList.add("hidden");$("#analyticsContent").classList.add("hidden");$("#analyticsEmpty").classList.add("hidden");$("#analyticsError").classList.remove("hidden")}}
function render(){
  const jobs=state.jobs.filter(j=>(!state.filter||[j.client,j.location,j.work,j.trade].join(" ").toLowerCase().includes(state.filter))&&(!state.trade||j.trade===state.trade)&&(!state.status||j.status===state.status)),monthJobs=currentMonthJobs();
  const newCount=state.jobs.filter(j=>j.status==="Nieuw").length,busyCount=state.jobs.filter(j=>j.status==="In behandeling").length;
  [["#newTabCount",newCount],["#busyTabCount",busyCount]].forEach(([selector,count])=>{const badge=$(selector);badge.textContent=count;badge.classList.toggle("hidden",count===0)});
  $("#sNew").textContent=monthJobs.filter(j=>j.status==="Nieuw").length;$("#sBusy").textContent=monthJobs.filter(j=>j.status==="In behandeling").length;$("#sDone").textContent=monthJobs.filter(j=>j.status==="Ingevuld").length;$("#sAll").textContent=monthJobs.length;
  $("#jobs").innerHTML=jobs.length?jobs.map(card).join(""):'<div class="empty"><b>Nog geen aanvragen</b><span>Maak de eerste aanvraag aan met de oranje knop.</span></div>';
  const unread=state.jobs.filter(j=>createdDate(j.created_at).getTime()>state.lastSeen).length;$("#notifyCount").textContent=unread;$("#notifyCount").classList.toggle("hidden",!unread);renderAnalyticsSafe();if(state.page==="planning")renderPlanning()
}
function configuredReactionOptions(){const configured=Array.isArray(state.managedRuntime.reactions?.items)?state.managedRuntime.reactions.items:[],byKey=new Map(configured.map(item=>[String(item.key),item]));return defaultReactionOptions.map(fallback=>({...fallback,...(byKey.get(fallback.key)||{}),key:fallback.key})).filter(item=>item.enabled!==false).sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0))}
function reactionPanelText(){return {title:state.managedRuntime.reactions?.panel_title||"Reageren op deze aanvraag",help:state.managedRuntime.reactions?.panel_help||"Je reactie is direct zichtbaar voor alle collega’s."}}
function reactionBar(reactions,jobId,detail=false){const rows=Array.isArray(reactions)?reactions:[],mine=String(state.user?.name||"").toLowerCase(),options=configuredReactionOptions();const buttons=options.map(option=>{const matching=rows.filter(row=>row.reaction===option.key),isMine=matching.some(row=>String(row.user_name||"").toLowerCase()===mine),names=matching.map(row=>row.user_name).filter(Boolean);return '<button type="button" class="reactionButton'+(isMine?' isMine':'')+'" data-reaction-job="'+jobId+'" data-reaction="'+option.key+'" aria-pressed="'+(isMine?'true':'false')+'" title="'+esc(names.length?option.label+': '+names.join(', '):option.label)+'"><span class="reactionEmoji">'+esc(option.emoji)+'</span><span class="reactionLabel">'+esc(option.label)+'</span>'+(matching.length?'<span class="reactionCount">'+matching.length+'</span>':'')+'</button>'}).join(''),summary=detail?rows.map(row=>{const option=options.find(item=>item.key===row.reaction)||defaultReactionOptions.find(item=>item.key===row.reaction);return option?option.emoji+' '+row.user_name:''}).filter(Boolean).join(' · '):'';return '<div class="reactionBar" data-reaction-bar="'+jobId+'">'+buttons+(summary?'<div class="reactionNames">'+esc(summary)+'</div>':'')+'</div>'}
function card(j){return '<article class="card"><div class="cardhead"><div><h3>'+esc(tradeLabel(j.trade))+'</h3><div style="color:var(--muted);font-size:13px">'+esc(j.client)+'</div></div><span class="pill '+(j.priority!=="Normaal"?"high":"")+'">'+esc(j.priority)+'</span></div><div class="meta"><div>📍 '+esc(j.location)+'</div><div>📅 '+dateNL(j.start_date)+'</div><div>👷 '+esc(j.people)+' '+(j.people==1?"persoon":"personen")+'</div>'+(j.foreman?'<div>👤 Uitvoerder: '+esc(j.foreman)+'</div>':'')+'<div>🛠️ '+esc(j.work)+'</div></div>'+reactionBar(j.reactions,j.id)+'<div class="cardfoot"><span class="status '+(j.status==="Ingevuld"?"done":"")+'">'+esc(j.status)+'</span><button class="open" data-open="'+j.id+'">Bekijken →</button></div></article>'}
function isoWeek(value){const date=value?new Date(value+"T12:00:00"):new Date(),utc=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())),day=utc.getUTCDay()||7;utc.setUTCDate(utc.getUTCDate()+4-day);const year=utc.getUTCFullYear(),start=new Date(Date.UTC(year,0,1)),week=Math.ceil((((utc-start)/86400000)+1)/7);return {year,week,key:year+"-W"+String(week).padStart(2,"0")}}
function weekRange(item){const jan4=new Date(Date.UTC(item.year,0,4)),day=jan4.getUTCDay()||7,monday=new Date(jan4);monday.setUTCDate(jan4.getUTCDate()-day+1+(item.week-1)*7);const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6);const short=date=>String(date.getUTCDate()).padStart(2,"0")+"-"+String(date.getUTCMonth()+1).padStart(2,"0");return short(monday)+" t/m "+short(sunday)}
function dateForWeekOffset(offset){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+offset*7);return date.toISOString().slice(0,10)}
function planningWeeks(){const map=new Map(),before=Math.max(0,Number(state.appSettings.planning_weeks_before)||0),after=Math.max(1,Number(state.appSettings.planning_weeks_after)||12);for(let offset=-before;offset<=after;offset++){const item=isoWeek(dateForWeekOffset(offset));map.set(item.key,item)}state.jobs.forEach(j=>{if(j.start_date){const item=isoWeek(j.start_date);map.set(item.key,item)}});return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key))}
const feeRate=trade=>Number(state.trades.find(item=>item.name===trade)?.fee_rate??.12);
const calculatedFee=j=>j.planning_fee!==null&&j.planning_fee!==undefined&&j.planning_fee!==""?Number(j.planning_fee):(Number(j.purchase_rate)||0)*feeRate(j.trade);
const tradeOptions=value=>[...state.trades,...(!state.trades.some(item=>item.name===value)&&value?[{name:value,fee_rate:.12}]:[])].map(item=>'<option value="'+esc(item.name)+'" '+(item.name===value?"selected":"")+'>'+esc(tradeLabel(item.name))+'</option>').join("");
function refreshTradeControls(){const select=$("#tradeFilter"),current=select.value;select.innerHTML='<option value="">Alle vakgroepen</option>'+tradeOptions(current);select.value=[...select.options].some(option=>option.value===current)?current:"";const job=$("#jobTrade"),currentJob=job.value;job.innerHTML='<option value="">Kies vakgroep</option>'+tradeOptions(currentJob);if([...job.options].some(option=>option.value===currentJob))job.value=currentJob;const selected=new Set(selectedWorkerTrades()),fieldset=$("#workerTradeChoices"),legend=fieldset.querySelector("legend")?.outerHTML||'<legend class="label">Functies * <small>Kies één of meerdere</small></legend>';fieldset.innerHTML=legend+state.trades.map(item=>'<label><input type="checkbox" name="trades" value="'+esc(item.name)+'" '+(selected.has(item.name)?"checked":"")+'>'+esc(tradeLabel(item.name))+'</label>').join("")}
const statusOptions=value=>["Nieuw","In behandeling","Ingevuld","Geannuleerd"].map(item=>'<option '+(item===value?"selected":"")+'>'+item+'</option>').join("");
function planningJobs(){return expandPlanningRows(state.jobs).filter(j=>isoWeek(j.start_date).key===state.planningWeek&&(!state.planningFilter||[j.start_date,j.end_date,j.planning_worker_name,j.client,j.work,j.location,j.trade,j.status].join(" ").toLowerCase().includes(state.planningFilter))&&(!state.planningStatus||j.status===state.planningStatus)).sort((a,b)=>String(a.start_date||"").localeCompare(String(b.start_date||""))||Number(a.planning_sort_order||0)-Number(b.planning_sort_order||0)||String(a.planning_worker_name||"").localeCompare(String(b.planning_worker_name||""),"nl"))}
const planningCardKey=j=>String(j.id)+"-"+String(j.planning_worker_id||"open")+"-"+String(j.planning_slot||1);
function rememberPlanningCards(){try{localStorage.setItem(planningOpenStorage,JSON.stringify([...planningOpenCards]))}catch{}}
function planningDateKey(date){return String(state.planningWeek||"week")+":"+String(date||"zonder-datum")}
function rememberPlanningDates(){try{localStorage.setItem(planningClosedDatesStorage,JSON.stringify([...planningClosedDates]))}catch{}}
function groupPlanningByDate(rows){const groups=[];for(const row of rows){const date=String(row.start_date||"");let group=groups[groups.length-1];if(!group||group.date!==date){group={date,rows:[]};groups.push(group)}group.rows.push(row)}return groups}
function applyPlanningDateGroups(table,jobs){const body=table.tBodies[0];if(!body||!jobs.length)return table;const dataRows=[...body.rows];groupPlanningByDate(jobs).forEach(group=>{const firstIndex=jobs.indexOf(group.rows[0]),first=dataRows[firstIndex],key=planningDateKey(group.date),open=!planningClosedDates.has(key),header=document.createElement("tr"),cell=document.createElement("td"),button=document.createElement("button");header.className="planningDateRow"+(open?" isOpen":"");header.dataset.planDateRow=key;cell.colSpan=planningHeaders.length;button.type="button";button.className="planningDateToggle";button.dataset.planDateToggle=key;button.setAttribute("aria-expanded",String(open));button.innerHTML='<strong>'+esc(dateNL(group.date))+'</strong><span>'+group.rows.length+' '+(group.rows.length===1?'regel':'regels')+'</span><i aria-hidden="true">⌄</i>';cell.append(button);header.append(cell);body.insertBefore(header,first);group.rows.forEach(item=>{const row=dataRows[jobs.indexOf(item)];row.classList.add("planningDateItem");row.dataset.planDateKey=key;row.classList.toggle("isDateCollapsed",!open);row.classList.remove("dateBreak")})});return table}
function renderPlanningDateGroups(rows){return groupPlanningByDate(rows).map(group=>{const key=planningDateKey(group.date),open=!planningClosedDates.has(key),cards=group.rows.map(j=>{const cardKey=planningCardKey(j),cardOpen=planningOpenCards.has(cardKey),worker=j.planning_worker_name||j.worker_names||"Nog geen vakman";return '<article class="planningCard'+(Number(j.planning_system_planned)?' isPlanned':'')+(cardOpen?'':' isCollapsed')+'" data-plan-card-key="'+esc(cardKey)+'"><button class="planningCardToggle" data-plan-toggle="'+esc(cardKey)+'" aria-expanded="'+(cardOpen?'true':'false')+'"><span class="planningCardToggleText"><h3>'+esc(j.client)+'</h3><span class="planningCardSummary"><span>'+esc(j.location)+'</span><span>· '+esc(worker)+'</span>'+(j.planning_slots>1?'<span>· plek '+j.planning_slot+' van '+j.planning_slots+'</span>':'')+'</span></span><i class="planningCardChevron" aria-hidden="true">⌄</i></button>'+planningFields(j,true)+'</article>'}).join('');return '<section class="planningDateGroup'+(open?' isOpen':'')+'" data-plan-date-group="'+esc(key)+'"><button type="button" class="planningDateGroupHead" data-plan-date-toggle="'+esc(key)+'" aria-expanded="'+(open?'true':'false')+'"><strong>'+esc(dateNL(group.date))+'</strong><span>'+group.rows.length+' '+(group.rows.length===1?'regel':'regels')+'</span><i aria-hidden="true">⌄</i></button><div class="planningDateGroupBody">'+cards+'</div></section>'}).join('')}
const usesAIPlanning=j=>Number(j.ai_planning)!==0;
const planningWorkText=j=>usesAIPlanning(j)?(j.planning_work||"AI-tekst wordt gemaakt…"):(j.work||"");
function planningFields(j,mobile=false){const cls=mobile?"planningCardGrid":"",wrap=(label,html,wide=false,extra="")=>mobile?'<label class="'+(wide?"wide ":"")+extra+'"><small>'+label+'</small>'+html+'</label>':html,planningWork=planningWorkText(j),aiPending=usesAIPlanning(j)&&!j.planning_work,workerName=j.planning_worker_name??j.worker_names??"",workerNameControl=mobile?'<span><b>'+esc(workerName)+'</b></span>':'<button type="button" class="planningWorkerLink" data-contract-link aria-label="Open contracten voor '+esc(workerName)+'"><b>'+esc(workerName)+'</b></button>',workerControl=j.planning_worker_id?'<div class="plannedWorker"><input type="checkbox" data-plan-confirm data-worker-id="'+j.planning_worker_id+'" '+(Number(j.planning_system_planned)?"checked":"")+' aria-label="'+esc(workerName)+' is in eigen systeem ingepland">'+workerNameControl+'</div>':'<div><b></b></div>',addressControl='<div class="planningAddressField"><input class="sheetInput" data-plan-field="location" value="'+esc(j.location)+'"><label class="planningAddressCheck" title="Adres via WhatsApp verstuurd"><input type="checkbox" data-address-sent data-worker-id="'+(j.planning_worker_id||"")+'" '+(Number(j.planning_address_sent)?"checked":"")+' '+(!j.planning_worker_id?"disabled":"")+'><span>Verstuurd</span></label></div>',personal=Boolean(j.planning_person_rate);return '<div class="planningEditable '+cls+'" data-plan-row="'+j.id+'" data-plan-worker-id="'+(j.planning_worker_id||"")+'" data-plan-person-rate="'+(personal?"1":"0")+'">'+wrap("Naam vakman · vink aan na inplannen",workerControl)+wrap("Startdatum",'<input class="sheetInput" data-plan-field="start_date" type="date" value="'+esc(j.start_date)+'">')+wrap("Einddatum",'<input class="sheetInput" data-plan-field="end_date" type="date" value="'+esc(j.end_date||j.start_date)+'">')+wrap("Opdrachtgever",'<input class="sheetInput" data-plan-field="client" value="'+esc(j.client)+'">')+wrap("Werkzaamheden",'<div class="planningWorkPreview '+(aiPending?"aiPending":"")+'" data-plan-work="'+j.id+'">'+esc(planningWork)+'</div>',true)+wrap("Locatie · vink aan na WhatsApp",addressControl,false,"planningAddressWrap"+(Number(j.planning_address_sent)?" addressSent":""))+wrap(personal?"Uurtarief per vakman":"Uurtarief",'<input class="sheetInput sheetMoney" data-plan-rate data-plan-field="purchase_rate" inputmode="decimal" value="'+esc(j.purchase_rate??"")+'">')+wrap("Fee",'<input class="sheetInput sheetMoney" data-plan-fee readonly value="'+calculatedFee(j).toFixed(2).replace(".",",")+'">')+wrap("Vakgroep",'<select class="sheetSelect" data-plan-trade data-plan-field="trade">'+tradeOptions(j.trade)+'</select>')+wrap("Status",'<select class="sheetSelect" data-plan-field="status">'+statusOptions(j.status)+'</select>')+(mobile?'<div class="planActions wide"><button class="planEdit save" data-plan-save="'+j.id+'">Opslaan</button><button class="planEdit" data-plan-open="'+j.id+'">Open / koppel</button></div>':'')+'</div>'}
const planningHeaders=["Startdatum","Naam vakman","Opdrachtgever","Werkzaamheden","Locatie","Uurtarief","Fee","Vakgroep","Einddatum"];
const planningWidths=["9%","12%","13%","16%","12%","7%","7%","14%","10%"];
function planningCell(row){const cell=document.createElement("td");row.append(cell);return cell}
function editablePlanningCell(row,field,value,label,extra=""){const cell=planningCell(row);cell.className="excelCell";cell.contentEditable="true";cell.role="textbox";cell.ariaLabel=label;cell.dataset.planField=field;if(extra)cell.setAttribute(extra,"");cell.textContent=value;return cell}
function buildPlanningTable(jobs,selected){const table=document.createElement("table");table.className="excelTable";const colgroup=document.createElement("colgroup");planningWidths.forEach(width=>{const col=document.createElement("col");col.style.width=width;colgroup.append(col)});table.append(colgroup);const thead=document.createElement("thead"),head=document.createElement("tr");thead.append(head);table.append(thead);planningHeaders.forEach(label=>{const th=document.createElement("th");th.scope="col";th.textContent=label;if(label==="Einddatum")th.classList.add("endDateHead");head.append(th)});const body=document.createElement("tbody");table.append(body);if(!jobs.length){const row=document.createElement("tr"),cell=planningCell(row);body.append(row);cell.colSpan=planningHeaders.length;cell.className="planningEmpty";cell.textContent="Nog geen aanvragen in week "+selected.week+".";return table}jobs.forEach((j,index)=>{const row=document.createElement("tr"),dateBreak=index>0&&String(j.start_date)!==String(jobs[index-1].start_date);body.append(row);row.className="planningEditable"+(dateBreak?" dateBreak":"")+(Number(j.planning_system_planned)?" isPlanned":"");row.dataset.planRow=j.id;row.dataset.planWorkerId=j.planning_worker_id||"";row.dataset.planPersonRate=j.planning_person_rate?"1":"0";editablePlanningCell(row,"start_date",dateExcel(j.start_date),"Startdatum","data-plan-date");const worker=planningCell(row);worker.className="excelCell excelWorker";if(j.planning_worker_id){const control=document.createElement("div"),checkbox=document.createElement("input"),name=document.createElement("button");control.className="plannedWorker";checkbox.type="checkbox";checkbox.checked=Boolean(Number(j.planning_system_planned));checkbox.dataset.planConfirm="";checkbox.dataset.workerId=j.planning_worker_id;checkbox.ariaLabel=(j.planning_worker_name||"Vakman")+" is in eigen systeem ingepland";name.type="button";name.className="planningWorkerLink";name.dataset.contractLink="";name.textContent=j.planning_worker_name||"";name.ariaLabel="Open contracten voor "+(j.planning_worker_name||"vakman");control.append(checkbox,name);worker.append(control)}const clientCell=editablePlanningCell(row,"client",j.client,"Open aanvraag van "+j.client);clientCell.classList.add("clientLinkCell");clientCell.dataset.planOpen=j.id;clientCell.contentEditable="false";clientCell.role="button";clientCell.tabIndex=0;const work=planningCell(row),aiPending=usesAIPlanning(j)&&!j.planning_work,workText=planningWorkText(j);work.className="excelCell excelWork"+(aiPending?" aiPending":"");work.dataset.planWork=j.id;work.textContent=workText;work.title=aiPending?"De AI-tekst wordt automatisch gemaakt.":workText;const addressCell=planningCell(row),addressText=document.createElement("span"),addressLabel=document.createElement("label"),addressCheck=document.createElement("input");addressCell.className="excelCell excelAddressCell"+(Number(j.planning_address_sent)?" addressSent":"");addressText.className="excelAddressText";addressText.contentEditable="true";addressText.role="textbox";addressText.ariaLabel="Locatie";addressText.dataset.planField="location";addressText.textContent=j.location;addressLabel.className="planningAddressCheck";addressLabel.title="Adres via WhatsApp verstuurd";addressCheck.type="checkbox";addressCheck.dataset.addressSent="";addressCheck.dataset.workerId=j.planning_worker_id||"";addressCheck.checked=Boolean(Number(j.planning_address_sent));addressCheck.disabled=!j.planning_worker_id;addressCheck.ariaLabel="Adres naar "+(j.planning_worker_name||"vakman")+" verstuurd";addressLabel.append(addressCheck);addressCell.append(addressText,addressLabel);editablePlanningCell(row,"purchase_rate",String(j.purchase_rate??"").replace(".",","),j.planning_person_rate?"Uurtarief per vakman":"Uurtarief","data-plan-rate");const feeCell=planningCell(row);feeCell.className="excelCell";feeCell.dataset.planFee="";feeCell.textContent=calculatedFee(j).toFixed(2).replace(".",",");const tradeCell=planningCell(row),select=document.createElement("select");tradeCell.className="excelCell";select.className="excelSelect";select.ariaLabel="Vakgroep";select.dataset.planTrade="";select.dataset.planField="trade";select.innerHTML=tradeOptions(j.trade);tradeCell.append(select);editablePlanningCell(row,"end_date",dateExcel(j.end_date||j.start_date),"Einddatum","data-plan-end-date")});return table}
function expandPlanningRows(jobs){return jobs.flatMap(job=>{const linked=Array.isArray(job.planning_workers)&&job.planning_workers.length?job.planning_workers:String(job.worker_names||"").split(",").map(name=>name.trim()).filter(Boolean).map(name=>({id:null,name,system_planned:0,address_sent:0})),slots=Math.max(1,Number(job.people)||1,linked.length),personal=slots>=2;return Array.from({length:slots},(_,index)=>{const person=linked[index];return {...job,start_date:person?.planning_start_date||job.start_date,location:person?.planning_location||job.location,purchase_rate:personal?(person?.hourly_rate??job.purchase_rate):job.purchase_rate,planning_fee:personal?(person?.fee??job.planning_fee):job.planning_fee,planning_sort_order:Number(person?.planning_sort_order??job.planning_sort_order??0),planning_person_rate:personal,planning_worker_id:person?.id||null,planning_worker_name:person?.name||"",planning_system_planned:Number(person?.system_planned||0),planning_address_sent:Number(person?.address_sent||0),planning_slot:index+1,planning_slots:slots}})})}
function rateAssignments(){return state.jobs.flatMap(job=>(job.planning_workers||[]).map(worker=>({job,worker}))).sort((a,b)=>a.worker.name.localeCompare(b.worker.name,"nl")||String(a.job.start_date).localeCompare(String(b.job.start_date)))}
function refreshRateSummary(){const [jobId,workerId]=String($("#rateAssignment").value||"").split(":").map(Number),entry=rateAssignments().find(item=>Number(item.job.id)===jobId&&Number(item.worker.id)===workerId),rate=entry?(entry.worker.hourly_rate??entry.job.purchase_rate):null;$("#rateProject").textContent=entry?entry.job.client+" · "+entry.job.location+" · "+dateNL(entry.job.start_date):"—";$("#rateOld").textContent=entry?money(rate):"—";if(entry)$("#rateForm").elements.new_rate.value=String(rate??"").replace(".",",")}
function openRateChange(){const assignments=rateAssignments(),select=$("#rateAssignment");$("#rateForm").reset();$("#rateForm").elements.effective_date.value=new Date().toISOString().slice(0,10);select.innerHTML='<option value="">Kies een vakman en project</option>'+assignments.map(({job,worker})=>'<option value="'+job.id+':'+worker.id+'">'+esc(worker.name)+' · '+esc(job.client)+' · '+dateNL(job.start_date)+'</option>').join("");refreshRateSummary();show("rateModal")}
function addressAssignments(){const today=dateForWeekOffset(0);return state.jobs.filter(job=>job.status!=="Geannuleerd"&&(!job.end_date||String(job.end_date)>=today)).flatMap(job=>(job.planning_workers||[]).map(worker=>({job,worker}))).sort((a,b)=>a.worker.name.localeCompare(b.worker.name,"nl")||String(a.job.start_date).localeCompare(String(b.job.start_date)))}
function refreshAddressSummary(){const [jobId,workerId]=String($("#addressAssignment").value||"").split(":").map(Number),entry=addressAssignments().find(item=>Number(item.job.id)===jobId&&Number(item.worker.id)===workerId),form=$("#addressForm"),dateField=form.elements.effective_date,address=entry?(entry.worker.planning_location||entry.job.location):"",startDate=entry?(entry.worker.planning_start_date||entry.job.start_date):"";$("#addressWorker").textContent=entry?entry.worker.name:"—";$("#addressProject").textContent=entry?entry.job.client:"—";$("#addressOld").textContent=entry?address:"—";$("#addressOldDate").textContent=entry?dateNL(startDate):"—";if(entry){$("#addressNew").value=address;dateField.min=startDate||"";dateField.max="";if(startDate&&dateField.value<startDate)dateField.value=startDate}else{$("#addressNew").value="";dateField.min="";dateField.max=""}}
function openAddressChange(){const assignments=addressAssignments(),select=$("#addressAssignment"),form=$("#addressForm");form.reset();form.elements.effective_date.value=dateForWeekOffset(0);select.innerHTML='<option value="">Kies een vakman en project</option>'+assignments.map(({job,worker})=>'<option value="'+job.id+':'+worker.id+'">'+esc(worker.name)+' · '+esc(job.client)+' · '+dateNL(worker.planning_start_date||job.start_date)+'</option>').join("");refreshAddressSummary();show("addressModal")}
function renderPlanning(){const weeks=planningWeeks();if(!state.planningWeek||!weeks.some(item=>item.key===state.planningWeek)){const current=isoWeek().key;state.planningWeek=weeks.some(item=>item.key===current)?current:(weeks[0]?.key||current)}const selected=weeks.find(item=>item.key===state.planningWeek)||isoWeek();$("#planningWeekTitle").textContent="Planning week "+selected.week;$("#planningWeeks").innerHTML=weeks.map(item=>'<button class="weekTab '+(item.key===state.planningWeek?"active":"")+'" data-plan-week="'+item.key+'"><span>Week '+item.week+'</span><small>'+weekRange(item)+'</small></button>').join("");const rows=planningJobs();$("#planningCount").textContent=rows.length+" "+(rows.length===1?"regel":"regels");$("#planningSheet").replaceChildren(buildPlanningTable(rows,selected));$("#planningCards").innerHTML=rows.length?rows.map((j,index)=>{const key=planningCardKey(j),open=planningOpenCards.has(key),worker=j.planning_worker_name||j.worker_names||"Nog geen vakman",dateBreak=index>0&&String(j.start_date)!==String(rows[index-1].start_date);return '<article class="planningCard'+(dateBreak?" dateBreak":"")+(Number(j.planning_system_planned)?" isPlanned":"")+(open?"":" isCollapsed")+'" data-plan-card-key="'+esc(key)+'"><button class="planningCardToggle" data-plan-toggle="'+esc(key)+'" aria-expanded="'+(open?"true":"false")+'"><span class="planningCardToggleText"><h3>'+esc(j.client)+'</h3><span class="planningCardSummary"><span>'+dateNL(j.start_date)+'</span><span>· '+esc(j.location)+'</span><span>· '+esc(worker)+'</span>'+(j.planning_slots>1?'<span>· plek '+j.planning_slot+' van '+j.planning_slots+'</span>':'')+'</span></span><i class="planningCardChevron" aria-hidden="true">⌄</i></button>'+planningFields(j,true)+'</article>'}).join(""):'<div class="empty"><b>Nog geen planning in week '+selected.week+'</b><span>Kies een andere week of maak een nieuwe aanvraag.</span></div>'}
renderPlanning=function(){const weeks=planningWeeks();if(!state.planningWeek||!weeks.some(item=>item.key===state.planningWeek)){const current=isoWeek().key;state.planningWeek=weeks.some(item=>item.key===current)?current:(weeks[0]?.key||current)}const selected=weeks.find(item=>item.key===state.planningWeek)||isoWeek();$("#planningWeekTitle").textContent="Planning week "+selected.week;$("#planningWeeks").innerHTML=weeks.map(item=>'<button class="weekTab '+(item.key===state.planningWeek?'active':'')+'" data-plan-week="'+item.key+'"><span>Week '+item.week+'</span><small>'+weekRange(item)+'</small></button>').join("");const rows=planningJobs();$("#planningCount").textContent=rows.length+" "+(rows.length===1?"regel":"regels");$("#planningSheet").replaceChildren(applyPlanningDateGroups(buildPlanningTable(rows,selected),rows));$("#planningCards").innerHTML=rows.length?renderPlanningDateGroups(rows):'<div class="empty"><b>Nog geen planning in week '+selected.week+'</b><span>Kies een andere week of maak een nieuwe aanvraag.</span></div>'}
function showPage(page){state.page=page;const planning=page==="planning",titles=pageTitles();$("#boardPage").classList.toggle("hidden",planning);$("#planningPage").classList.toggle("hidden",!planning);$("#homeNav").classList.toggle("active",!planning);$("#planningNav").classList.toggle("active",planning);document.querySelector(".title").textContent=planning?titles.planning_title:titles.board_title;if(planning)renderPlanning();window.scrollTo({top:0,behavior:"auto"})}
async function savePlanningRow(container,id,button=null){const job=state.jobs.find(item=>Number(item.id)===Number(id));if(!job)return;const workerId=container.dataset.planPersonRate==="1"?(Number(container.dataset.planWorkerId)||null):null,data={status:job.status,worker_id:workerId};container.querySelectorAll("[data-plan-field]").forEach(input=>data[input.dataset.planField]=input.hasAttribute("contenteditable")?input.textContent.trim():input.value);if(container.querySelector("[data-plan-date]"))data.start_date=parseExcelDate(data.start_date);if(container.querySelector("[data-plan-end-date]"))data.end_date=parseExcelDate(data.end_date);data.purchase_rate=parseFloat(String(data.purchase_rate||"").replace(",","."))||null;const label=button?.textContent;if(button){button.disabled=true;button.textContent="Opslaan…"}const saveKey=id+":"+(workerId||0),previous=state.savePromises.get(saveKey)||Promise.resolve(),task=previous.catch(()=>{}).then(async()=>{const moved=isoWeek(job.start_date).key!==isoWeek(data.start_date).key,result=await api("/api/jobs/"+id+"/planning",{method:"PATCH",body:JSON.stringify(data)});if(workerId){const worker=job.planning_workers?.find(item=>Number(item.id)===workerId);if(worker)Object.assign(worker,{hourly_rate:data.purchase_rate,fee:result.fee})}else Object.assign(job,{purchase_rate:data.purchase_rate,planning_fee:result.fee});Object.assign(job,{client:data.client,location:data.location,trade:data.trade,start_date:data.start_date,end_date:data.end_date,status:data.status,updated_at:new Date().toISOString()});state.dataSignature="";await refreshData(true);if(moved)renderPlanning();toast(workerId?"Tarief van vakman opgeslagen":"Planning opgeslagen")}).catch(error=>{toast(error.message);if(button){button.disabled=false;button.textContent=label}}).finally(()=>{if(state.savePromises.get(saveKey)===task)state.savePromises.delete(saveKey);if(button){button.disabled=false;button.textContent=label}});state.savePromises.set(saveKey,task);return task}
async function saveWorkerRate(container){if(container.dataset.planPersonRate!=="1")return false;const jobId=Number(container.dataset.planRow),workerId=Number(container.dataset.planWorkerId),rateField=container.querySelector("[data-plan-rate]"),feeField=container.querySelector("[data-plan-fee]");if(!jobId||!workerId||!rateField)return false;const rate=parseFloat(String(planValue(rateField)||"").replace(",","."));if(!Number.isFinite(rate)||rate<=0){toast("Vul een geldig uurtarief in");return true}const saveKey="rate:"+jobId+":"+workerId,previous=state.savePromises.get(saveKey)||Promise.resolve(),task=previous.catch(()=>{}).then(async()=>{rateField.dataset.saving="true";const result=await api("/api/jobs/"+jobId+"/workers/"+workerId+"/rate",{method:"PATCH",body:JSON.stringify({hourly_rate:rate})}),job=state.jobs.find(item=>Number(item.id)===jobId),worker=job?.planning_workers?.find(item=>Number(item.id)===workerId);if(worker)Object.assign(worker,{hourly_rate:result.hourly_rate,fee:result.fee});setPlanValue(feeField,Number(result.fee).toFixed(2).replace(".",","));rateField.dataset.saved="true";setTimeout(()=>delete rateField.dataset.saved,900)}).catch(error=>toast(error.message)).finally(()=>{delete rateField.dataset.saving;if(state.savePromises.get(saveKey)===task)state.savePromises.delete(saveKey)});state.savePromises.set(saveKey,task);await task;return true}
async function setSystemPlanned(input){if(input.dataset.saving==="true")return;const row=input.closest(".planningEditable"),card=input.closest(".planningCard"),jobId=Number(row?.dataset.planRow),workerId=Number(input.dataset.workerId),planned=input.checked,job=state.jobs.find(item=>Number(item.id)===jobId),worker=job?.planning_workers?.find(item=>Number(item.id)===workerId),paint=value=>{row?.classList.toggle("isPlanned",value);card?.classList.toggle("isPlanned",value)};input.dataset.saving="true";input.disabled=true;paint(planned);if(worker)worker.system_planned=planned?1:0;try{await api("/api/jobs/"+jobId+"/workers/"+workerId+"/planned",{method:"PATCH",body:JSON.stringify({planned})});state.dataSignature="";toast(planned?"In eigen systeem ingepland":"Planningvinkje verwijderd")}catch(error){input.checked=!planned;paint(!planned);if(worker)worker.system_planned=planned?0:1;toast(error.message)}finally{delete input.dataset.saving;input.disabled=false}}
async function setAddressSent(input){if(input.dataset.saving==="true")return;const row=input.closest(".planningEditable"),jobId=Number(row?.dataset.planRow),workerId=Number(input.dataset.workerId),sent=input.checked,job=state.jobs.find(item=>Number(item.id)===jobId),worker=job?.planning_workers?.find(item=>Number(item.id)===workerId),paint=value=>{row?.querySelector(".excelAddressCell")?.classList.toggle("addressSent",value);row?.querySelector(".planningAddressWrap")?.classList.toggle("addressSent",value)};if(!jobId||!workerId){input.checked=false;toast("Koppel eerst een vakman aan deze aanvraag");return}input.dataset.saving="true";input.disabled=true;paint(sent);if(worker)worker.address_sent=sent?1:0;try{await api("/api/jobs/"+jobId+"/workers/"+workerId+"/address-sent",{method:"PATCH",body:JSON.stringify({sent})});state.dataSignature="";toast(sent?"Adres als verstuurd gemarkeerd":"Adresvinkje verwijderd")}catch(error){input.checked=!sent;paint(!sent);if(worker)worker.address_sent=sent?0:1;toast(error.message)}finally{delete input.dataset.saving;input.disabled=false}}
const phoneDigits=phone=>String(phone||"").replace(/[^0-9+]/g,"");
const whatsappDigits=phone=>{let digits=String(phone||"").replace(/[^0-9]/g,"");if(digits.startsWith("0"))digits="31"+digits.slice(1);return digits};
const whatsappAppUrl=(phone,text="")=>"whatsapp://send?phone="+whatsappDigits(phone)+(text?"&text="+encodeURIComponent(text):"");
function whatsappJobUrl(worker,job){const values={naam:worker.name,datum:dateNL(job.start_date),opdrachtgever:job.client,uitvoerder:job.foreman||"nog niet bekend",locatie:job.location,vakgroep:tradeLabel(job.trade)};const message=String(state.appSettings.whatsapp_job_template||defaultWhatsAppTemplate).replace(/\{(naam|datum|opdrachtgever|uitvoerder|locatie|vakgroep)\}/g,(_,key)=>values[key]||"");return whatsappAppUrl(worker.phone,message)}
const whatsappGroups={
  Bouwspecialist:{name:"Bouwspecialisten",url:"https://chat.whatsapp.com/BVRqMEyTWfnCPxCaqWHV1e"},
  Timmerman:{name:"Timmermannen en betontimmermannen",url:"https://chat.whatsapp.com/Hu7vZRxuHAL9Zk0g8L6Cdr"},
  Betontimmerman:{name:"Timmermannen en betontimmermannen",url:"https://chat.whatsapp.com/Hu7vZRxuHAL9Zk0g8L6Cdr"},
  Infraspecialist:{name:"Infraspecialisten",url:"https://chat.whatsapp.com/HyMvKd2ahSS0cF3uEoK6G6"}
};
function selectedWorkerTrades(form=$("#workerForm")){return [...form.querySelectorAll('[name="trades"]:checked')].map(input=>input.value)}
function workerInviteGroups(trades){const seen=new Set();return trades.map(trade=>whatsappGroups[trade]).filter(group=>group&&!seen.has(group.url)&&seen.add(group.url))}
function whatsappGroupInviteUrl(name,phone,trades){const groups=workerInviteGroups(trades);if(!groups.length)return "";const lines=["Hoi "+String(name||"").trim()+",","","Welkom bij DUS! Op basis van jouw functie kun je deelnemen aan "+(groups.length===1?"deze WhatsAppgroep:":"deze WhatsAppgroepen:"),""];groups.forEach(group=>lines.push(group.name+":",group.url,""));lines.push("Via deze groep delen wij beschikbare klussen en belangrijke informatie.","","Met vriendelijke groet,","DUS");return whatsappAppUrl(phone,lines.join("\\n"))}
function refreshWorkerInvite(){const form=$("#workerForm"),groups=workerInviteGroups(selectedWorkerTrades(form)),hint=$("#workerInviteHint");hint.textContent=groups.length?"Uitnodiging voor: "+groups.map(group=>group.name).join(" en ")+".":"Kies Bouwspecialist, Timmerman, Betontimmerman of Infraspecialist voor een groepsuitnodiging."}
function workerActions(worker,withEdit=false){return '<div class="contactActions"><a class="contactBtn" href="tel:'+phoneDigits(worker.phone)+'">☎ Bellen</a><a class="contactBtn whatsapp" href="'+esc(whatsappAppUrl(worker.phone))+'">WhatsApp</a>'+(withEdit?'<button class="contactBtn edit" data-worker-edit="'+worker.id+'">Bewerken</button>':'')+'</div>'}
const workerTrades=worker=>String(worker?.trade||"").split(",").map(value=>value.trim()).filter(Boolean);
const mapPlaces={
  "'s-gravenhage":[52.0705,4.3007],"den haag":[52.0705,4.3007],rotterdam:[51.9225,4.4792],dordrecht:[51.8133,4.6901],hellevoetsluis:[51.8333,4.1333],leidschendam:[52.0886,4.3939],zoetermeer:[52.0607,4.494],delfzijl:[53.33,6.92],almere:[52.3508,5.2647],"hazerswoude-rijndijk":[52.128,4.594],leiden:[52.1601,4.497],spijkenisse:[51.845,4.329],gorinchem:[51.83,4.974],gouderak:[51.985,4.678],breda:[51.5719,4.7683],bleskensgraaf:[51.872,4.783],lelystad:[52.5185,5.4714],rijswijk:[52.0363,4.325],alblasserdam:[51.865,4.662],schoonhoven:[51.9475,4.8486],schipluiden:[51.976,4.314],"krimpen aan den ijssel":[51.916,4.602],schiedam:[51.916,4.399],poeldijk:[52.024,4.22],amsterdam:[52.3676,4.9041],leerdam:[51.893,5.091],delfgauw:[52.006,4.395],voorburg:[52.07,4.359],honselersdijk:[52.006,4.225],gouda:[52.0116,4.7105],"hoogvliet rotterdam":[51.863,4.355],hoogvliet:[51.863,4.355],ijmuiden:[52.458,4.619],brielle:[51.901,4.163],"capelle aan den ijssel":[51.93,4.578],naaldwijk:[51.994,4.209],"nieuw-vennep":[52.266,4.634],maasland:[51.935,4.272],"de lier":[51.975,4.248],wateringen:[52.024,4.275],antwerpen:[51.2194,4.4025],leiderdorp:[52.1583,4.5297],wageningen:[51.9692,5.6654],vlaardingen:[51.9121,4.3416],lisse:[52.26,4.556],putten:[52.259,5.607],hilversum:[52.2292,5.1669]};
let dusMap,mapLayer,mapLoading=false;
const mapGeocodes=new Map(),mapGeocodeFailures=new Map();
const mapConfig=()=>({...managedDefaults.map,...(state.managedRuntime.map||{})});
function mapAddressKey(value){return String(value||"").trim().toLowerCase().replace(/\\s+/g," ")}
function mapCoords(value,preferExact=false){const addressKey=mapAddressKey(value);if(mapGeocodes.has(addressKey))return mapGeocodes.get(addressKey);if(preferExact)return null;const text=addressKey.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[(),]/g," ");const keys=Object.keys(mapPlaces).sort((a,b)=>b.length-a.length);const key=keys.find(name=>text.includes(name));return key?mapPlaces[key]:null}
function mapDistance(a,b){const rad=value=>value*Math.PI/180,dLat=rad(b[0]-a[0]),dLng=rad(b[1]-a[1]),lat1=rad(a[0]),lat2=rad(b[0]);return 6371*2*Math.atan2(Math.sqrt(Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2),Math.sqrt(1-(Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2)))}
function travelEstimate(from,to){if(!from||!to)return null;const cfg=mapConfig(),km=mapDistance(from,to)*Number(cfg.road_factor||1.25),minutes=Math.max(1,Math.round(km/Math.max(10,Number(cfg.average_speed||65))*60));return {km:Math.round(km),minutes,label:(minutes>=60?Math.floor(minutes/60)+" u "+(minutes%60)+" min":minutes+" min")+" · ca. "+Math.round(km)+" km"}}
function mapJobOpen(job){return !["Ingevuld","Geannuleerd"].includes(String(job.status))}
function mapJobEnded(job){const end=String(job.end_date||"").slice(0,10),today=nlParts(new Date())?.key||new Date().toISOString().slice(0,10);return Boolean(end&&end<today)}
function ensureMapButtons(){if($("#mapBtn"))return;const top=document.createElement("button");top.className="iconbtn";top.id="mapBtn";top.innerHTML='🗺 <span class="hideMobile">Kaart</span>';$("#workersBtn").before(top);const nav=document.createElement("button");nav.className="navbtn";nav.id="mapNav";nav.innerHTML="<i>⌖</i>Kaart";$("#newNav").before(nav);top.onclick=nav.onclick=openMap}
function mapTravelForJob(job){const jobPoint=mapCoords(job.location,true),links=job.planning_workers||[],rows=links.map(link=>{const worker=state.workers.find(item=>Number(item.id)===Number(link.id)),estimate=travelEstimate(mapCoords(worker?.location),jobPoint);return worker?'<div><b>'+esc(worker.name)+'</b>: '+(estimate?"geschat "+esc(estimate.label):"reistijd niet beschikbaar")+'</div>':""}).filter(Boolean);return rows.length?rows.join(""):'<div>Nog geen vakman gekoppeld.</div>'}
function mapItems(){const type=$("#mapType").value,availability=$("#mapAvailability").value,trade=$("#mapTrade").value,cfg=mapConfig(),items=[],missing=[],workerGroups=new Map();if(type!=="jobs")state.workers.forEach(worker=>{const available=Boolean(Number(worker.available));if((!cfg.show_unavailable&&!available)||(availability==="available"&&!available)||(availability==="unavailable"&&available)||(trade&&!workerTrades(worker).includes(trade)))return;const coords=mapCoords(worker.location);if(!coords){missing.push(worker.name);return}const key=mapAddressKey(worker.location)||coords.join(","),group=workerGroups.get(key)||{kind:"worker",coords,workers:[],location:worker.location||"Woonplaats onbekend"};group.workers.push(worker);workerGroups.set(key,group)});for(const group of workerGroups.values()){const availableCount=group.workers.filter(worker=>Number(worker.available)).length,total=group.workers.length,allUnavailable=!availableCount;items.push({kind:"worker",available:!allUnavailable,coords:group.coords,title:group.location+" · "+total+" vakman"+(total===1?"":"sen"),subtitle:availableCount+" beschikbaar · "+(total-availableCount)+" niet beschikbaar",color:allUnavailable?"#778078":"#159447",count:total,popup:'<div class="mapPopup"><b>'+esc(group.location)+'</b><br>'+availableCount+" van "+total+' beschikbaar<hr style="border:0;border-top:1px solid #ddd">'+group.workers.sort((a,b)=>Number(b.available)-Number(a.available)||a.name.localeCompare(b.name,"nl")).map(worker=>'<div style="padding:7px 0;border-bottom:1px solid #eee"><strong>'+esc(worker.name)+'</strong><br><small>'+esc(workerTrades(worker).map(tradeLabel).join(", "))+' · '+(Number(worker.available)?"Beschikbaar":"Niet beschikbaar")+'</small>'+workerActions(worker)+'</div>').join("")+'</div>'})}if(type!=="workers")state.jobs.forEach(job=>{if(job.status==="Geannuleerd"||mapJobEnded(job))return;const open=mapJobOpen(job);if((!cfg.show_filled&&!open)||(availability==="available"&&!open)||(availability==="unavailable"&&open)||(trade&&job.trade!==trade))return;const coords=mapCoords(job.location,true);if(!coords){missing.push(job.client+" · "+job.location);return}items.push({kind:"job",available:open,coords,title:job.client,subtitle:job.location+" · "+tradeLabel(job.trade)+" · "+job.status,color:open?"#f47b35":"#125b32",popup:'<div class="mapPopup"><b>'+esc(job.client)+'</b><br>'+esc(job.location)+'<br>'+esc(tradeLabel(job.trade))+' · '+esc(job.status)+'<br><br><strong>Gekoppelde vakmensen</strong>'+mapTravelForJob(job)+'<br><button class="contactBtn" data-map-job="'+job.id+'">Aanvraag openen</button></div>'})});return {items,missing}}
async function hydrateMapAddresses(){if(mapLoading||mapConfig().geocoding_enabled===false||String(mapConfig().geocoding_enabled)==="false")return;const recentlyFailed=value=>Date.now()-Number(mapGeocodeFailures.get(mapAddressKey(value))||0)<60000,jobAddresses=state.jobs.filter(item=>item.status!=="Geannuleerd"&&!mapJobEnded(item)).map(item=>item.location).filter(value=>value&&!mapCoords(value,true)),workerLocations=state.workers.map(item=>item.location).filter(value=>value&&!mapCoords(value)),addresses=[...new Set([...jobAddresses,...workerLocations].map(value=>String(value||"").trim()).filter(value=>value&&!recentlyFailed(value)))];if(!addresses.length)return;mapLoading=true;const notice=$("#mapNotice");notice.classList.remove("hidden");notice.textContent="Adressen worden opgezocht…";for(let index=0;index<addresses.length;index++){const address=addresses[index];try{const result=await api("/api/geocode?address="+encodeURIComponent(address));if(result.found){mapGeocodes.set(mapAddressKey(address),[Number(result.latitude),Number(result.longitude)]);mapGeocodeFailures.delete(mapAddressKey(address))}else mapGeocodeFailures.set(mapAddressKey(address),Date.now())}catch{mapGeocodeFailures.set(mapAddressKey(address),Date.now())}if(index<addresses.length-1)await new Promise(resolve=>setTimeout(resolve,1050))}mapLoading=false;renderMap()}
function renderMap(){if(!window.L){$("#mapNotice").classList.remove("hidden");$("#mapNotice").textContent="De kaart kon niet worden geladen. Controleer de internetverbinding.";return}const cfg=mapConfig(),result=mapItems();if(!dusMap){dusMap=L.map("dusMap",{zoomControl:true,preferCanvas:true}).setView([Number(cfg.center_lat||52.05),Number(cfg.center_lng||4.48)],Number(cfg.default_zoom||8));L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(dusMap);mapLayer=L.layerGroup().addTo(dusMap)}mapLayer.clearLayers();const bounds=[];result.items.forEach(item=>{const marker=L.circleMarker(item.coords,{radius:item.kind==="job"?10:Math.min(17,8+Math.log2(Number(item.count||1))*2),color:"#fff",weight:2,fillColor:item.color,fillOpacity:.96}).bindPopup(item.popup,{maxHeight:390});marker.addTo(mapLayer);bounds.push(item.coords)});if(bounds.length>1)dusMap.fitBounds(bounds,{padding:[28,28],maxZoom:12});else if(bounds.length===1)dusMap.setView(bounds[0],12);const notice=$("#mapNotice");notice.classList.toggle("hidden",!result.missing.length);notice.textContent=result.missing.length?(mapLoading?"Adressen worden opgezocht…":result.missing.length+" adres"+(result.missing.length===1?"":"sen")+" kon"+(result.missing.length===1?"":"den")+" niet worden gevonden. Controleer plaats en postcode."):"";$("#mapResults").innerHTML=result.items.length?result.items.map(item=>'<button class="mapResult" type="button" data-map-lat="'+item.coords[0]+'" data-map-lng="'+item.coords[1]+'"><b>'+esc(item.title)+'</b><small>'+esc(item.subtitle)+'</small></button>').join(""):'<div class="empty"><b>Geen kaartresultaten</b><span>Pas de filters aan.</span></div>';setTimeout(()=>dusMap.invalidateSize(),50);hydrateMapAddresses()}
function openMap(){const cfg=mapConfig();if(cfg.enabled===false||String(cfg.enabled)==="false"){toast("Kaartweergave is uitgeschakeld in Beheer");return}ensureMapButtons();$("#mapTrade").innerHTML='<option value="">Alle vakgroepen</option>'+state.trades.map(item=>'<option value="'+esc(item.name)+'">'+esc(tradeLabel(item.name))+'</option>').join("");show("mapModal");renderMap()}
function renderWorkers(){
  const term=state.workerSearch.trim().toLowerCase(),all=state.workers,availableCount=all.filter(worker=>Number(worker.available)).length,unavailableCount=all.length-availableCount;
  $("#workerAvailabilityStats").innerHTML='<div class="workerSummaryLine"><strong>'+availableCount+'</strong> van '+all.length+' vakmensen beschikbaar <span>'+unavailableCount+' niet beschikbaar</span></div>';
  const matches=all.filter(worker=>!term||[worker.name,worker.phone,worker.trade,worker.location,worker.notes].join(" ").toLowerCase().includes(term)),chip=(worker,available)=>'<button type="button" class="workerNameChip '+(available?'isAvailable':'isUnavailable')+'" data-worker-quick="'+worker.id+'" title="'+esc([worker.name,worker.phone,worker.location].filter(Boolean).join(" · "))+'"><i></i><b>'+esc(worker.name)+'</b></button>',rows=state.trades.map(item=>{const group=matches.filter(worker=>workerTrades(worker).includes(item.name)).sort((a,b)=>a.name.localeCompare(b.name,"nl"));if(!group.length)return "";const available=group.filter(worker=>Number(worker.available)),unavailable=group.filter(worker=>!Number(worker.available));return '<section class="workerMatrixRow"><div class="workerMatrixTrade"><b>'+esc(tradeLabel(item.name))+'</b><span>'+group.length+' totaal</span></div><div class="workerMatrixCell availableCell">'+(available.length?available.map(worker=>chip(worker,true)).join(""):'<span class="workerNone">—</span>')+'</div><div class="workerMatrixCell unavailableCell">'+(unavailable.length?unavailable.map(worker=>chip(worker,false)).join(""):'<span class="workerNone">—</span>')+'</div></section>'}).join("");
  $("#workersList").innerHTML='<div class="workerMatrix"><header><b>Vakgroep</b><b>Beschikbaar</b><b>Niet beschikbaar</b></header>'+rows+'</div>';
}
function openWorkers(){renderWorkers();show("workersModal")}
function openWorkerForm(worker=null){const form=$("#workerForm"),field=name=>form.elements.namedItem(name);form.reset();field("id").value=worker?.id||"";field("name").value=worker?.name||"";field("phone").value=worker?.phone||"";field("location").value=worker?.location||"";const selected=workerTrades(worker);form.querySelectorAll('[name="trades"]').forEach(input=>input.checked=selected.includes(input.value));field("available").value=String(worker?Number(worker.manual_available??worker.available):1);field("notes").value=worker?.notes||"";field("send_invite").checked=!worker;$("#workerFormTitle").textContent=worker?"Vakman bewerken":"Vakman toevoegen";$("#deleteWorker").classList.toggle("hidden",!worker);$("#workerInvite").classList.toggle("hidden",!!worker);refreshWorkerInvite();show("workerFormModal")}
async function waitForJobSaves(id){const jobId=String(Number(id)),pending=[...state.savePromises.entries()].filter(([key])=>String(key).startsWith("rate:"+jobId+":")||String(key).startsWith(jobId+":")).map(([,promise])=>promise);if(pending.length)await Promise.allSettled(pending)}
async function openDetail(id){
  state.current=id;
  const j=state.jobs.find(x=>x.id===id);
  if(!j)return;
  $("#detailBody").innerHTML='<div class="loadingState"><span class="loadingDot"></span><span>Aanvraag openen…</span></div>';
  show("detailModal");
  try{
    await waitForJobSaves(id);
    const detail=await api("/api/jobs/"+id+"/detail"),comments=detail.comments,staffing=detail.staffing,reactions=detail.reactions||[];
    j.reactions=reactions;
    j.worker_names=staffing.linked.map(worker=>worker.name).join(", ");
    j.planning_workers=staffing.linked.map(worker=>({id:Number(worker.id),name:worker.name,system_planned:Number(worker.system_planned||0),address_sent:Number(worker.address_sent||0),hourly_rate:worker.hourly_rate,fee:worker.fee,linked_at:worker.linked_at}));
    renderPlanning();
    const opts=['<option value="">Niet toegewezen</option>',...state.members.map(m=>'<option '+(j.assignee===m.name?"selected":"")+'>'+esc(m.name)+'</option>')].join("");
    const personalRates=Number(j.people)>=2,linked=staffing.linked.map(worker=>{const rate=worker.hourly_rate??j.purchase_rate,fee=worker.fee??((Number(rate)||0)*feeRate(j.trade)),rateEditor=personalRates?'<form class="linkedWorkerRate" data-detail-rate="'+worker.id+'"><label><span class="label">Uurtarief</span><input class="field" name="hourly_rate" inputmode="decimal" required value="'+esc(String(rate??"").replace(".",","))+'"></label><label><span class="label">Fee</span><output data-detail-fee>'+Number(fee).toFixed(2).replace(".",",")+'</output></label><button class="secondary">Tarief opslaan</button></form>':"";return '<div class="linkedWorker'+(personalRates?"":" noPersonalRate")+'"><div><strong>'+esc(worker.name)+'</strong><small>'+esc(workerTrades(worker).map(tradeLabel).join(" · "))+' · '+esc(worker.phone)+'</small></div>'+rateEditor+'<div class="contactActions"><a class="contactBtn" href="tel:'+phoneDigits(worker.phone)+'">☎</a><a class="contactBtn whatsapp" href="'+esc(whatsappJobUrl(worker,j))+'">WhatsApp met opdracht</a><button class="unlink" data-unlink-worker="'+worker.id+'">Loskoppelen</button></div></div>'}).join("");
    const availableOptions=staffing.available.map(worker=>'<option value="'+worker.id+'">'+esc(worker.name)+' · '+esc(worker.phone)+'</option>').join("");
    $("#detailBody").innerHTML='<div class="detailTop"><div class="eyebrow">Prioriteit: '+esc(j.priority)+'</div><h3>'+esc(tradeLabel(j.trade))+' in '+esc(j.location)+'</h3><p>'+esc(j.client)+'</p></div><div class="detailgrid"><div class="detailbox"><small>Startdatum</small><b>'+dateNL(j.start_date)+'</b></div><div class="detailbox"><small>Einddatum</small><b>'+dateNL(j.end_date||j.start_date)+'</b></div><div class="detailbox"><small>Aantal</small><b>'+esc(j.people)+' '+(j.people==1?"persoon":"personen")+'</b></div><div class="detailbox"><small>'+(personalRates?"Standaard uurtarief":"Uurtarief")+'</small><b>'+money(j.purchase_rate)+'</b></div>'+(j.foreman?'<div class="detailbox"><small>Uitvoerder</small><b>'+esc(j.foreman)+'</b></div>':'')+'</div><div class="formgrid" style="margin-top:18px"><label class="full"><span class="label">Werkzaamheden</span><textarea class="field" id="dWork" rows="4" required>'+esc(j.work)+'</textarea></label><label class="full aiChoice"><input type="checkbox" id="dAI" '+(usesAIPlanning(j)?"checked":"")+'><span>Werkzaamheden automatisch met AI uitwerken<small>Aangevinkt gebruikt de planning de uitgebreide AI-tekst. Uitgevinkt gebruikt de planning precies de normale werkzaamheden.</small></span></label><label><span class="label">Status</span><select class="field" id="dStatus"><option>Nieuw</option><option>In behandeling</option><option>Ingevuld</option><option>Geannuleerd</option></select></label><label><span class="label">Toegewezen aan</span><select class="field" id="dAssignee">'+opts+'</select></label></div><div class="actions"><button class="danger" id="deleteDetail">Aanvraag verwijderen</button><button class="primary" id="saveDetail">Wijzigingen opslaan</button></div><section class="staffing"><h3>Vakmensen op deze klus</h3>'+(linked||'<p style="color:var(--muted)">Nog niemand aan deze aanvraag gekoppeld.</p>')+(availableOptions?'<form class="row" id="linkWorkerForm"><select class="field" name="worker_id" required><option value="">Kies beschikbare '+esc(tradeLabel(j.trade).toLowerCase())+'</option>'+availableOptions+'</select><button class="primary">Koppelen</button></form>':'<p style="color:var(--muted);font-size:13px">Er zijn geen andere beschikbare vakmensen in de vakgroep '+esc(tradeLabel(j.trade))+'.</p>')+'</section><div class="comments"><h3>Interne opmerkingen</h3><form class="row" id="commentForm"><input class="field" name="text" required placeholder="Schrijf een opmerking"><button class="secondary">Plaatsen</button></form><div>'+comments.map(c=>'<div class="comment"><small>'+esc(c.author||"Collega")+' · '+new Date(c.created_at).toLocaleString("nl-NL")+'</small><p>'+esc(c.text)+'</p></div>').join("")+'</div></div>';
    const reactionText=reactionPanelText();$("#detailBody .detailTop").insertAdjacentHTML("afterend",'<section class="reactionPanel"><h3>'+esc(reactionText.title)+'</h3><p>'+esc(reactionText.help)+'</p>'+reactionBar(reactions,id,true)+'</section>');
    $("#dWork").closest(".formgrid").insertAdjacentHTML("beforeend",'<label><span class="label">Aantal personen</span><input class="field" id="dPeople" type="number" inputmode="numeric" min="1" max="100" value="'+Number(j.people||1)+'" required><small style="display:block;color:var(--muted);margin-top:5px">Bepaalt het aantal plaatsen in de planning.</small></label>');
    $("#dStatus").value=j.status;
    const customDisplay=(state.formFields||[]).filter(field=>Object.prototype.hasOwnProperty.call(j.custom_values||{},String(field.id)));if(customDisplay.length){const target=$("#detailBody .detailgrid");target.insertAdjacentHTML("afterend",'<section class="companyCard" style="margin-top:16px"><h3>Extra aanvraaggegevens</h3><div class="detailgrid">'+customDisplay.map(field=>'<div class="detailbox"><small>'+esc(field.label)+'</small><b>'+esc(j.custom_values[String(field.id)]||"—")+'</b></div>').join("")+'</div></section>')}
    $("#saveDetail").onclick=()=>updateJob(id,{status:$("#dStatus").value,assignee:$("#dAssignee").value,people:Number($("#dPeople").value),work:$("#dWork").value.trim(),ai_planning:$("#dAI").checked?1:0});
    $("#deleteDetail").onclick=()=>deleteJob(id,j);
    $("#commentForm").onsubmit=async e=>{e.preventDefault();const text=new FormData(e.target).get("text");busy(e.target,true,"Plaatsen…");try{await api("/api/jobs/"+id+"/comments",{method:"POST",body:JSON.stringify({text,author:state.user?.name||"Collega"})});toast("Opmerking geplaatst");await openDetail(id)}catch(error){toast(error.message);busy(e.target,false)}};
    if($("#linkWorkerForm"))$("#linkWorkerForm").onsubmit=async e=>{e.preventDefault();const worker_id=Number(new FormData(e.target).get("worker_id")),previous=j.status;j.status="Ingevuld";render();$("#dStatus").value="Ingevuld";busy(e.target,true,"Koppelen…");try{await api("/api/jobs/"+id+"/workers",{method:"POST",body:JSON.stringify({worker_id})});toast("Vakman gekoppeld · nu niet beschikbaar");await refreshData(true);await openDetail(id)}catch(error){j.status=previous;render();toast(error.message);busy(e.target,false)}};
    $$("[data-detail-rate]").forEach(form=>{const input=form.elements.hourly_rate,fee=form.querySelector("[data-detail-fee]");input.oninput=()=>{const rate=parseFloat(String(input.value||"").replace(",","."))||0;fee.textContent=(rate*feeRate(j.trade)).toFixed(2).replace(".",",")};form.onsubmit=async e=>{e.preventDefault();const workerId=Number(form.dataset.detailRate),rate=parseFloat(String(input.value||"").replace(",","."));if(!Number.isFinite(rate)||rate<=0){toast("Vul een geldig uurtarief in");return}busy(form,true,"Opslaan…");try{const result=await api("/api/jobs/"+id+"/workers/"+workerId+"/rate",{method:"PATCH",body:JSON.stringify({hourly_rate:rate})}),worker=j.planning_workers?.find(item=>Number(item.id)===workerId);if(worker)Object.assign(worker,{hourly_rate:result.hourly_rate,fee:result.fee});fee.textContent=Number(result.fee).toFixed(2).replace(".",",");renderPlanning();toast("Tarief van "+(staffing.linked.find(item=>Number(item.id)===workerId)?.name||"vakman")+" opgeslagen")}catch(error){toast(error.message)}finally{busy(form,false)}}});
    $$("[data-unlink-worker]").forEach(button=>button.onclick=async()=>{button.disabled=true;button.textContent="Even…";try{await api("/api/jobs/"+id+"/workers/"+button.dataset.unlinkWorker,{method:"DELETE"});toast("Vakman losgekoppeld · weer beschikbaar");await refreshData(true);await openDetail(id)}catch(error){button.disabled=false;button.textContent="Loskoppelen";toast(error.message)}});
  }catch(error){$("#detailBody").innerHTML='<div class="empty"><b>Openen is niet gelukt</b><span>'+esc(error.message)+'</span></div>'}
}
async function updateJob(id,data){const j=state.jobs.find(job=>job.id===id),previous=j?{status:j.status,assignee:j.assignee,people:j.people,work:j.work,planning_work:j.planning_work,planning_work_source:j.planning_work_source,ai_planning:j.ai_planning}:null,aiEnabled=Number(data.ai_planning)!==0,refreshAI=Boolean(j&&aiEnabled&&(data.work!==j.work||!usesAIPlanning(j)));if(j){if(data.work!==j.work||refreshAI){j.planning_work=null;j.planning_work_source=null}Object.assign(j,data);render()}hide("detailModal");try{await api("/api/jobs/"+id,{method:"PATCH",body:JSON.stringify(data)});state.dataSignature="";await refreshData(true);toast(refreshAI?"Aanvraag bijgewerkt · AI-tekst wordt gemaakt":"Aanvraag bijgewerkt");if(refreshAI)setTimeout(()=>load(true),2500)}catch(e){if(j&&previous){Object.assign(j,previous);render()}toast(e.message)}}
async function setJobReaction(jobId,reaction){const job=state.jobs.find(item=>Number(item.id)===Number(jobId));if(!job)return;const buttons=$$('[data-reaction-job="'+CSS.escape(String(jobId))+'"]');buttons.forEach(button=>button.disabled=true);try{const result=await api("/api/jobs/"+jobId+"/reaction",{method:"POST",body:JSON.stringify({reaction})});job.reactions=result.reactions||[];state.dataSignature="";render();const panel=$("#detailModal:not(.hidden) .reactionPanel"),reactionText=reactionPanelText();if(panel&&Number(state.current)===Number(jobId))panel.innerHTML='<h3>'+esc(reactionText.title)+'</h3><p>'+esc(reactionText.help)+'</p>'+reactionBar(job.reactions,jobId,true);toast(result.active?"Reactie geplaatst":"Reactie verwijderd")}catch(error){buttons.forEach(button=>button.disabled=false);toast(error.message)}}
async function deleteJob(id,j){if(!confirm("Aanvraag voor "+j.client+" definitief verwijderen?"))return;const index=state.jobs.findIndex(job=>job.id===id);if(index>=0)state.jobs.splice(index,1);hide("detailModal");render();try{await api("/api/jobs/"+id,{method:"DELETE"});await refreshData(true);toast("Aanvraag verwijderd")}catch(e){if(index>=0)state.jobs.splice(index,0,j);render();toast(e.message)}}
function openPlanningWork(id){const j=state.jobs.find(job=>Number(job.id)===Number(id));if(!j)return;const form=$("#planningWorkForm"),ai=usesAIPlanning(j);form.elements.id.value=id;form.elements.planning_work.value=planningWorkText(j);$("#planningWorkHelp").textContent=ai?"Deze uitgebreide AI-tekst is alleen zichtbaar in de planning. Je kunt hem hier nog aanpassen.":"AI staat voor deze aanvraag uit. Je past hier de normale werkzaamheden aan die ook in de aanvraag staan.";show("planningWorkModal")}
function renderMembers(){const el=$("#members");el.innerHTML=state.members.length?state.members.map(m=>'<div class="teamrow"><div class="avatar">'+esc(m.name.split(/\\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase())+'</div><b>'+esc(m.name)+'</b><button class="remove" data-remove="'+m.id+'">Verwijder</button></div>').join(""):'<p style="color:var(--muted)">Nog geen collega’s toegevoegd.</p>'}
function refreshForemen(){const company=state.companies.find(item=>item.name===$("#clientSelect").value),select=$("#foremanSelect"),current=select.value;select.innerHTML='<option value="">Geen uitvoerder gekozen</option>'+((company?.foremen||[]).map(person=>'<option>'+esc(person.name)+'</option>').join(""))+'<option value="__custom">Andere uitvoerder…</option>';if([...select.options].some(option=>option.value===current))select.value=current;$("#foremanCustom").classList.add("hidden");$("#foremanCustom").required=false;$("#foremanCustom").value=""}
function refreshClientOptions(){const select=$("#clientSelect");if(!select)return;const current=select.value;select.innerHTML='<option value="">Kies opdrachtgever</option>'+state.companies.map(company=>'<option>'+esc(company.name)+'</option>').join("")+'<option value="__custom">Andere opdrachtgever…</option>';if([...select.options].some(option=>option.value===current))select.value=current;refreshForemen()}
function renderCompanies(){const el=$("#companiesList"),term=state.companySearch.trim().toLowerCase(),companies=state.companies.filter(company=>!term||[company.name,...(company.foremen||[]).map(person=>person.name)].join(" ").toLowerCase().includes(term));el.innerHTML=companies.length?companies.map(company=>'<article class="companyCard"><div class="companyHead"><div class="avatar">🏢</div><h3>'+esc(company.name)+'</h3><button class="remove" data-company-remove="'+company.id+'">Verwijder</button></div><div class="foremen">'+((company.foremen||[]).length?(company.foremen||[]).map(person=>'<span class="foremanChip">'+esc(person.name)+' <button aria-label="Verwijder uitvoerder" data-foreman-remove="'+person.id+'">×</button></span>').join(""):'<span style="color:var(--muted);font-size:12px">Nog geen uitvoerders</span>')+'</div><form class="foremanForm" data-foreman-form="'+company.id+'"><input class="field" name="name" required placeholder="Naam uitvoerder"><button class="secondary">Uitvoerder toevoegen</button></form></article>').join(""):'<div class="empty"><b>Geen opdrachtgever gevonden</b><span>Je kunt deze bedrijfsnaam met de knop hierboven toevoegen.</span></div>'}
function openClients(){renderCompanies();show("clientsModal")}
function fillSettingsForm(formId,keys){const form=$(formId);keys.forEach(key=>{const field=form.elements.namedItem(key);if(field)field.value=String(state.appSettings[key]??"")})}
function fillTradeSettingsEditor(name){const item=state.trades.find(trade=>trade.name===name)||state.trades[0],form=$("#tradeSettingsList");if(!item){form.classList.add("hidden");return}form.classList.remove("hidden");form.dataset.tradeSetting=item.name;form.elements.name.value=item.name;form.elements.fee_percent.value=String(Number(item.fee_rate)*100)}
function managementConfig(section){return {...managedDefaults[section],...(state.adminManage?.config?.[section]||{})}}
function fillManageForm(section){const form=document.querySelector('[data-manage-section="'+section+'"]'),values=managementConfig(section);if(!form)return;for(const [key,value] of Object.entries(values)){const input=form.elements.namedItem(key);if(input)input.value=String(value??"")}updateManagePreview(section)}
function updateManagePreview(section){const form=document.querySelector('[data-manage-section="'+section+'"]');if(!form)return;const values=Object.fromEntries(new FormData(form));if(section==="branding"){const preview=$("#brandPreview");preview.style.background=values.primary_color;preview.querySelector("button").style.background=values.accent_color}if(section==="texts")$("#textsPreview").innerHTML="<b>"+esc(values.title)+"</b><br>"+esc(values.subtitle)+"<p>"+esc(values.start_intro)+"</p>";if(section==="messages")$("#messagesPreview").textContent=values.notification_title+"\\n"+values.notification_body+"\\n\\n"+values.whatsapp_job_template}
function renderAppManager(){const data=state.adminManage;if(!data)return;$("#manageLoading").classList.add("hidden");$("#managePanels").classList.remove("hidden");["branding","texts","messages"].forEach(fillManageForm);$("#statusManager").innerHTML=data.statuses.map(item=>'<div class="statusManageRow" data-status-key="'+esc(item.status_key)+'"><input class="field" name="label" value="'+esc(item.label)+'" aria-label="Statusnaam"><input class="field colorField" name="color" type="color" value="'+esc(item.color)+'"><label class="checkSetting"><input name="active" type="checkbox" '+(Number(item.active)?"checked":"")+'><span>Aan</span></label></div>').join("");$("#fieldManager").innerHTML=data.fields.map(item=>'<div class="sortableItem" data-field-id="'+item.id+'"><span class="dragHandle">⋮⋮</span><div><b>'+esc(item.label)+'</b><small>'+esc(item.field_type)+(Number(item.required)?" · verplicht":"")+(Number(item.archived)?" · gearchiveerd":"")+'</small></div><div class="itemActions"><button type="button" data-field-edit="'+item.id+'">Bewerken</button>'+(Number(item.archived)?"":'<button type="button" data-field-archive="'+item.id+'">Archiveren</button>')+'</div></div>').join("")||'<p class="manageHint">Nog geen extra velden.</p>';$("#dashboardManager").innerHTML=data.widgets.map(item=>'<div class="sortableItem" draggable="true" data-widget-key="'+esc(item.widget_key)+'"><span class="dragHandle">⋮⋮</span><b>'+esc(item.label)+'</b><div class="itemActions"><button type="button" data-move="-1">↑</button><button type="button" data-move="1">↓</button><label class="checkSetting"><input type="checkbox" '+(Number(item.enabled)?"checked":"")+'><span>Aan</span></label></div></div>').join("");$("#rolesManager").innerHTML=data.roles.map(item=>'<div class="roleManageRow" data-role-user="'+esc(item.user_name)+'"><b>'+esc(item.user_name)+'</b><select class="field" '+(item.user_name.toLowerCase()==="swen"?"disabled":"")+'><option value="beheerder" '+(item.role_key==="beheerder"?"selected":"")+'>Beheerder</option><option value="planner" '+(item.role_key==="planner"?"selected":"")+'>Planner</option><option value="lezer" '+(item.role_key==="lezer"?"selected":"")+'>Alleen lezen</option></select></div>').join("");$("#changeLogList").innerHTML=data.logs.map(item=>'<div class="logRow"><b>'+esc(item.changed_by)+' wijzigde '+esc(item.section)+" · "+esc(item.setting_key)+'</b><small>'+new Date(item.changed_at.replace(" ","T")+"Z").toLocaleString("nl-NL")+'</small></div>').join("")||'<p class="manageHint">Nog geen wijzigingen vastgelegd.</p>';wireDashboardDrag()}
async function loadAppManager(){if(String(state.user?.name||"").toLowerCase()!=="swen")return;$("#manageLoading").classList.remove("hidden");$("#managePanels").classList.add("hidden");try{state.adminManage=await api("/api/settings/manage");renderAppManager()}catch(error){$("#manageLoading").textContent=error.message}}
function wireDashboardDrag(){let dragged=null;$$('#dashboardManager [draggable="true"]').forEach(item=>{item.ondragstart=()=>dragged=item;item.ondragover=e=>e.preventDefault();item.ondrop=e=>{e.preventDefault();if(dragged&&dragged!==item)item.parentElement.insertBefore(dragged,item)}})}
function resetFieldBuilder(){const form=$("#fieldBuilderForm");form.reset();form.elements.id.value="";form.elements.sort_order.value="100";form.elements.visible.checked=true}
function renderSettings(){if(String(state.user?.name||"").toLowerCase()!=="swen")return;fillSettingsForm("#workflowSettingsForm",["default_priority","default_people","default_board_status","default_ai","planning_weeks_before","planning_weeks_after"]);fillSettingsForm("#securitySettingsForm",["mobile_session_minutes"]);const tradeSelect=$("#tradeSettingsSelect"),selected=state.trades.some(item=>item.name===tradeSelect.value)?tradeSelect.value:state.trades[0]?.name||"";tradeSelect.innerHTML=state.trades.map(item=>'<option value="'+esc(item.name)+'">'+esc(tradeLabel(item.name))+'</option>').join("");tradeSelect.value=selected;fillTradeSettingsEditor(selected);$("#pinUser").innerHTML=(state.loginUsers||["Swen","Ernst","Christiaan"]).map(name=>'<option>'+esc(name)+'</option>').join("");show("settingsModal");loadAppManager()}
async function openNotifications(){state.lastSeen=Date.now();localStorage.setItem("dus-last-seen",state.lastSeen);render();$("#notifications").innerHTML=state.jobs.length?state.jobs.slice(0,20).map(j=>'<button class="teamrow" style="width:100%;border-left:0;border-right:0;border-top:0;background:#fff;text-align:left" data-note="'+j.id+'"><div class="avatar">＋</div><div><b>Nieuwe '+esc(tradeLabel(j.trade))+'</b><div style="color:var(--muted);font-size:12px">'+esc(j.location)+' · '+new Date(j.created_at).toLocaleString("nl-NL")+'</div></div></button>').join(""):'<p>Er zijn nog geen meldingen.</p>';show("notifyModal")}
const clientSelect=$("#clientSelect"),clientCustom=$("#clientCustom"),foremanSelect=$("#foremanSelect"),foremanCustom=$("#foremanCustom");
const jobStart=$("#jobForm").elements.namedItem("start_date"),jobEnd=$("#jobForm").elements.namedItem("end_date");
jobStart.addEventListener("change",()=>{jobEnd.min=jobStart.value;if(!jobEnd.value||jobEnd.value<jobStart.value)jobEnd.value=jobStart.value});
clientSelect.onchange=()=>{const custom=clientSelect.value==="__custom";clientCustom.classList.toggle("hidden",!custom);clientCustom.required=custom;if(custom)setTimeout(()=>clientCustom.focus(),50);else clientCustom.value="";refreshForemen()};
foremanSelect.onchange=()=>{const custom=foremanSelect.value==="__custom";foremanCustom.classList.toggle("hidden",!custom);foremanCustom.required=custom;if(custom)setTimeout(()=>foremanCustom.focus(),50);else foremanCustom.value=""};
$("#jobForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),custom_fields={};for(const field of state.formFields||[]){const key="custom_"+field.id;if(key in data){custom_fields[String(field.id)]=data[key];delete data[key]}else if(field.field_type==="checkbox")custom_fields[String(field.id)]="0"}data.custom_fields=custom_fields;data.ai_planning=data.ai_planning==="1"?1:0;if(data.client==="__custom")data.client=String(data.client_custom||"").trim();if(data.foreman==="__custom")data.foreman=String(data.foreman_custom||"").trim();delete data.client_custom;delete data.foreman_custom;busy(e.target,true,"Publiceren…");try{const result=await api("/api/jobs",{method:"POST",body:JSON.stringify(data)});state.jobs.unshift({...data,custom_values:custom_fields,id:result.id,people:Math.max(1,Number(data.people)||1),purchase_rate:parseFloat(String(data.purchase_rate||"").replace(",","."))||null,status:"Nieuw",assignee:null,created_at:new Date().toISOString()});render();e.target.reset();e.target.people.value=String(Math.max(1,Number(state.appSettings.default_people)||1));e.target.priority.value=state.appSettings.default_priority||"Normaal";e.target.ai_planning.checked=Number(state.appSettings.default_ai)===1;clientCustom.classList.add("hidden");clientCustom.required=false;foremanCustom.classList.add("hidden");foremanCustom.required=false;refreshClientOptions();hide("jobModal");toast(data.ai_planning?"Aanvraag gepubliceerd · AI-tekst wordt gemaakt":"Aanvraag gepubliceerd")}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#companyForm").onsubmit=async e=>{e.preventDefault();const name=new FormData(e.target).get("name");busy(e.target,true,"Toevoegen…");try{await api("/api/companies",{method:"POST",body:JSON.stringify({name})});e.target.reset();state.companySearch="";await load();renderCompanies();toast("Opdrachtgever toegevoegd")}catch(err){toast(err.message)}finally{busy(e.target,false)}};
async function saveSettingsForm(event,section,message){event.preventDefault();const data=Object.fromEntries(new FormData(event.target));busy(event.target,true,"Opslaan…");try{await api("/api/settings/"+section,{method:"PATCH",body:JSON.stringify(data)});state.dataSignature="";await load();renderSettings();toast(message)}catch(err){toast(err.message)}finally{busy(event.target,false)}}
$("#refreshAppManager").onclick=loadAppManager;
$("#manageTabs").onclick=e=>{const button=e.target.closest("[data-manage-tab]");if(!button)return;$$(".manageTab").forEach(item=>item.classList.toggle("active",item===button));$$(".managePanel").forEach(item=>item.classList.toggle("active",item.dataset.managePanel===button.dataset.manageTab))};
$$(".manageForm").forEach(form=>{const section=form.dataset.manageSection;form.oninput=()=>updateManagePreview(section);form.onsubmit=async e=>{e.preventDefault();busy(form,true,"Opslaan…");try{await api("/api/settings/manage/"+section,{method:"PATCH",body:JSON.stringify(Object.fromEntries(new FormData(form)))});state.dataSignature="";await load();await loadAppManager();toast("Instelling centraal opgeslagen")}catch(error){toast(error.message)}finally{busy(form,false)}};form.querySelector(".manageCancel").onclick=()=>fillManageForm(section);form.querySelector(".manageReset").onclick=async()=>{if(!confirm("Deze instellingen herstellen naar de DUS-standaard?"))return;try{await api("/api/settings/manage/"+section,{method:"PATCH",body:JSON.stringify({reset:true})});state.dataSignature="";await load();await loadAppManager();toast("Standaardinstellingen hersteld")}catch(error){toast(error.message)}}});
$("#statusManager").parentElement.addEventListener("click",async e=>{const action=e.target.closest("[data-save-list]");if(!action||action.dataset.saveList!=="statuses")return;const items=$$("#statusManager [data-status-key]").map(row=>({status_key:row.dataset.statusKey,label:row.querySelector('[name="label"]').value,color:row.querySelector('[name="color"]').value,active:row.querySelector('[name="active"]').checked}));try{await api("/api/settings/manage/statuses",{method:"PATCH",body:JSON.stringify({items})});state.dataSignature="";await load();await loadAppManager();toast("Statussen opgeslagen")}catch(error){toast(error.message)}});
$("#fieldBuilderForm").onsubmit=async e=>{e.preventDefault();const form=e.target,data=Object.fromEntries(new FormData(form));data.required=form.elements.required.checked;data.visible=form.elements.visible.checked;data.options=String(data.options||"").split("\\n").map(value=>value.trim()).filter(Boolean);busy(form,true,"Opslaan…");try{await api("/api/settings/manage/fields",{method:"POST",body:JSON.stringify(data)});resetFieldBuilder();state.dataSignature="";await load();await loadAppManager();toast("Formulierveld opgeslagen")}catch(error){toast(error.message)}finally{busy(form,false)}};
$("#cancelFieldEdit").onclick=resetFieldBuilder;
$("#fieldManager").onclick=async e=>{const edit=e.target.closest("[data-field-edit]"),archive=e.target.closest("[data-field-archive]");if(edit){const item=state.adminManage.fields.find(field=>Number(field.id)===Number(edit.dataset.fieldEdit)),form=$("#fieldBuilderForm");if(!item)return;form.elements.id.value=item.id;form.elements.label.value=item.label;form.elements.field_type.value=item.field_type;form.elements.options.value=(item.options||[]).join("\\n");form.elements.sort_order.value=item.sort_order;form.elements.required.checked=Number(item.required);form.elements.visible.checked=Number(item.visible);form.scrollIntoView({behavior:"smooth",block:"center"})}if(archive&&confirm("Dit veld archiveren? Historische gegevens blijven bewaard.")){try{await api("/api/settings/manage/fields/"+archive.dataset.fieldArchive,{method:"DELETE"});state.dataSignature="";await load();await loadAppManager();toast("Veld gearchiveerd")}catch(error){toast(error.message)}}};
$("#dashboardManager").onclick=e=>{const move=e.target.closest("[data-move]");if(!move)return;const row=move.closest("[data-widget-key]"),direction=Number(move.dataset.move),other=direction<0?row.previousElementSibling:row.nextElementSibling;if(other)row.parentElement.insertBefore(direction<0?row:other,direction<0?other:row)};
$("#dashboardManager").parentElement.addEventListener("click",async e=>{if(e.target.closest("[data-save-list]")?.dataset.saveList!=="dashboard")return;const items=$$("#dashboardManager [data-widget-key]").map(row=>({widget_key:row.dataset.widgetKey,enabled:row.querySelector('input[type="checkbox"]').checked}));try{await api("/api/settings/manage/dashboard",{method:"PATCH",body:JSON.stringify({items})});state.dataSignature="";await load();await loadAppManager();toast("Dashboardindeling opgeslagen")}catch(error){toast(error.message)}});
$("#rolesManager").parentElement.addEventListener("click",async e=>{if(e.target.closest("[data-save-list]")?.dataset.saveList!=="roles")return;const items=$$("#rolesManager [data-role-user]").map(row=>({user_name:row.dataset.roleUser,role_key:row.querySelector("select").value}));try{await api("/api/settings/manage/roles",{method:"PATCH",body:JSON.stringify({items})});await loadAppManager();toast("Gebruikersrechten opgeslagen")}catch(error){toast(error.message)}});
$$("[data-reset-list]").forEach(button=>button.onclick=async()=>{if(!confirm("Dit onderdeel herstellen naar de standaardinstellingen?"))return;const section=button.dataset.resetList;try{if(section==="statuses"){const labels=[["Nieuw","#F47B35"],["In behandeling","#E9A23B"],["Ingevuld","#125B32"],["Geannuleerd","#8A948C"]],items=labels.map(([status_key,color])=>({status_key,label:status_key,color,active:true}));await api("/api/settings/manage/statuses",{method:"PATCH",body:JSON.stringify({items})})}if(section==="dashboard"){const items=["new","busy","filled","total","analytics"].map(widget_key=>({widget_key,enabled:true}));await api("/api/settings/manage/dashboard",{method:"PATCH",body:JSON.stringify({items})})}if(section==="roles"){const items=(state.loginUsers||["Swen","Ernst","Christiaan"]).map(user_name=>({user_name,role_key:user_name.toLowerCase()==="swen"?"beheerder":"planner"}));await api("/api/settings/manage/roles",{method:"PATCH",body:JSON.stringify({items})})}state.dataSignature="";await load();await loadAppManager();toast("Standaardinstellingen hersteld")}catch(error){toast(error.message)}});
$("#workflowSettingsForm").onsubmit=e=>saveSettingsForm(e,"workflow","Werkproces opgeslagen");
$("#securitySettingsForm").onsubmit=e=>saveSettingsForm(e,"security","Beveiliging opgeslagen");
$("#tradeSettingsForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));busy(e.target,true,"Toevoegen…");try{await api("/api/settings/trades",{method:"POST",body:JSON.stringify(data)});e.target.reset();e.target.fee_percent.value=14;state.dataSignature="";await load();renderSettings();toast("Vakgroep toegevoegd")}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#tradeSettingsSelect").onchange=e=>fillTradeSettingsEditor(e.target.value);
$("#tradeSettingsList").onsubmit=async e=>{const form=e.target.closest("[data-trade-setting]");if(!form)return;e.preventDefault();const data=Object.fromEntries(new FormData(form));busy(form,true,"Opslaan…");try{await api("/api/settings/trades/"+encodeURIComponent(form.dataset.tradeSetting),{method:"PATCH",body:JSON.stringify(data)});state.dataSignature="";await load();renderSettings();toast("Vakgroep bijgewerkt")}catch(err){toast(err.message)}finally{busy(form,false)}};
$("#pinSettingsForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));busy(e.target,true,"Wijzigen…");try{await api("/api/settings/pin",{method:"PATCH",body:JSON.stringify(data)});e.target.reset();toast("Pincode van "+data.name+" gewijzigd")}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#revokeFaceIds").onclick=async()=>{if(!confirm("Alle Face ID-koppelingen verwijderen? Iedereen moet Face ID daarna opnieuw instellen."))return;const button=$("#revokeFaceIds");button.disabled=true;try{await api("/api/settings/passkeys",{method:"DELETE",body:"{}"});toast("Alle Face ID-koppelingen zijn verwijderd")}catch(err){toast(err.message)}finally{button.disabled=false}};
$("#exportBackup").onclick=()=>{const backup={exported_at:new Date().toISOString(),app_settings:state.appSettings,trades:state.trades,jobs:state.jobs,members:state.members,workers:state.workers,companies:state.companies};const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="DUS-backup-"+new Date().toISOString().slice(0,10)+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$("#memberForm").onsubmit=async e=>{e.preventDefault();const name=new FormData(e.target).get("name");busy(e.target,true,"Toevoegen…");try{await api("/api/members",{method:"POST",body:JSON.stringify({name})});e.target.reset();await load();renderMembers()}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#workerForm").onsubmit=async e=>{e.preventDefault();const formData=new FormData(e.target),data=Object.fromEntries(formData),id=Number(data.id||0);data.trades=formData.getAll("trades");const inviteUrl=!id&&formData.get("send_invite")==="1"?whatsappGroupInviteUrl(data.name,data.phone,data.trades):"";delete data.id;delete data.trade;delete data.send_invite;data.available=Number(data.available);if(!data.trades.length){toast("Kies minimaal één functie");return}busy(e.target,true,"Opslaan…");try{const result=await api(id?"/api/workers/"+id:"/api/workers",{method:id?"PATCH":"POST",body:JSON.stringify(data)});data.trade=data.trades.join(", ");delete data.trades;if(id){data.available=Number(result.available);data.manual_available=Number(result.manual_available);const worker=state.workers.find(item=>Number(item.id)===id);if(worker)Object.assign(worker,data)}else state.workers.unshift({...data,manual_available:data.available,id:result.id});hide("workerFormModal");toast(id&&result.linked?"Vakman wordt na de einddatum automatisch beschikbaar":id?"Vakman bijgewerkt":inviteUrl?"Vakman toegevoegd · WhatsApp wordt geopend":"Vakman toegevoegd");renderWorkers();if(inviteUrl)setTimeout(()=>{window.location.href=inviteUrl},80)}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#planningWorkForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),id=Number(data.id);busy(e.target,true,"Opslaan…");try{await api("/api/jobs/"+id+"/planning-work",{method:"PATCH",body:JSON.stringify({planning_work:data.planning_work})});const j=state.jobs.find(job=>Number(job.id)===id);if(j){if(usesAIPlanning(j))j.planning_work=data.planning_work.trim();else j.work=data.planning_work.trim()}hide("planningWorkModal");renderPlanning();toast("Planningstekst opgeslagen")}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#rateAssignment").onchange=refreshRateSummary;
$("#rateForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),[jobId,workerId]=String(data.assignment||"").split(":").map(Number),newRate=parseFloat(String(data.new_rate||"").replace(",","."));if(!jobId||!workerId||!Number.isFinite(newRate)||newRate<=0||!data.effective_date){toast("Kies een vakman, nieuw tarief en ingangsdatum");return}busy(e.target,true,"Wijzigen…");try{const result=await api("/api/jobs/"+jobId+"/rate",{method:"PATCH",body:JSON.stringify({worker_id:workerId,new_rate:newRate,effective_date:data.effective_date})}),job=state.jobs.find(item=>Number(item.id)===jobId),worker=job?.planning_workers?.find(item=>Number(item.id)===workerId);if(worker)Object.assign(worker,{hourly_rate:result.new_rate,fee:result.new_fee});if(job)Object.assign(job,{start_date:result.effective_date,updated_at:new Date().toISOString()});state.planningWeek=isoWeek(result.effective_date).key;state.dataSignature="";hide("rateModal");renderPlanning();toast("Planning verplaatst naar "+dateNL(result.effective_date))}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#addressAssignment").onchange=refreshAddressSummary;
$("#addressForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),[jobId,workerId]=String(data.assignment||"").split(":").map(Number),newAddress=String(data.new_address||"").trim();if(!jobId||!workerId||newAddress.length<3||!data.effective_date){toast("Kies een vakman en project, nieuw adres en ingangsdatum");return}busy(e.target,true,"Wijzigen…");try{const result=await api("/api/jobs/"+jobId+"/address",{method:"PATCH",body:JSON.stringify({worker_id:workerId,new_address:newAddress,effective_date:data.effective_date})}),job=state.jobs.find(item=>Number(item.id)===jobId),worker=job?.planning_workers?.find(item=>Number(item.id)===workerId);if(worker)Object.assign(worker,{planning_location:result.new_address,planning_start_date:result.effective_date});state.planningWeek=isoWeek(result.effective_date).key;state.dataSignature="";hide("addressModal");await refreshData(true);renderPlanning();toast("Adres van "+(result.worker_name||"vakman")+" gewijzigd vanaf "+dateNL(result.effective_date))}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#aiSetupForm").onsubmit=async e=>{e.preventDefault();const key=new FormData(e.target).get("api_key");busy(e.target,true,"Veilig testen…");try{await api("/api/ai/setup",{method:"POST",body:JSON.stringify({api_key:key})});e.target.reset();hide("aiSetupModal");toast("AI is actief");await load(true)}catch(err){toast(err.message)}finally{busy(e.target,false)}};
$("#deleteWorker").onclick=async()=>{const id=Number($("#workerForm").elements.namedItem("id").value);const worker=state.workers.find(item=>Number(item.id)===id);if(!id||!confirm((worker?.name||"Deze vakman")+" definitief verwijderen?"))return;hide("workerFormModal");state.workers=state.workers.filter(item=>Number(item.id)!==id);renderWorkers();try{await api("/api/workers/"+id,{method:"DELETE"});toast("Vakman verwijderd")}catch(err){if(worker)state.workers.push(worker);renderWorkers();toast(err.message)}};
$("#addWorker").onclick=()=>openWorkerForm();
$("#workerSearch").oninput=e=>{state.workerSearch=e.target.value;scheduleUI("worker-search",renderWorkers)};
$("#workersList").onclick=e=>{const button=e.target.closest("[data-worker-quick]");if(!button)return;const worker=state.workers.find(item=>Number(item.id)===Number(button.dataset.workerQuick));if(worker)openWorkerForm(worker)};
$("#companySearch").oninput=e=>{state.companySearch=e.target.value;scheduleUI("company-search",renderCompanies)};
$("#workerForm").addEventListener("change",e=>{if(e.target.matches('[name="trades"]'))refreshWorkerInvite()});
async function completeLogin(result){setUser(result.user);$("#loginForm").reset();await load();restoreNotifications().catch(()=>{});hide("loginScreen");if(!await openRequestedJob())hideStart();startSync()}
$("#loginForm").onsubmit=async e=>{e.preventDefault();const pin=new FormData(e.target).get("pin");$("#loginError").textContent="";busy(e.target,true,"Inloggen…");try{const result=await api("/api/login",{method:"POST",body:JSON.stringify({pin})});await completeLogin(result)}catch(err){$("#loginError").textContent=err.message}finally{busy(e.target,false)}};
async function logout(){await api("/api/logout",{method:"POST"});clearTimeout(state.syncTimer);hide("teamModal");hideStart();setUser(null);show("loginScreen")}
$("#logoutBtn").onclick=$("#startLogout").onclick=logout;
$("#startBoard").onclick=()=>{showPage("board");hideStart()};
$("#startNew").onclick=()=>{hideStart();prepareNewJob()};
$("#startPlanning").onclick=()=>{showPage("planning");hideStart()};
$("#startWorkers").onclick=()=>{hideStart();openWorkers()};
$("#homeNav").onclick=$("#logoHome").onclick=$("#titleHome").onclick=()=>showPage("board");$("#planningBtn").onclick=$("#planningNav").onclick=()=>showPage("planning");$("#planningRate").onclick=openRateChange;$("#planningAddress").onclick=openAddressChange;$("#planningNew").onclick=$("#newBtn").onclick=$("#newNav").onclick=prepareNewJob;$("#workersBtn").onclick=$("#workersNav").onclick=openWorkers;$("#clientsBtn").onclick=$("#clientsNav").onclick=openClients;$("#settingsBtn").onclick=renderSettings;$("#teamBtn").onclick=()=>{renderMembers();show("teamModal")};$("#notifyBtn").onclick=openNotifications;
const b64bytes=value=>{const normalized=String(value).replace(/-/g,"+").replace(/_/g,"/");const padded=normalized+"=".repeat((4-normalized.length%4)%4);return Uint8Array.from(atob(padded),c=>c.charCodeAt(0))};
const bytes64=value=>{const bytes=new Uint8Array(value);let binary="";bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"")};
const passkeySupported=async()=>!!(window.PublicKeyCredential&&navigator.credentials&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.());
function registrationOptions(options){return {...options,challenge:b64bytes(options.challenge),user:{...options.user,id:b64bytes(options.user.id)},excludeCredentials:(options.excludeCredentials||[]).map(item=>({...item,id:b64bytes(item.id)}))}}
function authenticationOptions(options){return {...options,challenge:b64bytes(options.challenge),allowCredentials:(options.allowCredentials||[]).map(item=>({...item,id:b64bytes(item.id)}))}}
function registrationJSON(credential){return {id:credential.id,rawId:bytes64(credential.rawId),type:credential.type,authenticatorAttachment:credential.authenticatorAttachment,clientExtensionResults:credential.getClientExtensionResults(),response:{attestationObject:bytes64(credential.response.attestationObject),clientDataJSON:bytes64(credential.response.clientDataJSON),transports:credential.response.getTransports?.()||[]}}}
function authenticationJSON(credential){return {id:credential.id,rawId:bytes64(credential.rawId),type:credential.type,authenticatorAttachment:credential.authenticatorAttachment,clientExtensionResults:credential.getClientExtensionResults(),response:{authenticatorData:bytes64(credential.response.authenticatorData),clientDataJSON:bytes64(credential.response.clientDataJSON),signature:bytes64(credential.response.signature),userHandle:credential.response.userHandle?bytes64(credential.response.userHandle):undefined}}}
$("#enableFace").onclick=async()=>{const button=$("#enableFace");try{if(!await passkeySupported())throw new Error("Face ID wordt op dit apparaat of in deze browser niet ondersteund.");button.disabled=true;button.textContent="Face ID openen…";const options=await api("/api/passkeys/register/options",{method:"POST",body:"{}"});const credential=await navigator.credentials.create({publicKey:registrationOptions(options)});if(!credential)throw new Error("Face ID is niet ingesteld.");await api("/api/passkeys/register/verify",{method:"POST",body:JSON.stringify(registrationJSON(credential))});button.textContent="✓ Face ID is ingesteld";toast("Face ID is gekoppeld aan "+state.user.name)}catch(err){button.textContent="◉ Face ID instellen";toast(err.name==="NotAllowedError"?"Face ID is geannuleerd.":err.message)}finally{button.disabled=false}};
$("#faceLogin").onclick=async()=>{const button=$("#faceLogin");$("#loginError").textContent="";try{if(!await passkeySupported())throw new Error("Face ID wordt op dit apparaat of in deze browser niet ondersteund.");button.disabled=true;button.textContent="Face ID openen…";const options=await api("/api/passkeys/auth/options",{method:"POST",body:"{}"});const credential=await navigator.credentials.get({publicKey:authenticationOptions(options)});if(!credential)throw new Error("Inloggen met Face ID is niet gelukt.");const result=await api("/api/passkeys/auth/verify",{method:"POST",body:JSON.stringify(authenticationJSON(credential))});await completeLogin(result)}catch(err){$("#loginError").textContent=err.name==="NotAllowedError"?"Geen gekoppelde Face ID gevonden of de actie is geannuleerd.":err.message}finally{button.disabled=false;button.textContent="◉ Inloggen met Face ID"}};
const notificationsSupported=()=>("serviceWorker"in navigator)&&("PushManager"in window)&&("Notification"in window);
navigator.serviceWorker?.addEventListener("message",async event=>{if(event.data?.type!=="open-aanvraag")return;const url=new URL(event.data.url,location.origin),token=url.searchParams.get("melding"),id=Number(url.searchParams.get("aanvraag"));if(token){try{const data=await api("/api/notification-open",{method:"POST",body:JSON.stringify({token})});setUser(data.user);applyData(data);requestedJob=Number(data.job_id);hide("loginScreen");await openRequestedJob();startSync();return}catch{}}if(id){requestedJob=id;if(state.user)await openRequestedJob()}});
function setNotificationState(enabled,label){const button=$("#enableNotify");button.dataset.enabled=enabled?"true":"false";button.textContent=label||(enabled?"✓ Meldingen ingeschakeld":"🔔 Browsermeldingen inschakelen")}
async function notificationRegistration(){const reg=await navigator.serviceWorker.register("/sw.js?v=85");await reg.update().catch(()=>{});await navigator.serviceWorker.ready;return reg}
async function restoreNotifications(){if(!notificationsSupported())return;try{if(Notification.permission==="denied"){setNotificationState(false,"Meldingen geblokkeerd in iPhone-instellingen");return}if(Notification.permission!=="granted")return;const reg=await notificationRegistration();let sub=await reg.pushManager.getSubscription();if(!sub&&localStorage.getItem("dus-notifications-enabled")==="true"){const key=await api("/api/push-key");sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64bytes(key.publicKey)})}if(!sub)return;await api("/api/push-subscriptions",{method:"POST",body:JSON.stringify(sub.toJSON())});localStorage.setItem("dus-notifications-enabled","true");setNotificationState(true)}catch{setNotificationState(false,"🔔 Meldingen opnieuw verbinden")}}
$("#enableNotify").onclick=async()=>{try{if($("#enableNotify").dataset.enabled==="true"){toast("Meldingen staan al aan");return}if(!notificationsSupported())throw new Error("Zet de app eerst via Safari op je beginscherm.");const permission=await Notification.requestPermission();if(permission!=="granted")throw new Error("Meldingen zijn niet toegestaan.");const reg=await notificationRegistration();const key=await api("/api/push-key");let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64bytes(key.publicKey)});await api("/api/push-subscriptions",{method:"POST",body:JSON.stringify(sub.toJSON())});localStorage.setItem("dus-notifications-enabled","true");setNotificationState(true);toast("Meldingen blijven vanaf nu ingeschakeld")}catch(err){toast(err.message)}};
$("#search").oninput=e=>{state.filter=e.target.value.toLowerCase();scheduleUI("board-search",render)};$("#tradeFilter").onchange=e=>{state.trade=e.target.value;render()};
$("#analyticsToggle").onclick=()=>setAnalyticsExpanded($("#analyticsSection").classList.contains("isCollapsed"));
$("#analyticsTrade").onchange=e=>{state.analytics.trade=e.target.value;state.analytics.signature="";renderAnalyticsSafe()};$("#analyticsClient").onchange=e=>{state.analytics.client=e.target.value;state.analytics.signature="";renderAnalyticsSafe()};$("#analyticsPerson").onchange=e=>{state.analytics.person=e.target.value;state.analytics.signature="";renderAnalyticsSafe()};$("#analyticsMonth").onchange=e=>{state.analytics.month=e.target.value;state.analytics.signature="";renderAnalyticsSafe()};$("#analyticsReset").onclick=()=>{Object.assign(state.analytics,{trade:"",client:"",person:"",signature:""});renderAnalyticsSafe()};
$("#analyticsRanges").onclick=e=>{const button=e.target.closest("[data-analytics-range]");if(!button)return;state.analytics.range=button.dataset.analyticsRange;state.analytics.signature="";renderAnalyticsSafe()};
$("#analyticsLine").addEventListener("pointerover",e=>{const point=e.target.closest("[data-chart-tip]");if(point)$("#analyticsLineTooltip").textContent=point.dataset.chartTip});$("#analyticsLine").addEventListener("click",e=>{const point=e.target.closest("[data-chart-tip]");if(point)$("#analyticsLineTooltip").textContent=point.dataset.chartTip});
$("#analyticsBars").addEventListener("pointerover",e=>{const bar=e.target.closest("[data-bar-tip]");if(bar)$("#analyticsBarTooltip").textContent=bar.dataset.barTip});$("#analyticsBars").addEventListener("click",e=>{const bar=e.target.closest("[data-bar-tip]");if(bar)$("#analyticsBarTooltip").textContent=bar.dataset.barTip});
$("#planningSearch").oninput=e=>{state.planningFilter=e.target.value.toLowerCase();scheduleUI("planning-search",renderPlanning)};$("#planningStatus").onchange=e=>{state.planningStatus=e.target.value;renderPlanning()};
const planValue=element=>{if(!element)return;if(element.matches('[contenteditable="true"]')||!("value" in element))return element.textContent;return element.value};
const setPlanValue=(element,value)=>{if(!element)return;if(element.matches('[contenteditable="true"]')||!("value" in element))element.textContent=value;else element.value=value};
document.addEventListener("click",e=>{const link=e.target.closest("[data-contract-link]");if(!link)return;e.preventDefault();e.stopPropagation();const opened=window.open(contractUrl,"_blank","noopener,noreferrer");if(!opened)toast("Sta pop-ups toe om het contractscherm in de browser te openen")},true);
document.addEventListener("click",e=>{const toggle=e.target.closest("[data-plan-date-toggle]");if(!toggle)return;const key=String(toggle.dataset.planDateToggle),willOpen=planningClosedDates.has(key);if(willOpen)planningClosedDates.delete(key);else planningClosedDates.add(key);rememberPlanningDates();toggle.setAttribute("aria-expanded",String(willOpen));const tableHeader=document.querySelector('.planningDateRow[data-plan-date-row="'+CSS.escape(key)+'"]');if(tableHeader){tableHeader.classList.toggle("isOpen",willOpen);document.querySelectorAll('.planningDateItem[data-plan-date-key="'+CSS.escape(key)+'"]').forEach(row=>row.classList.toggle("isDateCollapsed",!willOpen))}const group=toggle.closest(".planningDateGroup");if(group)group.classList.toggle("isOpen",willOpen)});
document.addEventListener("click",e=>{const button=e.target.closest("[data-reaction-job]");if(!button)return;e.preventDefault();e.stopPropagation();setJobReaction(Number(button.dataset.reactionJob),button.dataset.reaction)});
document.addEventListener("input",e=>{const row=e.target.closest(".planningEditable");if(!row)return;if(e.target.matches("[data-plan-rate]")){const fee=row.querySelector("[data-plan-fee]"),rate=parseFloat(String(planValue(e.target)||"").replace(",","."))||0,trade=planValue(row.querySelector("[data-plan-trade]"))||"";setPlanValue(fee,(rate*feeRate(trade)).toFixed(2).replace(".",","))}});
document.addEventListener("change",async e=>{const row=e.target.closest(".planningEditable");if(row&&e.target.matches("[data-plan-confirm]")){await setSystemPlanned(e.target);return}if(row&&e.target.matches("[data-address-sent]")){await setAddressSent(e.target);return}if(row&&e.target.matches("[data-plan-trade]")){const fee=row.querySelector("[data-plan-fee]"),rate=parseFloat(String(planValue(row.querySelector("[data-plan-rate]"))||"").replace(",","."))||0;setPlanValue(fee,(rate*feeRate(e.target.value)).toFixed(2).replace(".",","))}if(row&&e.target.closest(".excelTable")){if(e.target.matches("[data-plan-rate]")&&row.dataset.planPersonRate==="1"&&Number(row.dataset.planWorkerId)){await saveWorkerRate(row);return}await savePlanningRow(row,Number(row.dataset.planRow))}});
document.addEventListener("focusout",async e=>{const row=e.target.closest(".excelTable .planningEditable");if(!row||!e.target.matches('[contenteditable="true"]'))return;if(e.target.matches("[data-plan-rate]")&&row.dataset.planPersonRate==="1"&&Number(row.dataset.planWorkerId)){await saveWorkerRate(row);return}await savePlanningRow(row,Number(row.dataset.planRow))});
document.addEventListener("keydown",e=>{if(e.target.matches('.excelCell[contenteditable="true"]')&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.target.blur()}});
document.addEventListener("submit",async e=>{const form=e.target.closest("[data-foreman-form]");if(!form)return;e.preventDefault();const companyId=Number(form.dataset.foremanForm),name=new FormData(form).get("name");busy(form,true,"Toevoegen…");try{await api("/api/companies/"+companyId+"/foremen",{method:"POST",body:JSON.stringify({name})});form.reset();await load();renderCompanies();toast("Uitvoerder toegevoegd")}catch(error){toast(error.message)}finally{busy(form,false)}});
document.addEventListener("click",async e=>{const c=e.target.closest("[data-close]");if(c)hide(c.dataset.close);const o=e.target.closest("[data-open]");if(o)openDetail(Number(o.dataset.open));const week=e.target.closest("[data-plan-week]");if(week){state.planningWeek=week.dataset.planWeek;renderPlanning()}const toggle=e.target.closest("[data-plan-toggle]");if(toggle){const key=String(toggle.dataset.planToggle),card=toggle.closest(".planningCard"),willOpen=card.classList.contains("isCollapsed");card.classList.toggle("isCollapsed",!willOpen);toggle.setAttribute("aria-expanded",String(willOpen));if(willOpen)planningOpenCards.add(key);else planningOpenCards.delete(key);rememberPlanningCards()}const save=e.target.closest("[data-plan-save]");if(save){e.preventDefault();await savePlanningRow(save.closest(".planningEditable"),Number(save.dataset.planSave),save)}const planWork=e.target.closest("[data-plan-work]");if(planWork)openPlanningWork(Number(planWork.dataset.planWork));const planOpen=e.target.closest("[data-plan-open]");if(planOpen)openDetail(Number(planOpen.dataset.planOpen));const n=e.target.closest("[data-note]");if(n){hide("notifyModal");openDetail(Number(n.dataset.note))}const edit=e.target.closest("[data-worker-edit]");if(edit)openWorkerForm(state.workers.find(worker=>Number(worker.id)===Number(edit.dataset.workerEdit)));const rm=e.target.closest("[data-remove]");if(rm&&confirm("Collega verwijderen?")){await api("/api/members/"+rm.dataset.remove,{method:"DELETE"});await load();renderMembers()}const companyRemove=e.target.closest("[data-company-remove]");if(companyRemove&&confirm("Opdrachtgever verwijderen? Bestaande aanvragen blijven bewaard.")){await api("/api/companies/"+companyRemove.dataset.companyRemove,{method:"DELETE"});await load();renderCompanies()}const foremanRemove=e.target.closest("[data-foreman-remove]");if(foremanRemove&&confirm("Uitvoerder verwijderen?")){await api("/api/foremen/"+foremanRemove.dataset.foremanRemove,{method:"DELETE"});await load();renderCompanies()}const tab=e.target.closest(".tab");if(tab){$$(".tab").forEach(x=>x.classList.remove("active"));tab.classList.add("active");state.status=tab.dataset.status;render()}});
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)hide(m.id)}));
document.addEventListener("visibilitychange",()=>{if(document.hidden){state.wasHidden=true;return}if(state.user&&!isEditing())load(true);if(state.wasHidden&&state.user&&!document.querySelector(".modal:not(.hidden)"))showStart();state.wasHidden=false});
setAnalyticsExpanded(localStorage.getItem(analyticsOpenStorage)==="true");
ensureMapButtons();
["mapType","mapAvailability","mapTrade"].forEach(id=>$("#"+id).addEventListener("change",renderMap));
$("#mapReset").onclick=()=>{$("#mapType").value="";$("#mapAvailability").value="";$("#mapTrade").value="";renderMap()};
$("#mapResults").onclick=e=>{const button=e.target.closest("[data-map-lat]");if(!button||!dusMap)return;dusMap.setView([Number(button.dataset.mapLat),Number(button.dataset.mapLng)],13)};
$("#mapModal").addEventListener("click",e=>{const button=e.target.closest("[data-map-job]");if(!button)return;hide("mapModal");openDetail(Number(button.dataset.mapJob))});
boot();
</script></body></html>`;

const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; font-src 'self' data:; style-src 'self' 'unsafe-inline' https://unpkg.com; script-src 'self' 'unsafe-inline' https://unpkg.com; connect-src 'self'; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), publickey-credentials-create=(self), publickey-credentials-get=(self)",
  "referrer-policy": "no-referrer",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-permitted-cross-domain-policies": "none",
};
function secureResponse(response) {
  const secured = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  for (const [name, value] of Object.entries(SECURITY_HEADERS))
    secured.headers.set(name, value);
  return secured;
}
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=utf-8",
      "cache-control": "no-store",
    },
  });
const DEFAULT_WHATSAPP_TEMPLATE =
  "Hoi {naam},\n\nHierbij de gegevens voor de opdracht:\nStartdatum: {datum}\nOpdrachtgever: {opdrachtgever}\nUitvoerder: {uitvoerder}\nLocatie: {locatie}\nVakgroep: {vakgroep}\n\nDenk eraan om je geldige VCA, ID en PBM’s mee te nemen.\n\nMet vriendelijke groet,\nDUS";
const WORKER_LOCATION_SEED = [{"phone":"0638988123","location":"Dordrecht"},{"phone":"0641288853","location":"Hellevoetsluis"},{"phone":"0658787704","location":"'s-Gravenhage"},{"phone":"0630823037","location":"'s-Gravenhage"},{"phone":"0618182854","location":"Dordrecht"},{"phone":"0633094047","location":"Leidschendam"},{"phone":"0626258847","location":"Zoetermeer"},{"phone":"0684887175","location":"Rotterdam"},{"phone":"0627118471","location":"Rotterdam"},{"phone":"0687022048","location":"Delfzijl"},{"phone":"0621203083","location":"Almere"},{"phone":"0685061156","location":"'s-Gravenhage"},{"phone":"0643867273","location":"'s-Gravenhage"},{"phone":"0620228906","location":"Hazerswoude-Rijndijk"},{"phone":"0610546862","location":"'s-Gravenhage"},{"phone":"0681489579","location":"'s-Gravenhage"},{"phone":"0614974251","location":"Leiden"},{"phone":"0634444595","location":"'s-Gravenhage"},{"phone":"0628438740","location":"Spijkenisse"},{"phone":"0685176015","location":"'s-Gravenhage"},{"phone":"0620402745","location":"Rotterdam"},{"phone":"0614427720","location":"'s-Gravenhage"},{"phone":"0648942696","location":"Gorinchem"},{"phone":"0621511740","location":"Gouderak"},{"phone":"0649511946","location":"Breda"},{"phone":"0657741945","location":"Spijkenisse"},{"phone":"0614627669","location":"Rotterdam"},{"phone":"0639804202","location":"Rotterdam"},{"phone":"0639449233","location":"Bleskensgraaf ca"},{"phone":"0636553251","location":"'s-Gravenhage"},{"phone":"0649218609","location":"Rotterdam"},{"phone":"0620238511","location":"Lelystad"},{"phone":"0626822010","location":"'s-Gravenhage"},{"phone":"0687556290","location":"'s-Gravenhage"},{"phone":"0685217567","location":"'s-Gravenhage"},{"phone":"0681939070","location":"Rijswijk"},{"phone":"0623767937","location":"'s-Gravenhage"},{"phone":"0620021479","location":"'s-Gravenhage"},{"phone":"0639489485","location":"'s-Gravenhage"},{"phone":"0623843325","location":"Rotterdam"},{"phone":"0681313506","location":"'s-Gravenhage"},{"phone":"0648671889","location":"Spijkenisse"},{"phone":"0684962796","location":"'s-Gravenhage"},{"phone":"0683702530","location":"Rotterdam"},{"phone":"0616179505","location":"Spijkenisse"},{"phone":"0638315403","location":"Rotterdam"},{"phone":"0623371552","location":"'s-Gravenhage"},{"phone":"0614402110","location":"Alblasserdam"},{"phone":"0615422423","location":"'s-Gravenhage"},{"phone":"0618499581","location":"'s-Gravenhage"},{"phone":"0623969699","location":"Rotterdam"},{"phone":"0628785182","location":"'s-Gravenhage"},{"phone":"0624289371","location":"Schoonhoven"},{"phone":"0641089161","location":"Schipluiden"},{"phone":"0633814612","location":"Rijswijk"},{"phone":"0611388381","location":"Krimpen aan den IJssel"},{"phone":"0649777238","location":"Rotterdam"},{"phone":"0685296734","location":"Schiedam"},{"phone":"0614941916","location":"Zoetermeer"},{"phone":"0634558575","location":"Poeldijk"},{"phone":"0645942156","location":"Amsterdam"},{"phone":"0618771991","location":"Zoetermeer"},{"phone":"0638376900","location":"Rijswijk"},{"phone":"0684069399","location":"Rotterdam"},{"phone":"0685020227","location":"Rotterdam"},{"phone":"0626200563","location":"Zoetermeer"},{"phone":"0687861308","location":"Rotterdam"},{"phone":"0615443602","location":"Leerdam"},{"phone":"0643545123","location":"Leerdam"},{"phone":"0641786102","location":"Leiden"},{"phone":"0613339270","location":"Schiedam"},{"phone":"0684561851","location":"Delfgauw"},{"phone":"0626105663","location":"'s-Gravenhage"},{"phone":"0686111314","location":"Voorburg"},{"phone":"0615087241","location":"Honselersdijk"},{"phone":"0629128999","location":"Rotterdam"},{"phone":"0614178066","location":"Gouda"},{"phone":"0612106005","location":"Hoogvliet Rotterdam"},{"phone":"0623372796","location":"IJmuiden"},{"phone":"0684352299","location":"'s-Gravenhage"},{"phone":"0684066001","location":"'s-Gravenhage"},{"phone":"0613052282","location":"Rotterdam"},{"phone":"0633666361","location":"Rotterdam"},{"phone":"0644090284","location":"Schiedam"},{"phone":"0641883658","location":"Zoetermeer"},{"phone":"0684108691","location":"Brielle"},{"phone":"0624735197","location":"'s-Gravenhage"},{"phone":"0687505743","location":"Rotterdam"},{"phone":"0641010067","location":"Rotterdam"},{"phone":"0649764922","location":"'s-Gravenhage"},{"phone":"0639226536","location":"Capelle aan den IJssel"},{"phone":"0628436773","location":"'s-Gravenhage"},{"phone":"0651775666","location":"'s-Gravenhage"},{"phone":"0641668884","location":"Hoogvliet Rotterdam"},{"phone":"0621615890","location":"Hellevoetsluis"},{"phone":"0685818247","location":"Rotterdam"},{"phone":"0626163299","location":"'s-Gravenhage"},{"phone":"0682459124","location":"Naaldwijk"},{"phone":"0627479019","location":"Rotterdam"},{"phone":"0650974048","location":"Gouda"},{"phone":"0617822622","location":"'s-Gravenhage"},{"phone":"0619330349","location":"'s-Gravenhage"},{"phone":"0648555758","location":"Rijswijk"},{"phone":"0684652101","location":"'s-Gravenhage"},{"phone":"0686492315","location":"'s-Gravenhage"},{"phone":"0032465946121","location":"Antwerpen (BE)"},{"phone":"0687523432","location":"Nieuw-Vennep"},{"phone":"0685673858","location":"'s-Gravenhage"},{"phone":"0644043347","location":"'s-Gravenhage"},{"phone":"0643155723","location":"'s-Gravenhage"},{"phone":"0687759285","location":"'s-Gravenhage"},{"phone":"0639772998","location":"Rotterdam"},{"phone":"0614684675","location":"Rotterdam"},{"phone":"0686206305","location":"'s-Gravenhage"},{"phone":"0645968610","location":"'s-Gravenhage"},{"phone":"0613410745","location":"Rotterdam"},{"phone":"0621592843","location":"Maasland"},{"phone":"0651455766","location":"De Lier"},{"phone":"0684730599","location":"'s-Gravenhage"},{"phone":"0685005891","location":"'s-Gravenhage"},{"phone":"0643988543","location":"'s-Gravenhage"},{"phone":"0613809872","location":"Schoonhoven"},{"phone":"0648051544","location":"Schoonhoven"},{"phone":"0640163519","location":"Rotterdam"},{"phone":"0652411842","location":"'s-Gravenhage"},{"phone":"0626910414","location":"Wateringen"}];
const MANAGED_DEFAULTS = {
  branding: {
    primary_color: "#125B32",
    accent_color: "#F47B35",
    lime_color: "#9BD54B",
  },
  texts: {
    title: "Aanvraagbord",
    subtitle: "Samen snel schakelen",
    start_intro:
      "Klaar om snel te schakelen? Bekijk de lopende aanvragen of zet direct een nieuwe klus uit voor het team.",
  },
  messages: {
    notification_title: "Nieuwe DUS-aanvraag",
    notification_body:
      "Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",
    whatsapp_job_template: DEFAULT_WHATSAPP_TEMPLATE,
  },
  reactions: {
    panel_title: "Reageren op deze aanvraag",
    panel_help: "Je reactie is direct zichtbaar voor alle collega’s.",
    push_title_template: "{emoji} {naam}: {reactie}",
    push_body_template: "{opdrachtgever} · {locatie}. Tik om de aanvraag te bekijken.",
    items: [
      { key: "seen", emoji: "👍", label: "Gezien", enabled: true, notify: false, sort_order: 10 },
      { key: "claim", emoji: "✅", label: "Ik pak hem op", enabled: true, notify: true, sort_order: 20 },
      { key: "looking", emoji: "👀", label: "Ik kijk ernaar", enabled: true, notify: false, sort_order: 30 },
      { key: "question", emoji: "❓", label: "Vraag", enabled: true, notify: false, sort_order: 40 },
    ],
  },
  navigation: {
    board_title: "Aanvraagbord",
    planning_title: "Planning",
    workers_title: "Vakmensen",
    clients_title: "Opdrachtgevers",
    settings_title: "Instellingen",
    team_title: "Collega’s",
    new_title: "Nieuwe aanvraag",
  },
  automation: {
    notify_new_job: true,
    auto_status_on_link: true,
    block_overlapping_workers: true,
    release_after_end_date: true,
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00",
  },
  ai: {
    enabled: true,
    require_approval: false,
    model: "gpt-5.6",
    reasoning_effort: "low",
    instructions:
      "Je schrijft professionele Nederlandse werkomschrijvingen voor een interne bouwplanning. Geef precies twee alinea's zonder kopjes of opsomming. Alinea 1 beschrijft verantwoordelijkheden en concrete werkzaamheden. Alinea 2 beschrijft wanneer het projectonderdeel als correct afgerond geldt. Schrijf helder, formeel en praktisch in 120 tot 180 woorden. Behoud uitsluitend aangeleverde feiten; verzin geen materialen, machines, certificaten of projectspecifieke eisen. Algemene formuleringen over veiligheid, projectafspraken, netheid en kwaliteit zijn toegestaan.",
  },
  map: {
    enabled: true,
    geocoding_enabled: true,
    default_zoom: 8,
    center_lat: 52.05,
    center_lng: 4.48,
    road_factor: 1.25,
    average_speed: 65,
    show_unavailable: true,
    show_filled: true,
  },
};
async function schema(db) {
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, client TEXT NOT NULL, foreman TEXT, location TEXT NOT NULL, trade TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT, people INTEGER NOT NULL DEFAULT 1, priority TEXT NOT NULL DEFAULT 'Normaal', purchase_rate REAL, sales_rate REAL, planning_fee REAL, planning_sort_order INTEGER NOT NULL DEFAULT 0, duration TEXT, work TEXT NOT NULL, ai_planning INTEGER NOT NULL DEFAULT 1 CHECK (ai_planning IN (0,1)), planning_work TEXT, planning_work_source TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'Nieuw', assignee TEXT, created_by TEXT, filled_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER NOT NULL, author TEXT, text TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS job_reactions (job_id INTEGER NOT NULL, user_name TEXT NOT NULL COLLATE NOCASE, reaction TEXT NOT NULL CHECK (reaction IN ('seen','claim','looking','question')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(job_id,user_name), FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS rate_changes (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER NOT NULL, worker_id INTEGER NOT NULL, old_rate REAL NOT NULL, new_rate REAL NOT NULL, effective_date TEXT NOT NULL, changed_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE, FOREIGN KEY(worker_id) REFERENCES workers(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS address_changes (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER NOT NULL, worker_id INTEGER, old_address TEXT NOT NULL, new_address TEXT NOT NULL, old_start_date TEXT NOT NULL, effective_date TEXT NOT NULL, changed_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE, FOREIGN KEY(worker_id) REFERENCES workers(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS workers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, trade TEXT NOT NULL, available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0,1)), manual_available INTEGER NOT NULL DEFAULT 1 CHECK (manual_available IN (0,1)), notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS job_workers (job_id INTEGER NOT NULL, worker_id INTEGER NOT NULL, linked_by TEXT, linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, planning_location TEXT, planning_start_date TEXT, planning_sort_order INTEGER NOT NULL DEFAULT 0, address_sent INTEGER NOT NULL DEFAULT 0 CHECK (address_sent IN (0,1)), PRIMARY KEY (job_id,worker_id), FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE, FOREIGN KEY(worker_id) REFERENCES workers(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS auth_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS push_subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS passkeys (credential_id TEXT PRIMARY KEY, user_name TEXT NOT NULL, public_key TEXT NOT NULL, webauthn_user_id TEXT NOT NULL, counter INTEGER NOT NULL DEFAULT 0, device_type TEXT, backed_up INTEGER NOT NULL DEFAULT 0, transports TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL COLLATE NOCASE UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS company_foremen (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, name TEXT NOT NULL COLLATE NOCASE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(company_id,name), FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS trade_settings (name TEXT PRIMARY KEY COLLATE NOCASE, fee_rate REAL NOT NULL CHECK (fee_rate>=0 AND fee_rate<=1), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS user_pins (name TEXT PRIMARY KEY COLLATE NOCASE, pin_hash TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS user_aliases (source_name TEXT PRIMARY KEY COLLATE NOCASE, new_name TEXT NOT NULL UNIQUE COLLATE NOCASE, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS organization_settings (organization_id TEXT NOT NULL DEFAULT 'dus', section TEXT NOT NULL, setting_key TEXT NOT NULL, value_json TEXT NOT NULL, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(organization_id,section,setting_key))",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS settings_change_log (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id TEXT NOT NULL DEFAULT 'dus', section TEXT NOT NULL, setting_key TEXT NOT NULL, old_value_json TEXT, new_value_json TEXT, changed_by TEXT NOT NULL, changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS application_statuses (organization_id TEXT NOT NULL DEFAULT 'dus', status_key TEXT NOT NULL, label TEXT NOT NULL, color TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, locked INTEGER NOT NULL DEFAULT 1, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(organization_id,status_key))",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS application_form_fields (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id TEXT NOT NULL DEFAULT 'dus', field_key TEXT NOT NULL, label TEXT NOT NULL, field_type TEXT NOT NULL, options_json TEXT NOT NULL DEFAULT '[]', required INTEGER NOT NULL DEFAULT 0, visible INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 100, archived INTEGER NOT NULL DEFAULT 0, created_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(organization_id,field_key))",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS job_field_values (job_id INTEGER NOT NULL, field_id INTEGER NOT NULL, value_json TEXT, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(job_id,field_id), FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE, FOREIGN KEY(field_id) REFERENCES application_form_fields(id))",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS dashboard_widgets (organization_id TEXT NOT NULL DEFAULT 'dus', widget_key TEXT NOT NULL, label TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(organization_id,widget_key))",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS user_roles (organization_id TEXT NOT NULL DEFAULT 'dus', user_name TEXT NOT NULL COLLATE NOCASE, role_key TEXT NOT NULL, permissions_json TEXT NOT NULL DEFAULT '[]', updated_by TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(organization_id,user_name))",
    ),
    db.prepare("CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status)"),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS comments_job_idx ON comments(job_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS job_reactions_job_idx ON job_reactions(job_id,updated_at)",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_reactions_revision_insert AFTER INSERT ON job_reactions BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_reactions_revision_update AFTER UPDATE ON job_reactions BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_reactions_revision_delete AFTER DELETE ON job_reactions BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS workers_trade_available_idx ON workers(trade,available)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS job_workers_worker_idx ON job_workers(worker_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS passkeys_user_idx ON passkeys(user_name)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS company_foremen_company_idx ON company_foremen(company_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS jobs_status_start_idx ON jobs(status,start_date)",
    ),
    db.prepare("CREATE INDEX IF NOT EXISTS jobs_start_idx ON jobs(start_date)"),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS jobs_updated_idx ON jobs(updated_at)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS workers_available_name_idx ON workers(available,name)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS job_workers_job_linked_idx ON job_workers(job_id,linked_at)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS comments_job_created_idx ON comments(job_id,created_at)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS rate_changes_job_date_idx ON rate_changes(job_id,effective_date)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS address_changes_job_date_idx ON address_changes(job_id,effective_date)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS auth_attempts_ip_created_idx ON auth_attempts(ip,created_at)",
    ),
    db.prepare(
      "INSERT INTO app_settings(key,value) VALUES('data_revision','1') ON CONFLICT(key) DO NOTHING",
    ),
    db.prepare(
      "INSERT OR IGNORE INTO trade_settings(name,fee_rate) VALUES('Timmerman',0.14),('Bouwspecialist',0.14),('Betontimmerman',0.14),('Poortwachter',0.14),('Infraspecialist',0.12),('Overig',0.12)",
    ),
    db.prepare(
      "INSERT OR IGNORE INTO application_statuses(organization_id,status_key,label,color,sort_order,active,locked) VALUES('dus','Nieuw','Nieuw','#F47B35',10,1,1),('dus','In behandeling','In behandeling','#E9A23B',20,1,1),('dus','Ingevuld','Ingevuld','#125B32',30,1,1),('dus','Geannuleerd','Geannuleerd','#8A948C',40,1,1)",
    ),
    db.prepare(
      "INSERT OR IGNORE INTO dashboard_widgets(organization_id,widget_key,label,enabled,sort_order) VALUES('dus','new','Nieuwe aanvragen',1,10),('dus','busy','In behandeling',1,20),('dus','filled','Ingevuld',1,30),('dus','total','Totaal',1,40),('dus','analytics','Voortgang & statistieken',1,50)",
    ),
    db.prepare(
      "INSERT OR IGNORE INTO user_roles(organization_id,user_name,role_key,permissions_json) VALUES('dus','Swen','beheerder','[\"manage_jobs\",\"manage_planning\",\"manage_workers\",\"manage_settings\",\"manage_security\"]'),('dus','Ernst','planner','[\"manage_jobs\",\"manage_planning\",\"manage_workers\"]'),('dus','Christiaan','planner','[\"manage_jobs\",\"manage_planning\",\"manage_workers\"]')",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS jobs_revision_insert AFTER INSERT ON jobs BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS jobs_revision_update AFTER UPDATE ON jobs BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS jobs_revision_delete AFTER DELETE ON jobs BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS workers_revision_insert AFTER INSERT ON workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS workers_revision_update AFTER UPDATE ON workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS workers_revision_delete AFTER DELETE ON workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS members_revision_insert AFTER INSERT ON members BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS members_revision_update AFTER UPDATE ON members BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS members_revision_delete AFTER DELETE ON members BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_workers_revision_insert AFTER INSERT ON job_workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_workers_revision_update AFTER UPDATE ON job_workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS job_workers_revision_delete AFTER DELETE ON job_workers BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS companies_revision_insert AFTER INSERT ON companies BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS companies_revision_update AFTER UPDATE ON companies BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS companies_revision_delete AFTER DELETE ON companies BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS company_foremen_revision_insert AFTER INSERT ON company_foremen BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS company_foremen_revision_update AFTER UPDATE ON company_foremen BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
    db.prepare(
      "CREATE TRIGGER IF NOT EXISTS company_foremen_revision_delete AFTER DELETE ON company_foremen BEGIN UPDATE app_settings SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=CURRENT_TIMESTAMP WHERE key='data_revision'; END",
    ),
  ]);
  const columns = await db.prepare("PRAGMA table_info(jobs)").all();
  if (!columns.results.some((column) => column.name === "foreman"))
    await db.prepare("ALTER TABLE jobs ADD COLUMN foreman TEXT").run();
  if (!columns.results.some((column) => column.name === "planning_fee"))
    await db.prepare("ALTER TABLE jobs ADD COLUMN planning_fee REAL").run();
  if (!columns.results.some((column) => column.name === "planning_work"))
    await db.prepare("ALTER TABLE jobs ADD COLUMN planning_work TEXT").run();
  if (!columns.results.some((column) => column.name === "planning_work_source"))
    await db
      .prepare("ALTER TABLE jobs ADD COLUMN planning_work_source TEXT")
      .run();
  if (!columns.results.some((column) => column.name === "ai_planning"))
    await db
      .prepare(
        "ALTER TABLE jobs ADD COLUMN ai_planning INTEGER NOT NULL DEFAULT 1 CHECK (ai_planning IN (0,1))",
      )
      .run();
  if (!columns.results.some((column) => column.name === "end_date")) {
    await db.prepare("ALTER TABLE jobs ADD COLUMN end_date TEXT").run();
    await db
      .prepare(
        "UPDATE jobs SET end_date=CASE WHEN lower(COALESCE(duration,'')) LIKE '%week%' AND CAST(duration AS INTEGER)>0 THEN date(start_date,'+'||(CAST(duration AS INTEGER)*7-1)||' days') WHEN lower(COALESCE(duration,'')) LIKE '%dag%' AND CAST(duration AS INTEGER)>0 THEN date(start_date,'+'||(CAST(duration AS INTEGER)-1)||' days') WHEN lower(COALESCE(duration,'')) LIKE '%maand%' AND CAST(duration AS INTEGER)>0 THEN date(start_date,'+'||CAST(duration AS INTEGER)||' months','-1 day') ELSE start_date END WHERE end_date IS NULL",
      )
      .run();
  }
  if (!columns.results.some((column) => column.name === "filled_at")) {
    await db.prepare("ALTER TABLE jobs ADD COLUMN filled_at TEXT").run();
    await db
      .prepare(
        "UPDATE jobs SET filled_at=updated_at WHERE status='Ingevuld' AND filled_at IS NULL",
      )
      .run();
  }
  if (!columns.results.some((column) => column.name === "created_by"))
    await db.prepare("ALTER TABLE jobs ADD COLUMN created_by TEXT").run();
  if (!columns.results.some((column) => column.name === "planning_sort_order"))
    await db
      .prepare(
        "ALTER TABLE jobs ADD COLUMN planning_sort_order INTEGER NOT NULL DEFAULT 0",
      )
      .run();
  const workerColumns = await db.prepare("PRAGMA table_info(workers)").all();
  if (
    !workerColumns.results.some((column) => column.name === "manual_available")
  ) {
    await db
      .prepare(
        "ALTER TABLE workers ADD COLUMN manual_available INTEGER NOT NULL DEFAULT 1 CHECK (manual_available IN (0,1))",
      )
      .run();
    await db
      .prepare(
        "UPDATE workers SET manual_available=available WHERE NOT EXISTS (SELECT 1 FROM job_workers WHERE job_workers.worker_id=workers.id)",
      )
      .run();
  }
  if (!workerColumns.results.some((column) => column.name === "location"))
    await db.prepare("ALTER TABLE workers ADD COLUMN location TEXT").run();
  const locationSeeded = await db
    .prepare("SELECT value FROM app_settings WHERE key='worker_location_seed_v2'")
    .first();
  if (!locationSeeded) {
    const statements = WORKER_LOCATION_SEED.map((item) =>
      db
        .prepare(
          "UPDATE workers SET location=?,updated_at=CURRENT_TIMESTAMP WHERE COALESCE(trim(location),'')='' AND CASE WHEN replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+','') LIKE '0031%' THEN '0'||substr(replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+',''),5) WHEN replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+','') LIKE '31%' THEN '0'||substr(replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+',''),3) ELSE replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+','') END=?",
        )
        .bind(item.location, item.phone),
    );
    statements.push(
      db.prepare(
        "INSERT INTO app_settings(key,value) VALUES('worker_location_seed_v2','1') ON CONFLICT(key) DO UPDATE SET value='1',updated_at=CURRENT_TIMESTAMP",
      ),
    );
    await db.batch(statements);
  }
  const jobWorkerColumns = await db
    .prepare("PRAGMA table_info(job_workers)")
    .all();
  if (
    !jobWorkerColumns.results.some((column) => column.name === "system_planned")
  )
    await db
      .prepare(
        "ALTER TABLE job_workers ADD COLUMN system_planned INTEGER NOT NULL DEFAULT 0 CHECK (system_planned IN (0,1))",
      )
      .run();
  if (!jobWorkerColumns.results.some((column) => column.name === "hourly_rate"))
    await db
      .prepare("ALTER TABLE job_workers ADD COLUMN hourly_rate REAL")
      .run();
  if (!jobWorkerColumns.results.some((column) => column.name === "fee"))
    await db.prepare("ALTER TABLE job_workers ADD COLUMN fee REAL").run();
  if (!jobWorkerColumns.results.some((column) => column.name === "planning_location"))
    await db.prepare("ALTER TABLE job_workers ADD COLUMN planning_location TEXT").run();
  if (!jobWorkerColumns.results.some((column) => column.name === "planning_start_date"))
    await db.prepare("ALTER TABLE job_workers ADD COLUMN planning_start_date TEXT").run();
  if (!jobWorkerColumns.results.some((column) => column.name === "address_sent"))
    await db
      .prepare(
        "ALTER TABLE job_workers ADD COLUMN address_sent INTEGER NOT NULL DEFAULT 0 CHECK (address_sent IN (0,1))",
      )
      .run();
  if (!jobWorkerColumns.results.some((column) => column.name === "planning_sort_order"))
    await db
      .prepare(
        "ALTER TABLE job_workers ADD COLUMN planning_sort_order INTEGER NOT NULL DEFAULT 0",
      )
      .run();
  const addressColumns = await db.prepare("PRAGMA table_info(address_changes)").all();
  if (!addressColumns.results.some((column) => column.name === "worker_id"))
    await db.prepare("ALTER TABLE address_changes ADD COLUMN worker_id INTEGER").run();
  await db
    .prepare("DROP INDEX IF EXISTS job_workers_one_job_per_worker_idx")
    .run();
}
async function importWorkerLocations(db) {
  const seeded = await db
    .prepare("SELECT value FROM app_settings WHERE key='worker_location_seed_v2'")
    .first();
  if (seeded) return;
  const normalizedPhone =
    "replace(replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')',''),'+','')";
  const statements = WORKER_LOCATION_SEED.map((item) =>
    db
      .prepare(
        "UPDATE workers SET location=?,updated_at=CURRENT_TIMESTAMP WHERE COALESCE(trim(location),'')='' AND CASE WHEN " +
          normalizedPhone +
          " LIKE '0031%' THEN '0'||substr(" +
          normalizedPhone +
          ",5) WHEN " +
          normalizedPhone +
          " LIKE '31%' THEN '0'||substr(" +
          normalizedPhone +
          ",3) ELSE " +
          normalizedPhone +
          " END=?",
      )
      .bind(item.location, item.phone),
  );
  statements.push(
    db.prepare(
      "INSERT INTO app_settings(key,value) VALUES('worker_location_seed_v2','1') ON CONFLICT(key) DO UPDATE SET value='1',updated_at=CURRENT_TIMESTAMP",
    ),
  );
  await db.batch(statements);
}
function netherlandsDateISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
async function refreshWorkerAvailability(db, organizationId = "dus") {
  const today = netherlandsDateISO();
  await db.prepare(
    "UPDATE workers SET available=CASE WHEN manual_available=1 AND NOT EXISTS (SELECT 1 FROM job_workers jw JOIN jobs j ON j.id=jw.job_id WHERE jw.worker_id=workers.id AND j.organization_id=? AND j.status<>'Geannuleerd' AND date(COALESCE(NULLIF(j.end_date,''),j.start_date))>=date(?)) THEN 1 ELSE 0 END WHERE organization_id=?",
  )
    .bind(organizationId, today, organizationId)
    .run();
}

async function bootstrapData(db) {
  await refreshWorkerAvailability(db);
  await importWorkerLocations(db);
  const [
    jobs,
    members,
    workers,
    companies,
    foremen,
    links,
    reactions,
    trades,
    appRows,
    revision,
    managedRows,
    statusRows,
    fieldRows,
    fieldValues,
    widgetRows,
  ] = await db.batch([
    db.prepare(
      "SELECT j.* FROM jobs j WHERE j.organization_id='dus' ORDER BY CASE j.status WHEN 'Nieuw' THEN 0 WHEN 'In behandeling' THEN 1 WHEN 'Ingevuld' THEN 2 ELSE 3 END, date(j.start_date), datetime(j.created_at) DESC",
    ),
    db.prepare("SELECT * FROM members WHERE organization_id='dus' ORDER BY name"),
    db.prepare(
      "SELECT w.* FROM workers w WHERE w.organization_id='dus' ORDER BY available DESC,trade,name",
    ),
    db.prepare("SELECT * FROM companies WHERE organization_id='dus' ORDER BY name COLLATE NOCASE"),
    db.prepare("SELECT f.* FROM company_foremen f JOIN companies c ON c.id=f.company_id WHERE c.organization_id='dus' ORDER BY f.name COLLATE NOCASE"),
    db.prepare(
      "SELECT jw.job_id,jw.worker_id,jw.system_planned,jw.address_sent,jw.hourly_rate,jw.fee,jw.planning_location,jw.planning_start_date,jw.planning_sort_order,jw.linked_at,w.name FROM job_workers jw JOIN workers w ON w.id=jw.worker_id JOIN jobs j ON j.id=jw.job_id WHERE j.organization_id='dus' ORDER BY jw.job_id,jw.planning_sort_order,jw.linked_at,w.name",
    ),
    db.prepare(
      "SELECT r.job_id,r.user_name,r.reaction,r.created_at,r.updated_at FROM job_reactions r JOIN jobs j ON j.id=r.job_id WHERE j.organization_id='dus' ORDER BY r.job_id,r.updated_at,r.user_name COLLATE NOCASE",
    ),
    db.prepare(
      "SELECT name,fee_rate FROM trade_settings ORDER BY name COLLATE NOCASE",
    ),
    db.prepare(
      "SELECT key,value FROM app_settings WHERE key IN ('ui_title','ui_subtitle','ui_start_intro','default_priority','default_people','default_board_status','default_ai','planning_weeks_before','planning_weeks_after','notification_title','notification_body','whatsapp_job_template','mobile_session_minutes')",
    ),
    db.prepare(
      "SELECT value||'-'||date('now') AS value FROM app_settings WHERE key='data_revision'",
    ),
    db.prepare(
      "SELECT section,setting_key,value_json FROM organization_settings WHERE organization_id='dus' AND section IN ('branding','texts','messages','navigation','map','reactions')",
    ),
    db.prepare(
      "SELECT status_key,label,color,sort_order,active FROM application_statuses WHERE organization_id='dus' ORDER BY sort_order",
    ),
    db.prepare(
      "SELECT id,field_key,label,field_type,options_json,required,visible,sort_order FROM application_form_fields WHERE organization_id='dus' AND archived=0 ORDER BY sort_order,label",
    ),
    db.prepare("SELECT v.job_id,v.field_id,v.value_json FROM job_field_values v JOIN jobs j ON j.id=v.job_id WHERE j.organization_id='dus'"),
    db.prepare(
      "SELECT widget_key,label,enabled,sort_order FROM dashboard_widgets WHERE organization_id='dus' ORDER BY sort_order",
    ),
  ]);
  const foremenByCompany = new Map();
  for (const person of foremen.results || []) {
    const key = Number(person.company_id);
    if (!foremenByCompany.has(key)) foremenByCompany.set(key, []);
    foremenByCompany.get(key).push(person);
  }
  const companyRows = (companies.results || []).map((company) => ({
    ...company,
    foremen: foremenByCompany.get(Number(company.id)) || [],
  }));
  const linksByJob = new Map();
  for (const link of links.results || []) {
    const key = Number(link.job_id);
    if (!linksByJob.has(key)) linksByJob.set(key, []);
    linksByJob
      .get(key)
      .push({
        id: Number(link.worker_id),
        name: link.name,
        system_planned: Number(link.system_planned),
        address_sent: Number(link.address_sent),
        hourly_rate: link.hourly_rate,
        fee: link.fee,
        planning_location: link.planning_location,
        planning_start_date: link.planning_start_date,
        planning_sort_order: Number(link.planning_sort_order || 0),
        linked_at: link.linked_at,
      });
  }
  const valuesByJob = new Map();
  const reactionsByJob = new Map();
  for (const reaction of reactions.results || []) {
    const key = Number(reaction.job_id);
    if (!reactionsByJob.has(key)) reactionsByJob.set(key, []);
    reactionsByJob.get(key).push(reaction);
  }
  for (const value of fieldValues.results || []) {
    const key = Number(value.job_id);
    if (!valuesByJob.has(key)) valuesByJob.set(key, {});
    valuesByJob.get(key)[String(value.field_id)] = jsonValue(
      value.value_json,
      value.value_json,
    );
  }
  const jobRows = (jobs.results || []).map((job) => {
    const planningWorkers = linksByJob.get(Number(job.id)) || [];
    return {
      ...job,
      worker_names: planningWorkers.map((worker) => worker.name).join(", "),
      planning_workers: planningWorkers,
      reactions: reactionsByJob.get(Number(job.id)) || [],
      custom_values: valuesByJob.get(Number(job.id)) || {},
    };
  });
  const appMap = Object.fromEntries(
    (appRows.results || []).map((row) => [row.key, row.value]),
  );
  const managedConfig = { branding: {}, texts: {}, messages: {}, navigation: {}, map: {}, reactions: {} };
  for (const row of managedRows.results || []) {
    managedConfig[row.section] ??= {};
    managedConfig[row.section][row.setting_key] = jsonValue(
      row.value_json,
      row.value_json,
    );
  }
  return {
    jobs: jobRows,
    members: members.results || [],
    workers: workers.results || [],
    companies: companyRows,
    trades: trades.results || [],
    managed_config: managedConfig,
    statuses: statusRows.results || [],
    form_fields: (fieldRows.results || []).map((row) => ({
      ...row,
      options: jsonValue(row.options_json, []),
    })),
    dashboard_widgets: widgetRows.results || [],
    app_settings: {
      title: appMap.ui_title || "Aanvraagbord",
      subtitle: appMap.ui_subtitle || "Samen snel schakelen",
      start_intro:
        appMap.ui_start_intro ||
        "Klaar om snel te schakelen? Bekijk de lopende aanvragen of zet direct een nieuwe klus uit voor het team.",
      default_priority: appMap.default_priority || "Normaal",
      default_people: Number(appMap.default_people || 1),
      default_board_status: appMap.default_board_status ?? "Nieuw",
      default_ai: Number(appMap.default_ai || 0),
      planning_weeks_before: Number(appMap.planning_weeks_before || 0),
      planning_weeks_after: Number(appMap.planning_weeks_after || 12),
      notification_title: appMap.notification_title || "Nieuwe DUS-aanvraag",
      notification_body:
        appMap.notification_body ||
        "Er is een nieuwe klus geplaatst. Tik om de aanvraag te bekijken.",
      whatsapp_job_template:
        appMap.whatsapp_job_template || DEFAULT_WHATSAPP_TEMPLATE,
      mobile_session_minutes: Number(appMap.mobile_session_minutes || 30),
    },
    sync_token: String(revision.results?.[0]?.value || "1"),
  };
}
class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
const body = async (request) => {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > 65536) throw new RequestError("De invoer is te groot.", 413);
  const text = await request.text();
  if (text.length > 65536)
    throw new RequestError("De invoer is te groot.", 413);
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    if (!value || Array.isArray(value) || typeof value !== "object")
      throw new Error();
    return value;
  } catch {
    throw new RequestError("De invoer heeft geen geldig formaat.", 400);
  }
};
const validTrade = (value) => {
  const text = String(value || "").trim();
  return text.length >= 2 &&
    text.length <= 50 &&
    /^[\p{L}0-9 .&'-]+$/u.test(text)
    ? text
    : null;
};
const normalizedTrades = (data) => [
  ...new Set(
    (Array.isArray(data.trades)
      ? data.trades
      : String(data.trade || "").split(",")
    )
      .map(validTrade)
      .filter(Boolean),
  ),
];
const configuredUsers = (env) => {
  try {
    const users = JSON.parse(env.USERS_JSON || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};
async function applicationUsers(env, db) {
  const aliasRows = await db.prepare("SELECT source_name,new_name FROM user_aliases").all(),
    aliases = new Map((aliasRows.results || []).map((row) => [String(row.source_name || "").toLowerCase(), row.new_name]));
  const users = configuredUsers(env).map((user) => ({ ...user, source_name:user.name, name:aliases.get(String(user.name || "").toLowerCase()) || user.name }));
  const known = new Set(users.map((user) => String(user.name || "").toLowerCase()));
  const stored = await db.prepare("SELECT name FROM user_pins ORDER BY name COLLATE NOCASE").all();
  for (const row of stored.results || []) {
    const key = String(row.name || "").toLowerCase();
    if (key && !known.has(key)) {
      users.push({ name: row.name, database_user: true });
      known.add(key);
    }
  }
  return users;
}
const knownUser = async (name, env, db) =>
  (await applicationUsers(env, db)).some(
    (user) => String(user.name || "") === String(name || ""),
  );
async function sameSecret(left, right) {
  const [a, b] = await Promise.all(
    [left, right].map((value) =>
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))),
    ),
  );
  const aa = new Uint8Array(a),
    bb = new Uint8Array(b);
  let difference = aa.length ^ bb.length;
  for (let index = 0; index < Math.max(aa.length, bb.length); index++)
    difference |= (aa[index % aa.length] || 0) ^ (bb[index % bb.length] || 0);
  return difference === 0;
}
const secretHash = async (value) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(String(value)),
      ),
    ),
  ]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
const loginFingerprint = async (request, env, scope) =>
  secretHash(
    scope + ":" +
      (request.headers.get("cf-connecting-ip") || "onbekend") + ":" +
      String(env.SESSION_SECRET || ""),
  );
async function loginAttemptCount(db, fingerprint) {
  await db.prepare(
    "DELETE FROM auth_attempts WHERE datetime(created_at) < datetime('now','-15 minutes')",
  ).run();
  const row = await db.prepare(
    "SELECT COUNT(*) AS count FROM auth_attempts WHERE ip=?",
  ).bind(fingerprint).first();
  return Number(row?.count || 0);
}
const recordLoginFailure = (db, fingerprint) =>
  db.prepare("INSERT INTO auth_attempts (ip) VALUES (?)").bind(fingerprint).run();
const clearLoginFailures = (db, fingerprint) =>
  db.prepare("DELETE FROM auth_attempts WHERE ip=?").bind(fingerprint).run();
async function userForPin(pin, env, db) {
  let match = null;
  const custom = await db.prepare("SELECT name,pin_hash FROM user_pins").all(),
    customByName = new Map(
      (custom.results || []).map((row) => [
        String(row.name).toLowerCase(),
        row.pin_hash,
      ]),
    ),
    candidateHash = await secretHash(pin);
  for (const user of await applicationUsers(env, db)) {
    const override = customByName.get(String(user.name || "").toLowerCase());
    if (
      override
        ? await sameSecret(candidateHash, override)
        : await sameSecret(pin, user.pin)
    )
      match = user;
  }
  return match;
}
const b64url = (value) => {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
const b64plain = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
};
const b64text = (value) =>
  new TextDecoder().decode(
    Uint8Array.from(atob(b64plain(value)), (c) => c.charCodeAt(0)),
  );
async function settingsKey(env) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(env.SESSION_SECRET)),
  );
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}
async function encryptSetting(value, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12)),
    key = await settingsKey(env),
    cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(value),
    );
  return b64url(iv) + "." + b64url(cipher);
}
async function decryptSetting(value, env) {
  const [iv, cipher] = String(value || "").split(".");
  if (!iv || !cipher) return null;
  const key = await settingsKey(env),
    plain = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: Uint8Array.from(atob(b64plain(iv)), (c) => c.charCodeAt(0)),
      },
      key,
      Uint8Array.from(atob(b64plain(cipher)), (c) => c.charCodeAt(0)),
    );
  return new TextDecoder().decode(plain);
}
async function openAIKey(env) {
  const row = await env.DB.prepare(
    "SELECT value FROM app_settings WHERE key='openai_api_key'",
  ).first();
  return row?.value ? decryptSetting(row.value, env) : null;
}
async function databaseFeeRate(db, trade) {
  const row = await db
    .prepare("SELECT fee_rate FROM trade_settings WHERE name=? COLLATE NOCASE")
    .bind(String(trade || ""))
    .first();
  return Number(row?.fee_rate ?? 0.12);
}
function responseText(data) {
  if (data?.output_text) return String(data.output_text).trim();
  for (const item of data?.output || [])
    for (const content of item?.content || [])
      if (content?.type === "output_text" && content.text)
        return String(content.text).trim();
  return "";
}
function privacySafeAIText(value) {
  return String(value || "")
    .slice(0, 2000)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-mailadres verwijderd]")
    .replace(/(?:\+31|0031|0)[\s().-]*6(?:[\s().-]*\d){8}/g, "[telefoonnummer verwijderd]")
    .replace(/\b\d{9}\b/g, "[persoonsnummer verwijderd]")
    .trim();
}
async function createPlanningWork(env, job, apiKey = null) {
  const key = apiKey || (await openAIKey(env));
  if (!key) throw new Error("AI is nog niet geactiveerd.");
  const ai = await organizationSection(env.DB, "ai");
  if (ai.enabled === false) throw new Error("AI is uitgeschakeld in het beheerportaal.");
  const model = /^gpt-[a-zA-Z0-9._-]+$/.test(String(ai.model || ""))
      ? String(ai.model)
      : "gpt-5.6",
    effort = ["low", "medium", "high"].includes(String(ai.reasoning_effort))
      ? String(ai.reasoning_effort)
      : "low",
    instructions = String(ai.instructions || MANAGED_DEFAULTS.ai.instructions)
      .trim()
      .slice(0, 5000);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + key,
    },
    body: JSON.stringify({
      model,
      reasoning: { effort },
      instructions,
      input:
        "Korte werkzaamheden: " +
        privacySafeAIText(job.work) +
        "\nVakgroep: " +
        String(job.trade || "").slice(0, 100),
      max_output_tokens: 500,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data?.error?.message || "OpenAI kon de tekst niet maken.");
  const text = responseText(data);
  if (!text) throw new Error("OpenAI gaf geen planningstekst terug.");
  return text;
}
async function regeneratePlanningWork(env, id, source) {
  try {
    const job = await env.DB.prepare(
      "SELECT id,client,location,trade,work,ai_planning,planning_work_source FROM jobs WHERE id=?",
    )
      .bind(id)
      .first();
    if (!job || Number(job.ai_planning) === 0 || job.work !== source) return;
    const text = await createPlanningWork(env, job);
    await env.DB.prepare(
      "UPDATE jobs SET planning_work=?,planning_work_source=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND work=? AND ai_planning=1",
    )
      .bind(text, source, id, source)
      .run();
  } catch (error) {
    console.error("planning-ai", id, String(error?.message || error));
  }
}
async function regenerateMissingPlanningWork(env) {
  const rows = await env.DB.prepare(
    "SELECT id,work FROM jobs WHERE ai_planning=1 AND (planning_work IS NULL OR planning_work_source IS NULL OR planning_work_source<>work) ORDER BY id DESC LIMIT 50",
  ).all();
  for (const job of rows.results || [])
    await regeneratePlanningWork(env, job.id, job.work);
}
async function signToken(data, env) {
  const payload = b64url(JSON.stringify(data));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(env.SESSION_SECRET)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return payload + "." + b64url(signature);
}
const cookieValue = (request, name) => {
  const prefix = name + "=";
  const cookie = (request.headers.get("cookie") || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : null;
};
async function verifySignedToken(token, env) {
  try {
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(String(env.SESSION_SECRET)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
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

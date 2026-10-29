/* DiagnosTechnology clinical workspace — hash-routed prototype, no build step */
(function () {
  const D = window.DT;
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("#view");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const patient = (id) => D.patients.find((p) => p.id === id);
  const allInd = D.platforms.flatMap((p) => p.indications.map(([name, status, input]) => ({ name, status, input, platform: p })));
  const count = (s) => allInd.filter((i) => i.status === s).length;
  const fmt = (n) => n.toLocaleString("en-US");

  const icons = {
    overview: '<path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>',
    atlas: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    new: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    reports: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    patients: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3 2.4 3.5 5.2"/>',
    hospital: '<path d="M4 21V5h10v16M14 9h6v12M8 9h2M8 13h2M8 17h2M9 2v4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]}</svg>`;
  const awaiting = D.cases.filter((c) => c.state === "awaiting").length;
  const NAV = [
    ["overview", "Overview"], ["atlas", "Indication map"], ["new", "New analysis"], ["reports", "Reports", awaiting],
    ["patients", "Patients"], ["hospital", "Hospital"], ["settings", "Settings"],
  ];
  $("#nav").innerHTML = NAV.map(([k, label, n]) => `<a href="#/${k}" data-k="${k}">${svg(k)}<span>${label}</span>${n ? `<span class="count" aria-label="${n} awaiting review">${n}</span>` : ""}</a>`).join("");

  // ---------- theme ----------
  const themeBtn = $("#themeBtn");
  function applyTheme(choice) {
    try { localStorage.setItem("dt-theme", choice); } catch (e) {}
    const t = choice === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : choice;
    document.documentElement.setAttribute("data-theme", t);
    themeBtn.innerHTML = svg(t === "dark" ? "sun" : "moon");
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  const savedTheme = () => { try { return localStorage.getItem("dt-theme") || "system"; } catch (e) { return "system"; } };
  const urlTheme = (location.search.match(/[?&]theme=(light|dark)/) || [])[1];
  if (urlTheme) { document.documentElement.setAttribute("data-theme", urlTheme); themeBtn.innerHTML = svg(urlTheme === "dark" ? "sun" : "moon"); } else applyTheme(savedTheme());
  themeBtn.addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (savedTheme() === "system") applyTheme("system"); });

  // ---------- mobile menu ----------
  const sidebar = $("#sidebar"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", () => { const o = sidebar.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); });

  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2400); };

  // ---------- shared pieces ----------
  const statePill = (s) => `<span class="pill ${s}">${{ awaiting: "Awaiting review", processing: "Analysing", signed: "Signed off" }[s]}</span>`;
  const flagText = (f) => (f ? `<span class="flag ${f}">${{ high: "High risk", moderate: "Moderate risk", low: "Low risk" }[f]}</span>` : '<span class="muted">—</span>');
  const casesTable = (rows, compact) => `<table><thead><tr><th>Case</th><th>Patient</th><th>Indication</th>${compact ? "" : '<th class="hide-sm">Input</th>'}<th>AI flag</th><th>Status</th></tr></thead><tbody>${rows.map((c) => {
    const p = patient(c.patient);
    return `<tr data-href="#/report/${c.id}" tabindex="0"><td><b>${c.id}</b><br><span class="muted small">${c.created}</span></td><td>${esc(p.name)}${compact ? "" : `<br><span class="muted small">${p.id} · ${p.age}${p.sex}</span>`}</td><td>${esc(c.indication)}</td>${compact ? "" : `<td class="hide-sm">${esc(c.input)}</td>`}<td>${flagText(c.flag)}</td><td>${statePill(c.state)}</td></tr>`;
  }).join("")}</tbody></table>`;
  const miniMap = () => `<div class="mini">${D.platforms.map((p) => `<div class="mini-row" style="--hue:var(--${p.hue})"><b>${p.name}</b><span class="dots">${p.indications.map(([n, s]) => `<i class="${s}" title="${esc(n)} · ${D.statusText[s]}"></i>`).join("")}</span><span class="muted">${p.indications.length}</span></div>`).join("")}</div>`;
  const legend = `<div class="legend"><span><i class="live"></i>Available now (${count("live")})</span><span><i class="dev"></i>In development (${count("dev")})</span><span><i></i>Planned (${count("planned")})</span><span class="muted">Dashed cell: MVP module outside the 50</span></div>`;

  // ---------- views ----------
  const views = {
    overview() {
      const today = D.cases.filter((c) => c.created.startsWith("Today")).length;
      return `<h1>Good morning, Dr. Karimi</h1>
      <p class="lede">${awaiting} AI reports are waiting for your review. Reports stay provisional until a physician signs them off.</p>
      <div class="stats"><div class="stat"><b>${today}</b><span>Analyses started today</span></div><div class="stat"><b>${awaiting}</b><span>Awaiting your review</span></div><div class="stat"><b>${fmt(D.months.at(-1)[1])}</b><span>Patient registrations in October</span></div><div class="stat"><b>${count("live") + D.extensions.length} of 51</b><span>Modules available now</span></div></div>
      <div class="grid-2">
        <section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><h2>Recent cases</h2><a href="#/reports" class="small">All reports</a></div>${casesTable(D.cases.slice(0, 4), true)}</section>
        <section class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><h2>50 indications, 8 platforms</h2><a href="#/atlas" class="small">Open map</a></div>${legend}${miniMap()}</section>
      </div>`;
    },
    atlas(param) {
      const f = param || "all";
      const chip = (k, l) => `<button class="chip" data-filter="${k}" aria-pressed="${f === k}">${l}</button>`;
      const show = (s) => f === "all" || f === s;
      return `<h1>Indication map</h1><p class="lede">One shared AI core hosts eight disease platforms and 50 indications. Select an indication to see the data it needs and where it is in development.</p>
      <div class="filters" role="group" aria-label="Filter by status">${chip("all", "All 50")}${chip("live", "Available now")}${chip("dev", "In development")}${chip("planned", "Planned")}</div>${legend}
      <div class="map">${D.platforms.map((p) => `<div class="map-row" style="--hue:var(--${p.hue})"><div class="map-head"><b>${p.name}</b><span>${p.indications.length} indications · ${p.inputs}</span></div><div class="cells">${p.indications.filter(([, s]) => show(s)).map(([n, s]) => `<button class="cell" data-status="${s}" data-name="${esc(n)}" aria-pressed="false"><span>${esc(n)}</span><span class="mark" aria-label="${D.statusText[s]}"></span></button>`).join("")}${p.id === "cancer" && show("live") ? D.extensions.map((e) => `<button class="cell ext" data-status="live" data-name="${esc(e.name)}" aria-pressed="false"><span>${esc(e.name)}</span><span class="mark" aria-label="Available"></span></button>`).join("") : ""}</div></div>`).join("")}</div>`;
    },
    new(param) {
      const step = Math.min(Math.max(parseInt(param || "1", 10), 1), 4);
      const S = ["Patient", "Indication", "Patient data", "Register and submit"];
      const head = `<ol class="steps">${S.map((s, i) => `<li class="${i + 1 < step ? "done" : i + 1 === step ? "now" : ""}"><b>${i + 1 < step ? "✓" : i + 1}</b>${s}</li>`).join("")}</ol>`;
      const nav = (back, next, label) => `<div class="actions">${back ? `<a class="btn ghost" href="#/new/${step - 1}">Back</a>` : ""}<a class="btn" href="${next}">${label}</a></div>`;
      let body = "";
      if (step === 1) body = `<div class="form"><div class="field"><label for="pt">Patient</label><select id="pt">${D.patients.map((p) => `<option>${p.id} — ${esc(p.name)}, ${p.age}${p.sex}</option>`).join("")}</select><p class="hint">Patients come from the hospital information system. Missing someone? Ask reception to register them first.</p></div><div class="field"><label for="ref">Referring physician</label><input id="ref" value="Dr. Nasrin Karimi"></div>${nav(false, "#/new/2", "Continue")}</div>`;
      if (step === 2) body = `<div class="form"><p class="muted" style="margin:0">Only available modules can be used today. Others show when they are released.</p>${D.platforms.map((p) => `<fieldset style="border:0;padding:0;margin:0"><legend><h3>${p.name}</h3></legend><div class="choice">${p.indications.map(([n, s], i) => `<label class="${s === "live" ? "" : "off"}"><input type="radio" name="ind" ${s === "live" ? "" : "disabled"} ${p.id === "cardio" && s === "live" ? "checked" : ""}><span>${esc(n)}<br><span class="muted small">${D.statusText[s]}</span></span></label>`).join("")}${p.id === "cancer" ? D.extensions.map((e) => `<label><input type="radio" name="ind"><span>${esc(e.name)}<br><span class="muted small">Available</span></span></label>`).join("") : ""}</div></fieldset>`).join("")}${nav(true, "#/new/3", "Continue")}</div>`;
      if (step === 3) body = `<div class="form"><div class="dropzone"><p><b>Drop the 12-lead ECG file here</b> or <a href="#/new/3" id="pick">choose a file</a></p><p class="small">Accepted: DICOM-ECG, SCP-ECG, HL7 aECG, PDF export. Data stays on the hospital server.</p></div><div class="field"><label for="ctx">Clinical context (optional)</label><input id="ctx" placeholder="For example: palpitations for 3 weeks, on beta-blocker"></div>${nav(true, "#/new/4", "Continue")}</div>`;
      if (step === 4) body = `<div class="form"><div class="panel"><h3>Summary</h3><dl style="display:grid;grid-template-columns:150px 1fr;gap:6px 12px;margin:10px 0 0;font-size:14px"><dt class="muted">Patient</dt><dd style="margin:0">P-24082 — Hossein Ahmadi, 58M</dd><dt class="muted">Indication</dt><dd style="margin:0">Atrial fibrillation (Cardio AI)</dd><dt class="muted">Input</dt><dd style="margin:0">12-lead ECG, 1 file</dd></dl>
        <div class="fee" style="margin-top:14px"><span>Patient registration fee</span><b>${fmt(D.fee)} toman</b></div><p class="small muted" style="margin:0">Collected by the hospital at registration. The hospital keeps ${D.hospitalShare * 100}%.</p></div>
        <div class="actions"><a class="btn ghost" href="#/new/3">Back</a><button class="btn" id="submitCase">Register and submit</button></div></div>`;
      return `<h1>New analysis</h1><p class="lede">Register a patient for an AI-assisted analysis. The report goes to the referring physician for review.</p>${head}${body}`;
    },
    reports() {
      return `<h1>Reports</h1><p class="lede">AI outputs are decision support. Open a report to review the evidence and sign it off.</p><section class="panel">${casesTable(D.cases)}</section>`;
    },
    report(id) {
      const c = D.cases.find((x) => x.id === id) || D.cases[0];
      const p = patient(c.patient);
      const ecg = (() => { // synthetic irregular rhythm trace
        let d = "M0 60", x = 0; const beats = [38, 61, 44, 72, 35, 58, 49, 66, 41, 55, 63];
        beats.forEach((gap) => { x += gap; d += ` L${x - 8} 60 L${x - 5} 56 L${x - 2} 64 L${x} 18 L${x + 3} 82 L${x + 6} 60 L${x + 16} 60 Q${x + 22} 50 ${x + 28} 60`; x += 28; });
        return `<svg class="ecg" viewBox="0 0 860 120" role="img" aria-label="Synthetic ECG lead II with irregular R-R intervals highlighted"><rect class="attn" x="250" y="8" width="300" height="104" rx="6"/><path class="trace" d="${d}" fill="none" stroke-width="1.6"/></svg>`;
      })();
      const isECG = /fibrillation/i.test(c.indication);
      return `<p class="small"><a href="#/reports">Reports</a> / ${c.id}</p>
      <div class="report-head"><div><h1>${esc(c.indication)} — AI report</h1><p class="lede" style="margin:0">${esc(p.name)}, ${p.age}${p.sex} · ${p.id} · ${esc(c.input)} · ${c.created}</p></div>${statePill(c.state)}</div>
      <div class="grid-2"><div class="stack">
        <section class="panel"><h2>What the model saw</h2>${isECG ? ecg + '<p class="small muted">Highlighted: segment with the most irregular R-R intervals and no clear P waves. Synthetic trace for interface review.</p>' : '<div class="dropzone" style="padding:60px">Image viewer with saliency overlay (Grad-CAM)</div>'}</section>
        <section class="panel"><h2>Findings</h2>
          <div class="finding"><span>Irregularly irregular R-R intervals</span><b>Present</b><span class="muted small">Across 7 of 10 seconds of lead II</span><span></span></div>
          <div class="finding"><span>Discernible P waves</span><b>Not detected</b><span class="muted small">Fibrillatory baseline in V1</span><span></span></div>
          <div class="finding"><span>Ventricular rate</span><b>112 bpm</b><span class="muted small">Calculated from the recording</span><span></span></div>
          <p class="small muted" style="margin:12px 0 0">Demo values. Model performance figures will be published only after the validation studies.</p></section>
      </div><div class="stack">
        <section class="panel"><h2>Risk band</h2><div class="risk"><div class="${c.flag === "low" ? "on" : ""}">Low</div><div class="${c.flag === "moderate" ? "on" : ""}">Moderate</div><div class="${c.flag === "high" ? "on" : ""}">High</div></div><p class="small muted" style="margin:6px 0 0">Model ${isECG ? "Cardio-AF" : "Neuro-AD"} v0.9 · research build · not for diagnosis on its own</p></section>
        <section class="signoff"><h2>Physician review</h2><p class="small" style="margin:0">Confirm, amend or reject the AI output. Your decision is recorded with the report.</p>
          <label class="sr-only" for="note">Review note</label><textarea id="note" placeholder="Your interpretation and next steps"></textarea>
          <div class="actions"><button class="btn" data-sign="Report signed off">Sign off report</button><button class="btn ghost" data-sign="Report returned for re-analysis">Return for re-analysis</button></div></section>
      </div></div>`;
    },
    patients() {
      return `<h1>Patients</h1><p class="lede">Patients registered for AI-assisted analysis at this hospital.</p><section class="panel"><table><thead><tr><th>ID</th><th>Name</th><th>Age / sex</th><th class="hide-sm">Clinic</th><th class="hide-sm">Physician</th><th>Cases</th></tr></thead><tbody>${D.patients.map((p) => `<tr><td><b>${p.id}</b></td><td>${esc(p.name)}</td><td>${p.age} ${p.sex}</td><td class="hide-sm">${esc(p.ward)}</td><td class="hide-sm">${esc(p.physician)}</td><td>${D.cases.filter((c) => c.patient === p.id).length}</td></tr>`).join("")}</tbody></table></section>`;
    },
    hospital() {
      const max = Math.max(...D.months.map((m) => m[1]));
      const last = D.months.at(-1)[1], gross = last * D.fee, share = gross * D.hospitalShare;
      return `<h1>Hospital</h1><p class="lede">Registrations and fee settlement for this hospital. Figures are synthetic.</p>
      <div class="grid-2"><section class="panel"><h2>Patient registrations per month</h2><div class="bars">${D.months.map(([m, v]) => `<div><b>${v}</b><span style="height:${(v / max) * 150}px"></span>${m}</div>`).join("")}</div></section>
      <section class="panel"><h2>October settlement</h2><div class="fee"><span>Registrations</span><b>${fmt(last)}</b></div><div class="fee"><span>Fees collected (${fmt(D.fee)} toman each)</span><b>${fmt(gross)} toman</b></div>
        <div class="split" role="img" aria-label="Hospital share 20 percent, DiagnosTechnology share 80 percent"><i style="width:${D.hospitalShare * 100}%"></i><i style="width:${100 - D.hospitalShare * 100}%"></i></div>
        <div class="fee"><span>Hospital share (${D.hospitalShare * 100}%)</span><b>${fmt(share)} toman</b></div><div class="fee"><span>Transferred to DiagnosTechnology</span><b>${fmt(gross - share)} toman</b></div><p class="small muted" style="margin:0">Settled monthly from the registration log.</p></section></div>`;
    },
    settings() {
      const t = savedTheme();
      const opt = (v, l) => `<label><input type="radio" name="theme" value="${v}" ${t === v ? "checked" : ""}>${l}</label>`;
      return `<h1>Settings</h1><p class="lede">Display preferences for this browser.</p><section class="panel"><h2>Theme</h2><div class="theme-opts" role="radiogroup" aria-label="Theme">${opt("light", "Light")}${opt("dark", "Dark")}${opt("system", "Match system")}</div><p class="small muted">Dark theme suits reading rooms and night shifts.</p></section>`;
    },
  };

  // ---------- drawer (indication detail) ----------
  const drawer = $("#drawer");
  function openDrawer(name) {
    const ind = allInd.find((i) => i.name === name) || (() => { const e = D.extensions.find((x) => x.name === name); return { name: e.name, status: e.status, input: e.input, platform: D.platforms.find((p) => p.id === e.platform), ext: true }; })();
    const stages = ["Clinical problem defined", "Data agreements", "Model development", "Validation study", "Available to hospitals"];
    const at = { live: stages.length, dev: 2, planned: 0 }[ind.status];
    drawer.style.setProperty("--hue", `var(--${ind.platform.hue})`);
    drawer.innerHTML = `<button class="icon-btn close" id="closeDrawer" aria-label="Close details">${svg("close")}</button>
      <p class="small" style="margin:0;color:var(--hue);font-weight:700">${ind.platform.name}</p><h2 style="margin-top:4px">${esc(ind.name)}</h2>
      <dl><dt>Status</dt><dd>${D.statusText[ind.status]}${ind.ext ? " (MVP module outside the 50)" : ""}</dd><dt>Patient data</dt><dd>${esc(ind.input)}</dd><dt>Output</dt><dd>Risk band, findings and visual explanation for physician review</dd></dl>
      <h3>Development stage</h3><ol class="stage">${stages.map((s, i) => `<li class="${i < at ? "done" : i === at ? "now" : ""}">${s}</li>`).join("")}</ol>
      ${ind.status === "live" ? '<p style="margin-top:20px"><a class="btn" href="#/new/1">Start an analysis</a></p>' : '<p class="small muted" style="margin-top:20px">Release dates depend on data access and validation results.</p>'}`;
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    $("#closeDrawer").focus();
  }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); document.querySelectorAll(".cell[aria-pressed=true]").forEach((c) => c.setAttribute("aria-pressed", "false")); }

  // ---------- router ----------
  function render() {
    const [, route = "overview", param] = (location.hash || "#/overview").split("/");
    const key = views[route] ? route : "overview";
    view.innerHTML = views[key](param);
    const current = key === "report" ? "reports" : key;
    document.querySelectorAll("#nav a").forEach((a) => (a.dataset.k === current ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    document.title = `${(NAV.find((n) => n[0] === key) || ["", key === "report" ? "Report" : "Overview"])[1]} — DiagnosTechnology`;
    sidebar.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); closeDrawer();
    view.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);

  view.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell"); if (cell) { closeDrawer(); cell.setAttribute("aria-pressed", "true"); openDrawer(cell.dataset.name); return; }
    const chip = e.target.closest("[data-filter]"); if (chip) { location.hash = `#/atlas/${chip.dataset.filter}`; return; }
    const tr = e.target.closest("tr[data-href]"); if (tr) { location.hash = tr.dataset.href; return; }
    const sign = e.target.closest("[data-sign]"); if (sign) { toast(sign.dataset.sign); return; }
    if (e.target.id === "submitCase") { toast("Case C-1044 registered and submitted"); setTimeout(() => (location.hash = "#/reports"), 900); }
    if (e.target.id === "pick") { e.preventDefault(); toast("File picker is not connected in the prototype"); }
  });
  view.addEventListener("keydown", (e) => { const tr = e.target.closest("tr[data-href]"); if (tr && e.key === "Enter") location.hash = tr.dataset.href; });
  view.addEventListener("change", (e) => { if (e.target.name === "theme") applyTheme(e.target.value); });
  drawer.addEventListener("click", (e) => { if (e.target.closest("#closeDrawer")) closeDrawer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  $("#search").addEventListener("keydown", (e) => { if (e.key === "Enter") { toast("Search is not connected in the prototype"); } });

  render();
})();

(() => {
  const STAGES = [
    ["screen_gold", "Screen Gold"],
    ["ending_options", "Ending Options"],
    ["theme_test", "Theme Test"],
    ["theme_law", "Theme Law"],
    ["photoplay_cast", "Photoplay Cast"],
    ["scene_board", "Scene Location Board"],
    ["brief_synopsis", "Brief Synopsis"],
    ["pictorial", "Pictorial Element"],
    ["continuity", "Continuity Summary"],
    ["ready_for_treatment", "Ready for Treatment"]
  ];

  const STEP_NUMBERS = {
    screen_gold: "Step 6",
    ending_options: "Step 6",
    theme_test: "Step 7",
    theme_law: "Step 8",
    photoplay_cast: "Step 9",
    scene_board: "Step 10",
    brief_synopsis: "Step 11",
    pictorial: "Step 12",
    continuity: "Step 12",
    ready_for_treatment: "Step 12 Approved"
  };

  const state = {
    property: null,
    packet: null,
    readerPacket: null,
    scenes: [],
    selectedArrangement: "",
    saving: false,
    autosaveTimer: null,
    archiveStage: ""
  };

  const query = new URLSearchParams(window.location.search);
  const propertyId = query.get("property") || "";
  const archiveMode = query.get("mode") === "archive";
  const reportSection = document.querySelector("#reader-v2-report");
  const reportContent = document.querySelector("#reader-v2-content");
  const pendingSection = document.querySelector("#reader-v2-pending");
  const readerStatus = document.querySelector("#reader-v2-status");
  const workspace = document.querySelector("#writers-v4-workspace");
  const active = document.querySelector("#writers-v4-active");
  const errorNode = document.querySelector("#writers-v4-error");
  const archiveBanner = document.querySelector("#writers-v4-archive-banner");
  const archiveTiles = document.querySelector("#development-archive-tiles");
  const archiveEmpty = document.querySelector("#development-archive-empty");

  function html(value) {
    return typeof escapeHtml === "function"
      ? escapeHtml(value)
      : String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
  }

  function normalizedScore(value) {
    if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10) return value;
    const match = String(value ?? "").trim().match(/^(\d{1,2})(?:\s*\/\s*10)?$/);
    const score = match ? Number(match[1]) : 0;
    return Number.isInteger(score) && score >= 1 && score <= 10 ? score : null;
  }

  function mutationId() {
    return window.crypto?.randomUUID?.() || `development-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function jsonp(action, params = {}, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
      const callbackName = `scenarioV4_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error(`${action} timed out.`));
      }, timeoutMs);
      const cleanup = () => {
        window.clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      };
      window[callbackName] = (payload) => {
        cleanup();
        resolve(payload);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error(`${action} request failed.`));
      };
      const query = new URLSearchParams({ action, ...params, callback: callbackName });
      script.src = `${scenarioBackendUrl}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  async function postDevelopment(command, payload = {}) {
    const id = mutationId();
    await fetch(scenarioBackendUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "runDevelopment",
        propertyId,
        command,
        payload: { ...payload, mutationId: id }
      })
    });
    const started = Date.now();
    while (Date.now() - started < 180000) {
      const receipt = await jsonp("developmentMutationStatus", { propertyId, mutationId: id }, 30000);
      if (receipt?.status === "error" || receipt?.ok === false) throw new Error(receipt?.error || "The development filing failed.");
      if (receipt?.status === "filed" && receipt.packet) return receipt.packet;
      await new Promise((resolve) => window.setTimeout(resolve, 2500));
    }
    throw new Error("The development filing did not return before the office clock expired.");
  }

  function setBusy(message) {
    state.saving = true;
    if (errorNode) errorNode.hidden = true;
    if (active) active.classList.add("is-filing");
    document.querySelectorAll("#writers-v4-workspace button").forEach((button) => { button.disabled = true; });
    const status = document.querySelector("#writers-v4-status");
    if (status) status.textContent = message;
  }

  function clearBusy() {
    state.saving = false;
    if (active) active.classList.remove("is-filing");
    document.querySelectorAll("#writers-v4-workspace button").forEach((button) => { button.disabled = false; });
  }

  function showError(error) {
    clearBusy();
    if (!errorNode) return;
    errorNode.hidden = false;
    errorNode.textContent = error?.message || String(error || "The development office could not file this action.");
  }

  async function mutate(command, payload, message) {
    setBusy(message || "Filing the development decision...");
    try {
      state.packet = await postDevelopment(command, payload);
      renderWorkspace();
      clearBusy();
      return state.packet;
    } catch (error) {
      showError(error);
      throw error;
    }
  }

  function scheduleAutosave(command, payloadFactory) {
    window.clearTimeout(state.autosaveTimer);
    state.autosaveTimer = window.setTimeout(async () => {
      const status = document.querySelector("#writers-v4-status");
      try {
        if (status) status.textContent = "Saving draft...";
        state.packet = await postDevelopment(command, payloadFactory());
        if (status) status.textContent = "Draft saved.";
      } catch (error) {
        if (status) status.textContent = "Draft save failed.";
        showError(error);
      }
    }, 1200);
  }

  function renderReaderReport(report) {
    if (!reportContent || !report) return;
    const identification = report.propertyIdentification || {};
    const summary = report.sourceStorySummary || {};
    const readerProfile = state.readerPacket?.readerProfile || state.property?.readerProfile || null;
    const readerName = report.reader || state.property?.reader || "Scenario Reader";
    const score = normalizedScore(state.property?.suitabilityScore ?? report.suitabilityScore);
    const needsRescore = state.readerPacket?.scoreStatus === "needs_rescore" || score === null;
    reportContent.innerHTML = `
      <article class="reader-identity-card">
        <p class="eyebrow">Assigned Scenario Reader</p>
        <h3>${html(readerName)}</h3>
        ${readerProfile?.specialty ? `<strong>${html(readerProfile.specialty)}</strong>` : ""}
        ${readerProfile?.biography ? `<p>${html(readerProfile.biography)}</p>` : ""}
        ${readerProfile?.voice ? `<p class="reader-identity-card__voice">${html(readerProfile.voice)}</p>` : ""}
        ${state.readerPacket?.assignmentRationale ? `<p class="reader-identity-card__assignment">${html(state.readerPacket.assignmentRationale)}</p>` : ""}
      </article>
      <article class="reader-score-card ${score >= 7 ? "is-greenlight-eligible" : ""}">
        <p class="eyebrow">Photoplay Suitability</p>
        <strong>${score === null ? "Needs Rescore" : `${score}/10`}</strong>
        ${score >= 7 ? `<span class="reader-score-badge">Greenlight Eligible</span>` : ""}
        ${needsRescore ? `<button type="button" id="rescore-reader-v2">Rescore Property</button>` : ""}
      </article>
      <article>
        <p class="eyebrow">Step 1 - Property Identification</p>
        <dl>
          <dt>Title</dt><dd>${html(identification.title)}</dd>
          <dt>Author</dt><dd>${html(identification.author)}</dd>
          <dt>Original Form</dt><dd>${html(identification.originalForm)}</dd>
          <dt>Period and Setting</dt><dd>${html(identification.periodAndSetting)}</dd>
          <dt>Apparent Genre</dt><dd>${html(identification.apparentGenre)}</dd>
          <dt>Rights Status</dt><dd>${html(identification.rightsStatus)}</dd>
        </dl>
      </article>
      <article>
        <p class="eyebrow">Step 2 - Source-Story Summary</p>
        <p>${html(summary.summary)}</p>
        <dl>
          <dt>Central Character</dt><dd>${html(summary.centralCharacter)}</dd>
          <dt>Desire</dt><dd>${html(summary.desire)}</dd>
          <dt>Obstacle</dt><dd>${html(summary.obstacle)}</dd>
          <dt>Original Ending</dt><dd>${html(summary.originalEnding)}</dd>
        </dl>
        <ol>${(summary.majorTurns || []).map((item) => `<li>${html(item)}</li>`).join("")}</ol>
      </article>
      <article>
        <p class="eyebrow">Step 3 - Source Cast</p>
        <div class="reader-v2-cards">${(report.sourceCast || []).map((item) => `
          <div class="source-control-card">
            <span class="provenance provenance--source">Source</span>
            <h3>${html(item.name)}</h3>
            <p>${html(item.socialPosition)}</p>
            <p><strong>Relationship:</strong> ${html(item.relationship)}</p>
            <p><strong>Original function:</strong> ${html(item.originalFunction)}</p>
            <p><strong>Visual value:</strong> ${html(item.visualValue)}</p>
          </div>`).join("")}</div>
      </article>
      <article>
        <p class="eyebrow">Step 4 - Photoplay Raw Material</p>
        <ul>${(report.photoplayRawMaterial || []).map((item) => `<li>${html(item)}</li>`).join("")}</ul>
      </article>
      <article>
        <p class="eyebrow">Step 5 - Adaptation Obstacles</p>
        <ul>${(report.adaptationObstacles || []).map((item) => `<li>${html(item)}</li>`).join("")}</ul>
        <div class="reader-recommendation">
          <strong>Reader recommends: ${html(String(report.recommendation || "").replace(/_/g, " "))}</strong>
          <p>${html(report.recommendationReason)}</p>
        </div>
      </article>
    `;
    document.querySelector("#rescore-reader-v2")?.addEventListener("click", (event) => runReader(event.currentTarget).catch(showError));
  }

  function renderReaderState() {
    const reader = state.readerPacket;
    const hasReport = Number(reader?.packetVersion || 0) === 2 && reader?.report;
    if (reportSection) reportSection.hidden = !hasReport;
    if (pendingSection) pendingSection.hidden = hasReport;
    if (workspace) workspace.hidden = archiveMode
      ? !state.packet
      : !(hasReport && reader.decision === "send_to_writers");
    document.querySelector("#reader-v2-actions")?.toggleAttribute("hidden", archiveMode);
    if (hasReport) renderReaderReport(reader.report);
    if (!hasReport && readerStatus) {
      if (String(state.property?.status || "").toLowerCase() === "reader failed") {
        readerStatus.textContent = reader?.error || "The Reader could not complete this report. Try the filing again.";
      } else if (String(state.property?.status || "").toLowerCase() === "reader reading") {
        readerStatus.textContent = "The Reader is examining the complete source file...";
      }
    }
  }

  function renderPropertyHeader() {
    const property = state.property || {};
    document.querySelector("#property-kicker").textContent = `${property.propertyId || "SPC"} - ${property.sourceType || "Property"}`;
    document.querySelector("#property-title").textContent = property.title || "Untitled Property";
    document.querySelector("#property-logline").textContent = property.logline || "No logline has been filed.";
    document.querySelector("#property-notes").innerHTML = `<strong>Submitter's Notes:</strong> ${html(property.notes || "No submitter notes have been filed.")}`;
    document.title = `${property.title || "Property"} | Writers' Room`;
  }

  function renderStageRail() {
    const list = document.querySelector("#writers-v4-stage-list");
    if (!list || !state.packet) return;
    list.innerHTML = STAGES.map(([key, label], index) => {
      const stage = state.packet.stages?.[key] || {};
      const current = (archiveMode ? state.archiveStage : state.packet.activeStage) === key;
      return `<button type="button" class="writers-v4-stage ${current ? "is-active" : ""} is-${html(stage.status || "not_started")}" data-return-stage="${html(key)}" ${stage.status === "not_started" ? "disabled" : ""}>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${html(label)}</strong>
        <small>${html(String(stage.status || "not started").replace(/_/g, " "))}</small>
      </button>`;
    }).join("");
    list.querySelectorAll("[data-return-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        const stage = button.dataset.returnStage;
        if (archiveMode) {
          state.archiveStage = stage;
          renderWorkspace();
          return;
        }
        if (stage === state.packet.activeStage) return;
        if (!window.confirm(`Return to ${button.querySelector("strong")?.textContent}? Later drafts will remain on file but become provisional.`)) return;
        mutate("return_to_stage", { stage }, "Reopening the earlier development stage...");
      });
    });
  }

  function renderDecisions() {
    const node = document.querySelector("#writers-v4-decisions");
    const approved = state.packet?.approved || {};
    if (!node) return;
    node.innerHTML = `
      ${decisionCard("Approved Ending", approved.ending?.title, approved.ending?.summary)}
      ${decisionCard("Approved Theme", approved.theme?.proposition, approved.themeLaw?.themeSentence)}
      ${decisionCard("Central Will", approved.themeLaw?.centralWill, approved.themeLaw?.opposingForce ? `Opposed by: ${approved.themeLaw.opposingForce}` : "")}
      ${approved.themeLaw?.adaptationRules?.length ? `<article><h3>Theme Production Laws</h3><ol>${approved.themeLaw.adaptationRules.map((rule) => `<li>${html(rule)}</li>`).join("")}</ol></article>` : ""}
      ${approved.cast?.length ? `<article><h3>Locked Cast</h3><p>${approved.cast.map((item) => html(item.name)).join(", ")}</p></article>` : ""}
      ${state.packet?.sourceControl?.sourceFacts?.length ? `<article><h3>Source Facts</h3><ul>${state.packet.sourceControl.sourceFacts.map((item) => `<li>${html(item)}</li>`).join("")}</ul></article>` : ""}
      ${state.packet?.sourceControl?.inventions?.length ? `<article><h3>Adaptation Inventions</h3><ul>${state.packet.sourceControl.inventions.map((item) => `<li>${html(item)}</li>`).join("")}</ul></article>` : ""}
      ${state.packet?.sourceControl?.deferredDecisions?.length ? `<article><h3>Deferred Decisions</h3><ul>${state.packet.sourceControl.deferredDecisions.map((item) => `<li>${html(item)}</li>`).join("")}</ul></article>` : ""}
      ${state.packet?.provisionalStages?.length ? `<article class="is-provisional"><h3>Provisional Work</h3><p>${state.packet.provisionalStages.map((key) => html(key.replace(/_/g, " "))).join(", ")}</p></article>` : ""}
    `;
    const notes = document.querySelector("#writers-v4-user-notes");
    if (notes && document.activeElement !== notes) notes.value = state.packet?.sourceControl?.userNotes || "";
  }

  function decisionCard(title, heading, body) {
    if (!heading && !body) return "";
    return `<article><h3>${html(title)}</h3>${heading ? `<strong>${html(heading)}</strong>` : ""}${body ? `<p>${html(body)}</p>` : ""}</article>`;
  }

  function renderSourceAndVersions() {
    const source = document.querySelector("#writers-v4-source-report");
    const versions = document.querySelector("#writers-v4-versions");
    if (source) source.innerHTML = state.readerPacket?.report
      ? `<p>${html(state.readerPacket.report.sourceStorySummary?.summary || "")}</p>
         ${state.property?.manuscriptLink ? `<p><a class="button button--small" href="${html(state.property.manuscriptLink)}" target="_blank" rel="noopener">Open Original Source</a></p>` : ""}`
      : "<p>No Reader Report is filed.</p>";
    if (versions) {
      const blocks = Object.entries(state.packet?.stages || {}).filter(([, value]) => value.versions?.length);
      const versionMarkup = blocks.length
        ? blocks.map(([key, value]) => `<p><strong>${html(key.replace(/_/g, " "))}</strong>: ${value.versions.length} filed version${value.versions.length === 1 ? "" : "s"}</p>`).join("")
        : "<p>No earlier versions are filed yet.</p>";
      const historyMarkup = archiveMode && state.packet?.history?.length
        ? `<hr><p><strong>Development History</strong></p><ol>${state.packet.history.map((entry) => `<li>${html(entry.command || "filing")} · ${html(entry.at || "")}</li>`).join("")}</ol>`
        : "";
      versions.innerHTML = versionMarkup + historyMarkup;
    }
  }

  function renderWorkspace() {
    if (!state.packet || !workspace) return;
    workspace.hidden = false;
    renderStageRail();
    renderDecisions();
    renderSourceAndVersions();
    if (archiveBanner) archiveBanner.hidden = !archiveMode;
    const notes = document.querySelector("#writers-v4-user-notes");
    const saveNotes = document.querySelector("#writers-v4-save-notes");
    if (notes) notes.disabled = archiveMode;
    if (saveNotes) saveNotes.hidden = archiveMode;
    const stage = archiveMode
      ? (state.archiveStage || archiveInitialStage())
      : state.packet.activeStage;
    if (archiveMode) state.archiveStage = stage;
    document.querySelector("#writers-v4-step").textContent = STEP_NUMBERS[stage] || "Development";
    document.querySelector("#writers-v4-title").textContent = STAGES.find(([key]) => key === stage)?.[1] || "Development Complete";
    document.querySelector("#writers-v4-status").textContent = archiveMode
      ? "Filed Development Record"
      : (state.packet.statusLabel || stage.replace(/_/g, " "));
    if (archiveMode) {
      renderArchivedStage(stage);
      return;
    }
    if (stage === "screen_gold" || stage === "ending_options") renderScreenGold();
    else if (stage === "theme_test") renderThemeTest();
    else if (stage === "theme_law") renderThemeLaw();
    else if (stage === "photoplay_cast") renderCast();
    else if (stage === "scene_board") renderSceneBoard();
    else if (stage === "brief_synopsis") renderSynopsis();
    else if (stage === "pictorial" || stage === "continuity") renderPictorial();
    else renderTreatmentReady();
  }

  function archiveInitialStage() {
    const approved = STAGES.filter(([key]) => state.packet.stages?.[key]?.status !== "not_started");
    return approved.length ? approved[approved.length - 1][0] : state.packet.activeStage;
  }

  function renderArchivedStage(stage) {
    const record = state.packet.stages?.[stage] || {};
    const data = record.data || {};
    if (stage === "scene_board") {
      const scenes = state.packet.approved?.sceneBoard?.length
        ? state.packet.approved.sceneBoard
        : (data.currentScenes || data.recommended || []);
      active.innerHTML = `
        <p class="archive-stage-summary"><strong>${scenes.length} filed scene cards.</strong> The approved order is preserved below.</p>
        <div class="archive-scene-board">${scenes.map((scene, index) => `
          <article>
            <header><strong>Scene ${scene.sceneNumber || index + 1}</strong><span class="provenance provenance--${html(scene.provenance || "adapted")}">${html(scene.provenance || "adapted")}</span></header>
            <h3>${html(scene.location || "Unspecified Location")}</h3>
            <p>${html(scene.dramaticEvent || "")}</p>
            <p><strong>Characters:</strong> ${html((scene.characters || []).join(", "))}</p>
            <p><strong>Visual business:</strong> ${html(scene.visualBusiness || "")}</p>
            ${scene.notes ? `<p><strong>Notes:</strong> ${html(scene.notes)}</p>` : ""}
          </article>`).join("")}
        </div>`;
      return;
    }
    if (stage === "photoplay_cast") {
      const cast = state.packet.approved?.cast?.length ? state.packet.approved.cast : (data.cast || []);
      active.innerHTML = `<div class="archive-record-grid">${cast.map((item) => `
        <article><span class="provenance provenance--${html(item.provenance || "adapted")}">${html(item.provenance || "adapted")}</span>
        <h3>${html(item.name)}</h3>${archiveObject(item, ["id", "name", "provenance"])}</article>`).join("")}</div>`;
      return;
    }
    if (stage === "brief_synopsis") {
      active.innerHTML = `<article class="archive-prose-record"><p>${html(data.synopsis || state.packet.approved?.briefSynopsis || "No synopsis was filed.")}</p></article>`;
      return;
    }
    if (stage === "pictorial" || stage === "continuity") {
      active.innerHTML = `<div class="pictorial-continuity-grid">
        <article><p class="eyebrow">Pictorial Element</p>${objectReport(state.packet.stages?.pictorial?.data || {})}</article>
        <article><p class="eyebrow">Continuity Summary</p>${objectReport(state.packet.stages?.continuity?.data || {})}</article>
      </div>`;
      return;
    }
    active.innerHTML = `
      <article class="archive-stage-record">
        <p class="eyebrow">${html(String(record.status || "filed").replace(/_/g, " "))}</p>
        ${archiveObject(data)}
        ${record.approvedAt ? `<p><strong>Approved:</strong> ${html(record.approvedAt)}</p>` : ""}
        <p><strong>Filed versions:</strong> ${(record.versions || []).length}</p>
      </article>`;
  }

  function archiveObject(value, omitted = []) {
    if (value === null || value === undefined || value === "") return "<p>No filed material.</p>";
    if (Array.isArray(value)) return `<ul>${value.map((item) => `<li>${typeof item === "object" ? archiveObject(item) : html(item)}</li>`).join("")}</ul>`;
    if (typeof value !== "object") return `<p>${html(value)}</p>`;
    return Object.entries(value)
      .filter(([key]) => !omitted.includes(key))
      .map(([key, item]) => `<section><h3>${html(key.replace(/([A-Z])/g, " $1"))}</h3>${archiveObject(item)}</section>`)
      .join("");
  }

  async function loadDevelopmentArchive() {
    if (!archiveTiles || !archiveEmpty) return;
    try {
      const payload = await jsonp("developmentArchive", {}, 120000);
      const records = payload?.records || [];
      archiveTiles.innerHTML = records.map((record) => `
        <a class="development-archive-tile" href="${html(record.writerRoomUrl)}">
          <span>${html(record.propertyId)}</span>
          <strong>${html(record.title)}</strong>
          <small>${html(record.status || record.statusLabel || "Filed")} / ${html((record.activeStage || "development").replace(/_/g, " "))}</small>
          <small>${record.versionCount || 0} filed version${record.versionCount === 1 ? "" : "s"}</small>
        </a>`).join("");
      archiveEmpty.hidden = records.length > 0;
    } catch (error) {
      archiveEmpty.hidden = false;
      archiveEmpty.textContent = `The Development Archive could not be opened. ${error?.message || ""}`;
    }
  }

  function renderScreenGold() {
    const data = state.packet.stages.screen_gold.data;
    if (!data) {
      active.innerHTML = "<p>The Writers are preparing the reconstruction docket.</p>";
      return;
    }
    active.innerHTML = `
      <div class="writers-v4-analysis-grid">
        ${analysisList("The Gold", data.gold, "source")}
        ${analysisList("The Dead Wood", data.deadWood, "source")}
        ${analysisList("Missing Photoplay Material", data.missingMaterial, "adapted")}
        ${analysisList("Faithful Inventions", data.faithfulInventions, "invented")}
      </div>
      <section><p class="eyebrow">Adaptation Principle</p><div class="writers-v4-choice-grid">${data.principles.map((item) => choiceCard("principle", item.id, item.title, item.summary)).join("")}</div></section>
      <section><p class="eyebrow">Alternative Endings</p><div class="writers-v4-choice-grid">${data.endings.map((item) => choiceCard("ending", item.id, item.title, `Summary: ${item.summary} Central reversal: ${item.centralReversal} Emotional effect: ${item.emotionalEffect} Final image: ${item.finalImage} Effect on adaptation: ${item.adaptationEffect}`)).join("")}</div></section>
      <label>Required combination notes<textarea id="reconstruction-notes">${html(state.packet.approved?.combinationNotes || "")}</textarea></label>
      <button type="button" id="approve-reconstruction">Approve Principle and Ending</button>
    `;
    document.querySelector("#approve-reconstruction").addEventListener("click", () => {
      const principleId = document.querySelector('input[name="principle"]:checked')?.value;
      const endingId = document.querySelector('input[name="ending"]:checked')?.value;
      mutate("approve_reconstruction", { principleId, endingId, combinationNotes: document.querySelector("#reconstruction-notes").value }, "Filing the approved reconstruction...");
    });
  }

  function analysisList(title, items, provenance) {
    return `<article><span class="provenance provenance--${provenance}">${html(provenance)}</span><h3>${html(title)}</h3><ul>${(items || []).map((item) => `<li>${html(item)}</li>`).join("")}</ul></article>`;
  }

  function choiceCard(name, id, title, body) {
    return `<label class="writers-v4-choice"><input type="radio" name="${html(name)}" value="${html(id)}"><span><strong>${html(title)}</strong><p>${html(body)}</p></span></label>`;
  }

  function renderThemeTest() {
    const themes = state.packet.stages.theme_test.data?.themes || [];
    active.innerHTML = `
      <p>Select the governing theme. No cast reconstruction or scene arrangement proceeds until it is approved.</p>
      <div class="writers-v4-choice-grid">${themes.map((item) => choiceCard("theme", item.id, item.proposition, `Visible action: ${item.visibleAction} Central conflict: ${item.centralConflict} Feature strength: ${item.featureStrength} Emotional pressure: ${item.emotionalPressure} Pictorial possibilities: ${item.pictorialPossibilities} Final image: ${item.finalImageStrength}`)).join("")}</div>
      <button type="button" id="approve-theme">Approve Governing Theme</button>`;
    document.querySelector("#approve-theme").addEventListener("click", () => {
      mutate("approve_theme", { themeId: document.querySelector('input[name="theme"]:checked')?.value }, "Testing and filing the selected theme...");
    });
  }

  function renderThemeLaw() {
    const law = state.packet.stages.theme_law.data || {};
    active.innerHTML = `
      <div class="writers-v4-form-grid">
        <label>Theme in one sentence<textarea data-law="themeSentence">${html(law.themeSentence)}</textarea></label>
        <label>Central will<textarea data-law="centralWill">${html(law.centralWill)}</textarea></label>
        <label>Opposing force<textarea data-law="opposingForce">${html(law.opposingForce)}</textarea></label>
      </div>
      <section><p class="eyebrow">Six Adaptation Rules</p><div class="writers-v4-rules">${(law.adaptationRules || []).map((rule, index) => `<label>Rule ${index + 1}<textarea data-law-rule>${html(rule)}</textarea></label>`).join("")}</div></section>
      <button type="button" id="approve-law">Approve Theme Production Law</button>`;
    document.querySelector("#approve-law").addEventListener("click", () => {
      const themeLaw = {
        themeSentence: document.querySelector('[data-law="themeSentence"]').value,
        centralWill: document.querySelector('[data-law="centralWill"]').value,
        opposingForce: document.querySelector('[data-law="opposingForce"]').value,
        adaptationRules: Array.from(document.querySelectorAll("[data-law-rule]")).map((node) => node.value)
      };
      mutate("approve_theme_law", { themeLaw }, "Filing the theme as production law...");
    });
    active.querySelectorAll("[data-law], [data-law-rule]").forEach((node) => node.addEventListener("input", () => scheduleAutosave("save_stage_draft", () => ({
      stage: "theme_law",
      data: {
        themeSentence: document.querySelector('[data-law="themeSentence"]').value,
        centralWill: document.querySelector('[data-law="centralWill"]').value,
        opposingForce: document.querySelector('[data-law="opposingForce"]').value,
        adaptationRules: Array.from(document.querySelectorAll("[data-law-rule]")).map((item) => item.value)
      }
    }))));
  }

  function renderCast() {
    const data = state.packet.stages.photoplay_cast.data || {};
    const cast = state.packet.approved.cast?.length ? state.packet.approved.cast : (data.cast || []);
    active.innerHTML = `
      <div class="cast-toolbar">
        <button type="button" id="add-cast">Add Invented Character</button>
        <button type="button" id="merge-cast">Merge Selected Characters</button>
      </div>
      <div class="photoplay-cast-board" id="photoplay-cast-board">${cast.map(castCard).join("")}</div>
      <div class="writers-v4-analysis-grid">
        ${analysisList("Combination Plan", data.combinationPlan, "adapted")}
        ${analysisList("Removal Plan", data.removalPlan, "adapted")}
        ${analysisList("Invented Characters", data.inventedCharacters, "invented")}
        ${analysisList("Star Vehicle Opportunity", [data.starVehicleOpportunity], "adapted")}
      </div>
      <button type="button" id="approve-cast">Lock Final Cast</button>`;
    document.querySelector("#add-cast").addEventListener("click", () => {
      document.querySelector("#photoplay-cast-board").insertAdjacentHTML("beforeend", castCard({ id: `cast_${Date.now()}`, name: "New Character", provenance: "invented", adaptationDecision: "invent", billingTier: "secondary" }));
    });
    document.querySelector("#merge-cast").addEventListener("click", () => {
      const selected = Array.from(document.querySelectorAll("[data-cast-merge]:checked")).map((node) => node.closest("[data-cast-card]"));
      if (selected.length !== 2) return showError(new Error("Select exactly two character cards to merge."));
      const firstName = selected[0].querySelector('[data-field="name"]').value;
      const secondName = selected[1].querySelector('[data-field="name"]').value;
      selected[0].querySelector('[data-field="name"]').value = `${firstName} / ${secondName}`;
      selected[0].querySelector('[data-field="adaptationDecision"]').value = "merge";
      selected[1].remove();
    });
    document.querySelector("#approve-cast").addEventListener("click", () => {
      mutate("approve_cast", { cast: collectCast() }, "Locking the reconstructed photoplay cast...");
    });
    active.querySelectorAll("[data-cast-card] textarea, [data-cast-card] select").forEach((node) => node.addEventListener("input", () => scheduleAutosave("save_stage_draft", () => ({
      stage: "photoplay_cast",
      data: { cast: collectCast() }
    }))));
  }

  function castCard(item) {
    const fields = ["name", "screenFunction", "sourceFunction", "photoplayFunction", "visibleTrait", "desire", "pressure", "relationships", "castingNote"];
    return `<article class="photoplay-cast-card" data-cast-card data-id="${html(item.id || "")}">
      <div><span class="provenance provenance--${html(item.provenance || "adapted")}">${html(item.provenance || "adapted")}</span><label><input type="checkbox" data-cast-merge> Select for merge</label></div>
      ${fields.map((field) => `<label>${html(field.replace(/([A-Z])/g, " $1"))}<textarea data-field="${field}">${html(item[field] || "")}</textarea></label>`).join("")}
      <label>Billing tier<select data-field="billingTier">${[
        ["primary", "Primary Character"],
        ["secondary", "Secondary Character"],
        ["mentioned", "Mentioned / Background Player"]
      ].map(([value, label]) => `<option value="${value}" ${castBillingTier(item) === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <label>Adaptation decision<select data-field="adaptationDecision">${["keep", "remove", "merge", "restore", "reinterpret", "invent"].map((value) => `<option ${item.adaptationDecision === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      <label>Provenance<select data-field="provenance">${["source", "adapted", "invented"].map((value) => `<option ${item.provenance === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    </article>`;
  }

  function castBillingTier(item) {
    const saved = String(item?.billingTier || "").toLowerCase();
    if (["primary", "secondary", "mentioned"].includes(saved)) return saved;
    const role = [item?.screenFunction, item?.photoplayFunction, item?.sourceFunction].join(" ").toLowerCase();
    if (/\b(hero|heroine|protagonist|antagonist|villain|romantic lead|love interest|moral center|central character|star vehicle)\b/.test(role)) return "primary";
    if (/\b(support|confidant|rival|teammate|companion|witness|comic|mentor|guardian|suspect|catalyst)\b/.test(role)) return "secondary";
    return "mentioned";
  }

  function collectCast() {
    return Array.from(document.querySelectorAll("[data-cast-card]")).map((card) => {
      const record = { id: card.dataset.id };
      card.querySelectorAll("[data-field]").forEach((node) => { record[node.dataset.field] = node.value; });
      return record;
    });
  }

  function renderSceneBoard() {
    const data = state.packet.stages.scene_board.data || {};
    if (!state.scenes.length) {
      const selected = data.currentScenes || data.recommended || [];
      state.scenes = JSON.parse(JSON.stringify(selected));
      state.selectedArrangement = state.packet.stages.scene_board.selectedArrangement || "recommended";
    }
    active.innerHTML = `
      <div class="scene-arrangement-picker">
        <button type="button" data-arrangement="recommended">Use Recommended Arrangement</button>
        <button type="button" data-arrangement="alternate">Use ${html(data.alternateName || "Alternate Arrangement")}</button>
        <p>${html(data.alternateRationale || "")}</p>
      </div>
      <div class="scene-board-toolbar">
        <button type="button" id="add-scene">Insert New Scene</button>
        <span id="scene-count">${state.scenes.length} scenes</span>
      </div>
      <div class="scene-location-board" id="scene-location-board">${state.scenes.map(sceneCard).join("")}</div>
      <div class="scene-board-actions">
        <button type="button" id="save-scene-board">Save Scene Board</button>
        <button type="button" id="approve-scene-board">Lock Scene Order and Write Synopsis</button>
      </div>`;
    bindSceneBoard();
  }

  function sceneCard(scene, index) {
    return `<article class="scene-location-card" draggable="true" data-scene-card data-id="${html(scene.id || `scene_${index}`)}">
      <header><strong>Scene ${index + 1}</strong><span class="provenance provenance--${html(scene.provenance || "adapted")}">${html(scene.provenance || "adapted")}</span></header>
      <label>Location<input data-scene="location" value="${html(scene.location || "")}"></label>
      <label>Dramatic event<textarea data-scene="dramaticEvent">${html(scene.dramaticEvent || "")}</textarea></label>
      <label>Source basis<textarea data-scene="sourceBasis">${html(scene.sourceBasis || "")}</textarea></label>
      <label>Characters<input data-scene="characters" value="${html((scene.characters || []).join(", "))}"></label>
      <label>Character pressure<textarea data-scene="characterPressure">${html(scene.characterPressure || "")}</textarea></label>
      <label>Visual business<textarea data-scene="visualBusiness">${html(scene.visualBusiness || "")}</textarea></label>
      <label>Status<select data-scene="adaptationStatus">${["keep", "compress", "combine", "expand", "invent", "move"].map((value) => `<option ${scene.adaptationStatus === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      <label>Provenance<select data-scene="provenance">${["source", "adapted", "invented"].map((value) => `<option ${scene.provenance === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      <label>Notes<textarea data-scene="notes">${html(scene.notes || "")}</textarea></label>
      <div class="scene-card-controls">
        <button type="button" data-scene-action="up" title="Move up">↑</button>
        <button type="button" data-scene-action="down" title="Move down">↓</button>
        <button type="button" data-scene-action="duplicate">Duplicate</button>
        <button type="button" data-scene-action="split">Divide</button>
        <button type="button" data-scene-action="combine">Combine Next</button>
        <button type="button" data-scene-action="remove">Remove</button>
        <label><input type="checkbox" data-scene="locked" ${scene.locked ? "checked" : ""}> Locked</label>
      </div>
    </article>`;
  }

  function collectScenes() {
    return Array.from(document.querySelectorAll("[data-scene-card]")).map((card, index) => {
      const record = { id: card.dataset.id, sceneNumber: index + 1 };
      card.querySelectorAll("[data-scene]").forEach((node) => {
        if (node.dataset.scene === "characters") record.characters = node.value.split(",").map((item) => item.trim()).filter(Boolean);
        else if (node.dataset.scene === "locked") record.locked = node.checked;
        else record[node.dataset.scene] = node.value;
      });
      return record;
    });
  }

  function bindSceneBoard() {
    document.querySelectorAll("[data-arrangement]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.arrangement;
        const source = state.packet.stages.scene_board.data[key] || [];
        state.scenes = JSON.parse(JSON.stringify(source));
        state.selectedArrangement = key;
        renderSceneBoard();
      });
    });
    document.querySelector("#add-scene").addEventListener("click", () => {
      state.scenes = collectScenes();
      if (state.scenes.length >= 50) return showError(new Error("The Scene Location Board may not exceed 50 cards."));
      state.scenes.push({ id: `scene_${Date.now()}`, location: "New Location", characters: [], adaptationStatus: "invent", provenance: "invented" });
      renderSceneBoard();
    });
    document.querySelectorAll("[data-scene-action]").forEach((button) => {
      button.addEventListener("click", () => {
        state.scenes = collectScenes();
        const card = button.closest("[data-scene-card]");
        const index = Array.from(document.querySelectorAll("[data-scene-card]")).indexOf(card);
        const action = button.dataset.sceneAction;
        if (action === "up" && index > 0) [state.scenes[index - 1], state.scenes[index]] = [state.scenes[index], state.scenes[index - 1]];
        if (action === "down" && index < state.scenes.length - 1) [state.scenes[index + 1], state.scenes[index]] = [state.scenes[index], state.scenes[index + 1]];
        if (action === "duplicate" && state.scenes.length < 50) state.scenes.splice(index + 1, 0, { ...state.scenes[index], id: `scene_${Date.now()}` });
        if (action === "split" && state.scenes.length < 50) state.scenes.splice(index + 1, 0, { ...state.scenes[index], id: `scene_${Date.now()}`, dramaticEvent: "Continuation: " + state.scenes[index].dramaticEvent });
        if (action === "combine" && index < state.scenes.length - 1) {
          state.scenes[index].dramaticEvent += ` ${state.scenes[index + 1].dramaticEvent}`;
          state.scenes.splice(index + 1, 1);
        }
        if (action === "remove") state.scenes.splice(index, 1);
        renderSceneBoard();
      });
    });
    let dragged = null;
    document.querySelectorAll("[data-scene-card]").forEach((card) => {
      card.addEventListener("dragstart", () => { dragged = card; });
      card.addEventListener("dragover", (event) => event.preventDefault());
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged || dragged === card) return;
        const board = card.parentElement;
        const rect = card.getBoundingClientRect();
        board.insertBefore(dragged, event.clientY < rect.top + rect.height / 2 ? card : card.nextSibling);
        state.scenes = collectScenes();
        renderSceneBoard();
      });
    });
    document.querySelector("#save-scene-board").addEventListener("click", () => {
      state.scenes = collectScenes();
      mutate("save_scene_board", { scenes: state.scenes, arrangement: state.selectedArrangement }, "Saving the Scene Location Board...");
    });
    document.querySelector("#approve-scene-board").addEventListener("click", () => {
      state.scenes = collectScenes();
      mutate("approve_scene_board", { scenes: state.scenes, arrangement: state.selectedArrangement }, "Locking the scene order and preparing the Brief Synopsis...");
    });
    document.querySelectorAll("[data-scene]").forEach((node) => node.addEventListener("input", () => scheduleAutosave("save_scene_board", () => ({
      scenes: collectScenes(),
      arrangement: state.selectedArrangement
    }))));
  }

  function renderSynopsis() {
    const synopsis = state.packet.stages.brief_synopsis.data?.synopsis || state.packet.approved.briefSynopsis || "";
    active.innerHTML = `
      <label>Brief Synopsis<textarea class="brief-synopsis-editor" id="brief-synopsis-editor">${html(synopsis)}</textarea></label>
      <label>Change in emphasis<textarea id="synopsis-emphasis" placeholder="Describe the emphasis the revised synopsis should carry."></textarea></label>
      <div class="writers-v4-action-row">
        <button type="button" id="approve-synopsis">Approve Brief Synopsis</button>
        <button type="button" id="revise-synopsis">Request Change in Emphasis</button>
        <button type="button" data-synopsis-return="scene_board">Return to Scene Board</button>
        <button type="button" data-synopsis-return="screen_gold">Request Revised Ending</button>
      </div>`;
    document.querySelector("#approve-synopsis").addEventListener("click", () => mutate("approve_synopsis", { synopsis: document.querySelector("#brief-synopsis-editor").value }, "Approving the synopsis and preparing the pictorial pass..."));
    document.querySelector("#revise-synopsis").addEventListener("click", () => mutate("revise_synopsis", { emphasis: document.querySelector("#synopsis-emphasis").value }, "Revising the Brief Synopsis with the requested emphasis..."));
    document.querySelector("#brief-synopsis-editor").addEventListener("input", () => scheduleAutosave("save_stage_draft", () => ({
      stage: "brief_synopsis",
      data: { synopsis: document.querySelector("#brief-synopsis-editor").value, emphasisNote: state.packet.stages.brief_synopsis.data?.emphasisNote || "" }
    })));
    document.querySelectorAll("[data-synopsis-return]").forEach((button) => button.addEventListener("click", () => mutate("return_to_stage", { stage: button.dataset.synopsisReturn }, "Returning the property to the requested stage...")));
  }

  function renderPictorial() {
    const pictorial = state.packet.stages.pictorial.data || {};
    const continuity = state.packet.stages.continuity.data || {};
    active.innerHTML = `
      <div class="pictorial-continuity-grid">
        <article><p class="eyebrow">Pictorial Element</p>${objectReport(pictorial)}</article>
        <article><p class="eyebrow">Continuity Summary</p>${objectReport(continuity)}</article>
      </div>
      <div class="writers-v4-action-row">
        <button type="button" data-pictorial-gate="approve">Approve for Treatment</button>
        <button type="button" data-pictorial-gate="scene_board">Return to Scene Board</button>
        <button type="button" data-pictorial-gate="theme">Return to Theme</button>
        <button type="button" data-pictorial-gate="cast">Return to Cast</button>
      </div>`;
    document.querySelectorAll("[data-pictorial-gate]").forEach((button) => button.addEventListener("click", () => mutate("pictorial_gate", { decision: button.dataset.pictorialGate, pictorial, continuity }, "Filing the Pictorial and Continuity gate decision...")));
  }

  function objectReport(value) {
    return Object.entries(value || {}).map(([key, item]) => `<section><h3>${html(key.replace(/([A-Z])/g, " $1"))}</h3>${Array.isArray(item) ? `<ul>${item.map((entry) => `<li>${html(entry)}</li>`).join("")}</ul>` : `<p>${html(item)}</p>`}</section>`).join("");
  }

  function renderTreatmentReady() {
    active.innerHTML = `
      <div class="treatment-ready-filing">
        <p class="eyebrow">Steps 6-12 Approved</p>
        <h2>The photoplay architecture is ready for treatment.</h2>
        <p>The approved ending, theme law, reconstructed cast, locked scene order, synopsis, and pictorial-continuity pass will travel together to Treatment Room.</p>
        <a class="button" href="treatment-room.html?property=${encodeURIComponent(propertyId)}">Send Development Packet to Treatment Room</a>
      </div>`;
  }

  async function runReader(triggerButton) {
    const button = triggerButton || document.querySelector("#run-reader-v2");
    button.disabled = true;
    readerStatus.textContent = "The Reader is examining the complete source file...";
    try {
      await fetch(scenarioBackendUrl, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "runReader", propertyId })
      });
    } catch (error) {
      button.disabled = false;
      throw new Error(`The Reader request could not reach the office: ${error?.message || error}`);
    }
    const started = Date.now();
    while (Date.now() - started < 300000) {
      const property = await loadPropertyPacket(propertyId, ["source", "reader"]);
      if (String(property.status || "").toLowerCase() === "reader failed") {
        button.disabled = false;
        readerStatus.textContent = property.readerError || "The Reader could not complete this report.";
        throw new Error(readerStatus.textContent);
      }
      if (property.readerPacketVersion == 2 && property.readerReport) {
        await loadProperty();
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 4000));
    }
    button.disabled = false;
    readerStatus.textContent = "The Reader is still working, but the page stopped waiting after five minutes. Reopen this property to check the filed report before trying again.";
  }

  async function routeReader(decision) {
    document.querySelectorAll("[data-reader-decision]").forEach((button) => { button.disabled = true; });
    const guidance = document.querySelector("#reader-v2-guidance").value;
    const result = await jsonp("readerDecision", { propertyId, decision, guidance });
    if (!result?.ok) throw new Error(result?.error || "The Reader routing decision could not be filed.");
    if (decision === "further_reading") {
      await runReader();
      return;
    }
    await loadProperty();
  }

  async function openDevelopment() {
    setBusy("The Writers are opening the adaptation file...");
    try {
      const result = await jsonp("runDevelopment", { propertyId, command: "open", payload: "{}" }, 180000);
      if (!result?.ok) throw new Error(result?.error || "The Writers could not open the development file.");
      state.packet = result.packet;
      renderWorkspace();
      clearBusy();
    } catch (error) {
      showError(error);
    }
  }

  async function loadProperty() {
    if (!/^SPC-/i.test(propertyId)) {
      pendingSection.hidden = false;
      document.querySelector("#run-reader-v2").disabled = true;
      readerStatus.textContent = "Select a property from the desk.";
      return;
    }
    state.property = await loadPropertyPacket(propertyId, ["source", "reader", "conference"]);
    state.readerPacket = state.property.readerPacketVersion == 2
      ? {
          packetVersion: 2,
          report: state.property.readerReport,
          decision: state.property.readerDecision,
          error: state.property.readerError || "",
          scoreStatus: state.property.suitabilityScoreStatus || "",
          readerProfile: state.property.readerProfile || null,
          assignmentRationale: state.property.readerAssignmentRationale || ""
        }
      : null;
    const savedConference = state.property.conferenceJson ? JSON.parse(state.property.conferenceJson) : null;
    state.packet = savedConference?.packetVersion === 4 ? savedConference : null;
    renderPropertyHeader();
    renderReaderState();
    if (archiveMode) {
      if (!state.packet) throw new Error("The filed Development Packet is unavailable.");
      renderWorkspace();
      return;
    }
    if (state.readerPacket?.decision === "send_to_writers") {
      if (state.packet) renderWorkspace();
      else await openDevelopment();
    }
  }

  document.querySelector("#run-reader-v2")?.addEventListener("click", (event) => runReader(event.currentTarget).catch(showError));
  document.querySelectorAll("[data-reader-decision]").forEach((button) => button.addEventListener("click", () => routeReader(button.dataset.readerDecision).catch(showError)));
  document.querySelector("#writers-v4-save-notes")?.addEventListener("click", () => mutate("save_notes", { notes: document.querySelector("#writers-v4-user-notes").value }, "Filing the binding user notes..."));

  loadDevelopmentArchive();
  loadProperty().catch(showError);
})();

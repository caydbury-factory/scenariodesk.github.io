const memoranda = {
  "Jeanette Marchmont": {
    title: "Jeanette Marchmont, Structure and Photoplay Construction",
    body: "The premise has a clear engine: hidden mechanism, public deadline, and a heroine whose skill must become dramatic action. The next draft must make the midpoint irreversible. Give her one discovery that cannot be politely explained away, then force the picture toward the tower."
  },
  "Frances Fairchild": {
    title: "Frances Fairchild, Emotional Appeal and Audience Sympathy",
    body: "The audience will follow the clockmaker if her private wound is visible before the machinery begins. Let us see what she lost with her father, what she refuses to forgive, and why saving the city also means admitting she still loves him."
  },
  "Clara Ashcombe": {
    title: "Clara Ashcombe, Women, Society, Class, and Reputation",
    body: "The strongest material lies in reputation. A woman mechanic is already being judged by a public that depends upon her unseen labor. Make the society committee smile while denying her authority, then require them to beg for it."
  },
  "William Carrington": {
    title: "William Carrington, Moral Conflict and Ethical Drama",
    body: "The decision must not be merely practical. She should possess proof that saves the parade but condemns her father's name. The ethical question is whether a daughter owes silence to the dead or truth to the living."
  },
  "Anita Vane": {
    title: "Anita Vane, Wit, Pace, and Social Satire",
    body: "The office needs a faster pulse before the climax. Give the junior copyist, the parade marshal, and the newspaper girl cross-purposes that keep the story lively without reducing the danger. Wit should sharpen the pressure."
  },
  "June Sterling": {
    title: "June Sterling, Romance and Emotional Sweep",
    body: "The romance must feel destined but inconvenient. Pair her with a man assigned to stop the parade, not save her reputation. Their love should grow through competent disagreement, then peak when he trusts her hands with the city."
  },
  "Beulah Thorncroft": {
    title: "Beulah Thorncroft, Consequences, Sacrifice, Duty, and Stakes",
    body: "The story improves when the cost is counted. Someone must lose office, name, inheritance, or safety because the heroine acts. Without sacrifice, the clock is clever machinery. With sacrifice, it becomes destiny."
  }
};

const revealTargets = document.querySelectorAll(
  "main > section, .desk-sheet, .property-card, .dossier-sheet, .analysis-sheet, .letter-envelope, .reader-roster, .treatment-assignment, .official-treatment, .carstairs-desk, .carstairs-memo, .carstairs-verdict, .carstairs-rewrite, .carstairs-appeal, .rules-sheet, .source-shelf, .archive-stats > div, .selected-issue, .miner-desk, .report"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const memo = document.querySelector("#memo");

document.querySelectorAll("[data-consultant]").forEach((button) => {
  button.addEventListener("click", () => {
    const consultant = memoranda[button.dataset.consultant];
    memo.innerHTML = `
      <p class="eyebrow">Studio Memorandum</p>
      <h3>${consultant.title}</h3>
      <p>${consultant.body}</p>
    `;
  });
});

const timer = document.querySelector("#timer");
let minutes = 48 * 60;

if (timer) {
  setInterval(() => {
    minutes -= 1;
    if (minutes < 0) minutes = 48 * 60;
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    timer.textContent = `${hours}:${mins}`;
  }, 30000);
}

const archiveIssues = {
  argosy: {
    title: "Argosy All-Story Weekly",
    year: "1928",
    issue: "May 12",
    pdf: "argosy-allstory-1928-05-12.pdf",
    status: "Indexed and ready for mining",
    source: "Argosy All-Story Weekly, May 12, 1928"
  },
  adventure: {
    title: "Adventure",
    year: "1931",
    issue: "February",
    pdf: "adventure-1931-02.pdf",
    status: "PDF ready; OCR confidence high",
    source: "Adventure, February 1931"
  },
  detective: {
    title: "Detective Story Magazine",
    year: "1927",
    issue: "July 9",
    pdf: "detective-story-1927-07-09.pdf",
    status: "OCR pending; manual review recommended",
    source: "Detective Story Magazine, July 9, 1927"
  },
  love: {
    title: "Love Story Magazine",
    year: "1930",
    issue: "October",
    pdf: "love-story-1930-10.pdf",
    status: "PDF ready for mining",
    source: "Love Story Magazine, October 1930"
  }
};

const issueButtons = document.querySelectorAll("[data-issue]");

issueButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const issue = archiveIssues[button.dataset.issue];
    if (!issue) return;

    issueButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");

    document.querySelector("#issue-title").textContent = issue.title;
    document.querySelector("#issue-year").textContent = issue.year;
    document.querySelector("#issue-number").textContent = issue.issue;
    document.querySelector("#issue-pdf").textContent = issue.pdf;
    document.querySelector("#issue-status").textContent = issue.status;

    document.querySelectorAll("#archive-results dd").forEach((dd) => {
      if (dd.textContent.includes("Argosy") || dd.textContent.includes("Adventure") || dd.textContent.includes("Detective") || dd.textContent.includes("Love Story")) {
        dd.textContent = issue.source;
      }
    });
  });
});

const manuscriptFile = document.querySelector("#manuscript-file");
const uploadLabel = document.querySelector("#upload-label");
const submissionForm = document.querySelector("#property-submission-form");
const submissionStatus = document.querySelector("#submission-status");
const submitPropertyButton = document.querySelector("#submit-property-button");
const scenarioBackendUrl = "https://script.google.com/macros/s/AKfycbzwItYelXxPfcfxcB9Z0sSTnecphm7ibkLpMkX0zpjWF2LumeCbDqhEdt-OnkbSjKPezQ/exec";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function loadLedgerProperties() {
  return new Promise((resolve, reject) => {
    const callbackName = `scenarioLedger_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Ledger request timed out."));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Ledger request failed."));
    };

    script.src = `${scenarioBackendUrl}?action=properties&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function restoreDevelopmentProperty(propertyId) {
  return new Promise((resolve, reject) => {
    const callbackName = `restoreDevelopment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Development restoration timed out."));
    }, 30000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Development restoration request failed."));
    };
    script.src = `${scenarioBackendUrl}?action=restoreDevelopment&propertyId=${encodeURIComponent(propertyId)}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("conference ready") || normalized.includes("greenlit") || normalized.includes("treatment")) return "stamp--green";
  if (normalized.includes("wastebasket")) return "stamp--red";
  return "";
}

function propertyHref(property) {
  const key = property.propertyId || property.title || "";
  const status = String(property.status || "");
  const carstairsVerdict = String(property.carstairsVerdict || "");
  const hasFinalCarstairs = Boolean(parseSavedCarstairs(property)) || /greenlit|wastebasket/i.test(status) || /greenlight|wastebasket/i.test(carstairsVerdict);
  const hasExecutiveRewrite = /executive rewrite/i.test(status) || /rewrite/i.test(carstairsVerdict);
  if (hasExecutiveRewrite) {
    return `carstairs-office.html?property=${encodeURIComponent(key)}`;
  }
  if (hasFinalCarstairs) {
    return `carstairs-office.html?property=${encodeURIComponent(key)}`;
  }
  const hasTreatment = /treatment/i.test(property.treatmentStatus || "") || /treatment ready|treatment applied/i.test(status) || Boolean(parseSavedTreatment(property));
  if (hasTreatment) {
    return property.treatmentUrl || `treatment-room.html?property=${encodeURIComponent(key)}`;
  }
  return `writers-room.html?property=${encodeURIComponent(key)}`;
}

function parseSavedTreatment(property) {
  if (!property || !property.treatmentJson) return null;
  try {
    return JSON.parse(property.treatmentJson);
  } catch (error) {
    return null;
  }
}

function parseSavedCarstairs(property) {
  if (!property || !property.carstairsJson) return null;
  try {
    return JSON.parse(property.carstairsJson);
  } catch (error) {
    return null;
  }
}

function lowerText(value) {
  return String(value || "").toLowerCase();
}

function isConferenceRepairProperty(property) {
  const status = lowerText(property && property.status);
  const verdict = lowerText(property && property.conferenceVerdict);
  const savedConference = parseSavedConference(property) || {};
  const decision = lowerText(savedConference.decision || savedConference.finalDecision);
  return /reconference|development/.test(status) || /reconference|development/.test(verdict) || /reconference|continue|paused/.test(decision);
}

function isExecutiveRewriteProperty(property) {
  const status = lowerText(property && property.status);
  const verdict = lowerText(property && property.carstairsVerdict);
  const savedCarstairs = parseSavedCarstairs(property) || {};
  const packetVerdict = lowerText(savedCarstairs.verdict || savedCarstairs.statusLabel);
  return /executive rewrite/.test(status) || /rewrite/.test(verdict) || /rewrite/.test(packetVerdict);
}

function isWritersRoomSelectorProperty(property) {
  const status = lowerText(property && property.status);
  return /needs reader|conference ready|needs conference|needs development|development questions filed|development under review/.test(status) || isConferenceRepairProperty(property);
}

function canOpenInWritersRoom(property) {
  return isWritersRoomSelectorProperty(property);
}

function isTreatmentRoomProperty(property) {
  const status = lowerText(property && property.status);
  const treatmentStatus = lowerText(property && property.treatmentStatus);
  if (isExecutiveRewriteProperty(property)) return false;
  if (/greenlit|wastebasket/.test(status)) return false;
  return /treatment ready|treatment applied/.test(status) || /treatment ready|treatment applied/.test(treatmentStatus);
}

function isCarstairsRoomProperty(property) {
  const status = lowerText(property && property.status);
  const treatmentStatus = lowerText(property && property.treatmentStatus);
  const verdict = lowerText(property && property.carstairsVerdict);
  return /treatment applied|executive rewrite|greenlit|wastebasket/.test(status)
    || /treatment applied/.test(treatmentStatus)
    || /rewrite|greenlight|wastebasket/.test(verdict)
    || Boolean(parseSavedCarstairs(property));
}

function roomPropertyFilter(room, property) {
  if (room === "writers") return isWritersRoomSelectorProperty(property);
  if (room === "treatment") return isTreatmentRoomProperty(property);
  if (room === "carstairs") return isCarstairsRoomProperty(property);
  return false;
}

function roomPropertyEligibleForDirectLoad(room, property) {
  if (room === "writers") return canOpenInWritersRoom(property);
  if (room === "treatment") return isTreatmentRoomProperty(property);
  if (room === "carstairs") return isCarstairsRoomProperty(property);
  return false;
}

function renderRoomPropertySelector(room, options) {
  const {
    properties = [],
    currentPropertyId = "",
    currentIsValid = true,
    tilesSelector,
    emptySelector,
    pageHref
  } = options || {};

  const tiles = document.querySelector(tilesSelector);
  const empty = document.querySelector(emptySelector);
  if (!tiles || !empty) return;

  const eligible = properties.filter((property) => roomPropertyFilter(room, property));

  if (!eligible.length) {
    tiles.innerHTML = "";
    empty.hidden = false;
    empty.textContent = "No properties are currently waiting on this desk.";
    return;
  }

  tiles.innerHTML = eligible.map((property) => `
    <button
      type="button"
      class="room-property-tile ${String(property.propertyId || "") === String(currentPropertyId || "") ? "is-active" : ""}"
      data-room-property-id="${escapeHtml(property.propertyId || "")}">
      ${escapeHtml(property.title || "Untitled Property")}
    </button>
  `).join("");

  tiles.querySelectorAll("[data-room-property-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const propertyId = button.dataset.roomPropertyId || "";
      window.location.href = `${pageHref}?property=${encodeURIComponent(propertyId)}`;
    });
  });

  empty.hidden = false;
  empty.textContent = currentPropertyId && !currentIsValid
    ? "That property is not presently on this desk. Select another current file."
    : "Select a current property from the desk.";
}

function renderScenarioDesk(properties) {
  const board = document.querySelector("#property-board");
  const status = document.querySelector("#desk-ledger-status");
  if (!board || !Array.isArray(properties) || !properties.length) {
    if (board) {
      board.innerHTML = `
        <article class="property-card property-card--active property-card--loading">
          <div class="property-card__clip"></div>
          <p class="stamp">Ledger Empty</p>
          <h3>No current properties are on the desk.</h3>
          <p>Submit a new property or mine the archives to place fresh material under the banker lamp.</p>
        </article>
      `;
    }
    if (status) status.textContent = "The live ledger is empty. Submit a property or mine the archives to begin a new file.";
    return;
  }

  board.innerHTML = properties.map((property, index) => {
    const savedCarstairs = parseSavedCarstairs(property);
    const hasCarstairs = Boolean(savedCarstairs) || /greenlit|executive rewrite/i.test(property.status || "") || /greenlight|rewrite|wastebasket/i.test(property.carstairsVerdict || "");
    const isLegacyWriterWastebasket = /wastebasket/i.test(property.status || "") && !hasCarstairs;
    const hasTreatment = /treatment/i.test(property.treatmentStatus || "") || Boolean(parseSavedTreatment(property));
    const stamp = isLegacyWriterWastebasket
      ? "Development Paused"
      : hasCarstairs
      ? (savedCarstairs && savedCarstairs.statusLabel ? savedCarstairs.statusLabel : (property.status || "Greenlit"))
      : hasTreatment
      ? "Treatment Applied"
      : (property.status || "Needs Reader");
    const source = property.sourceType || "Unclassified Property";
    const reader = property.reader || "Awaiting assignment";
    const score = property.suitabilityScore || "Pending";
    const summary = property.logline || property.readerSynopsis || property.notes || "No synopsis has been entered for this property yet.";
    const idLine = property.propertyId ? `<p class="property-id">${escapeHtml(property.propertyId)}</p>` : "";
    const actionLabel = hasCarstairs ? "Open Carstairs' Office" : hasTreatment ? "Open Treatment Room" : "Open Writers' Room";
    const isDevelopmentPaused = (/development paused/i.test(property.status || "") || isLegacyWriterWastebasket) && !/waste/i.test(property.carstairsVerdict || "");

    const cardBody = `
        <div class="property-card__clip"></div>
        <p class="stamp ${statusClass(stamp)}">${escapeHtml(stamp)}</p>
        ${idLine}
        <h3>${escapeHtml(property.title || "Untitled Property")}</h3>
        <dl>
          <dt>Nature</dt><dd>${escapeHtml(source)}</dd>
          <dt>Reader</dt><dd>${escapeHtml(reader)}</dd>
          <dt>Score</dt><dd>${escapeHtml(score)}</dd>
        </dl>
        <p>${escapeHtml(summary)}</p>
        <span class="button button--small">${escapeHtml(actionLabel)}</span>
        ${isDevelopmentPaused ? `<button type="button" class="button button--small" data-restore-development="${escapeHtml(property.propertyId)}">Restore to Writers' Room</button>` : ""}
    `;
    return isDevelopmentPaused
      ? `<article class="property-card ${index === 0 ? "property-card--active" : ""}">${cardBody}</article>`
      : `<a class="property-card ${index === 0 ? "property-card--active" : ""}" href="${propertyHref(property)}">${cardBody}</a>`;
  }).join("");

  board.querySelectorAll("[data-restore-development]").forEach((button) => {
    button.addEventListener("click", async () => {
      const propertyId = button.dataset.restoreDevelopment || "";
      button.disabled = true;
      button.textContent = "Restoring Development";
      try {
        const payload = await restoreDevelopmentProperty(propertyId);
        if (!payload || !payload.ok) throw new Error(payload?.error || "Development restoration was not accepted.");
        window.location.href = `writers-room.html?property=${encodeURIComponent(propertyId)}`;
      } catch (error) {
        button.disabled = false;
        button.textContent = error?.message || "Restore to Writers' Room";
      }
    });
  });

  document.querySelector("#desk-total-properties").textContent = String(properties.length);
  document.querySelector("#desk-total-conference").textContent = String(properties.filter((property) => /conference ready/i.test(property.status || "")).length);
  document.querySelector("#desk-total-mined").textContent = String(properties.filter((property) => /mined/i.test(property.status || "") || /pulp/i.test(property.sourceType || "")).length);
  document.querySelector("#desk-total-reader").textContent = String(properties.filter((property) => /needs reader/i.test(property.status || "")).length);

  if (status) status.textContent = "Live ledger connected. Showing current properties from the archive.";
}

if (document.querySelector("#property-board")) {
  loadLedgerProperties()
    .then((payload) => {
      if (!payload || !payload.ok) throw new Error(payload && payload.error ? payload.error : "Ledger response was not OK.");
      renderScenarioDesk(payload.properties || []);
    })
    .catch(() => {
      const status = document.querySelector("#desk-ledger-status");
      if (status) status.textContent = "The live ledger could not be reached. The desk is waiting for a fresh connection.";
    });
}

function getManuscriptTextarea() {
  return document.querySelector("[name='manuscriptText']");
}

function updateSubmissionStatus(message, kind = "") {
  if (!submissionStatus) return;
  submissionStatus.textContent = message;
  submissionStatus.className = kind ? `submission-status ${kind}` : "submission-status";
}

function loadPdfJs() {
  if (!window.__scenarioPdfJsPromise) {
    window.__scenarioPdfJsPromise = import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.min.mjs");
  }
  return window.__scenarioPdfJsPromise;
}

async function extractPdfText(file) {
  const pdfjsLib = await loadPdfJs();
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs";
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const text = await page.getTextContent();
    const lines = text.items.map((item) => item.str || "").join(" ").replace(/\s+/g, " ").trim();
    if (lines) pages.push(lines);
  }

  return pages.join("\n\n");
}

if (manuscriptFile && uploadLabel) {
  manuscriptFile.addEventListener("change", async () => {
    const file = manuscriptFile.files && manuscriptFile.files[0];
    const textarea = getManuscriptTextarea();

    uploadLabel.textContent = file ? file.name : "Place manuscript here - or paste text below";
    if (!file || !textarea) return;

    try {
      if (/\.txt$/i.test(file.name) || /^text\//i.test(file.type || "")) {
        updateSubmissionStatus("Reading the manuscript text into the property file...");
        textarea.value = await file.text();
        updateSubmissionStatus("Manuscript text loaded into the property file.", "submission-status--success");
        return;
      }

      if (/\.pdf$/i.test(file.name) || /pdf/i.test(file.type || "")) {
        updateSubmissionStatus("Reading the OCR PDF for manuscript text...");
        const extractedText = await extractPdfText(file);
        textarea.value = extractedText;
        updateSubmissionStatus(
          extractedText.trim()
            ? "OCR PDF text loaded into the property file."
            : "The PDF opened, but no readable text was found. Paste the OCR text below if needed.",
          extractedText.trim() ? "submission-status--success" : "submission-status--error"
        );
        return;
      }

      updateSubmissionStatus("This file type cannot be read directly here yet. Paste the manuscript text below.", "submission-status--error");
    } catch (error) {
      updateSubmissionStatus("The manuscript file could not be read cleanly. Paste the text below for this pass.", "submission-status--error");
    }
  });
}

if (submissionForm && submissionStatus && submitPropertyButton) {
  submissionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(submissionForm);
    const payload = {
      title: formData.get("title") || "",
      sourceType: formData.get("sourceType") || "",
      logline: formData.get("logline") || "",
      manuscriptText: formData.get("manuscriptText") || "",
      notes: formData.get("notes") || ""
    };

    if (!payload.title.trim() || !payload.sourceType.trim()) {
      submissionStatus.textContent = "The department requires a title and nature of material before filing.";
      submissionStatus.className = "submission-status submission-status--error";
      return;
    }

    submitPropertyButton.disabled = true;
    submissionStatus.textContent = "Filing property with the Scenario Department ledger...";
    submissionStatus.className = "submission-status";

    try {
      await fetch(scenarioBackendUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      submissionStatus.textContent = "Property filed. Sending the dossier to the Writers' Room...";

      window.setTimeout(() => {
        loadLedgerProperties()
          .then((ledger) => {
            if (!ledger || !ledger.ok) throw new Error("Ledger response was not OK.");
            const properties = ledger.properties || [];
            const matchingProperty = properties.find((property) =>
              String(property.title || "").trim().toLowerCase() === payload.title.trim().toLowerCase() &&
              String(property.sourceType || "").trim().toLowerCase() === payload.sourceType.trim().toLowerCase()
            ) || properties.find((property) =>
              String(property.title || "").trim().toLowerCase() === payload.title.trim().toLowerCase()
            );

            const propertyId = matchingProperty && matchingProperty.propertyId;
            window.location.href = propertyId
              ? `writers-room.html?property=${encodeURIComponent(propertyId)}&reader=auto`
              : "scenario-desk.html";
          })
          .catch(() => {
            submissionStatus.textContent = "Property filed. Return to the Scenario Desk to open the new file.";
            submissionStatus.className = "submission-status submission-status--success";
            submitPropertyButton.disabled = false;
          });
      }, 2200);
    } catch (error) {
      submissionStatus.textContent = "The filing clerk could not reach the ledger. Try once more.";
      submissionStatus.className = "submission-status submission-status--error";
      submitPropertyButton.disabled = false;
    }
  });
}

const propertyFiles = {
  "dangerous-kisses": {
    kicker: "Property Under Consideration - Pulp Magazine",
    title: "Dangerous Kisses",
    logline: "A young lady's life is saved by a mysterious man, igniting the flames of forbidden love just before a grand Mediterranean cruise.",
    notes: "Extracted from: Unknown Publication, Author: Unknown. Suitability Score: 9/10. Strong protagonist with clear desires, dramatic action potential, and moral conflict regarding class and love; rich visual settings for your photoplay.",
    reader: "Beatrice \"Bee\" Vance - high-society romances, European literature, and modern audience appeal",
    synopsis: "Barbara Ferrers, a spirited lady's maid, dreams of a dazzling adventure aboard a luxury Mediterranean cruise, where sunlight decks shimmer and laughter dances on the breeze. Her life takes an unexpected turn when a mysterious stranger saves her from a perilous fall, sparking a forbidden romance that defies their class boundaries. As the ship moves from port to port, Barbara finds herself torn between loyalty to her station and an insatiable desire for freedom. The grand cruise becomes a backdrop for stolen glances, whispers in the wind, and the question that may decide her fate: will she claim her own destiny or remain shackled by the limits of her world?",
    sequences: [
      ["Scene 01: Dangerous Encounter", "As the deck of the luxurious cruise ship basks in golden sunlight, Barbara balances a tray of cocktails before a guest loses footing near the railing. A mysterious stranger saves her, and the guests gasp with shock and intrigue.", "Establishes central romantic tension and foreshadows class conflict."],
      ["Scene 02: Midnight at Monte Carlo", "Barbara follows a coded note through a casino terrace and discovers that her rescuer moves among aristocrats under a false name.", "Turns romance into suspense and gives the heroine an active discovery."]
    ],
    archetypes: [
      ["Barbara Ferrers", "The Rebel", "A spirited young woman torn between her duties as a lady's maid and her desire for exploration, romance, and self-command."],
      ["The Mysterious Stranger", "The Hero", "An enigmatic figure representing freedom and danger, protecting Barbara while concealing a past that may ruin them both."]
    ]
  },
  "cathedral-clock": {
    kicker: "Property Under Consideration - Original Premise",
    title: "The Cathedral Clock",
    logline: "A woman clockmaker discovers that her late father's cathedral mechanism hides the schedule of a political assassination.",
    notes: "Submitted directly to the department. Strong central role, city spectacle, moral pressure between family duty and public truth.",
    reader: "Aloysius \"Al\" Finch - structure, stage-to-screen logic, and hard dramatic pressure",
    synopsis: "Elsa Venn repairs the cathedral clock her father built before his disgrace. Inside the mechanism she finds a hidden timing chart connected to a governor's parade and a murder plot that may have begun with her father. To save the city, Elsa must expose the dead man she has spent her life defending. The property offers a visual engine, a ticking deadline, and a heroine whose skill becomes action under pressure.",
    sequences: [
      ["Scene 01: The Tower Mechanism", "Elsa climbs through the cathedral clock while gears hammer above the city square and discovers the false wheel hidden by her father.", "Makes the heroine's craft cinematic and gives the story a visible engine."],
      ["Scene 02: Parade Under the Bells", "The governor's parade reaches the cathedral as Elsa must stop the mechanism before the assassin's signal rings.", "Combines spectacle, suspense, and moral decision."]
    ],
    archetypes: [
      ["Elsa Venn", "The Artisan Heroine", "A skilled mechanic whose private loyalty is tested by public danger."],
      ["The Late Father", "The Shadow", "A beloved parent whose hidden guilt drives the moral conflict from beyond the grave."]
    ]
  },
  "lantern-bitter-creek": {
    kicker: "Property Under Consideration - Mined Archive",
    title: "The Lantern at Bitter Creek",
    logline: "A disgraced surveyor escorts a widow across a flood-threatened mountain pass and discovers the railroad fraud that ruined them both.",
    notes: "Mined from Argosy All-Story Weekly, May 12, 1928. Outdoor action, flood peril, clean revenge engine, strong Western setting.",
    reader: "T. J. \"Texas\" Mahoney - westerns, outdoor action, and physical accuracy",
    synopsis: "At Bitter Creek, a failed surveyor accepts one last guide job for a widow whose land was stolen by a railroad syndicate. A storm cuts off the pass, forcing them into a race through floodwater, sabotage, and old accusations. The lantern of the title becomes both survival tool and proof of fraud, giving the story a visual object that can carry the climax.",
    sequences: [
      ["Scene 01: The Washed-Out Bridge", "The wagon team reaches the bridge as the first supports tear loose, forcing the hero to choose between cargo and passengers.", "Immediate physical danger reveals character."],
      ["Scene 02: Lantern Signal", "In the flood-dark canyon, the widow raises the lantern from the ridge to expose the false survey markers.", "Turns evidence into spectacle."]
    ],
    archetypes: [
      ["Cal Rusk", "The Disgraced Guide", "A capable man accused of cowardice who can only recover his name through action."],
      ["Mara Bell", "The Widow Claimant", "A landowner whose grief sharpens into courage and public accusation."]
    ]
  },
  "glass-duchess": {
    kicker: "Property Under Consideration - Mined Archive",
    title: "The Glass Duchess",
    logline: "A society impostor wins a title, loses a sister, and must choose between reputation and confession on opening night.",
    notes: "Mined from Love Story Magazine, October 1930. Needs reader assignment. Strong society setting, but moral choice requires sharpening.",
    reader: "Awaiting assignment from the story department",
    synopsis: "A clever impostor enters society under a borrowed name and discovers that the life she has stolen costs more than poverty ever did. When her sister is accused of the fraud, confession becomes both ruin and redemption. The material has glamour, social tension, and a promising final public scene, but the central sacrifice must be made more visual.",
    sequences: [
      ["Scene 01: The Borrowed Invitation", "The heroine enters the gala under another woman's name and survives her first test at the receiving line.", "Introduces social jeopardy and performance."],
      ["Scene 02: Opening Night Confession", "Before the curtain rises, she must choose whether to keep her title or save her sister.", "Places moral decision in a public setting."]
    ],
    archetypes: [
      ["Vivian Glass", "The Impostor", "A brilliant social climber whose talent for deception conceals a desperate loyalty."],
      ["Lena Glass", "The Innocent Sister", "The person whose suffering turns masquerade into moral reckoning."]
    ]
  }
};

const defaultPhotoplaywrightVerdicts = [
  {
    initials: "J.M.",
    next: "Consult with Miss Frances Fairchild ->",
    title: "Miss Jeanette Marchmont",
    role: "Chief of Scenario Construction / Structure and Photoplay Architecture",
    body: "The material is playable because its desire is visible: Barbara wants life beyond service, and the cruise gives that want movement, splendor, and danger. The present weakness is architectural. The class conflict must rise by complications rather than by conversation. Give the second act one crisis that cannot be politely explained away, and the climax will have a true motion-picture shape."
  },
  {
    initials: "F.F.",
    next: "Consult with Mr. William Carrington ->",
    title: "Miss Frances Fairchild",
    role: "Director of Human Interest / Emotional Appeal and Audience Sympathy",
    body: "The audience will care if Barbara's longing is not treated as vanity. She must suffer visibly from the small humiliations of service before the romance promises escape. The mysterious gentleman is useful only if he awakens a wound already present. Let the audience love her before the first stolen glance, and the picture will have tears as well as satin."
  },
  {
    initials: "W.C.",
    next: "Convene the Conference ->",
    title: "Mr. William Carrington",
    role: "Director of Moral Drama / Ethical Conflict and Character Judgment",
    body: "The property must not become a holiday romance with pretty ports. Its moral wound is duty against self-command. Barbara's choice must carry consequence: disgrace, dismissal, or the loss of the very love that tempted her upward. If the final scene judges her character through action, not sentiment, the material is worthy of treatment."
  }
];

const cathedralPhotoplaywrightVerdicts = [
  {
    initials: "J.M.",
    next: "Consult with Mr. William Carrington ->",
    title: "Miss Jeanette Marchmont",
    role: "Chief of Scenario Construction / Structure and Photoplay Architecture",
    body: "The clock is a fine visual engine, but the construction is not yet sound. The first act establishes machinery without establishing sufficient dramatic pressure. By the photoplay rules, the protagonist's desire must drive every scene; Elsa is skilled, but she is not yet forced forward sharply enough. Reconference advised."
  },
  {
    initials: "W.C.",
    next: "Consult with Miss Beulah Thorncroft ->",
    title: "Mr. William Carrington",
    role: "Director of Moral Drama / Ethical Conflict and Character Judgment",
    body: "The moral wound is present but underdeveloped. A daughter discovering her father's guilt is powerful material, but the current file lets the question remain atmospheric. It must become a choice with public consequence. By the rule of morality, consequence must follow action. Reconference required."
  },
  {
    initials: "B.T.",
    next: "Convene the Conference ->",
    title: "Miss Beulah Thorncroft",
    role: "Director of Historical and Moral Pressure / Consequence, Duty, and Stakes",
    body: "The stakes are handsome but not costly enough. A parade, a tower, and a hidden mechanism are not sufficient unless someone pays dearly for the truth. Give Elsa a sacrifice, a duty, and a loss that cannot be undone. Return this property to conference."
  }
];

let activePhotoplaywrightVerdicts = defaultPhotoplaywrightVerdicts;
let activeConferenceDecision = "treatments";
let activeConferenceProperty = null;
let activeConferenceWriterKeys = ["marchmont", "fairchild", "carrington"];
let activeConferencePayload = null;

const photoplaywrightRoster = {
  marchmont: {
    initials: "J.M.",
    title: "Miss Jeanette Marchmont",
    role: "Chief of Scenario Construction / Structure and Photoplay Architecture",
    body: "The first question is whether this material can stand as a motion picture. It must have a protagonist whose desire pushes the action forward, a middle that complicates rather than repeats, and a climax that can be seen. I find playable material here, but the conference must watch the structure like a bank vault."
  },
  fairchild: {
    initials: "F.F.",
    title: "Miss Frances Fairchild",
    role: "Director of Human Interest / Emotional Appeal and Audience Sympathy",
    body: "The property will live or die by whether the audience cares before the machinery begins. I want suffering that can be seen, longing that costs something, and reconciliation or loss that arrives honestly. If the heart is made visible, the picture may carry."
  },
  ashcombe: {
    initials: "C.A.",
    title: "Miss Clara Ashcombe",
    role: "Director of Society and Character / Women, Social Consequence, and Reputation",
    body: "The social pressure is the richest ore. Reputation, class, family opinion, marriage, and public judgment can make every gesture dangerous. The women must not merely be decorated by the plot; they must exert pressure upon it."
  },
  carrington: {
    initials: "W.C.",
    title: "Mr. William Carrington",
    role: "Director of Moral Drama / Ethical Conflict and Character Judgment",
    body: "A story without a moral wound is only movement. This material needs a choice that exposes character under pressure. The final action must judge someone plainly: mercy, betrayal, sacrifice, confession, duty, or cowardice."
  },
  vane: {
    initials: "A.V.",
    title: "Miss Anita Vane",
    role: "Director of Modern Audiences / Wit, Pace, and Entertainment",
    body: "I am interested if the property can move. The premise needs pace, bright reversals, and enough wit to keep the audience leaning forward between the heavy blows. Commercial appeal is not vulgarity; it is rhythm."
  },
  sterling: {
    initials: "J.S.",
    title: "Miss June Sterling",
    role: "Director of Romance and Destiny / Epic Emotion and Star Vehicles",
    body: "The romance must feel inevitable and inconvenient. I want destiny, longing, sacrifice, and a part large enough for a star to suffer beautifully. If love changes the heroine's fate rather than merely rewarding her, there is photoplay promise."
  },
  thorncroft: {
    initials: "B.T.",
    title: "Miss Beulah Thorncroft",
    role: "Director of Historical and Moral Pressure / Consequence, Duty, and Stakes",
    body: "Actions must carry costs. The property must justify development by making duty heavier than comfort and consequence sharper than atmosphere. Someone must lose something that cannot be easily replaced."
  }
};

const executiveVerdicts = {
  treatments: {
    type: "treatments",
    stamp: "Send to Treatments",
    className: "final-stamp final-stamp--treatments",
    quote: "This has a heart, a wound, and a house big enough to echo with both. Send it to treatments.",
    action: "Send to the Treatment Room",
    href: "treatment-room.html"
  },
  reconference: {
    type: "reconference",
    stamp: "Development in Progress",
    className: "final-stamp final-stamp--reconference",
    quote: "The photoplay blueprint is taking shape. Complete the active development stage before moving forward.",
    action: "Open Development Docket",
    href: "#reconference-workshop"
  },
  paused: {
    type: "paused",
    stamp: "Development Paused",
    className: "final-stamp final-stamp--wastebasket",
    quote: "The file remains alive, but the writers require additional source material before development can continue.",
    action: "Return to the Scenario Desk",
    href: "scenario-desk.html"
  }
};

const propertyTitle = document.querySelector("#property-title");
let activePropertyKey = "";
let reconferenceCount = 0;
let activeExecutiveVerdict = "treatments";

function makeConferenceVerdicts(writerKeys) {
  return writerKeys.map((key, index) => {
    const writer = photoplaywrightRoster[key] || photoplaywrightRoster.marchmont;
    const nextWriter = writerKeys[index + 1]
      ? photoplaywrightRoster[writerKeys[index + 1]]
      : null;

    return {
      key,
      initials: writer.initials,
      next: nextWriter ? `Consult with ${nextWriter.title} ->` : "Convene the Conference ->",
      title: writer.title,
      role: writer.role,
      body: writer.body
    };
  });
}

function stableHash(value) {
  return String(value || "").split("").reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }, 0);
}

function weightedConferenceWriters(property = {}) {
  const text = [
    property.title,
    property.sourceType,
    property.logline,
    property.notes,
    property.readerSynopsis,
    property.keyDramaticSequences,
    property.characterArchetypes
  ].join(" ").toLowerCase();
  const seed = Math.abs(stableHash(property.propertyId || property.title || text));
  const scores = {
    marchmont: 12,
    fairchild: 4,
    ashcombe: 4,
    carrington: 4,
    vane: 4,
    sterling: 4,
    thorncroft: 4
  };

  if (/romance|love|marriage|destiny|heart|longing|sacrifice|kiss/.test(text)) scores.sterling += 8;
  if (/woman|women|society|class|reputation|family|heiress|matron|social/.test(text)) scores.ashcombe += 8;
  if (/moral|guilt|sin|confession|betrayal|duty|judgment|ethical/.test(text)) scores.carrington += 8;
  if (/history|war|inheritance|legacy|consequence|stakes|redemption|cost/.test(text)) scores.thorncroft += 8;
  if (/comedy|wit|satire|comic|pace|entertainment|modern|flapper/.test(text)) scores.vane += 8;
  if (/suffering|sympathy|mother|child|wound|reconciliation|grief/.test(text)) scores.fairchild += 8;

  return Object.keys(scores)
    .map((key, index) => ({
      key,
      score: scores[key] + ((seed + index * 7) % 5)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.key);
}

function configureConferenceFromProperty(property = {}) {
  activeConferenceProperty = property;
  const sourceText = [
    property.title,
    property.sourceType,
    property.logline,
    property.notes,
    property.readerSynopsis,
    property.keyDramaticSequences,
    property.characterArchetypes
  ].join(" ").toLowerCase();

  activeConferenceWriterKeys = weightedConferenceWriters(property);
  activePhotoplaywrightVerdicts = makeConferenceVerdicts(activeConferenceWriterKeys);

  const score = Number(String(property.suitabilityScore || "").match(/\d+/)?.[0] || 0);
  const needsRepair = /weak|unclear|underdeveloped|thin|confusing|needs|repair|reconference|failed/.test(sourceText);
  activeConferenceDecision = (score && score < 55) || needsRepair ? "reconference" : "treatments";
}

function parseSavedConference(property) {
  if (!property || !property.conferenceJson) return null;
  try {
    return JSON.parse(property.conferenceJson);
  } catch (error) {
    return null;
  }
}

function normalizeConferenceDecision(value) {
  const cleaned = String(value || "").toLowerCase();
  if (cleaned.includes("ready") || cleaned.includes("treatment")) return "treatments";
  if (cleaned.includes("continue") || cleaned.includes("development") || cleaned.includes("reconference") || cleaned.includes("rewrite") || cleaned.includes("repair")) return "reconference";
  return "treatments";
}

function loadPropertyPacket(propertyId, sections = []) {
  return new Promise((resolve, reject) => {
    const callbackName = `scenarioPropertyPacket_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Property packet request timed out."));
    }, 30000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      if (!payload?.ok || !payload?.property) {
        loadLedgerProperties()
          .then((ledger) => {
            const fallback = (ledger?.properties || []).find((item) =>
              String(item.propertyId || "").toLowerCase() === String(propertyId || "").toLowerCase()
            );
            if (!fallback) throw new Error(payload?.error || "The private property packet was unavailable.");
            resolve(fallback);
          })
          .catch(reject);
        return;
      }
      resolve(payload.property);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Property packet request failed."));
    };
    script.src = `${scenarioBackendUrl}?action=propertyPacket&propertyId=${encodeURIComponent(propertyId)}&sections=${encodeURIComponent(sections.join(","))}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

const stagedDevelopmentNames = [
  "Property Examination",
  "Theme Determination",
  "Character Test",
  "Situation Test",
  "Plot of Action",
  "Synopsis",
  "Scenario Department Conference",
  "Adaptation Analysis",
  "Scenario Sequences"
];

function isStagedDevelopmentPacket(payload) {
  return Number(payload?.workflowVersion) >= 2 && payload?.stagePackets && typeof payload.stagePackets === "object";
}

function developmentStageKey(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function activeDevelopmentStagePacket(payload) {
  if (!isStagedDevelopmentPacket(payload) || !payload.activeStage) return {};
  return payload.stagePackets[developmentStageKey(payload.activeStage)] || {};
}

function renderStagedDevelopment(payload) {
  if (!isStagedDevelopmentPacket(payload)) return;
  const workflow = document.querySelector("#development-workflow");
  const rail = document.querySelector("#development-rail");
  const title = document.querySelector("#development-stage-title");
  const summary = document.querySelector("#development-stage-summary");
  const blueprint = document.querySelector("#development-blueprint");
  const records = document.querySelector("#development-stage-records");
  const decisions = document.querySelector("#development-decisions");
  const legacy = document.querySelector("#legacy-conference-notes");
  if (!workflow || !rail || !title || !summary || !blueprint || !records) return;

  const completed = new Set(payload.completedStages || []);
  const provisional = new Set(payload.provisionalStages || []);
  const active = payload.activeStage || "";
  const activePacket = activeDevelopmentStagePacket(payload);
  workflow.hidden = false;
  title.textContent = active || "Development Blueprint Complete";
  summary.textContent = activePacket.completionSummary || payload.readinessSummary || payload.quote || "The writers are shaping the active stage.";

  rail.innerHTML = stagedDevelopmentNames.map((stage, index) => {
    const state = completed.has(stage) ? "is-complete" : provisional.has(stage) ? "is-provisional" : stage === active ? "is-active" : "is-upcoming";
    const label = completed.has(stage) ? "Filed" : provisional.has(stage) ? "Provisional" : stage === active ? "At Desk" : "Upcoming";
    return `<button type="button" class="development-rail__stage ${state}" data-development-stage="${escapeHtml(stage)}" ${completed.has(stage) ? "" : "disabled"}>
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(stage)}</strong>
      <small>${label}</small>
    </button>`;
  }).join("");

  const anchorLabels = {
    dramaticPromise: "Dramatic Promise",
    centralWound: "Central Wound",
    theme: "Theme",
    opposingForce: "Opposing Force",
    spectacle: "Spectacle",
    emotionalPayoff: "Emotional Payoff"
  };
  blueprint.innerHTML = Object.entries(anchorLabels).map(([key, label]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <p>${escapeHtml(payload.developmentBlueprint?.[key] || "Still being determined.")}</p>
    </article>
  `).join("");

  if (decisions) {
    const decisionGroups = [
      ["Resolved Decisions", payload.resolvedDecisions || activePacket.resolvedDecisions || [], "is-resolved"],
      ["Unresolved Decisions", payload.unresolvedDecisions || activePacket.unresolvedDecisions || [], "is-unresolved"],
      ["Deferred Decisions", payload.deferredDecisions || activePacket.deferredDecisions || [], "is-deferred"],
      ["Newly Raised Decisions", payload.newlyRaisedDecisions || activePacket.newlyRaisedDecisions || [], "is-new"],
      ["Development Cautions", payload.developmentCautions || [], "is-deferred"]
    ];
    decisions.innerHTML = decisionGroups.map(([label, items, className]) => `
      <article class="development-decision-group ${className}">
        <h3>${escapeHtml(label)}</h3>
        ${items.length
          ? `<ul>${items.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.caution || item.label || item.id || "")}</li>`).join("")}</ul>`
          : "<p>None filed at this stage.</p>"}
      </article>
    `).join("");
  }

  records.innerHTML = (payload.completedStages || []).map((stage) => {
    const packet = payload.stagePackets[developmentStageKey(stage)] || {};
    return `<article class="development-stage-record">
      <div>
        <p class="eyebrow">Filed Development Stage</p>
        <h3>${escapeHtml(stage)}</h3>
        <p>${escapeHtml(packet.completionSummary || "This stage has been filed in the development blueprint.")}</p>
        ${Array.isArray(packet.adaptationLenses) && packet.adaptationLenses.length
          ? `<p><strong>Studio-inspired adaptation lenses:</strong> ${packet.adaptationLenses.map((lens) => escapeHtml(lens)).join(" ")}</p>`
          : ""}
        ${Array.isArray(packet.developmentCautions) && packet.developmentCautions.length
          ? `<div class="development-stage-cautions"><strong>Carried forward as cautions:</strong><ul>${packet.developmentCautions.map((item) => `<li>${escapeHtml(item.caution || item.label || "")}</li>`).join("")}</ul></div>`
          : ""}
        ${Array.isArray(packet.writers) && packet.writers.length
          ? `<details class="development-stage-responses"><summary>Read the writers' filed responses</summary>${packet.writers.map((writer) => `
              <article>
                <h4>${escapeHtml(writer.title || "Photoplaywright")}</h4>
                <p>${escapeHtml(writer.body || "Development response filed.")}</p>
                ${writer.suggestions ? `<p><strong>Advice carried forward:</strong> ${escapeHtml(writer.suggestions)}</p>` : ""}
              </article>
            `).join("")}</details>`
          : ""}
      </div>
      <button type="button" class="button button--small" data-reopen-development-stage="${escapeHtml(stage)}">Reopen This Stage</button>
    </article>`;
  }).join("");

  records.querySelectorAll("[data-reopen-development-stage]").forEach((button) => {
    button.addEventListener("click", async () => {
      const stageName = button.dataset.reopenDevelopmentStage;
      if (!window.confirm(`Reopen ${stageName}? Later development stages will become provisional until the writers review the consequences.`)) return;
      button.disabled = true;
      button.textContent = "Reopening Stage";
      try {
        const reopened = await requestConferenceVerdicts({ action: "reopenStage", stageName });
        if (!applyConferenceVerdicts(reopened)) throw new Error(reopened?.error || "The stage could not be reopened.");
        showExecutiveVerdict("reconference");
      } catch (error) {
        button.disabled = false;
        button.textContent = "Reopen This Stage";
      }
    });
  });

  if (legacy && payload.legacyConferenceNotes) {
    legacy.hidden = false;
    legacy.innerHTML = `
      <p class="eyebrow">Preliminary Conference Notes Preserved</p>
      <p>Earlier conference material remains filed as source notes. The staged development blueprint is now the authoritative Writers' Room record.</p>
    `;
  } else if (legacy) {
    legacy.hidden = true;
  }
}

function normalizeConferenceQuestions(payload) {
  const pendingQuestions = payload?.pendingReview?.questions || payload?.pendingReconference?.questions;
  const questions = Array.isArray(pendingQuestions) && pendingQuestions.length
    ? pendingQuestions
    : Array.isArray(payload && payload.reconferenceQuestions)
      ? payload.reconferenceQuestions
      : [];

  if (questions.length) {
    return questions.map((item, index) => ({
      id: item.id || `repair_${index + 1}`,
      label: item.label || `Conference Repair ${String(index + 1).padStart(2, "0")}`,
      prompt: item.prompt || item.question || "Clarify the repair demanded by the photoplaywrights.",
      placeholder: item.placeholder || "Enter the new dramatic material for the updated conference...",
      sourceConcernIds: item.sourceConcernIds || [],
      parentQuestionIds: item.parentQuestionIds || [],
      remainingGap: item.remainingGap || ""
    }));
  }

  return [
    {
      id: "repair_structure",
      label: "Structural Repair",
      prompt: "What new action makes the central dramatic problem clearer and harder to avoid?",
      placeholder: "Describe the new turn, discovery, deadline, or public pressure..."
    },
    {
      id: "repair_emotion",
      label: "Human Repair",
      prompt: "What new wound, romance, duty, or personal tie gives the audience someone to care about?",
      placeholder: "Describe the emotional cost or relationship pressure..."
    },
    {
      id: "repair_spectacle",
      label: "Visual Repair",
      prompt: "What new visual sequence makes this property more playable as a photoplay?",
      placeholder: "Describe the image, chase, crowd, storm, confrontation, or public moment..."
    }
  ];
}

function normalizeCurrentConferenceQuestions(payload) {
  const stagedDocket = activeDevelopmentStagePacket(payload)?.docket;
  if (Array.isArray(stagedDocket) && stagedDocket.length) {
    return stagedDocket.map((item, index) => ({
      id: item.id || `development_${index + 1}`,
      label: item.label || `Development Question ${String(index + 1).padStart(2, "0")}`,
      prompt: item.prompt || item.question || "Settle this development decision.",
      placeholder: item.placeholder || "Describe the screen decision the writers should carry forward.",
      sourceConcernIds: item.sourceConcernIds || [],
      parentQuestionIds: item.parentQuestionIds || [],
      remainingGap: item.remainingGap || ""
    }));
  }
  const questions = Array.isArray(payload && payload.reconferenceQuestions)
    ? payload.reconferenceQuestions
    : [];

  if (questions.length) {
    return questions.map((item, index) => ({
      id: item.id || `repair_${index + 1}`,
      label: item.label || `Conference Repair ${String(index + 1).padStart(2, "0")}`,
      prompt: item.prompt || item.question || "Clarify the repair demanded by the photoplaywrights.",
      placeholder: item.placeholder || "Enter the new dramatic material for the updated conference...",
      sourceConcernIds: item.sourceConcernIds || []
    }));
  }

  return normalizeConferenceQuestions(payload);
}

function normalizeConferenceAnswers(payload) {
  const raw = payload?.pendingReview?.answers || payload?.pendingReconference?.answers || payload?.reconferenceAnswers;
  if (!raw) return {};
  if (!Array.isArray(raw) && typeof raw === "object") return raw;
  if (!Array.isArray(raw)) return {};
  return raw.reduce((answers, item) => {
    if (item && item.id) answers[item.id] = item.answer || "";
    return answers;
  }, {});
}

function normalizeReconferenceCount(payload, fallback = 0) {
  const explicitCount = Number(payload?.reconferenceCount);
  if (Number.isFinite(explicitCount) && explicitCount > 0) return explicitCount;

  const history = Array.isArray(payload?.reconferenceHistory) ? payload.reconferenceHistory : [];
  const historyRounds = history
    .map((entry) => Number(entry?.round))
    .filter((round) => Number.isFinite(round) && round > 0);
  if (historyRounds.length) return Math.max(...historyRounds);

  const pendingRound = Number(payload?.pendingReconference?.round);
  if (payload?.reviewStatus === "under_review" && Number.isFinite(pendingRound) && pendingRound > 0) {
    return pendingRound;
  }

  const questionRound = Number(payload?.questionRound);
  if (Number.isFinite(questionRound) && questionRound > 1) return questionRound - 1;

  return Math.max(0, Number(fallback) || 0);
}

function normalizeDeferredConferenceAnswers(payload) {
  const raw = payload?.pendingReview?.answers || [];
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((item) => item?.deferred === true).map((item) => item.id));
}

function conferenceQuestionRound(payload) {
  return Math.max(1, Number(payload?.questionRound || payload?.pendingReconference?.round || payload?.reconferenceCount || 1) || 1);
}

function renderFiledReconferenceHistory(payload, mode = "questions") {
  if (!reconferenceFeedback) return;
  if (isStagedDevelopmentPacket(payload)) {
    const history = Array.isArray(payload.developmentHistory) ? payload.developmentHistory : [];
    const pending = payload.pendingReview;
    const blocks = history.map((entry) => {
      const questions = Array.isArray(entry.questions) ? entry.questions : [];
      const answers = Array.isArray(entry.answers)
        ? Object.fromEntries(entry.answers.map((answer) => [answer.id, answer.answer || ""]))
        : (entry.answers || {});
      const deferredIds = new Set(Array.isArray(entry.answers)
        ? entry.answers.filter((answer) => answer?.deferred === true).map((answer) => answer.id)
        : []);
      return `<div>
        <h3>${escapeHtml(entry.stageName || "Development Stage")} - Answers Filed</h3>
        ${questions.map((question) => `
          <article class="analysis-card">
            <h3>${escapeHtml(question.label || question.id || "Development Question")}</h3>
            <p>${escapeHtml(question.prompt || "")}</p>
            <blockquote>${deferredIds.has(question.id) ? "Decision deferred for a later pass." : escapeHtml(answers[question.id] || "No answer was filed.")}</blockquote>
          </article>
        `).join("")}
        ${entry.note ? `<p><strong>Additional material:</strong> ${escapeHtml(entry.note)}</p>` : ""}
      </div>`;
    });
    if (mode === "under_review" && pending) {
      blocks.push(`<div>
        <h3>${escapeHtml(pending.stageName || payload.activeStage)} - Answers Filed</h3>
        <p>The writers have the submitted screen decisions. No updated judgment has been written yet.</p>
      </div>`);
    }
    if (!blocks.length) {
      blocks.push(`<div><h3>${escapeHtml(payload.activeStage || "Development Docket")}</h3><p>Marchmont has consolidated the unresolved points from the writers' memoranda below.</p></div>`);
    }
    reconferenceFeedback.hidden = false;
    reconferenceFeedback.innerHTML = blocks.join("");
    return;
  }
  const history = Array.isArray(payload?.reconferenceHistory) ? payload.reconferenceHistory : [];
  const pending = payload?.pendingReconference;
  const blocks = [];

  history.forEach((entry) => {
    const questions = Array.isArray(entry.questions) ? entry.questions : [];
    const answers = entry.answers || {};
    const answerHtml = questions.map((question) => `
      <div class="analysis-card">
        <h3>${escapeHtml(question.label || question.id || "Filed Question")}</h3>
        <p>${escapeHtml(question.prompt || "")}</p>
        <blockquote>${escapeHtml(answers[question.id] || "No answer was filed for this question.")}</blockquote>
      </div>
    `).join("");
    blocks.push(`
      <div>
        <h3>Development Answers Filed</h3>
        ${answerHtml || "<p>Prior development material is filed in the ledger.</p>"}
        ${entry.note ? `<p><strong>General note:</strong> ${escapeHtml(entry.note)}</p>` : ""}
      </div>
    `);
  });

  if (mode === "under_review" && pending) {
    blocks.push(`
      <div>
        <h3>Development Answers Filed</h3>
        <p>The writers have the added material shown below. Their new decision has not been written yet.</p>
        ${pending.note ? `<p><strong>General note:</strong> ${escapeHtml(pending.note)}</p>` : ""}
      </div>
    `);
  }

  if (!blocks.length && mode === "questions") {
    blocks.push(`
      <div>
        <h3>Development Questions</h3>
        <p>The photoplaywrights have found promise in the material, but they need more specific dramatic ammunition before they can advance it.</p>
      </div>
    `);
  }

  reconferenceFeedback.hidden = false;
  reconferenceFeedback.innerHTML = blocks.join("");
}

function renderReconferenceQuestions(payload) {
  const container = document.querySelector("#reconference-questions");
  if (!container) return;
  const questions = payload?.reviewStatus === "under_review"
    ? normalizeConferenceQuestions(payload)
    : normalizeCurrentConferenceQuestions(payload);
  const answers = payload?.reviewStatus === "under_review" ? normalizeConferenceAnswers(payload) : {};
  const deferred = payload?.reviewStatus === "under_review" ? normalizeDeferredConferenceAnswers(payload) : new Set();
  container.innerHTML = questions.map((question) => `
    <fieldset class="development-question">
      <label>
      ${escapeHtml(question.label)}
      <p>${escapeHtml(question.prompt)}</p>
      ${question.remainingGap ? `<p class="development-question__gap"><strong>Remaining gap:</strong> ${escapeHtml(question.remainingGap)}</p>` : ""}
      ${Array.isArray(question.sourceConcernIds) && question.sourceConcernIds.length
        ? `<small>Drawn from concerns: ${question.sourceConcernIds.map((id) => escapeHtml(id)).join(", ")}</small>`
        : ""}
      ${Array.isArray(question.parentQuestionIds) && question.parentQuestionIds.length
        ? `<small>Builds on questions: ${question.parentQuestionIds.map((id) => escapeHtml(id)).join(", ")}</small>`
        : ""}
      <textarea data-reconference-question-id="${escapeHtml(question.id)}" placeholder="${escapeHtml(question.placeholder)}">${escapeHtml(answers[question.id] || "")}</textarea>
      </label>
      <label class="development-question__defer">
        <input type="checkbox" data-defer-question-id="${escapeHtml(question.id)}" ${deferred.has(question.id) ? "checked" : ""} />
        Defer this decision
      </label>
    </fieldset>
  `).join("");
  container.querySelectorAll("[data-reconference-question-id], [data-defer-question-id]").forEach((node) => {
    node.addEventListener("input", () => {
      const fieldset = node.closest(".development-question");
      fieldset?.classList.remove("has-filing-error");
      fieldset?.querySelector(".development-question__error")?.remove();
      clearDevelopmentFilingError();
    });
  });
  if (reconferenceNote) {
    reconferenceNote.value = payload?.reviewStatus === "under_review"
      ? (payload?.pendingReview?.note || payload?.pendingReconference?.note || payload?.reconferenceNotes || "")
      : "";
    reconferenceNote.placeholder = "Add any general note the writers should carry into this stage review...";
  }
}

function collectReconferenceAnswers() {
  const deferredIds = new Set(Array.from(document.querySelectorAll("[data-defer-question-id]"))
    .filter((node) => node.checked)
    .map((node) => node.dataset.deferQuestionId || ""));
  return Array.from(document.querySelectorAll("[data-reconference-question-id]")).map((node) => ({
    id: node.dataset.reconferenceQuestionId || "",
    answer: node.value || "",
    deferred: deferredIds.has(node.dataset.reconferenceQuestionId || "")
  }));
}

function validateDevelopmentAnswers(answers) {
  const incomplete = answers.filter((item) => !String(item.answer || "").trim() && item.deferred !== true);
  return incomplete.map((item) => item.id);
}

function makeDevelopmentSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `development-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function collectReconferenceNote() {
  return reconferenceNote ? reconferenceNote.value || "" : "";
}

function requestConferenceVerdicts(reconferenceNotes) {
  return new Promise((resolve, reject) => {
    if (!/^SPC-/i.test(activePropertyKey)) {
      resolve(null);
      return;
    }

    const callbackName = `scenarioConference_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Conference request timed out."));
    }, 90000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Conference request failed."));
    };

    const writers = activeConferenceWriterKeys.join(",");
    const notes = reconferenceNotes ? `&reconferenceNotes=${encodeURIComponent(JSON.stringify(reconferenceNotes))}` : "";
    script.src = `${scenarioBackendUrl}?action=runConference&propertyId=${encodeURIComponent(activePropertyKey)}&writers=${encodeURIComponent(writers)}${notes}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function requestConferenceSubmissionStatus(submissionId) {
  return new Promise((resolve, reject) => {
    const callbackName = `scenarioConferenceReceipt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("The conference clerk did not answer the receipt inquiry."));
    }, 30000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("The conference receipt inquiry failed."));
    };
    script.src = `${scenarioBackendUrl}?action=conferenceSubmissionStatus&propertyId=${encodeURIComponent(activePropertyKey)}&submissionId=${encodeURIComponent(submissionId)}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function waitForFiledConferencePacket(submissionId) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const poll = () => {
      requestConferenceSubmissionStatus(submissionId)
        .then((payload) => {
          if (payload?.status === "error" || payload?.ok === false) {
            reject(new Error(payload?.error || "The conference clerk could not file the answers."));
            return;
          }
          if (payload?.status === "filed" && payload?.packet) {
            resolve(payload.packet);
            return;
          }
          if (Date.now() - startedAt > 120000) {
            reject(new Error("The writers did not file this answer receipt before the office clock ran out."));
            return;
          }
          window.setTimeout(poll, 4000);
        })
        .catch((error) => {
          if (Date.now() - startedAt > 120000) {
            reject(error);
            return;
          }
          window.setTimeout(poll, 4000);
        });
    };

    poll();
  });
}

async function postConferenceRepairAnswers(reconferenceNotes) {
  const submissionId = reconferenceNotes?.submissionId || makeDevelopmentSubmissionId();
  reconferenceNotes.submissionId = submissionId;
  await fetch(scenarioBackendUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "runConference",
      propertyId: activePropertyKey,
      writers: activeConferenceWriterKeys.join(","),
      reconferenceNotes
    })
  });
  return waitForFiledConferencePacket(submissionId);
}

function reviewDueDate(payload) {
  const dueValue = payload?.pendingReview?.reviewDueAt || payload?.reviewDueAt;
  const due = dueValue ? new Date(dueValue) : null;
  return due && !Number.isNaN(due.getTime()) ? due : null;
}

function conferenceServerNow(payload) {
  const serverValue = payload?.serverNow || payload?.pendingReview?.serverNow;
  const serverDate = serverValue ? new Date(serverValue) : null;
  return serverDate && !Number.isNaN(serverDate.getTime()) ? serverDate : null;
}

function reviewRemainingMs(payload) {
  const due = reviewDueDate(payload);
  const serverNow = conferenceServerNow(payload);
  const now = serverNow ? serverNow.getTime() + (Date.now() - conferencePacketReceivedAt) : Date.now();
  return due ? Math.max(0, due.getTime() - now) : 0;
}

function formatReviewRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function showReconferenceQuestionsState(payload) {
  if (!reconferenceWorkshop) return;
  clearInterval(reconferenceInterval);
  reconferenceWorkshop.hidden = false;
  const heading = reconferenceWorkshop.querySelector("h2");
  if (heading) heading.textContent = isStagedDevelopmentPacket(payload)
    ? `${payload.activeStage || "Development"} Docket`
    : "Development Docket";
  renderFiledReconferenceHistory(payload, "questions");
  if (reconferenceTimer) {
    reconferenceTimer.textContent = `${String(payload?.reviewMinutes || 0).padStart(2, "0")}:00`;
    const timerPanel = reconferenceTimer.closest(".countdown");
    if (timerPanel) timerPanel.hidden = true;
  }
  renderDevelopmentFilingReceipt(payload, false);
  clearDevelopmentFilingError();
  const calculation = document.querySelector("#review-calculation");
  if (calculation) calculation.textContent = payload?.reviewCalculation || "6 minutes per filed question, plus a visible 0, 6, or 12 minute complexity allowance.";
  renderReconferenceQuestions(payload);
  document.querySelectorAll("[data-reconference-question-id]").forEach((node) => {
    node.disabled = false;
  });
  document.querySelectorAll("[data-defer-question-id]").forEach((node) => {
    node.disabled = false;
  });
  if (reconferenceNote) reconferenceNote.disabled = false;
  if (updatedConference) {
    updatedConference.hidden = false;
    updatedConference.disabled = false;
    updatedConference.textContent = "Submit Stage Answers to the Writers";
  }
}

function formatConferenceDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function renderDevelopmentFilingReceipt(payload, visible = true) {
  const receipt = document.querySelector("#development-filing-receipt");
  if (!receipt) return;
  const pending = payload?.pendingReview;
  if (!visible || !pending) {
    receipt.hidden = true;
    receipt.innerHTML = "";
    return;
  }
  const timing = pending.timing || {};
  receipt.hidden = false;
  receipt.innerHTML = `
    <p class="eyebrow">Answers Filed</p>
    <h3>The development docket is in the writers' hands.</h3>
    <dl>
      <div><dt>Filed</dt><dd>${escapeHtml(formatConferenceDate(pending.filedAt || pending.reviewStartedAt))}</dd></div>
      <div><dt>Questions</dt><dd>${escapeHtml(timing.questionCount ?? pending.questions?.length ?? 0)}</dd></div>
      <div><dt>Complexity</dt><dd>${escapeHtml(timing.complexityMinutes ?? 0)} minutes</dd></div>
      <div><dt>Review Due</dt><dd>${escapeHtml(formatConferenceDate(pending.reviewDueAt))}</dd></div>
    </dl>
  `;
}

function clearDevelopmentFilingError() {
  const errorNode = document.querySelector("#development-filing-error");
  if (!errorNode) return;
  errorNode.hidden = true;
  errorNode.textContent = "";
}

function showDevelopmentFilingError(message) {
  const errorNode = document.querySelector("#development-filing-error");
  if (!errorNode) return;
  errorNode.hidden = false;
  errorNode.textContent = message;
}

function markIncompleteDevelopmentQuestions(ids) {
  const missing = new Set(ids);
  document.querySelectorAll(".development-question").forEach((fieldset) => {
    const input = fieldset.querySelector("[data-reconference-question-id]");
    const isMissing = missing.has(input?.dataset.reconferenceQuestionId || "");
    fieldset.classList.toggle("has-filing-error", isMissing);
    let message = fieldset.querySelector(".development-question__error");
    if (isMissing && !message) {
      message = document.createElement("p");
      message.className = "development-question__error";
      message.textContent = "Answer this question or mark the decision Deferred.";
      fieldset.appendChild(message);
    } else if (!isMissing && message) {
      message.remove();
    }
  });
}

async function openFiledConferenceReview() {
  if (conferenceReviewOpening) return;
  conferenceReviewOpening = true;
  if (updatedConference) {
    updatedConference.disabled = true;
    updatedConference.textContent = "Opening Updated Conference...";
  }
  clearDevelopmentFilingError();
  try {
    const payload = await requestConferenceVerdicts();
    if (!applyConferenceVerdicts(payload)) throw new Error(payload?.error || "Conference response was not OK.");
    conferencePacketReceivedAt = Date.now();
    photoplaywrightIndex = 0;
    renderWriterCallboard();
    showConferenceSelectionPrompt("The timed review is filed. Consult with any photoplaywright below to review the updated memoranda.");
    showExecutiveVerdict(decideExecutiveVerdict());
  } catch (error) {
    showDevelopmentFilingError(error?.message || "The writers' updated conference could not be opened.");
    if (updatedConference) {
      updatedConference.hidden = false;
      updatedConference.disabled = false;
      updatedConference.textContent = "Retry Opening Review";
    }
  } finally {
    conferenceReviewOpening = false;
  }
}

function showReconferenceUnderReviewState(payload) {
  if (!reconferenceWorkshop || !reconferenceTimer) return;
  reconferenceWorkshop.hidden = false;
  const heading = reconferenceWorkshop.querySelector("h2");
  if (heading) heading.textContent = isStagedDevelopmentPacket(payload)
    ? `${payload.activeStage || payload.pendingReview?.stageName || "Development"} Answers Filed`
    : "Development Answers Filed";
  const timerPanel = reconferenceTimer.closest(".countdown");
  if (timerPanel) timerPanel.hidden = false;
  renderFiledReconferenceHistory(payload, "under_review");
  renderReconferenceQuestions(payload);
  document.querySelectorAll("[data-reconference-question-id]").forEach((node) => {
    node.disabled = true;
  });
  document.querySelectorAll("[data-defer-question-id]").forEach((node) => {
    node.disabled = true;
  });
  if (reconferenceNote) reconferenceNote.disabled = true;
  const calculation = document.querySelector("#review-calculation");
  if (calculation) calculation.textContent = payload?.reviewCalculation || payload?.pendingReview?.timing?.explanation || "";
  renderDevelopmentFilingReceipt(payload, true);
  clearDevelopmentFilingError();

  const tick = () => {
    const remaining = reviewRemainingMs(payload);
    reconferenceTimer.textContent = formatReviewRemaining(remaining);
    if (updatedConference) {
      updatedConference.hidden = remaining > 0;
      updatedConference.disabled = remaining > 0;
      updatedConference.textContent = remaining > 0
        ? "Writers Reviewing Development Notes"
        : "Open Updated Conference";
    }
    if (remaining <= 0) {
      clearInterval(reconferenceInterval);
      openFiledConferenceReview();
    }
  };

  clearInterval(reconferenceInterval);
  tick();
  reconferenceInterval = window.setInterval(tick, 1000);
}

function applyConferenceVerdicts(payload) {
  if (!payload || !payload.ok) return false;
  conferencePacketReceivedAt = Date.now();
  if (isStagedDevelopmentPacket(payload)) renderStagedDevelopment(payload);
  if (!Array.isArray(payload.writers)) payload.writers = [];

  activeConferencePayload = payload;
  reconferenceCount = normalizeReconferenceCount(payload, reconferenceCount);
  const writers = payload.writers.slice(0, 4);
  activePhotoplaywrightVerdicts = writers.map((writer, index) => {
    const nextWriter = writers[index + 1];
    const fallback = photoplaywrightRoster[writer.key] || {};

    return {
      key: writer.key || fallback.key,
      initials: writer.initials || fallback.initials || "S.D.",
      next: nextWriter ? `Consult with ${nextWriter.title || "the next photoplaywright"} ->` : "Convene the Conference ->",
      title: writer.title || fallback.title || "Scenario Department Photoplaywright",
      role: writer.role || fallback.role || "Photoplay Development Department",
      body: [
        writer.body || writer.verdict || fallback.body || "The photoplaywright has filed development feedback.",
        writer.suggestions ? `<strong>Suggested development:</strong> ${writer.suggestions}` : "",
        writer.unresolvedConcerns ? `<strong>Still to settle:</strong> ${writer.unresolvedConcerns}` : "",
        Array.isArray(writer.concernIds) && writer.concernIds.length
          ? `<strong>Concern references:</strong> ${writer.concernIds.map((id) => escapeHtml(id)).join(", ")}`
          : "",
        Array.isArray(writer.proposedQuestions) && writer.proposedQuestions.length
          ? `<strong>Questions proposed for Marchmont's docket:</strong> ${writer.proposedQuestions.map((question) => escapeHtml(question.prompt || "")).join(" ")}`
          : ""
      ].filter(Boolean).join("<br><br>")
    };
  });

  if (payload.statusLabel === "Treatment Ready") {
    activeConferenceDecision = "treatments";
  } else if (isStagedDevelopmentPacket(payload)) {
    activeConferenceDecision = "reconference";
  } else if (payload.developmentStatus || payload.decision || payload.finalDecision) {
    activeConferenceDecision = normalizeConferenceDecision(payload.developmentStatus || payload.decision || payload.finalDecision);
  }

  if (payload.quote && executiveVerdicts[activeConferenceDecision]) {
    executiveVerdicts[activeConferenceDecision].quote = payload.pauseExplanation || payload.readinessSummary || payload.quote;
  }

  if (activeConferenceDecision === "reconference" && normalizeCurrentConferenceQuestions(payload).length) {
    if (payload.reviewStatus === "under_review") {
      showReconferenceUnderReviewState(payload);
    } else {
      showReconferenceQuestionsState(payload);
    }
  } else if (reconferenceWorkshop) {
    reconferenceWorkshop.hidden = true;
  }

  return true;
}

function renderSavedConferenceState(property) {
  if (!activePropertyKey || !/^SPC-/i.test(activePropertyKey)) return false;
  const saved = parseSavedConference(property);
  if (!saved) return false;
  if (!isStagedDevelopmentPacket(saved)) {
    if (readerVerdict) {
      readerVerdict.innerHTML = `
        <p class="eyebrow">Preliminary Conference Notes Preserved</p>
        <h3>The property is ready for the new staged examination.</h3>
        <p>Earlier conference memoranda will be retained as source notes when the development file is opened.</p>
      `;
    }
    if (conferenceHeading) conferenceHeading.textContent = "Awaiting staged Property Examination.";
    if (sendLetter) {
      sendLetter.textContent = "Begin Property Examination";
      sendLetter.disabled = false;
    }
    return false;
  }
  if (!applyConferenceVerdicts(saved)) return false;

  readerRoster?.classList.remove("is-locked");
  if (sendLetter) {
    sendLetter.textContent = "Development File Open";
    sendLetter.disabled = true;
  }

  photoplaywrightIndex = 0;
  renderWriterCallboard();
  if (saved.reviewStatus === "under_review") {
    showConferenceSelectionPrompt("The writers are reviewing the filed repairs. The updated verdict remains sealed until the review clock expires.");
    if (finalEvaluation) finalEvaluation.hidden = true;
    showReconferenceUnderReviewState(saved);
  } else {
    showConferenceSelectionPrompt("This development file is open. Consult with any photoplaywright below to review the active-stage memoranda.");
    showExecutiveVerdict(decideExecutiveVerdict());
  }

  if (activeConferenceDecision === "reconference") {
    if (saved.reviewStatus === "under_review") {
      showReconferenceUnderReviewState(saved);
    } else {
      showReconferenceQuestionsState(saved);
    }
  }

  return true;
}

if (propertyTitle) {
  activePropertyKey = new URLSearchParams(window.location.search).get("property") || "";
  if (activePropertyKey && !/^SPC-/i.test(activePropertyKey)) {
    activePhotoplaywrightVerdicts = activePropertyKey === "cathedral-clock"
      ? cathedralPhotoplaywrightVerdicts
      : defaultPhotoplaywrightVerdicts;
    const file = propertyFiles[activePropertyKey] || propertyFiles["dangerous-kisses"];
    document.querySelector("#property-kicker").textContent = file.kicker;
    propertyTitle.textContent = file.title;
    document.querySelector("#property-logline").textContent = file.logline;
    document.querySelector("#property-notes").innerHTML = `<strong>Submitter's Notes:</strong> ${file.notes}`;
    document.querySelector("#reader-name").textContent = file.reader;
    document.querySelector("#reader-synopsis").textContent = file.synopsis;
    document.querySelector("#sequence-list").innerHTML = file.sequences.map(([title, body, value]) => `
      <div class="analysis-card">
        <h3>${title}</h3>
        <p>${body}</p>
        <em>Dramatic value: ${value}</em>
      </div>
    `).join("");
    document.querySelector("#archetype-list").innerHTML = file.archetypes.map(([name, type, body]) => `
      <div class="analysis-card">
        <h3>${name}</h3>
        <em>${type}</em>
        <p>${body}</p>
      </div>
    `).join("");
  }
}

const sendLetter = document.querySelector("#send-letter");
const readerRoster = document.querySelector("#reader-roster");
const readerVerdict = document.querySelector("#reader-verdict");
const writerCallboard = document.querySelector("#writer-callboard");
const conferenceHeading = document.querySelector("#conference-heading");
const finalEvaluation = document.querySelector("#final-evaluation");
const finalStamp = document.querySelector("#final-stamp");
const finalQuote = document.querySelector("#final-quote");
const finalAction = document.querySelector("#final-action");
const reconferenceWorkshop = document.querySelector("#reconference-workshop");
const reconferenceTimer = document.querySelector("#reconference-timer");
const reconferenceFeedback = document.querySelector("#reconference-feedback");
const updatedConference = document.querySelector("#updated-conference");
const reconferenceNote = document.querySelector("#reconference-note");
const labelMoralPressure = document.querySelector("#label-moral-pressure");
const labelRomance = document.querySelector("#label-romance");
const labelSpectacle = document.querySelector("#label-spectacle");
let photoplaywrightIndex = 0;
let reconferenceInterval;
let conferencePacketReceivedAt = Date.now();
let conferenceReviewOpening = false;

if (sendLetter && !activePropertyKey) {
  sendLetter.disabled = true;
  sendLetter.textContent = "Awaiting Property Packet";
}

if (propertyTitle) {
  initWritersRoomSelector();
}

function renderWriterCallboard() {
  if (!writerCallboard) return;
  if (!Array.isArray(activePhotoplaywrightVerdicts) || !activePhotoplaywrightVerdicts.length) {
    writerCallboard.hidden = true;
    writerCallboard.innerHTML = "";
    return;
  }

  writerCallboard.innerHTML = activePhotoplaywrightVerdicts.map((verdict, index) => `
    <button
      type="button"
      class="button button--small ${index === photoplaywrightIndex && readerVerdict?.dataset.hasSelection === "true" ? "is-active" : ""}"
      data-writer-index="${index}">
      ${escapeHtml(verdict.title || `Photoplaywright ${index + 1}`)}
    </button>
  `).join("");

  writerCallboard.querySelectorAll("[data-writer-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.writerIndex || 0);
      renderPhotoplaywright(index);
    });
  });

  writerCallboard.hidden = false;
}

function showConferenceSelectionPrompt(message = "Replies have arrived. Consult with a photoplaywright to read the memorandum.") {
  if (!readerVerdict) return;
  readerVerdict.dataset.hasSelection = "false";
  readerVerdict.innerHTML = `
    <p class="eyebrow">Writers' Development Notes</p>
    <h3>Photoplaywright guidance on file</h3>
    <p>${escapeHtml(message)}</p>
  `;
}

function renderPhotoplaywright(index) {
  const verdict = activePhotoplaywrightVerdicts[index];
  if (!verdict || !readerVerdict || !conferenceHeading) return;

  photoplaywrightIndex = index;
  readerVerdict.dataset.hasSelection = "true";
  conferenceHeading.textContent = "Interested photoplaywrights have replied.";
  readerVerdict.innerHTML = `
    <p class="eyebrow">Photoplaywright Development Notes</p>
    <div class="verdict-card">
      <span class="verdict-card__seal">${verdict.initials}</span>
      <div>
        <h3>${verdict.title}</h3>
        <p class="verdict-card__role">${verdict.role}</p>
        <p>${verdict.body}</p>
      </div>
    </div>
  `;
  renderWriterCallboard();
}

function decideExecutiveVerdict() {
  if (activePropertyKey === "cathedral-clock") return "reconference";
  if (activePropertyKey === "glass-duchess") return "reconference";
  if (/^SPC-/i.test(activePropertyKey)) return activeConferenceDecision;
  return "treatments";
}

function showExecutiveVerdict(kind) {
  const verdict = executiveVerdicts[kind] || executiveVerdicts.treatments;
  activeExecutiveVerdict = verdict.type;
  if (!finalEvaluation || !finalStamp || !finalQuote || !finalAction) return;

  const actionHref = verdict.type === "treatments" && /^SPC-/i.test(activePropertyKey)
    ? `treatment-room.html?property=${encodeURIComponent(activePropertyKey)}`
    : verdict.href;

  finalStamp.textContent = verdict.stamp;
  finalStamp.className = verdict.className;
  finalQuote.textContent = verdict.quote;
  finalAction.textContent = verdict.action;
  finalAction.href = actionHref;
  finalEvaluation.hidden = false;
  if (conferenceHeading) {
    conferenceHeading.textContent = kind === "treatments"
      ? "The photoplay blueprint is complete."
      : "The writers are developing the active stage.";
  }
  finalEvaluation.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startReconferenceClock() {
  if (!reconferenceTimer || !reconferenceFeedback) return;
  clearInterval(reconferenceInterval);
  let remaining = 36;
  reconferenceFeedback.hidden = true;
  renderReconferenceQuestions(activeConferencePayload);
  if (labelMoralPressure) labelMoralPressure.childNodes[0].textContent = "New Moral Pressure ";
  if (labelRomance) labelRomance.childNodes[0].textContent = "Stronger Romance or Human Tie ";
  if (labelSpectacle) labelSpectacle.childNodes[0].textContent = "New Spectacle or Visual Sequence ";
  if (updatedConference) {
    updatedConference.disabled = true;
    updatedConference.textContent = "Awaiting Photoplaywright Notes";
  }
  reconferenceTimer.textContent = "36:00";
  reconferenceInterval = window.setInterval(() => {
    remaining -= 1;
    reconferenceTimer.textContent = `${String(remaining).padStart(2, "0")}:00`;
    if (remaining <= 0) {
      clearInterval(reconferenceInterval);
      reconferenceTimer.textContent = "00:00";
      reconferenceFeedback.hidden = false;
      if (updatedConference) {
        updatedConference.disabled = false;
        updatedConference.textContent = "Convene Updated Conference";
      }
    }
  }, 60000);
}

function showWritersRoomDeskMessage(message, detail) {
  if (propertyTitle) propertyTitle.textContent = message;
  const kicker = document.querySelector("#property-kicker");
  if (kicker) kicker.textContent = "Property Under Consideration";
  const logline = document.querySelector("#property-logline");
  if (logline) logline.textContent = detail || "Choose a property currently on the Writers' Room desk.";
  const notes = document.querySelector("#property-notes");
  if (notes) notes.innerHTML = "<strong>Submitter's Notes:</strong> No notes have been filed yet.";
  const readerName = document.querySelector("#reader-name");
  if (readerName) readerName.textContent = "Scenario reader assignment pending";
  const readerSynopsis = document.querySelector("#reader-synopsis");
  if (readerSynopsis) readerSynopsis.textContent = "The scenario reader is preparing the file.";
  const sequenceList = document.querySelector("#sequence-list");
  if (sequenceList) {
    sequenceList.innerHTML = `
      <div class="analysis-card">
        <h3>Sequence 01</h3>
        <p>Key dramatic sequences will appear here after the scenario reader has examined the material.</p>
      </div>
    `;
  }
  const archetypeList = document.querySelector("#archetype-list");
  if (archetypeList) {
    archetypeList.innerHTML = `
      <div class="analysis-card">
        <h3>Character 01</h3>
        <p>Character archetypes will appear here after the scenario reader has examined the material.</p>
      </div>
    `;
  }
  if (sendLetter) {
    sendLetter.disabled = true;
    sendLetter.textContent = "Awaiting Property Packet";
  }
  if (writerCallboard) {
    writerCallboard.hidden = true;
    writerCallboard.innerHTML = "";
  }
  if (finalEvaluation) finalEvaluation.hidden = true;
  if (reconferenceWorkshop) reconferenceWorkshop.hidden = true;
}

function showTreatmentDeskMessage(message, detail) {
  if (treatmentTitle) treatmentTitle.textContent = message;
  if (treatmentLogline) treatmentLogline.textContent = detail || "Choose a property currently on the Treatment desk.";
  if (officialTreatment) officialTreatment.hidden = true;
}

function showCarstairsDeskMessage(message, detail) {
  if (carstairsTitle) carstairsTitle.textContent = message;
  if (carstairsLogline) carstairsLogline.textContent = detail || "Choose a property currently on Carstairs' desk for executive review.";
  if (carstairsDossier) carstairsDossier.hidden = true;
  if (carstairsMemo) carstairsMemo.hidden = true;
  if (carstairsVerdict) carstairsVerdict.hidden = true;
  if (carstairsRewrite) carstairsRewrite.hidden = true;
  if (carstairsAppeal) carstairsAppeal.hidden = true;
  if (carstairsAppealForm) carstairsAppealForm.hidden = true;
  if (carstairsReasons) carstairsReasons.hidden = true;
}

function initWritersRoomSelector() {
  const tiles = document.querySelector("#writers-room-property-tiles");
  const empty = document.querySelector("#writers-room-property-empty");
  if (!tiles || !empty) return;

  loadLedgerProperties()
    .then((payload) => {
      if (!payload || !payload.ok) throw new Error("Ledger response was not OK.");
      const properties = payload.properties || [];
      const current = properties.find((item) =>
        String(item.propertyId || "").toLowerCase() === String(activePropertyKey || "").toLowerCase()
      );
      const currentIsValid = !activePropertyKey || roomPropertyEligibleForDirectLoad("writers", current);
      renderRoomPropertySelector("writers", {
        properties,
        currentPropertyId: activePropertyKey,
        currentIsValid,
        tilesSelector: "#writers-room-property-tiles",
        emptySelector: "#writers-room-property-empty",
        pageHref: "writers-room.html"
      });

      if (!activePropertyKey) {
        showWritersRoomDeskMessage("Select Property", "Choose a property currently on the Writers' Room desk.");
        return;
      }

      if (!current) {
        showWritersRoomDeskMessage("Property Not Found", "This property could not be found in the live ledger. Select another current file.");
        return;
      }

      if (!roomPropertyEligibleForDirectLoad("writers", current)) {
        showWritersRoomDeskMessage("Select Property", "This property is not presently on the Writers' Room desk. Select another current file.");
        return;
      }

    })
    .catch(() => {
      empty.hidden = false;
      empty.textContent = "The Writers' Room could not draw the desk ledger just now.";
    });
}

function initTreatmentRoomSelector() {
  const tiles = document.querySelector("#treatment-room-property-tiles");
  const empty = document.querySelector("#treatment-room-property-empty");
  if (!tiles || !empty) return;

  const currentKey = getTreatmentProperty();

  loadLedgerProperties()
    .then((payload) => {
      if (!payload || !payload.ok) throw new Error("Ledger response was not OK.");
      const properties = payload.properties || [];
      const current = properties.find((item) =>
        String(item.propertyId || "").toLowerCase() === String(currentKey || "").toLowerCase()
      );
      const currentIsValid = !currentKey || roomPropertyEligibleForDirectLoad("treatment", current);
      renderRoomPropertySelector("treatment", {
        properties,
        currentPropertyId: currentKey,
        currentIsValid,
        tilesSelector: "#treatment-room-property-tiles",
        emptySelector: "#treatment-room-property-empty",
        pageHref: "treatment-room.html"
      });

      if (!currentKey) {
        showTreatmentDeskMessage("Select Property", "Choose a property currently on the Treatment desk.");
        if (prepareTreatment) {
          prepareTreatment.disabled = true;
          prepareTreatment.textContent = "Awaiting Treatment Packet";
        }
        return;
      }

      if (!current) {
        showTreatmentDeskMessage("Property Not Found", "This property could not be found in the live ledger. Select another current file.");
        return;
      }

      if (!roomPropertyEligibleForDirectLoad("treatment", current)) {
        showTreatmentDeskMessage("Select Property", "This property is not presently on the Treatment desk. Select another current file.");
        if (prepareTreatment) {
          prepareTreatment.disabled = true;
          prepareTreatment.textContent = "Awaiting Treatment Packet";
        }
      }
    })
    .catch(() => {
      empty.hidden = false;
      empty.textContent = "The Treatment desk could not draw the ledger just now.";
    });
}

function initCarstairsSelector() {
  const tiles = document.querySelector("#carstairs-property-tiles");
  const empty = document.querySelector("#carstairs-property-empty");
  if (!tiles || !empty) return;

  const currentKey = getCarstairsProperty();

  loadLedgerProperties()
    .then((payload) => {
      if (!payload || !payload.ok) throw new Error("Ledger response was not OK.");
      const properties = payload.properties || [];
      const current = properties.find((item) =>
        String(item.propertyId || "").toLowerCase() === String(currentKey || "").toLowerCase()
      );
      const currentIsValid = !currentKey || roomPropertyEligibleForDirectLoad("carstairs", current);
      renderRoomPropertySelector("carstairs", {
        properties,
        currentPropertyId: currentKey,
        currentIsValid,
        tilesSelector: "#carstairs-property-tiles",
        emptySelector: "#carstairs-property-empty",
        pageHref: "carstairs-office.html"
      });

      if (!currentKey) {
        showCarstairsDeskMessage("Select Property for Evaluation", "Choose a property currently on Carstairs' desk for executive review.");
        return;
      }

      if (!current) {
        showCarstairsDeskMessage("Property Not Found", "This property could not be found in the live ledger. Select another current file.");
        return;
      }

      if (!roomPropertyEligibleForDirectLoad("carstairs", current)) {
        showCarstairsDeskMessage("Select Property for Evaluation", "This property is not presently on Carstairs' desk. Select another current file.");
      }
    })
    .catch(() => {
      empty.hidden = false;
      empty.textContent = "The executive ledger could not be drawn just now.";
    });
}

if (sendLetter && readerRoster && readerVerdict) {
  sendLetter.addEventListener("click", async () => {
    readerRoster.classList.remove("is-locked");
    if (writerCallboard) {
      writerCallboard.hidden = true;
      writerCallboard.innerHTML = "";
    }
    readerVerdict.innerHTML = `
      <p class="eyebrow">Writers' Development Notes</p>
      <h3>The development file is open.</h3>
      <p>The photoplaywrights are examining the raw material and preparing the first stage of the screen blueprint.</p>
    `;
    if (conferenceHeading) conferenceHeading.textContent = "The property is before the writing staff.";
    sendLetter.textContent = "Development File Open";
    sendLetter.disabled = true;

    if (/^SPC-/i.test(activePropertyKey)) {
      readerVerdict.innerHTML = `
        <p class="eyebrow">Writers' Development Notes</p>
        <h3>The conference letter is being answered.</h3>
        <p>The interested photoplaywrights are reading the filed synopsis and preparing property-specific memoranda.</p>
      `;

      try {
        const payload = await requestConferenceVerdicts();
        if (applyConferenceVerdicts(payload)) {
          if (conferenceHeading) conferenceHeading.textContent = "Active-stage memoranda received.";
          renderWriterCallboard();
          showConferenceSelectionPrompt("The active-stage memoranda are filed. Consult with a photoplaywright, then answer Marchmont's development docket.");
          showExecutiveVerdict(decideExecutiveVerdict());
          return;
        }
      } catch (error) {
        readerVerdict.innerHTML = `
          <p class="eyebrow">Writers' Development Notes</p>
          <h3>The conference clerk could not reach the upstairs line.</h3>
          <p>The room will proceed with its standing departmental notes until the live conference action is installed.</p>
        `;
      }
    }

    window.setTimeout(() => {
      photoplaywrightIndex = 0;
      renderWriterCallboard();
      showConferenceSelectionPrompt();
    }, 900);
  });
}

if (finalAction && reconferenceWorkshop) {
  finalAction.addEventListener("click", (event) => {
    if (activeExecutiveVerdict !== "reconference") return;
    event.preventDefault();
    showReconferenceQuestionsState(activeConferencePayload);
    reconferenceWorkshop.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (updatedConference) {
  updatedConference.addEventListener("click", async () => {
    if (/^SPC-/i.test(activePropertyKey)) {
      if (activeConferencePayload?.reviewStatus === "under_review") {
        if (reviewRemainingMs(activeConferencePayload) > 0) return;
        await openFiledConferenceReview();
        return;
      }

      updatedConference.disabled = true;
      updatedConference.textContent = "Filing Answers...";
      clearDevelopmentFilingError();
      markIncompleteDevelopmentQuestions([]);
      try {
        const answers = collectReconferenceAnswers();
        const incomplete = validateDevelopmentAnswers(answers);
        if (incomplete.length) {
          markIncompleteDevelopmentQuestions(incomplete);
          throw new Error("Answer or defer every highlighted development question before filing.");
        }
        const submissionId = makeDevelopmentSubmissionId();
        const questions = normalizeCurrentConferenceQuestions(activeConferencePayload).map((question) => ({
          id: question.id,
          label: question.label,
          prompt: question.prompt,
          sourceConcernIds: question.sourceConcernIds || [],
          parentQuestionIds: question.parentQuestionIds || [],
          remainingGap: question.remainingGap || ""
        }));
        const payload = await postConferenceRepairAnswers({
          submissionId,
          questions,
          answers,
          note: collectReconferenceNote(),
          activeStage: activeConferencePayload?.activeStage || "",
          questionRound: conferenceQuestionRound(activeConferencePayload),
          reconferenceCount: Math.max(conferenceQuestionRound(activeConferencePayload), reconferenceCount + 1)
        });
        if (!applyConferenceVerdicts(payload)) throw new Error("Conference response was not OK.");
        photoplaywrightIndex = 0;
        if (payload.reviewStatus === "under_review") {
          showConferenceSelectionPrompt("The writers have accepted the additional material and retired to study it. Their updated development notes will open when the clock expires.");
        } else {
          renderWriterCallboard();
          showConferenceSelectionPrompt("The updated conference has filed a new packet. Consult with any photoplaywright below to review the memoranda.");
          showExecutiveVerdict(decideExecutiveVerdict());
        }
      } catch (error) {
        showDevelopmentFilingError(error && error.message ? error.message : "The development answers could not be filed.");
        if (readerVerdict) {
          const detail = error && error.message ? error.message : "No detailed error was returned.";
          readerVerdict.innerHTML = `
            <p class="eyebrow">Updated Writers' Development Notes</p>
            <h3>The conference clerk could not file the development pass.</h3>
            <p>The new material remains on the table. ${escapeHtml(detail)}</p>
          `;
        }
        updatedConference.disabled = false;
        updatedConference.textContent = "Submit Stage Answers to the Writers";
      }
      return;
    }

    if (readerVerdict) {
      readerVerdict.innerHTML = `
        <p class="eyebrow">Updated Writers' Development Notes</p>
        <div class="verdict-card">
          <span class="verdict-card__seal">J.M.</span>
          <div>
            <h3>Miss Jeanette Marchmont</h3>
            <p class="verdict-card__role">Stage Development Filed</p>
            <p>The writers have filed their constructive response and carried the remaining cautions forward into the development blueprint.</p>
          </div>
        </div>
      `;
    }

    showExecutiveVerdict("reconference");
  });
}

const treatmentTitle = document.querySelector("#treatment-title");
const treatmentLogline = document.querySelector("#treatment-logline");
const treatmentChecks = document.querySelectorAll("#treatment-writers input[type='checkbox']");
const selectedCount = document.querySelector("#selected-count");
const prepareTreatment = document.querySelector("#prepare-treatment");
const officialTreatment = document.querySelector("#official-treatment");
const executiveRevision = document.querySelector("#executive-revision");
const executiveRevisionMemo = document.querySelector("#executive-revision-memo");
const executiveRevisionQuestions = document.querySelector("#executive-revision-questions");
let activeTreatmentProperty = null;

const treatmentBlueprints = {
  "dangerous-kisses": {
    type: "Society Drama / Romantic Melodrama",
    theme: "A woman trapped by class discovers that freedom requires public courage, not secret longing.",
    cast: [
      ["Barbara Ferrers", "A spirited lady's maid in her early twenties, quick-eyed and restless, whose uniform conceals a hunger for adventure and self-command."],
      ["The Mysterious Stranger", "A polished gentleman of uncertain title, handsome and guarded, whose rescue of Barbara entangles romance with social danger."],
      ["Lady Montvale", "Barbara's employer, elegant and exacting, a woman who understands reputation as both armor and prison."]
    ],
    reels: [
      ["Introduction", "Barbara Ferrers serves aboard a glittering Mediterranean cruise and sees, in every salon and promenade, the life denied to her by birth."],
      ["Act I", "A dangerous fall near the rail is prevented by a mysterious stranger, whose gallantry gives Barbara a glimpse of romance beyond station."],
      ["Act II", "Ports, dances, and whispered meetings deepen the attachment while class suspicion, jealous servants, and false names tighten around them."],
      ["Act III", "Barbara must decide whether to protect her position or follow the stranger into public scandal when his true identity is challenged."],
      ["The Climax & Resolution", "Before the assembled passengers, Barbara acts with courage rather than obedience, winning not merely romance but command over her own fate."]
    ]
  },
  "cathedral-clock": {
    type: "Mechanical Mystery Melodrama",
    theme: "A daughter must choose between preserving her father's name and saving a city from the machinery he left behind.",
    cast: [
      ["Elsa Venn", "A young clockmaker with practical hands and a guarded heart, known in the city for repairing what respectable men do not understand."],
      ["Inspector Hale", "A police engineer assigned to stop the parade, stern, intelligent, and increasingly forced to trust Elsa's skill."],
      ["The Late Master Venn", "Elsa's disgraced father, present only through rumor, memory, and the hidden mechanism inside the cathedral clock."]
    ],
    reels: [
      ["Introduction", "Elsa Venn is called to repair the cathedral clock before the governor's parade, reopening the scandal that destroyed her father's name."],
      ["Act I", "Inside the tower, Elsa discovers a false wheel and timing marks that suggest the clock has been altered for murder."],
      ["Act II", "Her investigation makes her suspect her own father, while the city committee and police dismiss her as sentimental and unfit."],
      ["Act III", "The parade begins, the bells prepare to strike, and Elsa must expose the dead man she loves in order to save the living."],
      ["The Climax & Resolution", "Elsa climbs into the moving clockwork and stops the signal at the cost of her father's reputation, earning the city but losing the comfort of innocence."]
    ]
  }
};

function getTreatmentProperty() {
  const key = new URLSearchParams(window.location.search).get("property") || "";
  if (!key) return "";
  if (/^SPC-/i.test(key)) return key;
  return propertyFiles[key] ? key : "";
}

function selectedTreatmentWriters() {
  return Array.from(treatmentChecks).filter((check) => check.checked);
}

function updateTreatmentSelection() {
  const selected = selectedTreatmentWriters();
  treatmentChecks.forEach((check) => {
    check.disabled = !check.checked && selected.length >= 4;
  });
  if (selectedCount) selectedCount.textContent = `Selected: ${selected.length}/4 writers`;
  if (prepareTreatment) prepareTreatment.disabled = selected.length < 2 || selected.length > 4;
}

function treatmentWritersForRequest() {
  return selectedTreatmentWriters().map((check) => ({
    name: check.value,
    role: check.dataset.role || ""
  }));
}

function renderTreatmentDocument(file, treatment, authors, key) {
  const blueprint = treatment || treatmentBlueprints[key] || treatmentBlueprints["dangerous-kisses"];
  const cast = Array.isArray(blueprint.cast) ? blueprint.cast : [];
  const reels = Array.isArray(blueprint.reels) ? blueprint.reels : [];

  document.querySelector("#treatment-doc-title").textContent = blueprint.title || file.title;
  document.querySelector("#treatment-doc-author").textContent = blueprint.author || `${authors}. Original material credited according to the property file.`;
  document.querySelector("#treatment-doc-type").textContent = blueprint.type || "Photoplay Treatment";
  document.querySelector("#treatment-doc-reels").textContent = blueprint.footageReels || blueprint.reelsEstimate || "The Standard Feature - 5 reels, 5,000 feet, 55 to 75 minutes";
  document.querySelector("#treatment-doc-theme").textContent = blueprint.theme || file.logline;

  document.querySelector("#treatment-cast").innerHTML = cast.map((item) => {
    const name = Array.isArray(item) ? item[0] : item.name;
    const body = Array.isArray(item) ? item[1] : item.description;
    return `
      <article>
        <h3>${escapeHtml(name || "Dramatis Persona")}</h3>
        <p>${escapeHtml(body || "")}</p>
      </article>
    `;
  }).join("");

  document.querySelector("#reel-breakdown").innerHTML = reels.map((item) => {
    const label = Array.isArray(item) ? item[0] : item.label;
    const body = Array.isArray(item) ? item[1] : item.body;
    return `
      <article>
        <h3>${escapeHtml(label || "Treatment Movement")}</h3>
        <p>${escapeHtml(body || "")}</p>
      </article>
    `;
  }).join("");

  officialTreatment.hidden = false;
  const upstairs = officialTreatment.querySelector(".treatment-signoff .button");
  if (upstairs) upstairs.href = `carstairs-office.html?property=${encodeURIComponent(key)}`;
  officialTreatment.scrollIntoView({ behavior: "smooth", block: "start" });
}

function stripHtmlTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeCarstairsQuestions(payload) {
  const raw = Array.isArray(payload && payload.rewriteQuestions) && payload.rewriteQuestions.length
    ? payload.rewriteQuestions
    : deriveFallbackCarstairsQuestions(payload);

  return raw.slice(0, 4).map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `repair_${index + 1}`,
        label: `Executive Repair ${String(index + 1).padStart(2, "0")}`,
        prompt: item,
        placeholder: "Set down the repair plainly for the executive desk."
      };
    }

    return {
      id: item.id || `repair_${index + 1}`,
      label: item.label || `Executive Repair ${String(index + 1).padStart(2, "0")}`,
      prompt: item.prompt || item.question || item.label || "Clarify the repair Carstairs is demanding.",
      placeholder: item.placeholder || "Set down the repair plainly for the executive desk."
    };
  });
}

function deriveFallbackCarstairsQuestions(payload) {
  const memoText = stripHtmlTags((payload && payload.memoBody) || (payload && payload.opinion) || "");
  const suggestions = [];

  if (/title|hook|sell|promise|marquee/i.test(memoText)) {
    suggestions.push("State how the picture now announces its big promise to the masses from the title onward.");
  }
  if (/wound|moral|heart|care|suffer|sympathy/i.test(memoText)) {
    suggestions.push("Explain where the central wound now strikes the characters in visible action rather than explanation.");
  }
  if (/spectacle|visual|set piece|silver sheet|camera|public/i.test(memoText)) {
    suggestions.push("Describe the enlarged spectacle that now carries moral or emotional consequence on the silver sheet.");
  }
  if (/third act|climax|ending|resolution|pacing/i.test(memoText)) {
    suggestions.push("Set down how the final movement now reaches a cleaner and more decisive climax.");
  }

  if (!suggestions.length) {
    suggestions.push(
      "Tell Carstairs how the picture now declares its grand promise in unmistakable terms.",
      "Show where the audience will feel the wound and the moral consequence in action.",
      "Name the visual set-piece that now gives the photoplay majesty rather than cleverness."
    );
  }

  return suggestions;
}

function normalizeWastebasketReasons(payload) {
  const raw = Array.isArray(payload && payload.wastebasketReasons) && payload.wastebasketReasons.length
    ? payload.wastebasketReasons
    : deriveFallbackWastebasketReasons(payload);

  return raw.slice(0, 4).map((item) => String(typeof item === "string" ? item : item.reason || item.body || "").trim()).filter(Boolean);
}

function deriveFallbackWastebasketReasons(payload) {
  const memoText = stripHtmlTags((payload && payload.memoBody) || "");
  const reasons = [];
  if (/small|small-minded|drawing-room|thin/i.test(memoText)) reasons.push("The picture remains too small in scale to command the silver sheet.");
  if (/hook|title|marquee|sell/i.test(memoText)) reasons.push("The title and hook still fail to promise a commanding attraction for the audience.");
  if (/spectacle|visual|set piece/i.test(memoText)) reasons.push("The treatment does not yet furnish a spectacle worthy of production expense.");
  if (/confus|murky|unclear|pacing|structure/i.test(memoText)) reasons.push("The dramatic line remains too confused or slack to hold the house.");
  if (/moral|wound|heart|care/i.test(memoText)) reasons.push("The moral wound does not strike deeply enough to justify the downfall or redemption.");
  return reasons.length ? reasons : ["The property still lacks the clarity, scale, and emotional authority required for a major photoplay."];
}

function normalizeWastebasketAnalysis(payload) {
  const raw = payload && (payload.wastebasketAnalysis || payload.wastebasketExplanation || payload.whyItFell);
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 2);
  }
  if (raw) {
    const text = stripHtmlTags(raw);
    const paragraphs = text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    return (paragraphs.length ? paragraphs : [text]).slice(0, 2);
  }

  const reasons = deriveFallbackWastebasketReasons(payload);
  const memoText = stripHtmlTags((payload && payload.memoBody) || "");
  const subject = memoText ? "In the memorandum, Carstairs is objecting to the treatment's screen value rather than merely its premise." : "Carstairs' rejection turns on the missing screen value in the packet.";

  return [
    `${subject} The central lesson is to look for what the audience can see and feel at once: a saleable title, a visible moral wound, and a sequence large enough to make the silver sheet feel necessary.`,
    `For a future pass, treat these notes as production questions, not insults. ${reasons.join(" ")} The repair should name the exact image, choice, sacrifice, or public reversal that turns the story from promising material into a photoplay Carstairs can spend money on.`
  ];
}

function normalizeRewriteAnswers(payload) {
  const answers = payload && payload.rewriteAnswers;
  if (!answers) return {};
  if (Array.isArray(answers)) {
    return Object.fromEntries(answers.map((item, index) => [
      item.id || `repair_${index + 1}`,
      item.answer || item.response || ""
    ]));
  }
  if (typeof answers === "object") {
    return answers;
  }
  return {};
}

function renderTreatmentExecutiveRevision(property, treatment, carstairsPacket) {
  if (!executiveRevision || !executiveRevisionMemo || !executiveRevisionQuestions) return;

  const treatmentRewrite = treatment && treatment.executiveRewrite ? treatment.executiveRewrite : null;
  const packet = carstairsPacket || treatmentRewrite;

  if (!packet || !/rewrite/i.test(packet.verdict || packet.statusLabel || property?.status || "")) {
    executiveRevision.hidden = true;
    executiveRevisionMemo.innerHTML = "";
    executiveRevisionQuestions.innerHTML = "";
    return;
  }

  const questions = normalizeCarstairsQuestions(packet);
  const answers = normalizeRewriteAnswers(packet);

  executiveRevisionMemo.innerHTML = `
    <h3>${escapeHtml(packet.memoTitle || "From the Desk of Carstairs")}</h3>
    <p>${escapeHtml(stripHtmlTags(packet.memoBody || ""))}</p>
  `;

  executiveRevisionQuestions.innerHTML = questions.map((question) => `
    <article>
      <h3>${escapeHtml(question.label)}</h3>
      <p>${escapeHtml(question.prompt)}</p>
      <p class="executive-answer">${escapeHtml(answers[question.id] || "No filed answer yet.")}</p>
    </article>
  `).join("");

  executiveRevision.hidden = false;
}

function requestOfficialTreatment(propertyId, writers) {
  return new Promise((resolve, reject) => {
    const callbackName = `scenarioTreatment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Treatment request timed out."));
    }, 120000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Treatment request failed."));
    };

    script.src = `${scenarioBackendUrl}?action=runTreatment&propertyId=${encodeURIComponent(propertyId)}&writers=${encodeURIComponent(JSON.stringify(writers))}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function renderLiveTreatmentProperty(property) {
  if (!property || !treatmentTitle) return;
  if (!isTreatmentRoomProperty(property)) {
    showTreatmentDeskMessage("Select Property", "This property is not presently on the Treatment desk. Select another current file.");
    if (prepareTreatment) {
      prepareTreatment.disabled = true;
      prepareTreatment.textContent = "Awaiting Treatment Packet";
    }
    return;
  }

  activeTreatmentProperty = property;
  const title = property.title || "Untitled Property";
  const logline = property.logline || property.readerSynopsis || "No logline has been entered for this property yet.";
  const kicker = document.querySelector(".treatment-property-head .eyebrow");

  document.title = `${title} | Treatment Room`;
  if (kicker) kicker.textContent = `Treatment Room - ${property.propertyId || "SPC"}`;
  treatmentTitle.textContent = title;
  if (treatmentLogline) treatmentLogline.textContent = logline;
  if (prepareTreatment) {
    prepareTreatment.disabled = false;
    prepareTreatment.textContent = "Prepare the Official Treatment";
  }

  const savedTreatment = parseSavedTreatment(property);
  const savedCarstairs = parseSavedCarstairs(property);
  if (savedTreatment && officialTreatment) {
    renderTreatmentDocument(property, savedTreatment, savedTreatment.author || "", property.propertyId || getTreatmentProperty());
    renderTreatmentExecutiveRevision(property, savedTreatment, savedCarstairs);
    if (prepareTreatment) {
      prepareTreatment.textContent = "Official Treatment Filed";
      prepareTreatment.disabled = true;
    }
  } else {
    renderTreatmentExecutiveRevision(property, null, savedCarstairs);
  }
}

if (treatmentTitle) {
  const key = getTreatmentProperty();
  if (!key && prepareTreatment) {
    prepareTreatment.disabled = true;
    prepareTreatment.textContent = "Awaiting Treatment Packet";
  }
  if (/^SPC-/i.test(key)) {
    const kicker = document.querySelector(".treatment-property-head .eyebrow");
    if (kicker) kicker.textContent = `Treatment Room - ${key}`;
    treatmentTitle.textContent = "Preparing Treatment Packet";
    if (treatmentLogline) {
      treatmentLogline.textContent = "The current property packet will appear here as soon as the ledger finishes loading.";
    }
    loadPropertyPacket(key, ["source", "reader", "conference", "treatment", "carstairs"])
      .then(renderLiveTreatmentProperty)
      .catch(() => {
        if (kicker) kicker.textContent = "Treatment Room - ledger unavailable";
        treatmentTitle.textContent = "Treatment Packet Unavailable";
        if (treatmentLogline) {
          treatmentLogline.textContent = "The treatment file could not be reached from the ledger just now.";
        }
      });
  } else if (key) {
    const file = propertyFiles[key];
    treatmentTitle.textContent = file.title;
    if (treatmentLogline) treatmentLogline.textContent = file.logline;
  }
  treatmentChecks.forEach((check) => check.addEventListener("change", updateTreatmentSelection));
  updateTreatmentSelection();
  initTreatmentRoomSelector();
}

if (prepareTreatment && officialTreatment) {
  prepareTreatment.addEventListener("click", async () => {
    const key = getTreatmentProperty();
    const file = activeTreatmentProperty || (key ? propertyFiles[key] : null);
    const selected = selectedTreatmentWriters();
    const authors = selected.map((check) => `${check.value} (${check.dataset.role})`).join("; ");

    if (!key && !activeTreatmentProperty) {
      if (selectedCount) {
        selectedCount.textContent = "No filed property is on this desk yet.";
      }
      return;
    }

    if (/^SPC-/i.test(key)) {
      prepareTreatment.disabled = true;
      prepareTreatment.textContent = "The Treatment Is Being Prepared";

      try {
        const payload = await requestOfficialTreatment(key, treatmentWritersForRequest());
        if (!payload || !payload.ok || !payload.treatment) throw new Error(payload && payload.error ? payload.error : "Treatment response was not OK.");
        if (activeTreatmentProperty) {
          activeTreatmentProperty.treatmentStatus = "Treatment Applied";
          activeTreatmentProperty.treatmentUrl = `treatment-room.html?property=${encodeURIComponent(key)}`;
          activeTreatmentProperty.treatmentJson = JSON.stringify(payload.treatment);
        }
        renderTreatmentDocument(file, payload.treatment, authors, key);
        prepareTreatment.textContent = "Official Treatment Filed";
      } catch (error) {
        prepareTreatment.textContent = "Prepare the Official Treatment";
        prepareTreatment.disabled = false;
        if (selectedCount) {
          selectedCount.textContent = "The treatment clerk could not file the live treatment just now. Try again.";
        }
      }
      return;
    }

    renderTreatmentDocument(file, treatmentBlueprints[key] || treatmentBlueprints["dangerous-kisses"], authors, key);
  });
}

const carstairsTitle = document.querySelector("#carstairs-title");
const carstairsLogline = document.querySelector("#carstairs-logline");
const evaluateTreatment = document.querySelector("#evaluate-treatment");
const carstairsDossier = document.querySelector("#carstairs-dossier");
const carstairsTreatmentLink = document.querySelector("#carstairs-treatment-link");
const carstairsWritersLink = document.querySelector("#carstairs-writers-link");
const carstairsReaderSummary = document.querySelector("#carstairs-reader-summary");
const carstairsMemo = document.querySelector("#carstairs-memo");
const carstairsMemoTitle = document.querySelector("#carstairs-memo-title");
const carstairsOpinion = document.querySelector("#carstairs-opinion");
const carstairsReasons = document.querySelector("#carstairs-reasons");
const carstairsReasonsList = document.querySelector("#carstairs-reasons-list");
const carstairsVerdict = document.querySelector("#carstairs-verdict");
const carstairsStamp = document.querySelector("#carstairs-stamp");
const carstairsQuote = document.querySelector("#carstairs-quote");
const carstairsAction = document.querySelector("#carstairs-action");
const carstairsRewrite = document.querySelector("#carstairs-rewrite");
const carstairsQuestions = document.querySelector("#carstairs-questions");
const carstairsTimer = document.querySelector("#carstairs-timer");
const resubmitCarstairs = document.querySelector("#resubmit-carstairs");
const carstairsAppeal = document.querySelector("#carstairs-appeal");
const openCarstairsAppeal = document.querySelector("#open-carstairs-appeal");
const carstairsAppealForm = document.querySelector("#carstairs-appeal-form");
const carstairsAppealOverlooked = document.querySelector("#carstairs-appeal-overlooked");
const carstairsAppealValue = document.querySelector("#carstairs-appeal-value");
const submitCarstairsAppeal = document.querySelector("#submit-carstairs-appeal");
const carstairsAppealStatus = document.querySelector("#carstairs-appeal-status");
let carstairsRewriteUsed = false;
let carstairsInterval;
let activeCarstairsProperty = null;
let activeCarstairsPayload = null;
const carstairsMinimumReadingMs = 5500;

const carstairsFiles = {
  "dangerous-kisses": {
    memoTitle: "This one knows what it is selling.",
    opinion: "The treatment has gloss, appetite, and a human ache under the satin. Do not mistake the cruise for the picture; the picture is the girl's discovery that longing can become courage. The spectacle may stay quiet if the emotional pressure is sharp. A moonlit deck, a public choice, a forbidden hand released at the right instant: that is enough if it is staged with conviction.",
    verdict: "greenlight",
    quote: "Give it stars, give it glass, give it a moonlit deck big enough for every shopgirl in America to dream upon."
  },
  "cathedral-clock": {
    memoTitle: "The clock is handsome. The treatment is not yet alive.",
    opinion: "The tower is worth money. The girl inside it may be worth a star. But the treatment still admires its machinery more than it wounds its heroine. I want the father's guilt to strike her in the chest, not sit in the file like a clever device. Repair the big promise, sharpen the moral wound, and make the spectacle mean something before this office spends another dollar.",
    verdict: "rewrite",
    quote: "Send it downstairs. Give me a daughter, not a diagram."
  }
};

function getCarstairsProperty() {
  const key = new URLSearchParams(window.location.search).get("property") || "";
  if (!key) return "";
  if (/^SPC-/i.test(key)) return key;
  return propertyFiles[key] ? key : "";
}

function showCarstairsVerdict(kind, quote) {
  if (!carstairsVerdict || !carstairsStamp || !carstairsQuote || !carstairsAction) return;
  const labels = {
    greenlight: ["Greenlight", "final-stamp final-stamp--treatments", "Return to the Scenario Desk", "scenario-desk.html"],
    rewrite: ["Executive Rewrite", "final-stamp final-stamp--reconference", "Review Executive Questions", "#carstairs-rewrite"],
    wastebasket: ["Wastebasket", "final-stamp final-stamp--wastebasket", "Return to the Scenario Desk", "scenario-desk.html"]
  };
  const [stamp, className, action, href] = labels[kind] || labels.greenlight;
  carstairsStamp.textContent = stamp;
  carstairsStamp.className = className;
  carstairsQuote.textContent = quote;
  carstairsAction.textContent = action;
  carstairsAction.href = href;
  carstairsVerdict.hidden = false;
}

function renderCarstairsPacket(property) {
  if (!property || !carstairsTitle) return;
  if (!isCarstairsRoomProperty(property)) {
    showCarstairsDeskMessage("Select Property for Evaluation", "This property is not presently on Carstairs' desk. Select another current file.");
    if (evaluateTreatment) {
      evaluateTreatment.disabled = true;
      evaluateTreatment.textContent = "Awaiting Treatment Packet";
    }
    return;
  }
  activeCarstairsProperty = property;
  document.title = `${property.title || "Untitled Property"} | Carstairs' Office`;
  carstairsTitle.textContent = property.title || "Untitled Property";
  if (evaluateTreatment) {
    evaluateTreatment.disabled = false;
    evaluateTreatment.textContent = "Evaluate the Treatment";
  }
  if (carstairsLogline) {
    carstairsLogline.textContent = property.logline || property.readerSynopsis || "No filed logline is presently on the desk.";
  }
  if (carstairsDossier) {
    carstairsDossier.hidden = false;
  }
  if (carstairsTreatmentLink) {
    carstairsTreatmentLink.href = property.treatmentUrl || `treatment-room.html?property=${encodeURIComponent(property.propertyId || getCarstairsProperty())}`;
  }
  if (carstairsWritersLink) {
    carstairsWritersLink.href = property.writerRoomUrl || `writers-room.html?property=${encodeURIComponent(property.propertyId || getCarstairsProperty())}`;
  }
  if (carstairsReaderSummary) {
    carstairsReaderSummary.textContent = property.readerSynopsis || property.logline || "The scenario reader's precis has not yet been filed in the ledger.";
  }
}

function renderCarstairsReasonsBlock(payload) {
  if (!carstairsReasons || !carstairsReasonsList) return;
  const reasons = normalizeWastebasketReasons(payload);
  const analysis = normalizeWastebasketAnalysis(payload);
  if ((payload && payload.verdict) !== "wastebasket" || (!reasons.length && !analysis.length)) {
    carstairsReasons.hidden = true;
    carstairsReasonsList.innerHTML = "";
    return;
  }

  carstairsReasonsList.innerHTML = `
    <div class="carstairs-reasons__analysis">
      ${analysis.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>
    ${reasons.length ? `
      <ul>
        ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    ` : ""}
  `;
  carstairsReasons.hidden = false;
}

function hasCarstairsAppealBeenUsed(payload) {
  const propertyCount = Number(activeCarstairsProperty && activeCarstairsProperty.carstairsAppealCount || 0) || 0;
  const payloadCount = Number(payload && (payload.appealCount || payload.carstairsAppealCount) || 0) || 0;
  const hasAppealNotes = Boolean(payload && payload.appealNotes);
  return propertyCount > 0 || payloadCount > 0 || hasAppealNotes;
}

function renderCarstairsAppealBlock(payload) {
  if (!carstairsAppeal) return;
  const canAppeal = payload && payload.verdict === "wastebasket" && !hasCarstairsAppealBeenUsed(payload);

  if (!canAppeal) {
    carstairsAppeal.hidden = true;
    if (carstairsAppealForm) carstairsAppealForm.hidden = true;
    if (carstairsAppealStatus) carstairsAppealStatus.textContent = "";
    return;
  }

  if (carstairsAppealOverlooked) carstairsAppealOverlooked.value = "";
  if (carstairsAppealValue) carstairsAppealValue.value = "";
  if (carstairsAppealStatus) carstairsAppealStatus.textContent = "One reconsideration may be requested for this ruling.";
  if (openCarstairsAppeal) {
    openCarstairsAppeal.hidden = false;
    openCarstairsAppeal.disabled = false;
  }
  if (carstairsAppealForm) carstairsAppealForm.hidden = true;
  if (submitCarstairsAppeal) {
    submitCarstairsAppeal.disabled = false;
    submitCarstairsAppeal.textContent = "Submit Reconsideration";
  }
  carstairsAppeal.hidden = false;
}

function renderCarstairsRewriteForm(payload, forceOpen = false) {
  if (!carstairsRewrite || !carstairsQuestions) return;

  const questions = normalizeCarstairsQuestions(payload);
  const answers = normalizeRewriteAnswers(payload);
  const hasFiledAnswers = Object.values(answers).some(Boolean);

  if ((payload && payload.verdict) !== "rewrite" || !questions.length) {
    carstairsRewrite.hidden = true;
    carstairsQuestions.innerHTML = "";
    return;
  }

  carstairsQuestions.innerHTML = questions.map((question) => `
    <label class="executive-question">
      <h3>${escapeHtml(hasFiledAnswers ? `${question.label} - Answer Filed` : question.label)}</h3>
      <p>${escapeHtml(question.prompt)}</p>
      <textarea
        data-carstairs-question-id="${escapeHtml(question.id)}"
        placeholder="${escapeHtml(question.placeholder)}"
        ${hasFiledAnswers ? "disabled" : ""}
      >${escapeHtml(answers[question.id] || "")}</textarea>
    </label>
  `).join("");

  if (forceOpen || Object.values(answers).some(Boolean)) {
    carstairsRewrite.hidden = false;
  }
  if (resubmitCarstairs) {
    resubmitCarstairs.disabled = hasFiledAnswers;
    resubmitCarstairs.textContent = hasFiledAnswers ? "Answers Filed" : "Send Back Upstairs";
  }
}

function renderSavedCarstairsMemo(payload) {
  if (!payload || !carstairsMemo || !carstairsMemoTitle || !carstairsOpinion) return;
  activeCarstairsPayload = payload;
  carstairsMemoTitle.textContent = payload.memoTitle || "From the Desk of Carstairs";
  carstairsOpinion.innerHTML = payload.memoBody || "";
  carstairsMemo.hidden = false;
  if (payload.verdict) {
    showCarstairsVerdict(payload.verdict, payload.quote || "");
    renderCarstairsReasonsBlock(payload);
    renderCarstairsAppealBlock(payload);
    renderCarstairsRewriteForm(payload, payload.verdict === "rewrite");
  } else {
    if (carstairsVerdict) carstairsVerdict.hidden = true;
    if (carstairsReasons) carstairsReasons.hidden = true;
    if (carstairsAppeal) carstairsAppeal.hidden = true;
    if (carstairsRewrite) carstairsRewrite.hidden = true;
  }
  if (evaluateTreatment) {
    evaluateTreatment.textContent = payload && /greenlight|wastebasket/i.test(payload.verdict || "")
      ? "Executive Ruling Filed"
      : "Treatment Evaluated";
    evaluateTreatment.disabled = true;
  }
}

function withMinimumReadingDelay(promiseFactory) {
  const startedAt = Date.now();
  return promiseFactory().then((payload) => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, carstairsMinimumReadingMs - elapsed);
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(payload), remaining);
    });
  });
}

function requestCarstairsVerdict(propertyId, rewriteNotes) {
  return new Promise((resolve, reject) => {
    const callbackName = `scenarioCarstairs_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Carstairs timed out."));
    }, 120000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Carstairs request failed."));
    };

    const notes = rewriteNotes ? encodeURIComponent(JSON.stringify(rewriteNotes)) : "";
    script.src = `${scenarioBackendUrl}?action=runCarstairs&propertyId=${encodeURIComponent(propertyId)}&rewriteNotes=${notes}&callback=${encodeURIComponent(callbackName)}`;
    document.body.appendChild(script);
  });
}

function startCarstairsClock() {
  if (!carstairsTimer) return;
  clearInterval(carstairsInterval);
  let remaining = 30;
  carstairsTimer.textContent = "30:00";
  carstairsInterval = window.setInterval(() => {
    remaining -= 1;
    carstairsTimer.textContent = `${String(remaining).padStart(2, "0")}:00`;
    if (remaining <= 0) {
      clearInterval(carstairsInterval);
      carstairsTimer.textContent = "00:00";
    }
  }, 60000);
}

if (carstairsTitle) {
  const key = getCarstairsProperty();
  if (!key && evaluateTreatment) {
    evaluateTreatment.disabled = true;
    evaluateTreatment.textContent = "Awaiting Treatment Packet";
  }
  if (/^SPC-/i.test(key)) {
    loadPropertyPacket(key, ["source", "reader", "conference", "treatment", "carstairs"])
      .then((property) => {
        renderCarstairsPacket(property);
        const saved = parseSavedCarstairs(property);
        if (saved) {
          renderSavedCarstairsMemo(saved);
        }
      })
      .catch(() => {
        if (carstairsLogline) carstairsLogline.textContent = "The executive file could not be drawn from the ledger.";
      });
  } else if (key) {
    const file = propertyFiles[key];
    carstairsTitle.textContent = file.title;
    if (carstairsLogline) carstairsLogline.textContent = file.logline;
  }
  initCarstairsSelector();
}

if (evaluateTreatment && carstairsMemo && carstairsOpinion) {
  evaluateTreatment.addEventListener("click", async () => {
    const key = getCarstairsProperty();
    if (!key) {
      carstairsMemoTitle.textContent = "No packet has been sent upstairs.";
      carstairsOpinion.textContent = "Carstairs cannot evaluate an empty desk. Send a treatment upstairs and the executive packet will be filed here.";
      carstairsMemo.hidden = false;
      return;
    }
    if (/^SPC-/i.test(key)) {
      evaluateTreatment.disabled = true;
      evaluateTreatment.textContent = "Carstairs Is Reading";
      try {
        const payload = await withMinimumReadingDelay(() => requestCarstairsVerdict(key));
        if (!payload || !payload.ok) throw new Error(payload && payload.error ? payload.error : "Carstairs response was not OK.");
        renderSavedCarstairsMemo(payload);
        carstairsMemo.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        carstairsMemoTitle.textContent = "The upper office line has gone dead.";
        carstairsOpinion.textContent = error && error.message
          ? `Carstairs has not yet returned a usable memorandum. ${error.message}`
          : "Carstairs has not yet returned his memorandum to the desk. Keep the treatment on file and try the executive office again.";
        carstairsMemo.hidden = false;
        if (carstairsVerdict) carstairsVerdict.hidden = true;
        if (carstairsReasons) carstairsReasons.hidden = true;
        if (carstairsRewrite) carstairsRewrite.hidden = true;
        evaluateTreatment.textContent = "Evaluate the Treatment";
        evaluateTreatment.disabled = false;
      }
      return;
    }

    const file = carstairsFiles[key] || carstairsFiles["dangerous-kisses"];
    carstairsMemoTitle.textContent = file.memoTitle;
    carstairsOpinion.textContent = file.opinion;
    carstairsMemo.hidden = false;
    showCarstairsVerdict(file.verdict, file.quote);
    evaluateTreatment.textContent = "Treatment Evaluated";
    evaluateTreatment.disabled = true;
    carstairsMemo.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

if (carstairsAction && carstairsRewrite) {
  carstairsAction.addEventListener("click", (event) => {
    if (carstairsAction.getAttribute("href") !== "#carstairs-rewrite") return;
    event.preventDefault();
    if (activeCarstairsPayload) {
      renderCarstairsRewriteForm(activeCarstairsPayload, true);
    }
    carstairsRewrite.hidden = false;
    startCarstairsClock();
    carstairsRewrite.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (resubmitCarstairs) {
  resubmitCarstairs.addEventListener("click", async () => {
    const key = getCarstairsProperty();
    if (/^SPC-/i.test(key) && activeCarstairsPayload && activeCarstairsPayload.verdict === "rewrite") {
      const questionNodes = Array.from(document.querySelectorAll("[data-carstairs-question-id]"));
      const rewriteNotes = {
        questions: normalizeCarstairsQuestions(activeCarstairsPayload).map((question) => ({
          id: question.id,
          label: question.label,
          prompt: question.prompt
        })),
        answers: questionNodes.map((node) => ({
          id: node.dataset.carstairsQuestionId || "",
          answer: node.value || ""
        }))
      };

      questionNodes.forEach((node) => {
        node.disabled = true;
        const label = node.closest(".executive-question");
        const heading = label && label.querySelector("h3");
        if (heading && !/Answer Filed/i.test(heading.textContent || "")) {
          heading.textContent = `${heading.textContent} - Answer Filed`;
        }
      });
      resubmitCarstairs.disabled = true;
      resubmitCarstairs.textContent = "Carstairs Reviewing Return";
      if (carstairsMemoTitle && carstairsOpinion) {
        carstairsMemoTitle.textContent = "Carstairs is reading the returned treatment.";
        carstairsOpinion.textContent = "The revised packet has gone back across his desk. The executive office is weighing the repairs against the first memorandum.";
        carstairsMemo.hidden = false;
      }

      try {
        const payload = await withMinimumReadingDelay(() => requestCarstairsVerdict(key, rewriteNotes));
        if (!payload || !payload.ok) throw new Error(payload && payload.error ? payload.error : "Carstairs response was not OK.");
        if (activeCarstairsProperty) {
          activeCarstairsProperty.carstairsJson = JSON.stringify(payload);
        }
        renderSavedCarstairsMemo(payload);
        if (carstairsRewrite) carstairsRewrite.hidden = true;
        if (carstairsVerdict) carstairsVerdict.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        if (carstairsMemoTitle && carstairsOpinion) {
          carstairsMemoTitle.textContent = "The memorandum was returned in disorder.";
          carstairsOpinion.textContent = error && error.message
            ? `Carstairs did not file a proper second memorandum. ${error.message}`
            : "Carstairs did not file a proper second memorandum. The revision remains on the desk.";
          carstairsMemo.hidden = false;
        }
        resubmitCarstairs.disabled = false;
        resubmitCarstairs.textContent = "Send Back Upstairs";
      }
      return;
    }

    if (carstairsMemoTitle && carstairsOpinion) {
      carstairsMemoTitle.textContent = "There is no executive rewrite to return.";
      carstairsOpinion.textContent = "Carstairs has not ordered a return on this packet. Select a rewrite file if you mean to send material back downstairs.";
      carstairsMemo.hidden = false;
    }
  });
}

if (openCarstairsAppeal) {
  openCarstairsAppeal.addEventListener("click", () => {
    if (carstairsAppealForm) carstairsAppealForm.hidden = false;
    openCarstairsAppeal.hidden = true;
    if (carstairsAppealStatus) carstairsAppealStatus.textContent = "File the appeal in plain terms. Carstairs will only reconsider once.";
    carstairsAppealForm?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (submitCarstairsAppeal) {
  submitCarstairsAppeal.addEventListener("click", async () => {
    const key = getCarstairsProperty();
    const overlooked = String(carstairsAppealOverlooked && carstairsAppealOverlooked.value || "").trim();
    const productionValue = String(carstairsAppealValue && carstairsAppealValue.value || "").trim();

    if (!/^SPC-/i.test(key) || !activeCarstairsPayload || activeCarstairsPayload.verdict !== "wastebasket") {
      if (carstairsAppealStatus) carstairsAppealStatus.textContent = "There is no Wastebasket ruling available for reconsideration.";
      return;
    }

    if (!overlooked || !productionValue) {
      if (carstairsAppealStatus) carstairsAppealStatus.textContent = "Both appeal notes are required before Carstairs will reconsider the ruling.";
      return;
    }

    submitCarstairsAppeal.disabled = true;
    submitCarstairsAppeal.textContent = "Requesting Reconsideration";
    if (carstairsAppealStatus) carstairsAppealStatus.textContent = "The appeal has gone back across the executive desk.";
    if (carstairsMemoTitle && carstairsOpinion) {
      carstairsMemoTitle.textContent = "Carstairs is considering the appeal.";
      carstairsOpinion.textContent = "The rejected packet has returned with a formal appeal. He is weighing the claimed production value against the first ruling.";
      carstairsMemo.hidden = false;
    }

    try {
      const payload = await withMinimumReadingDelay(() => requestCarstairsVerdict(key, {
        appeal: true,
        appealNotes: {
          overlooked,
          productionValue
        }
      }));
      if (!payload || !payload.ok) throw new Error(payload && payload.error ? payload.error : "Carstairs appeal response was not OK.");
      if (activeCarstairsProperty) {
        activeCarstairsProperty.carstairsJson = JSON.stringify(payload);
        activeCarstairsProperty.carstairsAppealCount = payload.appealCount || 1;
      }
      renderSavedCarstairsMemo(payload);
      if (carstairsVerdict) carstairsVerdict.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      if (carstairsAppealStatus) {
        carstairsAppealStatus.textContent = error && error.message
          ? `The reconsideration could not be filed. ${error.message}`
          : "The reconsideration could not be filed. Try once more.";
      }
      submitCarstairsAppeal.disabled = false;
      submitCarstairsAppeal.textContent = "Submit Reconsideration";
    }
  });
}


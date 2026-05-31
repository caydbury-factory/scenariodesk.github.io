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
  "main > section, .desk-sheet, .property-card, .dossier-sheet, .analysis-sheet, .letter-envelope, .reader-roster, .treatment-assignment, .official-treatment, .carstairs-desk, .carstairs-memo, .carstairs-verdict, .carstairs-rewrite, .rules-sheet, .source-shelf, .archive-stats > div, .selected-issue, .miner-desk, .report"
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

if (manuscriptFile && uploadLabel) {
  manuscriptFile.addEventListener("change", () => {
    uploadLabel.textContent = manuscriptFile.files.length
      ? manuscriptFile.files[0].name
      : "Place manuscript here - or paste text below";
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
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      submissionStatus.textContent = "Property filed. The ledger will mark it Needs Reader.";
      submissionStatus.className = "submission-status submission-status--success";
      submissionForm.reset();
      uploadLabel.textContent = "Place manuscript here - or paste text below";
    } catch (error) {
      submissionStatus.textContent = "The filing clerk could not reach the ledger. Try once more.";
      submissionStatus.className = "submission-status submission-status--error";
    } finally {
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
    next: "Call in Miss Frances Fairchild ->",
    title: "Miss Jeanette Marchmont",
    role: "Chief of Scenario Construction / Structure and Photoplay Architecture",
    body: "The material is playable because its desire is visible: Barbara wants life beyond service, and the cruise gives that want movement, splendor, and danger. The present weakness is architectural. The class conflict must rise by complications rather than by conversation. Give the second act one crisis that cannot be politely explained away, and the climax will have a true motion-picture shape."
  },
  {
    initials: "F.F.",
    next: "Call in Mr. William Carrington ->",
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
    next: "Call in Mr. William Carrington ->",
    title: "Miss Jeanette Marchmont",
    role: "Chief of Scenario Construction / Structure and Photoplay Architecture",
    body: "The clock is a fine visual engine, but the construction is not yet sound. The first act establishes machinery without establishing sufficient dramatic pressure. By the photoplay rules, the protagonist's desire must drive every scene; Elsa is skilled, but she is not yet forced forward sharply enough. Reconference advised."
  },
  {
    initials: "W.C.",
    next: "Call in Miss Beulah Thorncroft ->",
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
    stamp: "Reconference",
    className: "final-stamp final-stamp--reconference",
    quote: "There is promise here, but the engine coughs. Return it to conference and make the stakes visible.",
    action: "Reconvene the Conference",
    href: "#reconference-workshop"
  },
  wastebasket: {
    type: "wastebasket",
    stamp: "Wastebasket",
    className: "final-stamp final-stamp--wastebasket",
    quote: "No spine, no pressure, no picture. Thank the submitter and clear the desk.",
    action: "Return to the Scenario Desk",
    href: "scenario-desk.html"
  }
};

const propertyTitle = document.querySelector("#property-title");
let activePropertyKey = "dangerous-kisses";
let reconferenceCount = 0;
let activeExecutiveVerdict = "treatments";

if (propertyTitle) {
  activePropertyKey = new URLSearchParams(window.location.search).get("property") || "dangerous-kisses";
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

const sendLetter = document.querySelector("#send-letter");
const readerRoster = document.querySelector("#reader-roster");
const readerVerdict = document.querySelector("#reader-verdict");
const nextWriter = document.querySelector("#next-writer");
const conferenceHeading = document.querySelector("#conference-heading");
const finalEvaluation = document.querySelector("#final-evaluation");
const finalStamp = document.querySelector("#final-stamp");
const finalQuote = document.querySelector("#final-quote");
const finalAction = document.querySelector("#final-action");
const reconferenceWorkshop = document.querySelector("#reconference-workshop");
const reconferenceTimer = document.querySelector("#reconference-timer");
const reconferenceFeedback = document.querySelector("#reconference-feedback");
const updatedConference = document.querySelector("#updated-conference");
const labelMoralPressure = document.querySelector("#label-moral-pressure");
const labelRomance = document.querySelector("#label-romance");
const labelSpectacle = document.querySelector("#label-spectacle");
let photoplaywrightIndex = 0;
let reconferenceInterval;

function renderPhotoplaywright(index) {
  const verdict = activePhotoplaywrightVerdicts[index];
  if (!verdict || !readerVerdict || !nextWriter || !conferenceHeading) return;

  conferenceHeading.textContent = "Interested photoplaywrights have replied.";
  readerVerdict.innerHTML = `
    <p class="eyebrow">The Writers' Verdicts</p>
    <div class="verdict-card">
      <span class="verdict-card__seal">${verdict.initials}</span>
      <div>
        <h3>${verdict.title}</h3>
        <p class="verdict-card__role">${verdict.role}</p>
        <p>${verdict.body}</p>
      </div>
    </div>
  `;
  nextWriter.textContent = verdict.next;
  nextWriter.hidden = false;
}

function decideExecutiveVerdict() {
  if (activePropertyKey === "cathedral-clock") {
    if (reconferenceCount >= 2) return "wastebasket";
    return "reconference";
  }

  if (activePropertyKey === "glass-duchess") return "reconference";
  return "treatments";
}

function showExecutiveVerdict(kind) {
  const verdict = executiveVerdicts[kind] || executiveVerdicts.treatments;
  activeExecutiveVerdict = verdict.type;
  if (!finalEvaluation || !finalStamp || !finalQuote || !finalAction) return;

  finalStamp.textContent = verdict.stamp;
  finalStamp.className = verdict.className;
  finalQuote.textContent = verdict.quote;
  finalAction.textContent = verdict.action;
  finalAction.href = verdict.href;
  finalEvaluation.hidden = false;
  nextWriter.hidden = true;
  if (conferenceHeading) {
    conferenceHeading.textContent = kind === "wastebasket"
      ? "The conference has exhausted the material."
      : "The conference has convened.";
  }
  finalEvaluation.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startReconferenceClock() {
  if (!reconferenceTimer || !reconferenceFeedback) return;
  clearInterval(reconferenceInterval);
  let remaining = 36;
  reconferenceFeedback.hidden = true;
  if (reconferenceCount >= 2) {
    if (labelMoralPressure) labelMoralPressure.childNodes[0].textContent = "Final Moral Repair ";
    if (labelRomance) labelRomance.childNodes[0].textContent = "Final Human Tie or Romance Repair ";
    if (labelSpectacle) labelSpectacle.childNodes[0].textContent = "Final Visual Climax Repair ";
    reconferenceFeedback.innerHTML = `
      <div>
        <h3>Marchmont's Final Demand</h3>
        <p>The mechanism must produce an unavoidable final action. No further explanation will rescue the structure.</p>
      </div>
      <div>
        <h3>Carrington's Final Demand</h3>
        <p>The father's guilt must be answered by Elsa in public and at cost. Private sorrow is insufficient.</p>
      </div>
      <div>
        <h3>Thorncroft's Final Demand</h3>
        <p>The climax must exact payment: name, office, love, inheritance, safety, or freedom.</p>
      </div>
    `;
  } else {
    if (labelMoralPressure) labelMoralPressure.childNodes[0].textContent = "New Moral Pressure ";
    if (labelRomance) labelRomance.childNodes[0].textContent = "Stronger Romance or Human Tie ";
    if (labelSpectacle) labelSpectacle.childNodes[0].textContent = "New Spectacle or Visual Sequence ";
  }
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

if (sendLetter && readerRoster && readerVerdict && nextWriter) {
  sendLetter.addEventListener("click", () => {
    readerRoster.classList.remove("is-locked");
    readerVerdict.innerHTML = `
      <p class="eyebrow">Writers' Verdicts</p>
      <h3>Conference letter delivered</h3>
      <p>The letter has gone to the photoplaywrights. Replies are expected within <strong>36 studio hours</strong>.</p>
    `;
    if (conferenceHeading) conferenceHeading.textContent = "Conference letters are out.";
    sendLetter.textContent = "Conference Letter Sent";
    sendLetter.disabled = true;
    window.setTimeout(() => {
      photoplaywrightIndex = 0;
      renderPhotoplaywright(photoplaywrightIndex);
    }, 900);
  });

  nextWriter.addEventListener("click", () => {
    if (photoplaywrightIndex < activePhotoplaywrightVerdicts.length - 1) {
      photoplaywrightIndex += 1;
      renderPhotoplaywright(photoplaywrightIndex);
      return;
    }

    showExecutiveVerdict(decideExecutiveVerdict());
  });
}

if (finalAction && reconferenceWorkshop) {
  finalAction.addEventListener("click", (event) => {
    if (activeExecutiveVerdict !== "reconference") return;
    event.preventDefault();
    reconferenceCount += 1;
    reconferenceWorkshop.hidden = false;
    startReconferenceClock();
    reconferenceWorkshop.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (updatedConference) {
  updatedConference.addEventListener("click", () => {
    if (reconferenceCount >= 2) {
      showExecutiveVerdict("wastebasket");
      return;
    }

    if (readerVerdict) {
      readerVerdict.innerHTML = `
        <p class="eyebrow">Updated Writers' Verdicts</p>
        <div class="verdict-card">
          <span class="verdict-card__seal">J.M.</span>
          <div>
            <h3>Miss Jeanette Marchmont</h3>
            <p class="verdict-card__role">Second Conference / Structure Reconsidered</p>
            <p>The new material improves the moral pressure, but the romance and spectacle still do not strike the same clock. The conference requires one final strengthening pass before the property can be saved.</p>
          </div>
        </div>
      `;
    }

    showExecutiveVerdict(decideExecutiveVerdict());
  });
}

const treatmentTitle = document.querySelector("#treatment-title");
const treatmentLogline = document.querySelector("#treatment-logline");
const treatmentChecks = document.querySelectorAll("#treatment-writers input[type='checkbox']");
const selectedCount = document.querySelector("#selected-count");
const prepareTreatment = document.querySelector("#prepare-treatment");
const officialTreatment = document.querySelector("#official-treatment");

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
  const key = new URLSearchParams(window.location.search).get("property") || "dangerous-kisses";
  return propertyFiles[key] ? key : "dangerous-kisses";
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

if (treatmentTitle) {
  const key = getTreatmentProperty();
  const file = propertyFiles[key];
  treatmentTitle.textContent = file.title;
  if (treatmentLogline) treatmentLogline.textContent = file.logline;
  treatmentChecks.forEach((check) => check.addEventListener("change", updateTreatmentSelection));
  updateTreatmentSelection();
}

if (prepareTreatment && officialTreatment) {
  prepareTreatment.addEventListener("click", () => {
    const key = getTreatmentProperty();
    const file = propertyFiles[key];
    const blueprint = treatmentBlueprints[key] || treatmentBlueprints["dangerous-kisses"];
    const selected = selectedTreatmentWriters();
    const lengthText = key === "cathedral-clock"
      ? "The Standard Feature - 5 reels, 5,000 feet, 55 to 75 minutes"
      : "The Standard Feature - 5 reels, 5,000 feet, 55 to 75 minutes";
    const authors = selected.map((check) => `${check.value} (${check.dataset.role})`).join("; ");

    document.querySelector("#treatment-doc-title").textContent = file.title;
    document.querySelector("#treatment-doc-author").textContent = `${authors}. Original material credited according to the property file.`;
    document.querySelector("#treatment-doc-type").textContent = blueprint.type;
    document.querySelector("#treatment-doc-reels").textContent = lengthText;
    document.querySelector("#treatment-doc-theme").textContent = blueprint.theme;

    document.querySelector("#treatment-cast").innerHTML = blueprint.cast.map(([name, body]) => `
      <article>
        <h3>${name}</h3>
        <p>${body}</p>
      </article>
    `).join("");

    document.querySelector("#reel-breakdown").innerHTML = blueprint.reels.map(([label, body]) => `
      <article>
        <h3>${label}</h3>
        <p>${body}</p>
      </article>
    `).join("");

    officialTreatment.hidden = false;
    const upstairs = officialTreatment.querySelector(".treatment-signoff .button");
    if (upstairs) upstairs.href = `carstairs-office.html?property=${key}`;
    officialTreatment.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const carstairsTitle = document.querySelector("#carstairs-title");
const carstairsLogline = document.querySelector("#carstairs-logline");
const evaluateTreatment = document.querySelector("#evaluate-treatment");
const carstairsMemo = document.querySelector("#carstairs-memo");
const carstairsMemoTitle = document.querySelector("#carstairs-memo-title");
const carstairsOpinion = document.querySelector("#carstairs-opinion");
const carstairsVerdict = document.querySelector("#carstairs-verdict");
const carstairsStamp = document.querySelector("#carstairs-stamp");
const carstairsQuote = document.querySelector("#carstairs-quote");
const carstairsAction = document.querySelector("#carstairs-action");
const carstairsRewrite = document.querySelector("#carstairs-rewrite");
const carstairsTimer = document.querySelector("#carstairs-timer");
const resubmitCarstairs = document.querySelector("#resubmit-carstairs");
let carstairsRewriteUsed = false;
let carstairsInterval;

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
  const key = new URLSearchParams(window.location.search).get("property") || "dangerous-kisses";
  return propertyFiles[key] ? key : "dangerous-kisses";
}

function showCarstairsVerdict(kind, quote) {
  if (!carstairsVerdict || !carstairsStamp || !carstairsQuote || !carstairsAction) return;
  const labels = {
    greenlight: ["Greenlight", "final-stamp final-stamp--treatments", "Return to the Scenario Desk", "scenario-desk.html"],
    rewrite: ["Reconference", "final-stamp final-stamp--reconference", "Return to Treatment Room", "#carstairs-rewrite"],
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
  const file = propertyFiles[key];
  carstairsTitle.textContent = file.title;
  if (carstairsLogline) carstairsLogline.textContent = file.logline;
}

if (evaluateTreatment && carstairsMemo && carstairsOpinion) {
  evaluateTreatment.addEventListener("click", () => {
    const key = getCarstairsProperty();
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
    if (carstairsRewriteUsed) return;
    carstairsRewriteUsed = true;
    carstairsRewrite.hidden = false;
    startCarstairsClock();
    carstairsRewrite.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (resubmitCarstairs) {
  resubmitCarstairs.addEventListener("click", () => {
    if (carstairsMemoTitle && carstairsOpinion) {
      carstairsMemoTitle.textContent = "Now the treatment has blood in it.";
      carstairsOpinion.textContent = "Better. The repair gives the central image a reason to exist and puts the wound where the audience can feel it. I still dislike the machinery of the second movement, but I can sell a daughter climbing into her father's sin while the city watches the clock. That is a picture.";
    }
    showCarstairsVerdict("greenlight", "Greenlight it. But keep the clock cruel and the girl braver than the men around her.");
    if (carstairsRewrite) carstairsRewrite.hidden = true;
    if (carstairsVerdict) carstairsVerdict.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const STUDIO_NAME = 'SCOTCHMALLOWS PICTURES CORPORATION';
const STORAGE_KEY = 'scenario_department_properties_v1';

const sourceTypes = [
  'Photoplay script',
  'Pulp magazine story',
  'Novel excerpt',
  'Short story',
  'Stage play',
  'Newspaper serial',
  'Original premise',
];

const statuses = [
  'Submitted',
  'Mining',
  'Mined',
  'Writers’ Conference',
  'Consensus Report Complete',
  'Executive Verdict',
  'Reconference',
  'Sent to Treatments',
  'Treatment in Progress',
  'Sent Upstairs',
  'Greenlit',
  'Rewrite Before Greenlight',
  'Wastebasket',
];

const rules = {
  Structure: [
    'Every photoplay must have a single, clearly identifiable protagonist.',
    'The protagonist’s desire must drive the story.',
    'The story must build in rising action.',
    'The climax must be visual.',
    'No scene should exist unless it advances story or reveals essential character.',
  ],
  Character: [
    'The protagonist must want something visible and dramatic.',
    'The antagonist must be worthy.',
    'The love story must matter to the central spine.',
    'Women characters must have intelligence, agency, reputation, and something to lose.',
    'Character must be revealed through action under pressure.',
  ],
  Spectacle: [
    'Every major property needs at least one unforgettable visual sequence.',
    'Spectacle must have moral or emotional meaning.',
    'The set-piece must reveal, punish, reward, or transform.',
    'The camera must be treated as an engine of sight, not merely a recorder of dialogue.',
  ],
  Morality: [
    'Choices must have consequences.',
    'The climax must force a moral decision.',
    'The ending must feel earned.',
    'Sin, betrayal, sacrifice, love, greed, duty, and ambition should collide visibly.',
  ],
  Comedy: [
    'Comedy should provide relief, contrast, or social bite.',
    'It can come from servants, class manners, pompous characters, romantic embarrassment, children, or social absurdity.',
    'Comedy should not weaken the drama. It should sharpen it.',
  ],
};

const writers = [
  {
    id: 'structure',
    role: 'The Structure Writer',
    byline: 'Continuity, reversals, clean rising action',
    focus: 'whether the story can become a clean, rising motion-picture structure',
    tags: ['plot', 'engine', 'climax', 'stakes'],
  },
  {
    id: 'humanity',
    role: 'The Humanity Writer',
    byline: 'Tears, recognition, emotional truth',
    focus: 'whether an audience will care, cry, ache, or recognize emotional truth',
    tags: ['love', 'family', 'heart', 'sacrifice'],
  },
  {
    id: 'social',
    role: 'The Social Polish Writer',
    byline: 'Manners, reputation, women, consequence',
    focus: 'manners, reputation, women’s intelligence, class pressure, and social consequence',
    tags: ['woman', 'society', 'reputation', 'class'],
  },
  {
    id: 'moral',
    role: 'The Moral Drama Writer',
    byline: 'Guilt, duty, betrayal, consequence',
    focus: 'moral conflict, confrontation, guilt, sacrifice, duty, betrayal, and consequence',
    tags: ['betrayal', 'duty', 'truth', 'honor'],
  },
  {
    id: 'wit',
    role: 'The Wit and Society Writer',
    byline: 'Comedy, relief, social bite',
    focus: 'comedy, wit, social bite, modernity, and relief from solemnity',
    tags: ['comedy', 'wit', 'servant', 'manners'],
  },
  {
    id: 'epic',
    role: 'The Epic Romance Writer',
    byline: 'Destiny, star-power, scale, sweep',
    focus: 'destiny, star power, romance, scale, and sweeping emotional appeal',
    tags: ['romance', 'spectacle', 'fate', 'star'],
  },
  {
    id: 'period',
    role: 'The Period Pressure Writer',
    byline: 'Tradition, inheritance, public shame',
    focus: 'historical force, old-world duty, tradition, honor, inheritance, and public shame',
    tags: ['inheritance', 'tradition', 'old', 'shame'],
  },
];

const seedProperties = [
  {
    id: 'seed-001',
    logNumber: 'SCN-1921-001',
    title: 'The House That Heard Everything',
    sourceType: 'Pulp magazine story',
    logline: 'A switchboard operator in a decaying hotel overhears the confession that could save the man she loves and ruin the woman who owns the house.',
    text: 'A Gothic suspense premise with a hotel switchboard, a rainstorm, a missing heiress, a society engagement, and a final flood in the basement records room.',
    notes: 'Look for Gothic suspense, a strong female role, public scandal, and a visual climax.',
    dateSubmitted: '1926-05-18',
    status: 'Sent to Treatments',
    executiveVerdict: 'SEND TO TREATMENTS',
    finalVerdict: '',
    conferenceCount: 1,
    history: ['Submitted to the Scenario Desk', 'Writers returned their notes', 'Stamped: SEND TO TREATMENTS'],
  },
  {
    id: 'seed-002',
    logNumber: 'SCN-1921-002',
    title: 'Bread for the Lion',
    sourceType: 'Original premise',
    logline: 'A bankrupt baker agrees to hide a circus lion for a gangster and accidentally becomes the bravest man in the city.',
    text: 'A comic city fable with a baker, a lion, a gangster, a mayoral parade, and a child who believes courage is contagious.',
    notes: 'Comedy with social bite, visual chaos, and a clean heroic want.',
    dateSubmitted: '1926-05-20',
    status: 'Reconference',
    executiveVerdict: 'RECONFERENCE',
    finalVerdict: '',
    conferenceCount: 1,
    reconference: {
      hours: 36,
      reason: 'The picture has charm and a public parade, but the moral crucible is still soft and the antagonist must become worthy of the lion.',
      missing: ['Stronger antagonist', 'Moral conflict', 'Defined climax'],
      startedAt: Date.now() - 1000 * 60 * 8,
    },
    history: ['Submitted to the Scenario Desk', 'Stamped: RECONFERENCE'],
  },
];

let state = {
  activeTab: 'desk',
  selectedPropertyId: null,
  properties: loadProperties(),
  minedStories: [],
  archiveFilter: 'All',
};

function loadProperties() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(stored) && stored.length ? stored : seedProperties;
  } catch {
    return seedProperties;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
}

function h(strings, ...values) {
  return strings.reduce((out, string, index) => out + string + (values[index] ?? ''), '');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function todayStudioDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextLogNumber() {
  const next = state.properties.length + 1;
  return `SCN-1921-${String(next).padStart(3, '0')}`;
}

function scoreText(property) {
  const blob = `${property.title} ${property.logline} ${property.text} ${property.notes}`.toLowerCase();
  const score = {
    spectacle: /(fire|flood|train|ship|ball|court|storm|battle|riot|disaster|cathedral|circus|hotel|parade|mansion|climax)/g,
    morality: /(betray|guilt|duty|sacrifice|honor|truth|greed|sin|family|love|ambition|choice)/g,
    character: /(woman|mother|daughter|sister|heroine|wife|protagonist|rival|antagonist|lover|child)/g,
    structure: /(must|wants|seeks|discovers|forces|loses|stakes|deadline|escape|prove)/g,
    comedy: /(comic|comedy|wit|servant|mistaken|embarrassment|pompous|absurd|manners)/g,
  };
  return Object.fromEntries(Object.entries(score).map(([key, regex]) => [key, (blob.match(regex) || []).length]));
}

function chooseWriters(property) {
  const scores = scoreText(property);
  const desired = new Set(['structure', 'humanity', 'moral']);
  if (scores.character > 0) desired.add('social');
  if (scores.comedy > 0) desired.add('wit');
  if (scores.spectacle > 1 || /romance|love|destiny|sweeping/i.test(property.notes + property.logline)) desired.add('epic');
  if (/gothic|inheritance|tradition|period|old-world|shame|mansion|hotel/i.test(property.notes + property.logline + property.text)) desired.add('period');
  return writers.filter((writer) => desired.has(writer.id)).slice(0, 5);
}

function buildConference(property) {
  const selected = chooseWriters(property);
  const scores = scoreText(property);
  const strongSpectacle = scores.spectacle >= 2;
  const strongMoral = scores.morality >= 2;
  const strongStructure = scores.structure >= 1 || property.logline.length > 65;
  const hasFemaleRole = scores.character >= 1 || /woman|female|heroine|daughter|wife|sister|mother/i.test(property.notes + property.logline);
  const strengths = [];
  const weaknesses = [];

  if (strongStructure) strengths.push('A readable dramatic engine with pressure enough to start a picture moving.');
  else weaknesses.push('No clear dramatic engine has yet declared itself on the page.');
  if (strongMoral) strengths.push('The material contains moral weather: duty, betrayal, sacrifice, or consequence.');
  else weaknesses.push('Insufficient moral consequence; the climax may argue nothing yet.');
  if (strongSpectacle) strengths.push('A world worth photographing and at least one set-piece with studio-size promise.');
  else weaknesses.push('Spectacle not yet attached to moral choice; the camera has too little to do.');
  if (hasFemaleRole) strengths.push('There is room for a woman of intelligence, agency, reputation, and something to lose.');
  else weaknesses.push('No major female role has power over the outcome rather than sympathy within it.');
  if (scores.comedy > 0) strengths.push('Comedy may sharpen the drama with social bite and relief.');

  const mostFrequentNote = !strongSpectacle
    ? 'What visual climax proves the moral argument?'
    : !strongMoral
      ? 'What public disaster makes a private wound impossible to hide?'
      : !hasFemaleRole
        ? 'What role gives the woman power over the outcome?'
        : 'What event forces the protagonist to choose between love, duty, ambition, and survival?';

  const notes = selected.map((writer) => ({
    writerId: writer.id,
    role: writer.role,
    note: writerNote(writer, property, { strongSpectacle, strongMoral, strongStructure, hasFemaleRole, scores }),
  }));

  const merits = [strongStructure, strongMoral, strongSpectacle, hasFemaleRole].filter(Boolean).length;
  let verdict = 'RECONFERENCE';
  if (merits >= 3 && strongSpectacle && strongMoral) verdict = 'SEND TO TREATMENTS';
  if (merits <= 1 || (property.conferenceCount || 0) >= 2 && verdict !== 'SEND TO TREATMENTS') verdict = 'WASTEBASKET';

  return {
    selectedWriters: selected.map((writer) => writer.id),
    notes,
    strengths,
    weaknesses,
    mostFrequentNote,
    executiveVerdict: verdict,
    executiveNote: executiveNote(verdict, mostFrequentNote),
    completedAt: todayStudioDate(),
  };
}

function writerNote(writer, property, flags) {
  const title = property.title || 'the untitled property';
  const templates = {
    structure: flags.strongStructure
      ? `${title} has a usable spine, but it must be made visible: a want, a deadline, a reversal, and a climax that cannot be talked through.`
      : `${title} is atmosphere without sufficient machinery. Give the protagonist a visible want and an event that forces every later scene to answer it.`,
    humanity: flags.scores.morality || /love|family|child|mother|brother|sister/i.test(property.logline + property.text)
      ? `There is ache in the material. The audience will follow if the private wound becomes public and the final sacrifice costs more than pride.`
      : `The heart is still under glass. Find the person who can be hurt most deeply, then arrange the plot so the injury must be witnessed.`,
    social: flags.hasFemaleRole
      ? `The feminine part can be more than ornament if reputation, intelligence, and choice are written into the last reel. Let her know something the men do not.`
      : `No woman yet has command of the outcome. Add a daughter, wife, rival, patroness, or witness whose reputation can turn the story.`,
    moral: flags.strongMoral
      ? `Good: the story smells of consequence. Now make the moral decision physical, public, and irreversible in the final movement.`
      : `The property must stop admiring trouble and start judging choices. Who betrays whom, and what visible price follows?`,
    wit: `Permit wit to enter through class pressure, servants, pompous authority, or romantic embarrassment. Comedy should tighten the screw, not loosen it.`,
    epic: flags.strongSpectacle
      ? `There is a poster in the material. Attach the spectacle to love, duty, or shame so the big scene becomes the soul of the picture.`
      : `The picture needs thunder: fire, flood, courtroom, train, ballroom, ship, public ruin—some visual engine large enough for destiny.`,
    period: `Old obligations are useful only when they trap the living. Make inheritance, tradition, or public shame push the lovers or rivals into action.`,
  };
  return templates[writer.id];
}

function executiveNote(verdict, note) {
  if (verdict === 'SEND TO TREATMENTS') return 'Stamp it and send it down the corridor. The property has sufficient fire, shape, and photographic appetite to justify treatment pages.';
  if (verdict === 'WASTEBASKET') return 'File it without malice. The writing may have virtues, but the property has not proved itself a picture.';
  return `The property has promise, but not yet thunder. Reconference ordered: ${note}`;
}

function createProperty(form) {
  return {
    id: crypto.randomUUID(),
    logNumber: nextLogNumber(),
    title: form.title || 'Untitled Property',
    sourceType: form.sourceType || 'Original premise',
    logline: form.logline || '',
    text: form.text || '',
    notes: form.notes || '',
    dateSubmitted: todayStudioDate(),
    status: 'Writers’ Conference',
    executiveVerdict: '',
    finalVerdict: '',
    conferenceCount: 0,
    history: ['Submitted to the Scenario Desk', 'Sent to the Writers’ Room'],
  };
}

function runConference(property) {
  property.conferenceCount = (property.conferenceCount || 0) + 1;
  property.status = 'Consensus Report Complete';
  property.conference = buildConference(property);
  property.executiveVerdict = property.conference.executiveVerdict;
  property.status = property.executiveVerdict === 'SEND TO TREATMENTS' ? 'Sent to Treatments' : property.executiveVerdict === 'WASTEBASKET' ? 'Wastebasket' : 'Reconference';
  property.history = [...(property.history || []), 'The writers have returned their notes', `Stamped: ${property.executiveVerdict}`];
  if (property.executiveVerdict === 'RECONFERENCE') {
    property.reconference = buildReconference(property);
  }
  persist();
}

function buildReconference(property) {
  const weaknesses = property.conference?.weaknesses || [];
  const missing = [];
  if (weaknesses.some((w) => /Spectacle|camera|visual/i.test(w))) missing.push('Grand spectacle');
  if (weaknesses.some((w) => /moral|consequence/i.test(w))) missing.push('Moral conflict');
  if (weaknesses.some((w) => /female|woman/i.test(w))) missing.push('Stronger female role');
  if (weaknesses.some((w) => /engine|structure/i.test(w))) missing.push('A stronger dramatic engine');
  if (!missing.length) missing.push('Physical stakes', 'A defined climax');
  const hours = [24, 36, 48, 60, 72][Math.min(missing.length, 4)];
  return {
    hours,
    missing,
    startedAt: Date.now(),
    reason: `The conference sees a promising nucleus in ${property.title}, but the property must be sweetened before another dollar of studio attention is spent.`,
  };
}

function generateTreatment(property, writerIds) {
  const chosen = writers.filter((writer) => writerIds.includes(writer.id));
  const title = property.title;
  property.treatmentWriters = chosen.map((writer) => writer.role);
  property.treatment = {
    preparedAt: todayStudioDate(),
    title,
    sourceMaterial: property.sourceType,
    logline: property.logline,
    centralPromise: `A motion picture in which private desire is driven into public consequence, giving ${title} the shape of spectacle with a human wound at its center.`,
    characters: [
      'The Protagonist — a visible want, a concealed wound, and a choice that must be made under pressure.',
      'The Antagonist or Rival — worthy enough to make victory costly.',
      'The Woman with Something to Lose — intelligence, reputation, agency, and command of a decisive fact.',
      'The Comic or Social Witness — relief, contrast, and an eye for hypocrisy.',
    ],
    visualWorld: 'Mahogany rooms, gaslit streets, society thresholds, public halls, and one set-piece large enough to make moral consequence visible from the back row.',
    movements: [
      'I. The Want Declared: the protagonist reaches for love, fortune, rescue, or honor and disturbs the settled order.',
      'II. The Pressure Mounts: rivals, family duty, public shame, and romantic danger compress every private secret into public action.',
      'III. The Crucible: spectacle arrives not as decoration but as judgment; the set-piece forces the decisive moral choice.',
      'IV. The Last Image: the ending rewards courage, punishes betrayal, and leaves the audience with a picture rather than a speech.',
    ],
    setPieces: ['A public revelation under chandeliers', 'A chase or rescue through weather, machinery, or crowd', 'A final tableau in which love and duty visibly collide'],
    moralCrucible: 'The protagonist must choose between personal desire and the act that saves another soul, reputation, or community.',
    emotionalSpine: 'A romance or family bond that cannot survive unless truth is made visible.',
    finalClimax: 'A thunderous visual decision staged before witnesses, so the camera becomes an engine of sight, not a megaphone.',
    upstairsReason: 'The property has enough spectacle, moral force, emotional fire, and visual power to request the attention of R. X. Carstairs-D’Assine.',
  };
  property.status = 'Treatment in Progress';
  property.history = [...(property.history || []), 'Treatment prepared for R. X. Carstairs-D’Assine'];
  persist();
}

function sendUpstairs(property) {
  const text = `${property.treatment?.centralPromise || ''} ${property.treatment?.finalClimax || ''} ${property.conference?.strengths?.join(' ') || ''}`.toLowerCase();
  const green = /spectacle|visual|moral|choice|public|fire|thunder/.test(text) && (property.conference?.strengths?.length || 0) >= 3;
  const rewrite = /promise|heart|wound|public|choice/.test(text);
  property.status = green ? 'Greenlit' : rewrite ? 'Rewrite Before Greenlight' : 'Wastebasket';
  property.finalVerdict = green ? 'GREENLIGHT' : rewrite ? 'REWRITE BEFORE GREENLIGHT' : 'WASTEBASKET';
  property.carstairsNote = green
    ? 'Greenlight. This has a heart, a wound, and a final image large enough to hang above the box office.'
    : rewrite
      ? 'This has a heart, a wound, and a house big enough to echo with both. But the climax still whispers where it must thunder. Rewrite before greenlight.'
      : 'The treatment bows handsomely, but it does not command the room. Wastebasket.';
  property.history = [...(property.history || []), 'Sent Upstairs to Carstairs', `Carstairs verdict: ${property.finalVerdict}`];
  persist();
}

function mineStories({ publicationTitle, sourceType, criteria, text }) {
  const chunks = text
    .split(/\n\s*(?:-{3,}|\*{3,}|STORY:|Title:|CHAPTER\s+\d+|\d+\.\s+)/i)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 80)
    .slice(0, 8);
  const candidates = (chunks.length ? chunks : [text]).map((chunk, index) => {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    const guessedTitle = (lines[0] || `${publicationTitle} Candidate ${index + 1}`).replace(/^by\s+/i, '').slice(0, 70);
    const authorLine = lines.find((line) => /^by\s+/i.test(line));
    const temp = { title: guessedTitle, logline: chunk.slice(0, 180), text: chunk, notes: criteria, sourceType };
    const scores = scoreText(temp);
    const promiseScore = scores.spectacle + scores.morality + scores.character + scores.structure;
    return {
      id: crypto.randomUUID(),
      title: guessedTitle,
      author: authorLine ? authorLine.replace(/^by\s+/i, '') : 'Not detected',
      summary: chunk.replace(/\s+/g, ' ').slice(0, 260) + (chunk.length > 260 ? '…' : ''),
      genre: /ghost|mansion|murder|inheritance|storm/i.test(chunk) ? 'Gothic suspense' : /love|marriage|romance/i.test(chunk) ? 'Romantic drama' : /comic|funny|servant/i.test(chunk) ? 'Society comedy' : 'Dramatic property',
      cinematicPromise: promiseScore > 6 ? 'Strong visual and moral pressure detected.' : promiseScore > 3 ? 'Some adaptable dramatic pressure detected.' : 'Modest cinematic evidence; needs invention.',
      criteriaFit: criteria ? `May suit the brief by answering: “${criteria.slice(0, 120)}${criteria.length > 120 ? '…' : ''}”` : 'No special criteria supplied; judged by the Photoplay Rules.',
      weaknesses: promiseScore > 4 ? 'Needs a sharper final image and a more public moral choice.' : 'Dramatic engine, spectacle, and character agency remain uncertain.',
      verdict: promiseScore > 6 ? 'Strong candidate' : promiseScore > 3 ? 'Possible candidate' : 'Weak candidate',
      sourceType,
      text: chunk,
    };
  });
  return candidates.sort((a, b) => verdictWeight(b.verdict) - verdictWeight(a.verdict));
}

function verdictWeight(verdict) {
  return verdict === 'Strong candidate' ? 3 : verdict === 'Possible candidate' ? 2 : 1;
}

function appShell(content) {
  const nav = [
    ['desk', 'The Scenario Desk'],
    ['submit', 'Submit a Property'],
    ['mine', 'Magazine Mine'],
    ['writers', 'The Writers’ Room'],
    ['treatment', 'Treatment Room'],
    ['archives', 'Pulp Archives'],
    ['rules', 'Photoplay Rules'],
  ];
  return h`
    <main class="studio-shell">
      <header class="studio-header">
        <div class="header-frame">
          <p class="kicker">The Scenario Department is now in session</p>
          <h1>${STUDIO_NAME}</h1>
          <h2>DEPARTMENT OF SCENARIOS</h2>
          <p class="established">ESTABLISHED MCMXXI — R. X. CARSTAIRS-D’ASSINE, HEAD OF SCENARIO</p>
        </div>
      </header>
      <nav class="file-tabs" aria-label="Scenario Department folders">
        ${nav.map(([id, label]) => `<button class="tab ${state.activeTab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}
      </nav>
      <section class="desk-surface">${content}</section>
    </main>
  `;
}

function render() {
  const view = {
    desk: renderDesk,
    submit: renderSubmit,
    mine: renderMine,
    writers: renderWriters,
    treatment: renderTreatment,
    archives: renderArchives,
    rules: renderRules,
  }[state.activeTab] || renderDesk;
  document.querySelector('#app').innerHTML = appShell(view());
  bindEvents();
}

function renderDesk() {
  const counts = {
    'Total properties submitted': state.properties.length,
    'Properties in writers’ conference': state.properties.filter((p) => ['Writers’ Conference', 'Consensus Report Complete'].includes(p.status)).length,
    'Properties sent to treatment': state.properties.filter((p) => ['Sent to Treatments', 'Treatment in Progress', 'Sent Upstairs'].includes(p.status)).length,
    'Properties greenlit': state.properties.filter((p) => p.status === 'Greenlit').length,
    'Properties reconferenced': state.properties.filter((p) => p.status === 'Reconference').length,
    'Properties thrown into the wastebasket': state.properties.filter((p) => p.status === 'Wastebasket').length,
  };
  return h`
    <div class="section-heading">
      <p class="rubric">Executive Desk</p>
      <h2>The Scenario Desk</h2>
      <p>The camera is an engine of sight, not a megaphone. Mine forgotten material for spectacle, moral force, emotional fire, and visual power.</p>
    </div>
    <div class="summary-grid">${Object.entries(counts).map(([label, count]) => memoCard(`<span class="count">${count}</span><span>${label}</span>`, 'summary')).join('')}</div>
    <div class="ledger paper-panel">
      <div class="panel-title"><span>Recent Submissions</span><b>Director-General’s blotter</b></div>
      <div class="property-list">${state.properties.slice().reverse().map(renderPropertyRow).join('')}</div>
    </div>
  `;
}

function memoCard(inner, extra = '') {
  return `<article class="memo-card ${extra}"><i class="brad"></i>${inner}</article>`;
}

function renderPropertyRow(property) {
  return h`
    <article class="property-row">
      <div>
        <p class="log-number">${property.logNumber}</p>
        <h3>${escapeHtml(property.title)}</h3>
        <p>${escapeHtml(property.sourceType)} · Submitted ${escapeHtml(property.dateSubmitted)}</p>
      </div>
      <div class="status-stack">
        <span class="stamp ${property.status === 'Wastebasket' ? 'danger' : ''}">${escapeHtml(property.status)}</span>
        ${property.executiveVerdict ? `<span class="verdict">${escapeHtml(property.executiveVerdict)}</span>` : ''}
      </div>
      <div class="row-actions">
        <button data-open="writers" data-id="${property.id}">Writers’ Room</button>
        <button data-open="treatment" data-id="${property.id}">Treatment Room</button>
        <button data-open="archives" data-id="${property.id}">Coverage</button>
      </div>
    </article>
  `;
}

function renderSubmit() {
  return h`
    <div class="section-heading">
      <p class="rubric">Single Property Intake</p>
      <h2>Submit a Property</h2>
      <p>Paste a premise, play, pulp story, serial, or treatment. The submitter’s notes tell the AI what treasure to mine.</p>
    </div>
    <form class="paper-form" id="submit-form">
      <label>Property title<input name="title" required placeholder="The Missing Heiress of Lot 7" /></label>
      <label>Source type<select name="sourceType">${sourceTypes.map((type) => `<option>${type}</option>`).join('')}</select></label>
      <label class="wide">Logline or basic story idea<textarea name="logline" rows="3" placeholder="A switchboard girl hears a confession that could save a lover and ruin a studio dynasty."></textarea></label>
      <label class="wide">Full pasted text<textarea name="text" rows="9" placeholder="Paste the story, excerpt, premise, or treatment here."></textarea></label>
      <label>File upload<input name="file" type="file" accept=".txt,.md,.pdf,text/plain,application/pdf" /><small>Plain text is read directly. PDF files receive a conversion notice in this browser build.</small></label>
      <label class="wide">Submitter’s notes<textarea name="notes" rows="4" placeholder="Look for Gothic suspense, a strong female role, a central moral betrayal, a visual climax, and a DeMille-style spectacle."></textarea></label>
      <button class="primary" type="submit">Submit to the Scenario Desk</button>
    </form>
  `;
}

function renderMine() {
  return h`
    <div class="section-heading">
      <p class="rubric">Bulk Source Examination</p>
      <h2>Magazine Mine</h2>
      <p>Upload or paste a magazine, anthology, newspaper issue, or large text file. The mine recommends the best two or three candidates instead of flooding the department.</p>
    </div>
    <form class="paper-form" id="mine-form">
      <label>Publication title<input name="publicationTitle" required placeholder="All-Story Weekly, June 1926" /></label>
      <label>Source type<select name="sourceType"><option>Pulp magazine story</option><option>Newspaper serial</option><option>Short story</option><option>Novel excerpt</option></select></label>
      <label class="wide">Mining criteria / submitter’s notes<textarea name="criteria" rows="4" placeholder="Find two or three stories with visual climax, moral betrayal, female agency, and romantic pressure."></textarea></label>
      <label>File upload<input name="file" type="file" accept=".txt,.md,.pdf,text/plain,application/pdf" /><small>PDF extraction is not available in this static build; convert PDFs to text first.</small></label>
      <label class="wide">Pasted magazine text<textarea name="text" rows="10" placeholder="Paste the issue or anthology text here. Separate stories with lines, dashes, or title headings."></textarea></label>
      <button class="primary" type="submit">Mine the Magazine</button>
    </form>
    ${renderMinedResults()}
  `;
}

function renderMinedResults() {
  if (!state.minedStories.length) return '';
  const topIds = new Set(state.minedStories.filter((story) => story.verdict !== 'Weak candidate').slice(0, 3).map((story) => story.id));
  return h`
    <div class="paper-panel mined-panel">
      <div class="panel-title"><span>Mining Results</span><b>Best candidates are pre-selected</b></div>
      <form id="selected-mined-form">
        ${state.minedStories.map((story) => h`
          <article class="scenario-card">
            <label class="checkline"><input type="checkbox" name="story" value="${story.id}" ${topIds.has(story.id) ? 'checked' : ''} /> Submit this story</label>
            <h3>${escapeHtml(story.title)}</h3>
            <p class="byline">By ${escapeHtml(story.author)} · ${escapeHtml(story.genre)}</p>
            <p>${escapeHtml(story.summary)}</p>
            <dl>
              <dt>Cinematic promise</dt><dd>${escapeHtml(story.cinematicPromise)}</dd>
              <dt>Why it suits the criteria</dt><dd>${escapeHtml(story.criteriaFit)}</dd>
              <dt>Possible weaknesses</dt><dd>${escapeHtml(story.weaknesses)}</dd>
            </dl>
            <span class="stamp">${escapeHtml(story.verdict)}</span>
          </article>
        `).join('')}
        <button class="primary" type="submit">Submit Selected Stories to the Scenario Department</button>
      </form>
    </div>
  `;
}

function selectedProperty() {
  return state.properties.find((p) => p.id === state.selectedPropertyId) || state.properties[0];
}

function renderWriters() {
  const property = selectedProperty();
  if (!property) return emptyState('No properties have reached the Writers’ Room.', 'Submit a Property');
  const conference = property.conference;
  return h`
    <div class="section-heading">
      <p class="rubric">Conference Table</p>
      <h2>The Writers’ Room</h2>
      <p>Select a property and convene only the writers whose opinions are useful. The verdict is automatic and governed by the Photoplay Rules.</p>
    </div>
    ${propertyPicker(property.id)}
    <article class="paper-panel feature-file">
      <div class="panel-title"><span>${escapeHtml(property.title)}</span><b>${escapeHtml(property.status)}</b></div>
      <p class="logline">${escapeHtml(property.logline || 'No logline supplied.')}</p>
      <p><strong>Submitter’s notes:</strong> ${escapeHtml(property.notes || 'None supplied.')}</p>
      <div class="writer-strip">${chooseWriters(property).map((writer) => `<span>${writer.role}<small>${writer.byline}</small></span>`).join('')}</div>
      <button class="primary" data-action="conference" data-id="${property.id}">Convene / Reconvene Writers</button>
    </article>
    ${conference ? renderConference(property) : ''}
    ${property.status === 'Reconference' ? renderReconference(property) : ''}
  `;
}

function propertyPicker(id) {
  return `<label class="picker">Open property file<select id="property-picker">${state.properties.map((p) => `<option value="${p.id}" ${p.id === id ? 'selected' : ''}>${p.logNumber} — ${escapeHtml(p.title)}</option>`).join('')}</select></label>`;
}

function renderConference(property) {
  const c = property.conference;
  return h`
    <section class="paper-panel">
      <div class="panel-title"><span>Consensus Report</span><b>${escapeHtml(c.executiveVerdict)}</b></div>
      <div class="notes-grid">${c.notes.map((note) => memoCard(`<h3>${escapeHtml(note.role)}</h3><p>${escapeHtml(note.note)}</p>`)).join('')}</div>
      <div class="report-columns">
        <div><h3>Strengths</h3><ul>${c.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div><h3>Weaknesses</h3><ul>${c.weaknesses.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      <blockquote><strong>Most Frequent Note:</strong> ${escapeHtml(c.mostFrequentNote)}</blockquote>
      <p class="executive-note"><strong>Executive Verdict:</strong> ${escapeHtml(c.executiveNote)}</p>
    </section>
  `;
}

function renderReconference(property) {
  const mandate = property.reconference || buildReconference(property);
  const minutesRemaining = Math.max(0, Math.ceil((mandate.hours * 60 * 1000 - (Date.now() - mandate.startedAt)) / 60000));
  return h`
    <section class="paper-panel mandate">
      <div class="panel-title"><span>Department of Scenarios — Reconference Mandate</span><b>Conference hours: ${mandate.hours}</b></div>
      <p>${escapeHtml(mandate.reason)}</p>
      <p><strong>Missing elements:</strong> ${mandate.missing.map(escapeHtml).join(', ')}</p>
      <div class="timer"><span>${minutesRemaining}</span><em>real-world minutes remaining</em><small>1 in-conference hour = 1 real-world minute</small></div>
      <form class="paper-form compact" id="reconference-form" data-id="${property.id}">
        <label class="wide">The New Spectacle<textarea name="spectacle" required rows="3" placeholder="A train wreck, flood, society ball, ship disaster, courtroom collapse, fire, or public scandal."></textarea></label>
        <label class="wide">The Moral Crucible<textarea name="crucible" required rows="3" placeholder="What choice forces love, duty, ambition, family, truth, honor, survival, or sacrifice to collide?"></textarea></label>
        <label class="wide">Additional Sweetening Notes<textarea name="notes" rows="3" placeholder="Add a rival, strengthen the woman’s role, introduce an inheritance fight, betrayal, or scandal."></textarea></label>
        <button class="primary" type="submit">Return to Conference</button>
      </form>
    </section>
  `;
}

function renderTreatment() {
  const property = selectedProperty();
  if (!property) return emptyState('No properties are ready for treatments.', 'Submit a Property');
  const recommended = chooseWriters(property).slice(0, 3).map((writer) => writer.id);
  return h`
    <div class="section-heading">
      <p class="rubric">Scenario Pages</p>
      <h2>Treatment Room</h2>
      <p>Select two or three writers, prepare the official treatment, then send it upstairs to R. X. Carstairs-D’Assine.</p>
    </div>
    ${propertyPicker(property.id)}
    <section class="paper-panel">
      <div class="panel-title"><span>${escapeHtml(property.title)}</span><b>${escapeHtml(property.status)}</b></div>
      <form id="treatment-form" data-id="${property.id}" class="writer-select">
        ${writers.map((writer) => `<label><input type="checkbox" name="writer" value="${writer.id}" ${recommended.includes(writer.id) ? 'checked' : ''}/> <strong>${writer.role}</strong><small>${writer.focus}</small></label>`).join('')}
        <button class="primary" type="submit">Prepare Official Treatment</button>
      </form>
    </section>
    ${property.treatment ? renderTreatmentPages(property) : ''}
  `;
}

function renderTreatmentPages(property) {
  const t = property.treatment;
  return h`
    <article class="paper-panel treatment-pages">
      <div class="panel-title"><span>Official Treatment</span><b>Prepared for R. X. Carstairs-D’Assine, Director-General</b></div>
      <h2>${escapeHtml(t.title)}</h2>
      <p><strong>Source material:</strong> ${escapeHtml(t.sourceMaterial)}</p>
      <p><strong>Logline:</strong> ${escapeHtml(t.logline || 'To be supplied in conference.')}</p>
      <p><strong>Central dramatic promise:</strong> ${escapeHtml(t.centralPromise)}</p>
      <h3>Principal Characters</h3><ul>${t.characters.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <h3>Visual World</h3><p>${escapeHtml(t.visualWorld)}</p>
      <h3>Major Movements</h3><ol>${t.movements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
      <h3>Major Set Pieces</h3><ul>${t.setPieces.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <p><strong>Moral crucible:</strong> ${escapeHtml(t.moralCrucible)}</p>
      <p><strong>Romantic or emotional spine:</strong> ${escapeHtml(t.emotionalSpine)}</p>
      <p><strong>Final visual climax:</strong> ${escapeHtml(t.finalClimax)}</p>
      <p><strong>Why this property should go upstairs:</strong> ${escapeHtml(t.upstairsReason)}</p>
      <button class="primary" data-action="upstairs" data-id="${property.id}">Send Upstairs to Carstairs</button>
      ${property.finalVerdict ? `<div class="carstairs"><span class="stamp">${escapeHtml(property.finalVerdict)}</span><p>${escapeHtml(property.carstairsNote)}</p></div>` : ''}
    </article>
  `;
}

function renderArchives() {
  const filters = ['All', 'Submitted', 'In conference', 'Reconference', 'Sent to treatments', 'Greenlit', 'Rewrite', 'Wastebasket', ...sourceTypes];
  const filtered = state.properties.filter((p) => {
    if (state.archiveFilter === 'All') return true;
    if (state.archiveFilter === 'In conference') return /Conference|Writers/.test(p.status);
    if (state.archiveFilter === 'Sent to treatments') return /Treatment|Upstairs/.test(p.status);
    if (state.archiveFilter === 'Rewrite') return p.status === 'Rewrite Before Greenlight';
    return p.status === state.archiveFilter || p.sourceType === state.archiveFilter;
  });
  const selected = selectedProperty();
  return h`
    <div class="section-heading">
      <p class="rubric">Library of Properties</p>
      <h2>Pulp Archives</h2>
      <p>Browse every submitted and mined property as a studio file card, then open the official coverage report.</p>
    </div>
    <div class="filter-bank">${filters.map((filter) => `<button class="filter ${state.archiveFilter === filter ? 'active' : ''}" data-filter="${filter}">${filter}</button>`).join('')}</div>
    <div class="archive-grid">${filtered.map((p) => h`
      <article class="file-card">
        <p class="log-number">${p.logNumber}</p><h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.sourceType)}</p><span class="stamp">${escapeHtml(p.status)}</span>
        ${p.executiveVerdict ? `<p><strong>Executive:</strong> ${escapeHtml(p.executiveVerdict)}</p>` : ''}
        ${p.finalVerdict ? `<p><strong>Final:</strong> ${escapeHtml(p.finalVerdict)}</p>` : ''}
        <button data-open="archives" data-id="${p.id}">Open Report</button>
        <button data-open="writers" data-id="${p.id}">Continue Workflow</button>
      </article>`).join('')}</div>
    ${selected ? renderCoverage(selected) : ''}
  `;
}

function renderCoverage(property) {
  const c = property.conference || {};
  const prefatory = {
    Interest: 'The public will respond to visible desire, social pressure, emotional danger, and a promise that trouble will become spectacle.',
    Scope: property.executiveVerdict === 'SEND TO TREATMENTS' ? 'Medium-to-large production with one commanding set-piece.' : 'Developmental scale until the central engine proves itself.',
    Comedy: 'Relief may be found in manners, servants, pompous authority, romantic embarrassment, or social absurdity where appropriate.',
    Drama: 'The core dramatic power lies in making private conflict public and forcing a moral decision under pressure.',
  };
  return h`
    <article class="paper-panel coverage-report">
      <div class="panel-title"><span>Official Coverage Report</span><b>${escapeHtml(property.logNumber)}</b></div>
      <h2>${escapeHtml(property.title)}</h2>
      <dl class="coverage-grid">
        <dt>Date of submission</dt><dd>${escapeHtml(property.dateSubmitted)}</dd>
        <dt>Source material</dt><dd>${escapeHtml(property.sourceType)}</dd>
        <dt>Assigned scenario writers</dt><dd>${escapeHtml((property.treatmentWriters || c.selectedWriters || []).join(', ') || 'Pending assignment')}</dd>
        <dt>Mined summary</dt><dd>${escapeHtml(property.logline || property.text?.slice(0, 220) || 'Not supplied')}</dd>
        <dt>Character archetypes</dt><dd>Protagonist, worthy antagonist, woman with agency, comic/social witness, public judge.</dd>
        <dt>Writer verdicts</dt><dd>${escapeHtml(c.notes?.map((n) => `${n.role}: filed`).join('; ') || 'Pending')}</dd>
        <dt>Most frequent note</dt><dd>${escapeHtml(c.mostFrequentNote || 'Pending conference')}</dd>
        <dt>Executive verdict</dt><dd>${escapeHtml(property.executiveVerdict || 'Pending')}</dd>
        <dt>Reconference history</dt><dd>${escapeHtml((property.history || []).filter((item) => /Reconference|Conference|Stamped/.test(item)).join(' · ') || 'None')}</dd>
        <dt>Carstairs final verdict</dt><dd>${escapeHtml(property.finalVerdict || 'Not yet sent upstairs')}</dd>
      </dl>
      <h3>Scenario Cards</h3><div class="scenario-card-row">${['Want', 'Obstacle', 'Spectacle', 'Moral Choice'].map((x) => `<span>${x}</span>`).join('')}</div>
      <h3>Consensus Strengths</h3><ul>${(c.strengths || ['Pending']).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <h3>Consensus Weaknesses</h3><ul>${(c.weaknesses || ['Pending']).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <h3>Prefatory Notes</h3>${Object.entries(prefatory).map(([key, value]) => `<p><strong>${key}.</strong> ${escapeHtml(value)}</p>`).join('')}
      ${property.treatment ? `<h3>Treatment</h3><p>${escapeHtml(property.treatment.centralPromise)}</p>` : ''}
      ${property.carstairsNote ? `<h3>Carstairs Note</h3><blockquote>${escapeHtml(property.carstairsNote)}</blockquote>` : ''}
    </article>
  `;
}

function renderRules() {
  return h`
    <div class="section-heading">
      <p class="rubric">Studio Doctrine</p>
      <h2>Photoplay Rules</h2>
      <p>These rules govern mining, conferences, verdicts, reconferences, treatments, and Carstairs’ final approval.</p>
    </div>
    <div class="rules-grid">${Object.entries(rules).map(([category, items]) => h`
      <article class="memo-card rule-card"><i class="brad"></i><h3>${category}</h3><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>
    `).join('')}</div>
  `;
}

function emptyState(message, action) {
  return `<div class="paper-panel empty"><h2>${message}</h2><button class="primary" data-tab="submit">${action}</button></div>`;
}

async function readFile(input) {
  const file = input?.files?.[0];
  if (!file) return '';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return '\n\n[PDF NOTICE: This static browser build cannot extract PDF text. Please convert the PDF to text first.]';
  }
  return file.text();
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    state.activeTab = button.dataset.tab;
    render();
  }));
  document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
    state.selectedPropertyId = button.dataset.id;
    state.activeTab = button.dataset.open;
    render();
  }));
  document.querySelector('#property-picker')?.addEventListener('change', (event) => {
    state.selectedPropertyId = event.target.value;
    render();
  });
  document.querySelector('#submit-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.text = `${data.text || ''}${await readFile(form.file)}`;
    const property = createProperty(data);
    state.properties.unshift(property);
    state.selectedPropertyId = property.id;
    runConference(property);
    state.activeTab = 'writers';
    persist();
    render();
  });
  document.querySelector('#mine-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.text = `${data.text || ''}${await readFile(form.file)}`;
    state.minedStories = mineStories(data);
    render();
  });
  document.querySelector('#selected-mined-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedIds = new FormData(event.currentTarget).getAll('story');
    selectedIds.forEach((id) => {
      const story = state.minedStories.find((item) => item.id === id);
      if (!story) return;
      const property = createProperty({
        title: story.title,
        sourceType: story.sourceType,
        logline: story.summary,
        text: story.text,
        notes: `${story.criteriaFit}\nSuggested verdict: ${story.verdict}`,
      });
      property.status = 'Mined';
      state.properties.unshift(property);
      runConference(property);
      state.selectedPropertyId = property.id;
    });
    state.activeTab = 'writers';
    persist();
    render();
  });
  document.querySelectorAll('[data-action="conference"]').forEach((button) => button.addEventListener('click', () => {
    const property = state.properties.find((p) => p.id === button.dataset.id);
    if (property) runConference(property);
    render();
  }));
  document.querySelector('#reconference-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const property = state.properties.find((p) => p.id === form.dataset.id);
    const data = Object.fromEntries(new FormData(form));
    if (!property) return;
    property.text += `\n\nRECONFERENCE SWEETENING\nNew Spectacle: ${data.spectacle}\nMoral Crucible: ${data.crucible}\nAdditional Notes: ${data.notes}`;
    property.notes += `\n${data.notes || ''}`;
    property.status = 'Writers’ Conference';
    property.history = [...(property.history || []), 'Reconference sweetening submitted'];
    runConference(property);
    render();
  });
  document.querySelector('#treatment-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const property = state.properties.find((p) => p.id === form.dataset.id);
    const writerIds = new FormData(form).getAll('writer').slice(0, 3);
    if (property) generateTreatment(property, writerIds.length ? writerIds : chooseWriters(property).slice(0, 3).map((w) => w.id));
    render();
  });
  document.querySelectorAll('[data-action="upstairs"]').forEach((button) => button.addEventListener('click', () => {
    const property = state.properties.find((p) => p.id === button.dataset.id);
    if (property) sendUpstairs(property);
    render();
  }));
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    state.archiveFilter = button.dataset.filter;
    render();
  }));
}

render();
setInterval(() => {
  if (state.activeTab === 'writers' && document.querySelector('.timer')) render();
}, 60000);

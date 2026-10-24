const canvas = document.querySelector('#scope');
const ctx = canvas.getContext('2d');
const panel = canvas.closest('.portrait-panel');
const portrait = document.querySelector('#portrait');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const status = document.querySelector('#audio-status');
const readout = {
  line: document.querySelector('#readout-line'),
  event: document.querySelector('#readout-event'),
  length: document.querySelector('#readout-length'),
};
const c3po = () => document.documentElement.dataset.droid === 'c3po';
const player = new Audio();
player.preload = 'auto';
let audioContext;
let analyzer;
let samples;
let activeButton;
let raf = 0;

// Every bundled clip's line and length in seconds, generated from audio/sources.json.
const LINES = {"r2-hello": ["(bright greeting whistle)","0.97"],"r2-beeps": ["(a burst of beeps and boops)","1.52"],"r2-agree": ["(affirmative chirp)","0.63"],"r2-agree-short": ["(quick affirmative beep)","0.43"],"r2-agree-bright": ["(bright affirmative beep)","0.36"],"r2-annoyed": ["(indignant raspberry)","1.01"],"r2-angry": ["(angry blat)","0.97"],"r2-attention": ["(insistent attention beeps)","0.94"],"r2-alert": ["(two-tone alert)","0.79"],"r2-huh": ["(curious rising warble)","0.55"],"r2-query": ["(questioning beep)","0.52"],"r2-fear": ["(alarmed warble)","0.90"],"r2-scream": ["(R2-D2 scream)","1.42"],"r2-thinking": ["(thoughtful burble)","1.25"],"r2-pondering": ["(pondering chatter)","1.26"],"r2-win": ["(excited trill)","0.65"],"r2-cheer": ["(happy whistle)","0.63"],"r2-sad": ["(sad descending whistle)","1.10"],"r2-worried": ["(worried warble)","0.79"],"r2-static": ["(electrocuted static)","1.70"],"r2-disagree": ["(short raspberry)","0.64"],"r2-off-he-goes": ["(rolling-off chirp)","0.88"],"r2-power-down": ["(power-down moan)","1.23"],"r2-laugh": ["(R2-D2 laughing)","1.34"],"r2-singing": ["(R2-D2 singing)","1.06"],"c3po-hello-assistance": ["Oh, hello. I am C-3PO. How may I be of assistance?","5.00"],"c3po-glad-you-are-here": ["I am glad you are here.","1.56"],"c3po-greetings": ["Greetings.","0.52"],"c3po-certainly": ["I can certainly be of assistance here.","2.17"],"c3po-where-i-come-in": ["I believe this is where I come in.","1.79"],"c3po-see-your-point": ["I see your point, sir.","0.93"],"c3po-technical": ["Don't get technical with me.","0.98"],"c3po-your-fault": ["I don't know what all this trouble is about, but I'm sure it must be your fault.","3.03"],"c3po-had-enough": ["I've just about had enough of you.","1.87"],"c3po-dont-like-you": ["I don't like you either.","0.86"],"c3po-how-rude": ["How rude!","0.81"],"c3po-gone-too-far": ["This time you have gone too far.","1.44"],"c3po-on-purpose": ["I believe you did that on purpose.","1.40"],"c3po-switch-off": ["Oh, switch off!","1.16"],"c3po-excuse-me": ["Excuse me.","1.13"],"c3po-assist-me": ["Would you assist me, please?","1.51"],"c3po-did-you-hear": ["Did you hear that?","0.68"],"c3po-alerted": ["All systems have been alerted to your presence, sir.","2.48"],"c3po-be-careful": ["Be careful. I am rather attached to all my parts.","3.34"],"c3po-goodness": ["Goodness gracious me.","0.75"],"c3po-please-be-careful": ["Please be careful.","1.79"],"c3po-doomed": ["We're doomed.","0.63"],"c3po-madness": ["This is madness!","0.88"],"c3po-under-attack": ["Oh no! I'm under attack!","1.71"],"c3po-talking-about": ["What are you talking about?","0.75"],"c3po-what-is-that": ["What is that?","0.59"],"c3po-what-is-happening": ["What is happening?","1.59"],"c3po-where-have-you-been": ["At last! Where have you been?","1.72"],"c3po-forgotten-us": ["Artoo, do you think they have forgotten about us?","2.49"],"c3po-stand-here": ["I shall stand here for as long as it takes to be of service.","3.54"],"c3po-thank-the-maker": ["Oh, thank the Maker.","1.16"],"c3po-how-wonderful": ["Oh, how wonderful!","1.41"],"c3po-im-doomed": ["I'm doomed.","1.29"],"c3po-deserve-this": ["What have I done to deserve this?","1.41"],"c3po-looks-bad": ["This looks very bad.","1.09"],"c3po-sensors": ["My sensors tell me enemies are approaching.","3.00"],"c3po-not-quite-sure": ["I'm not quite sure if you...","1.24"],"c3po-try-again": ["I am not quite sure if you fully understood me previously. I will try again.","3.99"],"c3po-unpleasant": ["That was very unpleasant.","1.28"],"c3po-not-built-for-this": ["I wasn't built for this!","2.40"],"c3po-oh-dear": ["Oh dear.","0.83"],"c3po-not-programmed": ["I have not been programmed to do this, I'm afraid.","2.40"],"c3po-embark": ["If we must embark on a mission together, could I please ask that you refrain from pulling me apart?","5.33"],"c3po-where-did-i-go": ["Where did I go?","0.66"],"c3po-traumatic": ["What a traumatic experience. I do hope we won't have to suffer through that sort of thing again.","4.65"],"c3po-good-day": ["Good day.","0.50"],"c3po-not-the-droid": ["I am terribly sorry, but I am not the droid you're looking for.","3.55"],"c3po-fluent": ["I am fluent in over six million forms of communication, if that is of any use today.","5.34"],"c3po-some-sort-of-god": ["I do believe they think I am some sort of god.","2.95"],"c3po-not-scrap": ["Just to let you know, I am not scrap and I am not for sale, so good day to you.","5.13"]};
const clip = id => ({ clip: id, line: LINES[id][0], length: LINES[id][1] });

// Which motion the portrait acts out for each cue, mirroring the state a Codex pet would show.
const MOODS = {
  session_started: 'jumping', prompt_submitted: 'working', annoyed: 'failure', approval_required: 'waiting', input_required: 'waiting',
  ready_for_input: 'waiting', turn_completed: 'jumping', out_of_power: 'failure', power_low: 'review', transmission_cut: 'failure', error: 'failure',
  tool_failed: 'failure', subagent_started: 'moving', context_compacting: 'review', session_ended: 'moving', 'easter-egg': 'jumping',
};
const mood = event => (event.includes('destructive') ? 'failure' : MOODS[event.split(' ')[0]] || 'waiting');

// The waveform runs along the droid's feet: hologram blue for R2-D2, burnished gold for C-3PO.
const trace = () => (c3po() ? '#9c4417' : '#4fc3f7');

function fit() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
}

function backdrop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function stroke(points, gain = 1) {
  const { width, height } = canvas;
  const color = trace();
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, width / 260);
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = width / 40;
  ctx.beginPath();
  points.forEach((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height / 2 - Math.max(-1, Math.min(1, value * gain)) * height * 0.4;
    if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

function idle() {
  cancelAnimationFrame(raf);
  backdrop();
  // A slow standby carrier, fixed rather than animated.
  stroke(Array.from({ length: 200 }, (_, i) => Math.sin(i * 0.07) * 0.02 + Math.sin(i * 0.9) * 0.004));
}

function live() {
  analyzer.getFloatTimeDomainData(samples);
  backdrop();
  // Speech and beeps rarely peak past a third of full scale, so the live trace is amplified.
  stroke(samples, 2.6);
  raf = requestAnimationFrame(live);
}

// Reduced motion: draw the whole clip's amplitude envelope once instead of animating.
async function envelope(url) {
  const buffer = await audioContext.decodeAudioData(await (await fetch(url)).arrayBuffer());
  const channel = buffer.getChannelData(0);
  const columns = 200;
  const step = Math.floor(channel.length / columns) || 1;
  const peaks = Array.from({ length: columns }, (_, column) => {
    let peak = 0;
    for (let i = column * step; i < (column + 1) * step && i < channel.length; i++) peak = Math.max(peak, Math.abs(channel[i]));
    return peak;
  });
  idle();
  stroke(peaks.flatMap(peak => [peak, -peak]));
}

function ensureAudio() {
  if (audioContext) return audioContext.resume();
  audioContext = new AudioContext();
  analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 2048;
  samples = new Float32Array(analyzer.fftSize);
  audioContext.createMediaElementSource(player).connect(analyzer);
  analyzer.connect(audioContext.destination);
  return audioContext.resume();
}

// Demo power cell: each preview drains it, it recharges slowly, and an empty cell gets the out_of_power line.
const COST = 10;
const power = { value: 100, node: document.querySelector('#power') };
const played = { value: 0, node: document.querySelector('#played') };
setInterval(() => {
  if (power.value < 100) { power.value = Math.min(100, power.value + 2); power.node.textContent = `${power.value}%`; }
}, 1000);
const DRAINED = { r2d2: 'r2-sad', c3po: 'c3po-im-doomed' };

function drain() {
  const chip = power.node.parentElement;
  if (power.value < COST) {
    chip.classList.remove('empty');
    void chip.offsetWidth;
    chip.classList.add('empty');
    return false;
  }
  power.value -= COST;
  power.node.textContent = `${power.value}%`;
  played.node.textContent = ++played.value;
  chip.dataset.delta = `-${COST}%`;
  chip.classList.remove('drained');
  void chip.offsetWidth;
  chip.classList.add('drained');
  return true;
}

function settle(message) {
  panel.classList.remove('live', 'annoyed');
  delete portrait.dataset.mood;
  activeButton?.classList.remove('playing');
  activeButton = null;
  if (!reducedMotion.matches) idle();
  if (message) status.textContent = message;
}

async function play(source, { free = false } = {}) {
  let { clip: id, line, event, length } = source.dataset || source;
  if (!free && !drain()) {
    ({ clip: id, line, length } = clip(DRAINED[c3po() ? 'c3po' : 'r2d2']));
    event = 'out_of_power · the demo power cell is empty';
  }
  const button = source instanceof HTMLElement ? source : null;
  activeButton?.classList.remove('playing');
  activeButton = button;
  readout.line.textContent = line;
  readout.event.textContent = event;
  readout.length.textContent = `${length} s`;
  const url = `audio/${id}.wav`;
  try {
    await ensureAudio();
    player.src = url;
    await player.play();
    if (activeButton !== button) return;
    button?.classList.add('playing');
    panel.classList.add('live');
    portrait.dataset.mood = mood(event);
    status.textContent = `Playing: ${line}`;
    cancelAnimationFrame(raf);
    if (reducedMotion.matches) await envelope(url);
    else live();
  } catch {
    if (activeButton === button) settle('Playback unavailable. Check your browser audio settings or try agent-starwars preview.');
  }
}

player.addEventListener('ended', () => settle('Preview finished. Pick another line.'));
document.querySelectorAll('[data-clip]').forEach(button => button.addEventListener('click', () => play(button)));

// The portrait answers when clicked; the third click inside ten seconds gets the annoyed lines.
const PORTRAIT = {
  r2d2: { what: ['r2-query', 'r2-huh', 'r2-attention', 'r2-hello'], annoyed: ['r2-annoyed', 'r2-angry', 'r2-disagree'] },
  c3po: {
    what: ['c3po-excuse-me', 'c3po-did-you-hear', 'c3po-what-is-that', 'c3po-greetings'],
    annoyed: ['c3po-technical', 'c3po-how-rude', 'c3po-had-enough', 'c3po-gone-too-far', 'c3po-your-fault', 'c3po-dont-like-you'],
  },
};
const clicks = [];
let annoyedIndex = 0;
portrait.addEventListener('click', () => {
  const now = Date.now();
  clicks.push(now);
  while (clicks.length && now - clicks[0] > 10000) clicks.shift();
  const set = PORTRAIT[c3po() ? 'c3po' : 'r2d2'];
  const annoyed = clicks.length >= 3;
  const id = annoyed ? set.annoyed[annoyedIndex++ % set.annoyed.length] : set.what[Math.floor(Math.random() * set.what.length)];
  play({ ...clip(id), event: annoyed ? 'annoyed · third click inside 10 s' : 'approval_required' }, { free: true }).then(() => {
    if (annoyed) panel.classList.add('annoyed');
  });
});

// Comlink: twelve hotkeys, voiced by whichever droid is selected.
const CARD = [
  ['H', 'Hello', 'session_started', 'r2-hello', 'c3po-hello-assistance'],
  ['A', 'Agree', 'prompt_submitted', 'r2-agree', 'c3po-certainly'],
  ['E', 'Excuse me', 'approval_required', 'r2-attention', 'c3po-excuse-me'],
  ['Q', 'Question', 'input_required', 'r2-query', 'c3po-talking-about'],
  ['W', 'Waiting', 'ready_for_input', 'r2-thinking', 'c3po-where-have-you-been'],
  ['M', 'Maker', 'turn_completed', 'r2-win', 'c3po-thank-the-maker'],
  ['D', 'Doomed', 'approval_required · destructive', 'r2-scream', 'c3po-doomed'],
  ['P', 'Power', 'power_low', 'r2-worried', 'c3po-looks-bad'],
  ['T', 'Cut off', 'transmission_cut', 'r2-static', 'c3po-not-quite-sure'],
  ['F', 'Failed', 'tool_failed', 'r2-disagree', 'c3po-oh-dear'],
  ['C', 'Compact', 'context_compacting', 'r2-pondering', 'c3po-where-did-i-go'],
  ['X', 'Extra', 'easter-egg', 'r2-laugh', 'c3po-not-the-droid'],
];
const card = document.querySelector('#command-card');
const hotkeys = new Map();
function renderCard() {
  card.replaceChildren(...CARD.map(([key, label, event, r2, threepio]) => {
    const { clip: id, line, length } = clip(c3po() ? threepio : r2);
    const button = document.createElement('button');
    button.className = 'cmd';
    Object.assign(button.dataset, { clip: id, line, event, length });
    button.setAttribute('aria-label', `${line} (${event}), hotkey ${key}`);
    button.setAttribute('aria-keyshortcuts', key);
    button.innerHTML = `<b aria-hidden="true">${key}</b><span aria-hidden="true">${label}</span>`;
    button.addEventListener('click', () => play(button));
    hotkeys.set(key.toLowerCase(), button);
    return button;
  }));
}
renderCard();
document.addEventListener('droidchange', () => { renderCard(); if (!panel.classList.contains('live')) idle(); });
document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
  const button = hotkeys.get(event.key.toLowerCase());
  if (!button) return;
  event.preventDefault();
  button.focus({ preventScroll: true });
  play(button);
});

new ResizeObserver(() => { fit(); if (!panel.classList.contains('live')) idle(); }).observe(canvas);
fit();
idle();

document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const copyStatus = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).innerText);
    copyStatus.textContent = 'Commands copied.';
    button.textContent = 'Copied';
    button.classList.add('copied');
    setTimeout(() => { button.textContent = 'Copy'; button.classList.remove('copied'); }, 2000);
  } catch { copyStatus.textContent = 'Clipboard unavailable. Select and copy the commands above.'; }
}));

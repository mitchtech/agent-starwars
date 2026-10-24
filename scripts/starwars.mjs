#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { petMain, petStatus, printPetStatus } from './pet.mjs';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..');
// Clip ids start with their droid: r2- (R2-D2) or c3po- (C-3PO).
const CLIPS = [
  'r2-hello', 'r2-beeps', 'r2-agree', 'r2-agree-short', 'r2-agree-bright', 'r2-annoyed', 'r2-angry', 'r2-attention',
  'r2-alert', 'r2-huh', 'r2-query', 'r2-fear', 'r2-scream', 'r2-thinking', 'r2-pondering', 'r2-win', 'r2-cheer',
  'r2-sad', 'r2-worried', 'r2-static', 'r2-disagree', 'r2-off-he-goes', 'r2-power-down', 'r2-laugh', 'r2-singing',
  'c3po-hello-assistance', 'c3po-glad-you-are-here', 'c3po-greetings', 'c3po-certainly', 'c3po-where-i-come-in',
  'c3po-see-your-point', 'c3po-technical', 'c3po-your-fault', 'c3po-had-enough', 'c3po-dont-like-you', 'c3po-how-rude',
  'c3po-gone-too-far', 'c3po-on-purpose', 'c3po-switch-off', 'c3po-excuse-me', 'c3po-assist-me', 'c3po-did-you-hear',
  'c3po-alerted', 'c3po-be-careful', 'c3po-goodness', 'c3po-please-be-careful', 'c3po-doomed', 'c3po-madness',
  'c3po-under-attack', 'c3po-talking-about', 'c3po-what-is-that', 'c3po-what-is-happening', 'c3po-where-have-you-been',
  'c3po-forgotten-us', 'c3po-stand-here', 'c3po-thank-the-maker', 'c3po-how-wonderful', 'c3po-im-doomed',
  'c3po-deserve-this', 'c3po-looks-bad', 'c3po-sensors', 'c3po-not-quite-sure', 'c3po-try-again', 'c3po-unpleasant',
  'c3po-not-built-for-this', 'c3po-oh-dear', 'c3po-not-programmed', 'c3po-embark', 'c3po-where-did-i-go',
  'c3po-traumatic', 'c3po-good-day', 'c3po-not-the-droid', 'c3po-fluent', 'c3po-some-sort-of-god', 'c3po-not-scrap',
];
const DROIDS = { r2d2: 'r2-', c3po: 'c3po-' };
const VOICES = ['r2d2', 'c3po', 'both', 'duo'];
// Duo mode: R2-D2's short beeps take frequent, low-stakes cues; C-3PO speaks when you need to act or should notice.
const DUO = {
  session_started: 'r2d2', prompt_submitted: 'r2d2', annoyed: 'c3po', approval_required: 'c3po', input_required: 'c3po',
  ready_for_input: 'c3po', turn_completed: 'c3po', out_of_power: 'c3po', power_low: 'c3po', transmission_cut: 'c3po',
  error: 'c3po', tool_failed: 'r2d2', subagent_started: 'r2d2', context_compacting: 'c3po', session_ended: 'r2d2',
};
const CHANGES = new Set(['Bash', 'PowerShell', 'Write', 'Edit', 'NotebookEdit', 'apply_patch', 'run_shell_command', 'write_file', 'replace']);
// Destructive shell and SQL patterns. Only the resulting boolean leaves normalize(); commands are never stored.
const DANGER = [
  /\brm\b(?=[^|;&\n]*\s(?:-[a-zA-Z]*[rR]|--recursive\b))(?=[^|;&\n]*\s(?:-[a-zA-Z]*f|--force\b))/,
  /\bgit\b[^|;&\n]*\bpush\b[^|;&\n]*\s(?:--force(?![-\w])|-[a-zA-Z]*f\b)/,
  /\bgit\b[^|;&\n]*\breset\b[^|;&\n]*\s--hard\b/,
  /\bgit\b[^|;&\n]*\bclean\b[^|;&\n]*\s-[a-zA-Z]*f/,
  /\b(?:drop\s+(?:table|database|schema)|truncate\s+table)\b/i,
  /\bmkfs(?:\.\w+)?\b/,
  /\bdd\b[^|;&\n]*\bof=/,
  /\bchmod\b[^|;&\n]*\s-[a-zA-Z]*R[^|;&\n]*\s0?777\b/,
  /\bRemove-Item\b(?=[^|;&\n]*\s-Recurse\b)(?=[^|;&\n]*\s-Force\b)/i,
  /\b(?:rd|rmdir)\s+\/s\b/i,
];
// Rare variants never replace approval, input, error, or danger cues.
const EASTER_EGG_EVENTS = new Set(['session_started', 'prompt_submitted', 'ready_for_input', 'turn_completed']);
// StopFailure error types that mean the account has run out of usage, not that the request was bad.
const OUT_OF_POWER = new Set(['rate_limit', 'billing_error', 'account_on_hold']);
// Three prompts inside this window turn the third into an annoyed cue, the way C-3PO loses patience with R2-D2.
const ANNOYED = { count: 3, windowMs: 10000 };
export const DEFAULTS = {
  muted: false,
  audioDir: null,
  cooldownMs: 1000,
  droid: 'duo',
  power: { budgetUsd: null, lowPercent: 80 },
  easterEgg: { chance: 0.02, clips: ['r2-laugh', 'r2-singing', 'c3po-not-the-droid', 'c3po-fluent', 'c3po-some-sort-of-god', 'c3po-not-scrap'] },
  events: {
    session_started: { enabled: true, clips: ['r2-hello', 'r2-beeps', 'c3po-hello-assistance', 'c3po-glad-you-are-here', 'c3po-greetings'] },
    prompt_submitted: { enabled: true, clips: ['r2-agree', 'r2-agree-short', 'r2-agree-bright', 'c3po-certainly', 'c3po-where-i-come-in', 'c3po-see-your-point'] },
    annoyed: {
      enabled: true, clips: ['r2-annoyed', 'r2-angry', 'c3po-technical', 'c3po-your-fault', 'c3po-had-enough', 'c3po-dont-like-you', 'c3po-how-rude',
        'c3po-gone-too-far', 'c3po-on-purpose', 'c3po-switch-off'],
    },
    approval_required: {
      enabled: true, clips: ['r2-attention', 'r2-alert', 'c3po-excuse-me', 'c3po-assist-me', 'c3po-did-you-hear', 'c3po-alerted'],
      changeClips: ['r2-huh', 'r2-query', 'c3po-be-careful', 'c3po-goodness', 'c3po-please-be-careful'],
      dangerClips: ['r2-fear', 'r2-scream', 'c3po-doomed', 'c3po-madness', 'c3po-under-attack'],
    },
    input_required: { enabled: true, clips: ['r2-query', 'c3po-talking-about', 'c3po-what-is-that', 'c3po-what-is-happening'] },
    ready_for_input: { enabled: true, clips: ['r2-thinking', 'c3po-where-have-you-been', 'c3po-forgotten-us', 'c3po-stand-here'] },
    turn_completed: { enabled: true, clips: ['r2-win', 'r2-cheer', 'c3po-thank-the-maker', 'c3po-how-wonderful'] },
    out_of_power: { enabled: true, clips: ['r2-sad', 'c3po-doomed', 'c3po-im-doomed', 'c3po-deserve-this'] },
    power_low: { enabled: true, clips: ['r2-worried', 'c3po-looks-bad', 'c3po-sensors'] },
    transmission_cut: { enabled: true, clips: ['r2-static', 'c3po-not-quite-sure', 'c3po-try-again'] },
    error: { enabled: false, clips: ['r2-scream', 'c3po-unpleasant', 'c3po-not-built-for-this'] },
    tool_failed: { enabled: false, clips: ['r2-disagree', 'c3po-oh-dear', 'c3po-not-programmed'] },
    subagent_started: { enabled: false, clips: ['r2-off-he-goes', 'c3po-embark'] },
    context_compacting: { enabled: false, clips: ['r2-pondering', 'c3po-where-did-i-go'] },
    session_ended: { enabled: false, clips: ['r2-power-down', 'c3po-traumatic', 'c3po-good-day'] },
  },
};
const ATTENTION = ['approval_required', 'input_required', 'ready_for_input', 'out_of_power', 'power_low', 'transmission_cut'];

export function dangerous(command) {
  return typeof command === 'string' && DANGER.some(pattern => pattern.test(command));
}

export function locations(env = process.env, platform = process.platform) {
  const home = homedir();
  const configBase = platform === 'win32' ? env.APPDATA || join(home, 'AppData', 'Roaming') : env.XDG_CONFIG_HOME || join(home, '.config');
  const stateBase = platform === 'win32' ? env.LOCALAPPDATA || join(home, 'AppData', 'Local') : env.XDG_STATE_HOME || join(home, '.local', 'state');
  return {
    config: resolve(env.AGENT_STARWARS_CONFIG || join(configBase, 'agent-starwars', 'config.json')),
    state: resolve(env.AGENT_STARWARS_STATE_DIR || join(stateBase, 'agent-starwars')),
  };
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clips(value) {
  return Array.isArray(value) && value.length > 0 && value.every(clip => CLIPS.includes(clip));
}

export function configuration(env = process.env) {
  const paths = locations(env);
  const config = structuredClone(DEFAULTS);
  const overrides = existsSync(paths.config) ? JSON.parse(readFileSync(paths.config, 'utf8')) : {};
  if (!object(overrides) || Object.keys(overrides).some(key => !Object.hasOwn(config, key))) throw new Error('Unknown configuration field');
  for (const key of ['muted', 'audioDir', 'cooldownMs', 'droid']) {
    if (Object.hasOwn(overrides, key)) config[key] = overrides[key];
  }
  if (typeof config.muted !== 'boolean' || (config.audioDir !== null && typeof config.audioDir !== 'string') || !Number.isFinite(config.cooldownMs) || config.cooldownMs < 0) throw new Error('Invalid configuration value');
  if (!VOICES.includes(config.droid)) throw new Error('droid must be r2d2, c3po, both, or duo');
  if (Object.hasOwn(overrides, 'power')) {
    if (!object(overrides.power) || Object.keys(overrides.power).some(key => !Object.hasOwn(config.power, key))) throw new Error('Invalid power settings');
    Object.assign(config.power, overrides.power);
    const { budgetUsd, lowPercent } = config.power;
    if ((budgetUsd !== null && (!Number.isFinite(budgetUsd) || budgetUsd <= 0)) || !Number.isFinite(lowPercent) || lowPercent <= 0 || lowPercent >= 100) throw new Error('Invalid power settings');
  }
  if (Object.hasOwn(overrides, 'easterEgg')) {
    if (!object(overrides.easterEgg) || Object.keys(overrides.easterEgg).some(key => !Object.hasOwn(config.easterEgg, key))) throw new Error('Invalid easterEgg settings');
    Object.assign(config.easterEgg, overrides.easterEgg);
    const { chance } = config.easterEgg;
    if (!Number.isFinite(chance) || chance < 0 || chance > 1 || !clips(config.easterEgg.clips)) throw new Error('Invalid easterEgg settings');
  }
  if (Object.hasOwn(overrides, 'events')) {
    if (!object(overrides.events)) throw new Error('events must be an object');
    for (const [event, settings] of Object.entries(overrides.events)) {
      const defaults = Object.hasOwn(config.events, event) ? config.events[event] : null;
      if (!defaults || !object(settings) || Object.keys(settings).some(key => !Object.hasOwn(defaults, key))) throw new Error(`Invalid settings for ${event}`);
      Object.assign(defaults, settings);
      if (typeof defaults.enabled !== 'boolean' || !clips(defaults.clips) || (defaults.changeClips && !clips(defaults.changeClips)) || (defaults.dangerClips && !clips(defaults.dangerClips))) throw new Error(`Invalid sounds for ${event}`);
    }
  }
  if (env.AGENT_STARWARS_MUTE !== undefined) {
    if (!['0', '1'].includes(env.AGENT_STARWARS_MUTE)) throw new Error('AGENT_STARWARS_MUTE must be 0 or 1');
    config.muted = env.AGENT_STARWARS_MUTE === '1';
  }
  const audio = env.AGENT_STARWARS_AUDIO_DIR || config.audioDir;
  config.audioDir = audio ? resolve(dirname(paths.config), audio) : join(ROOT, 'audio');
  return { config, paths };
}

// Temporary files live beside their destination so rename stays on the same filesystem.
function atomicWrite(path, value) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
    renameSync(temporary, path);
  } finally { rmSync(temporary, { force: true }); }
}

export function updateConfiguration(command, target, env = process.env) {
  // Validate existing preferences before writing; do not silently replace a broken user config.
  const { paths } = configuration(env);
  const value = existsSync(paths.config) ? JSON.parse(readFileSync(paths.config, 'utf8')) : {};
  if (command === 'preset') {
    if (!['default', 'attention'].includes(target)) throw new Error('Presets: default, attention');
    value.events ||= {};
    for (const [event, rule] of Object.entries(DEFAULTS.events)) {
      value.events[event] ||= {};
      value.events[event].enabled = target === 'attention' ? ATTENTION.includes(event) : rule.enabled;
    }
  } else if (command === 'droid') {
    if (!VOICES.includes(target)) throw new Error(`Droids: ${VOICES.join(', ')}`);
    value.droid = target;
  } else {
    if (!['mute', 'unmute'].includes(command)) throw new Error('Unknown configuration action');
    if (target === 'all') value.muted = command === 'mute';
    else if (target === 'easter-egg') value.easterEgg = { ...value.easterEgg, chance: command === 'mute' ? 0 : DEFAULTS.easterEgg.chance };
    else {
      if (!Object.hasOwn(DEFAULTS.events, target)) throw new Error(`Specify an event, easter-egg, or all: ${Object.keys(DEFAULTS.events).join(', ')}`);
      value.events ||= {};
      value.events[target] ||= {};
      value.events[target].enabled = command === 'unmute';
    }
  }
  atomicWrite(paths.config, value);
  return configuration(env);
}

export function status(env = process.env) {
  const settings = configuration(env);
  return { ...settings, environmentOverrides: Object.fromEntries(
    ['AGENT_STARWARS_MUTE', 'AGENT_STARWARS_AUDIO_DIR', 'AGENT_STARWARS_CONFIG', 'AGENT_STARWARS_STATE_DIR']
      .filter(key => env[key] !== undefined).map(key => [key, env[key]])) };
}

function printStatus(settings) {
  console.log(`Config: ${settings.paths.config}`);
  console.log(`Muted: ${settings.config.muted}${Object.hasOwn(settings.environmentOverrides, 'AGENT_STARWARS_MUTE') ? ' (AGENT_STARWARS_MUTE overrides the saved preference)' : ''}`);
  printRules(settings.config);
}

function printRules(config) {
  console.log(`Droid: ${config.droid}`);
  for (const [event, rule] of Object.entries(config.events)) console.log(`${event}: ${rule.enabled ? enlist(rule.clips, config.droid, event).join('/') : 'off'}`);
  console.log(`easter-egg: ${eggs(config)}`);
  console.log(`power: ${config.power.budgetUsd ? `$${config.power.budgetUsd} budget` : 'rate limits'}, low at ${config.power.lowPercent}%`);
}

function eggs(config) {
  return config.easterEgg.chance ? `${+(config.easterEgg.chance * 100).toFixed(2)}% ${enlist(config.easterEgg.clips, config.droid).join('/')}` : 'off';
}

// Keep the selected droid's clips; duo picks the droid assigned to the event, and easter eggs (no event) use both.
// A custom list with none of the chosen droid's clips plays as written rather than going silent.
export function enlist(list, droid, event) {
  const voice = droid === 'duo' ? DUO[event] : droid;
  if (!Object.hasOwn(DROIDS, voice)) return list;
  const own = list.filter(clip => clip.startsWith(DROIDS[voice]));
  return own.length ? own : list;
}

export function normalize(payload, agent) {
  if (!object(payload)) return null;
  const native = payload.hook_event_name;
  if (agent === 'gemini') {
    let event;
    if (native === 'SessionStart' && (!payload.source || ['startup', 'resume', 'clear'].includes(payload.source))) event = 'session_started';
    else if (native === 'BeforeAgent') event = 'prompt_submitted';
    else if (native === 'AfterAgent' && !payload.stop_hook_active) event = 'turn_completed';
    else if (native === 'Notification' && payload.notification_type === 'ToolPermission') event = 'approval_required';
    else if (native === 'PreCompress') event = 'context_compacting';
    else if (native === 'SessionEnd') event = 'session_ended';
    return event ? { event, agent, session: typeof payload.session_id === 'string' ? payload.session_id : 'default',
      change: CHANGES.has(payload.details?.tool_name), danger: event === 'approval_required' && dangerous(payload.details?.command), fallback: false } : null;
  }
  // Only lifecycle events suppress identified subagents; their approval prompts still need attention.
  if (['SessionStart', 'Stop', 'SessionEnd', 'PreCompact'].includes(native) && payload.agent_id) return null;
  let event;
  let fallback = false;
  if (native === 'SessionStart') {
    if (payload.source && !['startup', 'resume', 'clear'].includes(payload.source)) return null;
    event = 'session_started';
  } else if (native === 'UserPromptSubmit') event = 'prompt_submitted';
  else if (native === 'PermissionRequest') event = 'approval_required';
  else if (native === 'Stop' && !payload.stop_hook_active) event = 'turn_completed';
  else if (agent === 'claude' && native === 'StopFailure') {
    event = OUT_OF_POWER.has(payload.error) ? 'out_of_power' : payload.error === 'max_output_tokens' ? 'transmission_cut' : 'error';
  } else if (native === 'PreCompact') event = 'context_compacting';
  else if (native === 'SessionEnd') event = 'session_ended';
  else if (native === 'SubagentStart') event = 'subagent_started';
  else if (agent === 'claude' && native === 'PostToolUseFailure' && !payload.is_interrupt) event = 'tool_failed';
  else if (agent === 'claude' && native === 'Notification') {
    if (payload.notification_type === 'permission_prompt') {
      event = 'approval_required';
      fallback = true;
    } else if (['idle_prompt', 'quota_auto_resume_stale'].includes(payload.notification_type)) event = 'ready_for_input';
    else if (['elicitation_dialog', 'elicitation_url_dialog', 'agent_needs_input'].includes(payload.notification_type)) event = 'input_required';
    else if (payload.notification_type === 'quota_auto_resume_disabled') event = 'out_of_power';
  }
  return event ? { event, agent, session: typeof payload.session_id === 'string' ? payload.session_id : 'default', change: CHANGES.has(payload.tool_name),
    danger: event === 'approval_required' && dangerous(payload.tool_input?.command), fallback } : null;
}

function executable(command, env) {
  const result = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { env, stdio: 'ignore', timeout: 2000, windowsHide: true });
  return result.status === 0;
}

export function player(audio, platform = process.platform, available = command => executable(command, process.env)) {
  if (platform === 'darwin') return available('afplay') ? ['afplay', audio] : null;
  if (platform === 'win32') {
    if (!available('powershell.exe')) return null;
    // The filename is data in an environment variable, never PowerShell source.
    return ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', '$p = New-Object System.Media.SoundPlayer; $p.SoundLocation = $env:AGENT_STARWARS_PLAY_FILE; $p.PlaySync()'];
  }
  if (platform === 'linux') {
    for (const command of ['paplay', 'pw-play', 'aplay']) if (available(command)) return [command, audio];
    if (available('ffplay')) return ['ffplay', '-nodisp', '-autoexit', '-loglevel', 'quiet', audio];
  }
  return null;
}

export function reserve(paths, event, config, now = Date.now(), preview = false) {
  mkdirSync(paths.state, { recursive: true, mode: 0o700 });
  const lock = join(paths.state, 'playback.lock');
  try {
    mkdirSync(lock);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // Playback is bounded to 10 seconds. Recover a lock abandoned by a killed worker.
    if (now - statSync(lock).mtimeMs < 30000) return null;
    rmSync(lock, { recursive: true, force: true });
    try { mkdirSync(lock); } catch { return null; }
  }
  const release = () => rmSync(lock, { recursive: true, force: true });
  try {
    if (preview) return release;
    const key = createHash('sha256').update(`${event.agent}:${event.session}:${event.event}`).digest('hex');
    const stamp = join(paths.state, `${key}.json`);
    let previous = {};
    if (existsSync(stamp)) {
      try { previous = JSON.parse(readFileSync(stamp, 'utf8')) || {}; } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        // Timestamps are disposable cache data, unlike the user's configuration.
      }
    }
    const interval = event.fallback ? Math.max(10000, config.cooldownMs) : config.cooldownMs;
    if (Number.isFinite(previous.time) && now - previous.time < interval) {
      release();
      return null;
    }
    atomicWrite(stamp, { time: now });
    // State stores hashes and timestamps only. Remove inactive session records after a day.
    for (const name of readdirSync(paths.state)) {
      if (/^[a-f0-9]{64}\.json$/.test(name) && now - statSync(join(paths.state, name)).mtimeMs > 86400000) rmSync(join(paths.state, name));
    }
    return release;
  } catch (error) {
    release();
    throw error;
  }
}

// Session records share the hashed-name scheme above, so the same daily cleanup removes them.
function record(paths, ...parts) {
  const path = join(paths.state, `${createHash('sha256').update(parts.join(':')).digest('hex')}.json`);
  let value = {};
  try { value = JSON.parse(readFileSync(path, 'utf8')) || {}; } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
  }
  return { value, save: next => atomicWrite(path, next) };
}

// Turn the third prompt inside the window into an annoyed cue. Only timestamps are stored, never prompt text.
export function escalate(event, paths, now = Date.now()) {
  if (event.event !== 'prompt_submitted') return event;
  const history = record(paths, event.agent, event.session, 'prompts');
  const times = (Array.isArray(history.value.times) ? history.value.times : [])
    .filter(time => Number.isFinite(time) && now - time < ANNOYED.windowMs).concat(now).slice(-ANNOYED.count);
  history.save({ times });
  return times.length >= ANNOYED.count ? { ...event, event: 'annoyed' } : event;
}

// The tightest of the configured budget and any rate limit the host reports decides how much power is left.
export function power(input, config) {
  const used = [];
  const cost = input?.cost?.total_cost_usd;
  if (config.power.budgetUsd && Number.isFinite(cost)) used.push({ label: 'budget', percent: cost / config.power.budgetUsd * 100 });
  for (const [key, label] of [['five_hour', '5h'], ['seven_day', '7d'], ['spend_limit', 'spend']]) {
    const percent = input?.rate_limits?.[key]?.used_percentage;
    if (Number.isFinite(percent)) used.push({ label, percent });
  }
  if (!used.length) return null;
  const tightest = used.reduce((a, b) => (b.percent > a.percent ? b : a));
  const level = tightest.percent >= 100 ? 2 : tightest.percent >= config.power.lowPercent ? 1 : 0;
  const left = tightest.label === 'budget'
    ? `$${Math.max(0, config.power.budgetUsd - cost).toFixed(2)}` : `${Math.max(0, Math.round(100 - tightest.percent))}%`;
  return { ...tightest, level, text: `⚡ ${left} power${tightest.label === 'budget' ? '' : ` (${tightest.label})`}${['', ' low', ' out'][level]}` };
}

// Cue each rise in power level once per session. Falling back below a level, as when a window resets, re-arms it.
export function powerCue(meter, session, paths) {
  const state = record(paths, 'statusline', session, 'power');
  const previous = Number.isInteger(state.value.level) ? state.value.level : 0;
  if (meter.level !== previous) state.save({ level: meter.level });
  return meter.level > previous ? ['', 'power_low', 'out_of_power'][meter.level] : null;
}

export function playback(event, settings, options = {}) {
  const { config, paths } = settings;
  const rule = config.events[event.event];
  if (!rule || config.muted || !rule.enabled) return false;
  const random = options.random || Math.random;
  const egg = config.easterEgg;
  const hatched = EASTER_EGG_EVENTS.has(event.event) && !event.danger && !event.change && random() < egg.chance;
  // Duo easter eggs belong to neither droid, so they skip the per-event assignment.
  const choices = event.danger && rule.dangerClips ? enlist(rule.dangerClips, config.droid, event.event)
    : event.change && rule.changeClips ? enlist(rule.changeClips, config.droid, event.event)
      : hatched ? enlist(egg.clips, config.droid) : enlist(rule.clips, config.droid, event.event);
  const clip = options.clip || choices[Math.floor(random() * choices.length)];
  if (!CLIPS.includes(clip)) throw new Error('Unknown clip');
  const audio = join(config.audioDir, `${clip}.wav`);
  if (!existsSync(audio)) throw new Error(`Missing audio: ${audio}`);
  const command = (options.player || player)(audio);
  if (!command) throw new Error('No supported audio player found; run agent-starwars doctor');
  const release = reserve(paths, event, config, Date.now(), options.preview === true);
  if (!release) return false;
  try {
    const result = (options.run || spawnSync)(command[0], command.slice(1), {
      stdio: 'ignore', timeout: 10000, windowsHide: true,
      env: { ...process.env, AGENT_STARWARS_PLAY_FILE: audio },
    });
    if (result.error || result.status !== 0) throw new Error('Audio player failed');
    return true;
  } finally { release(); }
}

function schedule(event) {
  const child = spawn(process.execPath, [SCRIPT, '_play', JSON.stringify(event)], {
    detached: true, stdio: 'ignore', windowsHide: true,
  });
  child.on('error', () => {});
  child.unref();
}

function doctor() {
  const settings = configuration();
  const { config, paths } = settings;
  console.log(`Agent Star Wars | Node ${process.version} | ${process.platform}`);
  console.log(`Config: ${paths.config} (${existsSync(paths.config) ? 'loaded' : 'defaults'})`);
  console.log(`Audio: ${config.audioDir}`);
  console.log(`State: ${paths.state}`);
  console.log(`Muted: ${config.muted}`);
  const command = player(join(config.audioDir, `${CLIPS[0]}.wav`));
  console.log(`Player: ${command ? command[0] : 'MISSING'}`);
  const missing = CLIPS.filter(clip => !existsSync(join(config.audioDir, `${clip}.wav`)));
  console.log(`Clips: ${missing.length ? `missing ${missing.join(', ')}` : `all ${CLIPS.length} available`}`);
  printRules(config);
  printPetStatus();
  return command && !missing.length ? 0 : 1;
}

export async function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  const quiet = ['hook', '_play', 'statusline'].includes(command);
  try {
    if (command === '_play') {
      playback(JSON.parse(args[0]), configuration());
      return 0;
    }
    if (command === 'pet') return petMain(args);
    if (command === 'doctor') {
      const { values, positionals } = parseArgs({ args, options: { pet: { type: 'boolean', default: false } }, allowPositionals: true });
      if (positionals.length > (values.pet ? 1 : 0)) throw new Error('Usage: agent-starwars doctor [--pet [r2d2|c3po]]');
      if (values.pet) {
        const status = petStatus(process.env, positionals[0] ?? 'r2d2');
        printPetStatus(status);
        return status.state === 'matching' ? 0 : 1;
      }
      return doctor();
    }
    if (['status', 'config'].includes(command)) {
      const { values } = parseArgs({ args, options: { json: { type: 'boolean' }, effective: { type: 'boolean' } } });
      if (command === 'config' && !values.effective) {
        console.log(JSON.stringify(DEFAULTS, null, 2));
        return 0;
      }
      const current = status();
      if (command === 'config') console.log(JSON.stringify(current.config, null, 2));
      else if (values.json) console.log(JSON.stringify(current, null, 2));
      else printStatus(current);
      return 0;
    }
    if (['mute', 'unmute', 'preset', 'droid'].includes(command)) {
      const usage = { preset: 'default|attention', droid: VOICES.join('|') }[command] || 'EVENT|easter-egg|all';
      if (args.length !== 1) throw new Error(`Usage: agent-starwars ${command} ${usage}`);
      updateConfiguration(command, args[0]);
      printStatus(status());
      return 0;
    }
    if (command === 'list') {
      const { values } = parseArgs({ args, options: { json: { type: 'boolean' } } });
      const catalog = { clips: CLIPS, events: Object.keys(DEFAULTS.events), presets: ['default', 'attention'], droids: VOICES };
      console.log(values.json ? JSON.stringify(catalog, null, 2) : Object.entries(catalog).map(([key, items]) => `${key}: ${items.join(', ')}`).join('\n'));
      return 0;
    }
    if (command === 'hook') {
      const { values } = parseArgs({ args, options: { agent: { type: 'string' } } });
      if (!['claude', 'codex', 'gemini'].includes(values.agent)) throw new Error('Specify --agent claude, codex, or gemini');
      // Gemini always receives neutral JSON, including malformed-input/config paths.
      if (values.agent === 'gemini') console.log('{}');
      let input = '';
      process.stdin.setEncoding('utf8');
      for await (const chunk of process.stdin) {
        input += chunk;
        if (input.length > 1024 * 1024) return 0;
      }
      // Codex Stop accepts JSON output. An empty object never alters the agent's decisions.
      const payload = JSON.parse(input);
      if (values.agent === 'codex' && payload?.hook_event_name === 'Stop') console.log('{}');
      const { config, paths } = configuration();
      const event = normalize(payload, values.agent);
      if (!event || config.muted) return 0;
      // A broken prompt history must never cost the ordinary prompt cue.
      let cue = event;
      try { cue = escalate(event, paths); } catch {}
      if (config.events[cue.event].enabled) schedule(cue);
      return 0;
    }
    if (command === 'statusline') {
      // The status line must always print, so every failure degrades to the bare power bolt.
      let input = '';
      process.stdin.setEncoding('utf8');
      for await (const chunk of process.stdin) {
        input += chunk;
        if (input.length > 1024 * 1024) break;
      }
      let text = '⚡';
      try {
        const payload = JSON.parse(input);
        const { config, paths } = configuration();
        const meter = power(payload, config);
        if (meter) {
          text = meter.text;
          const session = typeof payload.session_id === 'string' ? payload.session_id : 'default';
          const cue = powerCue(meter, session, paths);
          if (cue && !config.muted && config.events[cue].enabled) schedule({ event: cue, agent: 'claude', session, change: false, danger: false, fallback: false });
        }
      } catch {}
      console.log(text);
      return 0;
    }
    if (command === 'play' || command === 'preview') {
      const { values, positionals } = parseArgs({ args, allowPositionals: true, options: { session: { type: 'string', default: 'default' }, tool: { type: 'string' }, command: { type: 'string' } } });
      if (positionals.length !== 1) throw new Error(`Usage: agent-starwars ${command} ${command === 'play' ? 'EVENT' : 'CLIP'}`);
      const settings = configuration();
      const event = { event: positionals[0], agent: 'generic', session: values.session, change: CHANGES.has(values.tool), danger: dangerous(values.command) };
      if (command === 'preview') {
        if (!CLIPS.includes(positionals[0])) throw new Error(`Clips: ${CLIPS.join(', ')}`);
        event.event = 'session_started';
        settings.config.muted = false;
        settings.config.events.session_started.enabled = true;
        if (!playback(event, settings, { clip: positionals[0], preview: true })) {
          console.error('Agent Star Wars: another sound is playing; try the preview again.');
          return 1;
        }
      } else {
        if (!Object.hasOwn(DEFAULTS.events, event.event)) throw new Error(`Events: ${Object.keys(DEFAULTS.events).join(', ')}`);
        playback(event, settings);
      }
      return 0;
    }
    if (command && !['--help', '-h'].includes(command)) throw new Error(`Unknown command: ${command}`);
    console.log('Agent Star Wars\n\nagent-starwars hook --agent claude|codex|gemini\nagent-starwars play EVENT [--session ID] [--tool TOOL] [--command CMD]\nagent-starwars preview CLIP\nagent-starwars pet install [r2d2|c3po] [--replace]\nagent-starwars pet status [r2d2|c3po] [--json]\nagent-starwars pet uninstall [r2d2|c3po]\nagent-starwars doctor [--pet [r2d2|c3po]]\nagent-starwars config [--effective]\nagent-starwars status [--json]\nagent-starwars mute EVENT|easter-egg|all\nagent-starwars unmute EVENT|easter-egg|all\nagent-starwars preset default|attention\nagent-starwars droid r2d2|c3po|both|duo\nagent-starwars statusline  (reads Claude Code status line JSON on stdin)\nagent-starwars list [--json]');
    return 0;
  } catch (error) {
    if (!quiet) console.error(`Agent Star Wars: ${error.message}`);
    return quiet ? 0 : 1;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === SCRIPT) process.exitCode = await main();

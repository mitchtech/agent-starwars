import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Each bundled pet installs into its own directory; R2-D2 is the default for every pet command.
export const PETS = { r2d2: 'R2-D2', c3po: 'C-3PO' };
const bundleOf = id => resolve(dirname(fileURLToPath(import.meta.url)), '..', 'pets', id);
const FILES = ['pet.json', 'spritesheet.webp', 'LICENSE.txt', 'NOTICE.md'];
const MARKER = '.agent-starwars.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const notBundled = (id = 'r2d2') => `${PETS[id]} pet art is not bundled yet. Create one with Codex's native pet feature, or watch the repo for a release that includes it.`;

function known(id) {
  if (!Object.hasOwn(PETS, id)) throw new Error(`Unknown pet: ${id}. Choose ${Object.keys(PETS).join(' or ')}`);
  return id;
}

export function petPath(env = process.env, id = 'r2d2') {
  return resolve(env.CODEX_HOME || join(homedir(), '.codex'), 'pets', known(id));
}

function regular(path) {
  try { return lstatSync(path).isFile(); } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Missing art is the expected state until a pet ships; it is not an error.
const HEALTHY = ['matching', 'not-installed', 'not-bundled'];

function bundled(id) {
  return regular(join(bundleOf(id), 'pet.json')) && regular(join(bundleOf(id), 'spritesheet.webp'));
}

function hashes(directory) {
  return Object.fromEntries(FILES.map(name => [name, regular(join(directory, name)) ? hash(readFileSync(join(directory, name))) : null]));
}

function owned(directory) {
  if (!regular(join(directory, MARKER))) return false;
  try {
    const marker = JSON.parse(readFileSync(join(directory, MARKER), 'utf8'));
    const actual = hashes(directory);
    return marker.owner === 'agent-starwars' && FILES.every(name => actual[name] && marker.files?.[name] === actual[name])
      && readdirSync(directory).every(name => FILES.includes(name) || name === MARKER);
  } catch { return false; }
}

export function petStatus(env = process.env, id = 'r2d2') {
  const path = petPath(env, id);
  let entry;
  try { entry = lstatSync(path); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { id, path, state: bundled(id) ? 'not-installed' : 'not-bundled', managed: false };
  }
  if (!entry.isDirectory() || entry.isSymbolicLink()) return { id, path, state: 'conflict', managed: false };
  // Without bundled art there is nothing to compare, but a managed copy from a release can still be removed.
  if (!bundled(id)) return { id, path, state: 'not-bundled', managed: owned(path) };
  const actual = hashes(path);
  const expected = hashes(bundleOf(id));
  // A manually extracted bundle may have only the two host files. Notices are optional for matching it.
  const matching = FILES.every(name => actual[name] === expected[name] || (!actual[name] && !['pet.json', 'spritesheet.webp'].includes(name)));
  const version = matching ? JSON.parse(readFileSync(join(bundleOf(id), 'pet.json'), 'utf8')).spriteVersionNumber ?? null : null;
  return { id, path, state: matching ? 'matching' : 'modified', managed: owned(path), spriteVersionNumber: version };
}

export function installPet(env = process.env, replace = false, id = 'r2d2') {
  const status = petStatus(env, id);
  if (status.state === 'not-bundled') throw new Error(notBundled(id));
  if (status.state === 'matching') return { ...status, changed: false };
  if (status.state === 'conflict') throw new Error(`Pet path is not a regular directory: ${status.path}`);
  if (status.state !== 'not-installed' && !replace) throw new Error(`Different pet files at ${status.path}; use --replace to keep a backup and install the ${PETS[id]}`);
  const parent = dirname(status.path);
  mkdirSync(parent, { recursive: true });
  const temporary = mkdtempSync(join(parent, '.agent-starwars-'));
  let backup;
  try {
    for (const name of FILES) writeFileSync(join(temporary, name), readFileSync(join(bundleOf(id), name)));
    writeFileSync(join(temporary, MARKER), `${JSON.stringify({ owner: 'agent-starwars', files: hashes(temporary) }, null, 2)}\n`);
    if (status.state !== 'not-installed') {
      backup = `${status.path}.backup-${temporary.split('.agent-starwars-').at(-1)}`;
      renameSync(status.path, backup);
    }
    renameSync(temporary, status.path);
  } catch (error) {
    if (backup && !existsSync(status.path)) renameSync(backup, status.path);
    throw error;
  } finally { rmSync(temporary, { recursive: true, force: true }); }
  return { ...petStatus(env, id), changed: true, ...(backup ? { backup } : {}) };
}

export function uninstallPet(env = process.env, id = 'r2d2') {
  const status = petStatus(env, id);
  if (status.state === 'not-installed' || (status.state === 'not-bundled' && !existsSync(status.path))) return { ...status, changed: false };
  if (!status.managed) throw new Error(`Refusing to remove unmanaged or changed files at ${status.path}; inspect and remove them manually`);
  // Move out of the live pet directory before removing only the verified owned bundle.
  const temporary = mkdtempSync(join(dirname(status.path), '.agent-starwars-remove-'));
  try {
    const retired = join(temporary, id);
    renameSync(status.path, retired);
    if (!owned(retired)) {
      renameSync(retired, status.path);
      throw new Error('Pet files changed during removal; nothing was deleted');
    }
    rmSync(retired, { recursive: true });
  } finally {
    // A failed restoration must preserve the retired directory for manual recovery.
    if (readdirSync(temporary).length === 0) rmSync(temporary, { recursive: true });
  }
  return { ...petStatus(env, id), changed: true };
}

export function printPetStatus(status = petStatus()) {
  const install = status.id === 'r2d2' ? 'agent-starwars pet install' : `agent-starwars pet install ${status.id}`;
  console.log(`Pet: ${PETS[status.id]}, ${status.state} (${status.path})`);
  console.log(`Pet ownership: ${status.managed ? 'managed by agent-starwars' : 'unmanaged'}`);
  console.log(status.state === 'matching'
    ? `Select: refresh the desktop pet picker, or enter /pets ${PETS[status.id]} in a supported Codex CLI terminal`
    : status.state === 'not-bundled' ? notBundled(status.id) : `Install: ${install} (optional; independent of sounds)`);
  return HEALTHY.includes(status.state) ? 0 : 1;
}

export function petMain(argv) {
  const [command, ...args] = argv;
  if (!command || ['--help', '-h'].includes(command)) {
    console.log('agent-starwars pet install [r2d2|c3po] [--replace]\nagent-starwars pet status [r2d2|c3po] [--json]\nagent-starwars pet uninstall [r2d2|c3po]');
    return 0;
  }
  const options = command === 'install' ? { replace: { type: 'boolean', default: false } }
    : command === 'status' ? { json: { type: 'boolean', default: false } } : {};
  const { values, positionals } = parseArgs({ args, options, allowPositionals: true });
  if (positionals.length > 1) throw new Error('Name one pet: r2d2 or c3po');
  const id = known(positionals[0] ?? 'r2d2');
  let status;
  if (command === 'install') status = installPet(process.env, values.replace, id);
  else if (command === 'status') status = petStatus(process.env, id);
  else if (command === 'uninstall') status = uninstallPet(process.env, id);
  else throw new Error(`Unknown pet command: ${command}`);
  if (values.json) console.log(JSON.stringify(status, null, 2));
  else {
    if (status.changed !== undefined) console.log(status.changed ? 'Pet files updated.' : 'No pet files changed.');
    if (status.backup) console.log(`Previous pet preserved: ${status.backup}`);
    return printPetStatus(status);
  }
  return HEALTHY.includes(status.state) ? 0 : 1;
}

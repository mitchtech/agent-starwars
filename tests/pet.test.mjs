import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { installPet, petPath, petStatus, uninstallPet } from '../scripts/pet.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'pet');
const SCRIPT = join(ROOT, 'scripts', 'starwars.mjs');

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "Droids' $pet "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const env = { ...process.env, CODEX_HOME: join(root, 'codex'), AGENT_STARWARS_CONFIG: join(root, 'invalid.json') };
  return { root, env, target: petPath(env) };
}

// Small fixtures isolate conflict and missing-art behavior from the real bundle.
async function packaged(root, files = ['pet.json', 'spritesheet.webp', 'LICENSE.txt', 'NOTICE.md']) {
  const copy = join(root, 'package');
  mkdirSync(join(copy, 'scripts'), { recursive: true });
  mkdirSync(join(copy, 'pets', 'r2d2'), { recursive: true });
  for (const name of ['pet.mjs', 'starwars.mjs']) copyFileSync(join(ROOT, 'scripts', name), join(copy, 'scripts', name));
  for (const name of files) copyFileSync(join(FIXTURE, name), join(copy, 'pets', 'r2d2', name));
  const module = await import(pathToFileURL(join(copy, 'scripts', 'pet.mjs')).href);
  return { ...module, bundle: join(copy, 'pets', 'r2d2'), script: join(copy, 'scripts', 'starwars.mjs') };
}

test('a manifest-only package reports not-bundled and install changes nothing', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root, ['pet.json']);
  assert.equal(pet.petStatus(env).state, 'not-bundled');
  assert.throws(() => pet.installPet(env), /not bundled yet/);
  assert.equal(existsSync(target), false);
  assert.equal(pet.uninstallPet(env).changed, false);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'personal.txt'), 'keep');
  assert.equal(pet.petStatus(env).state, 'not-bundled');
  assert.throws(() => pet.installPet(env, true), /not bundled yet/);
  assert.throws(() => pet.uninstallPet(env), /unmanaged/);
  assert.deepEqual(readdirSync(target), ['personal.txt']);
});

test('the stub pet CLI explains how to get a pet without failing status checks', async t => {
  const { root, env } = fixture(t);
  const pet = await packaged(root, ['pet.json']);
  const run = args => spawnSync(process.execPath, [pet.script, ...args], { env, encoding: 'utf8', timeout: 5000 });
  const status = run(['pet', 'status']);
  assert.equal(status.status, 0);
  assert.match(status.stdout, /not-bundled/);
  assert.match(status.stdout, /native pet feature/);
  const install = run(['pet', 'install']);
  assert.equal(install.status, 1);
  assert.match(install.stderr, /not bundled yet/);
  assert.equal(run(['doctor', '--pet']).status, 1);
});

test('a managed copy installed from a release with art can be removed after the art is gone', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  pet.installPet(env);
  rmSync(join(pet.bundle, 'spritesheet.webp'));
  assert.equal(pet.petStatus(env).state, 'not-bundled');
  assert.equal(pet.petStatus(env).managed, true);
  assert.equal(pet.uninstallPet(env).changed, true);
  assert.equal(existsSync(target), false);
});

test('the shipped R2-D2 and C-3PO stubs report not-bundled and install nothing', t => {
  const { env } = fixture(t);
  const run = args => spawnSync(process.execPath, [SCRIPT, ...args], { env, encoding: 'utf8', timeout: 5000 });
  for (const [id, name] of [['r2d2', 'R2-D2'], ['c3po', 'C-3PO']]) {
    assert.equal(petStatus(env, id).state, 'not-bundled');
    assert.throws(() => installPet(env, false, id), new RegExp(`${name} pet art is not bundled yet`));
    assert.equal(uninstallPet(env, id).changed, false);
    const status = run(['pet', 'status', id]);
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, new RegExp(`Pet: ${name}, not-bundled`));
    assert.equal(JSON.parse(run(['pet', 'status', id, '--json']).stdout).state, 'not-bundled');
    assert.equal(run(['pet', 'install', id]).status, 1);
  }
  assert.equal(existsSync(join(env.CODEX_HOME, 'pets')), false);
});

test('unknown pet names are rejected before touching the pets directory', t => {
  const { env } = fixture(t);
  const run = args => spawnSync(process.execPath, [SCRIPT, ...args], { env, encoding: 'utf8', timeout: 5000 });
  for (const args of [['pet', 'install', 'bb8'], ['pet', 'install', 'r2d2', 'c3po'], ['pet', 'status', '../r2d2'], ['doctor', '--pet', 'chopper'], ['doctor', 'c3po']]) {
    const result = run(args);
    assert.equal(result.status, 1, args.join(' '));
  }
  assert.throws(() => installPet(env, false, 'bb8'), /Unknown pet/);
  assert.equal(existsSync(join(env.CODEX_HOME, 'pets')), false);
});

test('pet installation is independent, identical, repeatable, and removable', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  mkdirSync(env.CODEX_HOME, { recursive: true });
  const config = join(env.CODEX_HOME, 'config.toml');
  writeFileSync(config, '[desktop]\nselected-avatar-id = "another-pet"\n');
  assert.equal(pet.petStatus(env).state, 'not-installed');
  assert.equal(pet.installPet(env).changed, true);
  assert.equal(pet.petStatus(env).managed, true);
  assert.equal(pet.petStatus(env).spriteVersionNumber, 2);
  for (const name of ['pet.json', 'spritesheet.webp', 'LICENSE.txt', 'NOTICE.md']) assert.deepEqual(readFileSync(join(target, name)), readFileSync(join(pet.bundle, name)));
  assert.equal(pet.installPet(env).changed, false);
  assert.match(readFileSync(config, 'utf8'), /another-pet/);
  assert.deepEqual(readdirSync(join(env.CODEX_HOME, 'pets')), ['r2d2']);
  assert.equal(pet.uninstallPet(env).changed, true);
  assert.equal(pet.uninstallPet(env).changed, false);
  assert.ok(existsSync(config));
});

test('a manually extracted bundle remains unmanaged and unchanged', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  mkdirSync(target, { recursive: true });
  for (const name of ['pet.json', 'spritesheet.webp']) copyFileSync(join(pet.bundle, name), join(target, name));
  assert.equal(pet.installPet(env).changed, false);
  assert.equal(pet.petStatus(env).managed, false);
  assert.throws(() => pet.uninstallPet(env), /unmanaged/);
  assert.deepEqual(readdirSync(target).sort(), ['pet.json', 'spritesheet.webp']);
});

test('conflicting files require replacement and the complete previous directory is backed up', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'pet.json'), 'my custom pet');
  writeFileSync(join(target, 'personal.txt'), 'keep this too');
  assert.throws(() => pet.installPet(env), /--replace/);
  assert.equal(readFileSync(join(target, 'pet.json'), 'utf8'), 'my custom pet');
  const result = pet.installPet(env, true);
  assert.equal(result.state, 'matching');
  assert.equal(readFileSync(join(result.backup, 'personal.txt'), 'utf8'), 'keep this too');
  assert.equal(readFileSync(join(result.backup, 'pet.json'), 'utf8'), 'my custom pet');
});

test('uninstall protects modified files, unknown files, and corrupt ownership records', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  pet.installPet(env);
  writeFileSync(join(target, 'personal.txt'), 'keep');
  assert.throws(() => pet.uninstallPet(env), /changed/);
  rmSync(join(target, 'personal.txt'));
  writeFileSync(join(target, 'pet.json'), 'edited');
  assert.throws(() => pet.uninstallPet(env), /changed/);
  copyFileSync(join(pet.bundle, 'pet.json'), join(target, 'pet.json'));
  writeFileSync(join(target, '.agent-starwars.json'), '{');
  assert.throws(() => pet.uninstallPet(env), /unmanaged/);
  assert.ok(existsSync(join(target, 'spritesheet.webp')));
});

test('pet paths that are files or symbolic links are never replaced', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, 'keep');
  assert.throws(() => pet.installPet(env, true), /regular directory/);
  assert.equal(readFileSync(target, 'utf8'), 'keep');
  if (process.platform !== 'win32') {
    rmSync(target);
    const elsewhere = join(root, 'elsewhere');
    mkdirSync(elsewhere);
    writeFileSync(join(elsewhere, 'personal.txt'), 'keep');
    symlinkSync(elsewhere, target);
    assert.throws(() => pet.installPet(env, true), /regular directory/);
    assert.throws(() => pet.uninstallPet(env), /unmanaged/);
    assert.ok(existsSync(join(elsewhere, 'personal.txt')));
  }
});

test('pet CLI and doctor work without audio players or valid audio configuration', async t => {
  const { root, env } = fixture(t);
  const pet = await packaged(root);
  writeFileSync(env.AGENT_STARWARS_CONFIG, '{');
  const run = args => spawnSync(process.execPath, [pet.script, ...args], { env, encoding: 'utf8', timeout: 5000 });
  assert.equal(run(['doctor', '--pet']).status, 1);
  assert.equal(run(['pet', 'install']).status, 0);
  assert.equal(run(['doctor', '--pet']).status, 0);
  assert.equal(JSON.parse(run(['pet', 'status', '--json']).stdout).state, 'matching');
  assert.equal(run(['pet', 'install', '--unknown']).status, 1);
  assert.equal(run(['pet', 'unknown']).status, 1);
  assert.equal(run(['pet', 'uninstall']).status, 0);
});

test('an incomplete package fails before replacement and cleans its temporary files', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root, ['pet.json', 'spritesheet.webp', 'NOTICE.md']);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'personal.txt'), 'keep');
  assert.throws(() => pet.installPet(env, true), /ENOENT/);
  assert.equal(readFileSync(join(target, 'personal.txt'), 'utf8'), 'keep');
  assert.deepEqual(readdirSync(dirname(target)), ['r2d2']);
});

test('a package missing its sprite sheet cannot make an empty target appear healthy', async t => {
  const { root, env, target } = fixture(t);
  const pet = await packaged(root, ['pet.json']);
  mkdirSync(target, { recursive: true });
  assert.equal(pet.petStatus(env).state, 'not-bundled');
  assert.throws(() => pet.installPet(env, true), /not bundled yet/);
  assert.deepEqual(readdirSync(target), []);
});

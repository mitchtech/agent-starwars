# Codex pets

R2-D2 and C-3PO Codex pets are on their way. The sound plugin and the pets are
independent: installing sounds never installs or selects a pet, and a pet never
registers hooks or changes sound settings.

## Current state

Each droid has a manifest-only slot: `pets/r2d2/pet.json` and
`pets/c3po/pet.json`, each with a `NOTICE.md` describing what the bundle needs.
No sprite sheet ships yet, so:

```bash
agent-starwars pet status          # R2-D2: not-bundled
agent-starwars pet status c3po     # C-3PO: not-bundled
agent-starwars pet install         # explains that the art is not bundled; changes nothing
agent-starwars doctor --pet c3po
```

`not-bundled` is a healthy state: `pet status` exits 0 and `doctor` reports it
without failing the sound checks. Until the art ships, Codex's
[native pet feature](https://learn.chatgpt.com/docs/pets) can create a pet.

## Adding the art

Each droid's bundle is a data drop; no runtime code changes are needed.

1. Create the atlas with Codex's native pet tool: an 8 x 11 grid of 192 x 208
   cells (1536 x 2288 RGBA WebP, Codex sprite version 2) with the nine standard
   animation rows and two look-direction rows. The art must be original: no
   frames, stills, or models extracted from Star Wars films or games.
2. Save it as `pets/<droid>/spritesheet.webp`, add `LICENSE.txt` for the
   artwork, and record provenance in `pets/<droid>/NOTICE.md`. Preserve the
   original under `assets/original/<droid>/`.
3. Create `assets/<droid>-pet-revision.json`, then run
   `python3 scripts/export-pet-web.py --pet <droid>` to write the nine-row web
   atlas `assets/exports/agent-starwars-<droid>-pet-web.webp` and record its hash.
4. Run `python3 scripts/check-pet.py`. It validates the format, cell occupancy,
   transparent-pixel cleanup, and that the web atlas matches the animation rows.
5. `python3 scripts/package-release.py` then adds
   `agent-starwars-<droid>-pet.zip` (and its versioned twin) and the web atlas
   to the release automatically.

With art in place, `agent-starwars pet install [r2d2|c3po]` copies the bundle
into `$CODEX_HOME/pets/<droid>` (default `~/.codex/pets/<droid>`), and the
release ZIP can be extracted there by hand:

```bash
unzip agent-starwars-r2d2-pet.zip -d ~/.codex/pets
```

## Installer behavior

The CLI copies the four bundle files and a local ownership record into the
pet's directory. It leaves avatar selection, agent settings, hooks, and audio
configuration unchanged. An identical install is a no-op. A matching manual
installation remains unmanaged.

Different files require `agent-starwars pet install --replace`. The previous
entire directory is renamed to `<droid>.backup-<unique-suffix>` next to the new
installation. Files and symbolic links at the target directory path are never
replaced.

Status reports `not-bundled`, `not-installed`, `matching`, `modified`, or
`conflict`. Uninstall removes only an unchanged CLI-owned installation, even
when the current package has no art. It refuses edited files, unknown additional
files, symbolic links, and unmanaged installations. Installer tests use a small
fixture bundle for install, conflict, and missing-art behavior, and check that
the shipped R2-D2 and C-3PO stubs report `not-bundled`.

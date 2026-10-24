# Promotion validation

Campaign publications have not started. No social accounts were modified, no
messages were sent, and no directory submissions were made. Local evidence under
`dist/promotion/` is ignored by Git.

## Initial observations

Capture the first metrics snapshot after the v0.1.0 release and before any
promotion:

```bash
python3 docs/promotion/capture-metrics.py
```

Record the star and fork counts, the release asset IDs with their initial
download counts, and the traffic window here. Treat downloads and clones from
release verification and isolated install checks as validation activity, not
campaign adoption.

| Measure | Initial value | Captured |
|---|---|---|
| Stars / forks | Pending | Pending |
| Traffic window views / unique visitors | Pending | Pending |
| Release assets and downloads | Pending | Pending |

## Pre-release checks

Completed on October 24, 2026 against the local build on macOS:

- `npm run check`, `npm test` (45 tests), and `npm run test:package` passed.
- `python3 scripts/build-audio.py --check` verified all 75 clips. Every C-3PO
  clip was transcribed with whisper.cpp after processing to confirm the intended
  line survived trimming (a soft "Oh dear." needed lead-in silence for the
  transcriber, and the source was switched to a clearer take), and every clip
  is normalized to -16 LUFS integrated. R2-D2 clips were chosen from
  emotion-named game files.
- `python3 scripts/check-pet.py` reported both pets as not bundled, as intended.
- `python3 scripts/build-assets.py --check` matched committed preview pixels.
- `claude plugin validate .` (Claude Code 2.1.310) passed with no warnings.
- A local build of the site was checked in Chromium at 1280 x 900 and 375 x 812,
  in both droid themes. There was no horizontal overflow and no console errors.
  Three portrait clicks produced the annoyed line, an empty demo power cell
  produced the out-of-power line, a hotkey played its comlink clip, and every
  chip's WAV resolved.
- The registered hook command was run with Claude, Codex, and Gemini payloads on
  macOS with `afplay`: session start, a destructive approval, Stop, `StopFailure`
  rate_limit and max_output_tokens, Codex Stop and Gemini AfterAgent (stdout
  exactly `{}`), three rapid prompts, and the status-line meter at 85% and 90%
  (`⚡ 15% power (5h) low`).
- A one-shot `claude -p --plugin-dir` session loaded the plugin and its hooks
  wrote playback state.
- Both promotional MP4s were rendered: 27 and 15 seconds, 1080 x 1080 H.264
  with AAC audio.

Known behavior: `afplay` holds the audio device for roughly 0.9 seconds after a
clip ends, and the global lock spans the player's whole run. A second cue
arriving within about 2.5 seconds of the first is dropped, as in the sibling
projects.

## Remaining native checks

The following have not been verified by automated, package, or browser checks:

- Physical speaker output heard by a person from an actual Claude Code approval request.
- The destructive-command cue from an actual Claude Code `rm -rf` approval.
- An actual Claude Code `StopFailure` from a real rate limit.
- Physical speaker output from an actual trusted Codex approval request.
- End-to-end native behavior on Linux or Windows.
- The published Pages site (only a local build has been checked).

The committed MP4s are labeled illustrated previews, not proof of those checks.
Before publishing a claim of native behavior personally observed, complete the
[capture script](demos.md) and record host/version, OS, event, and result here.

| Check | Host/version | OS | Event/result | Evidence |
|---|---|---|---|---|
| Claude physical approval cue | Pending | Pending | Pending | Pending |
| Claude destructive-command cue | Pending | Pending | Pending | Pending |
| Claude rate-limit power cue | Pending | Pending | Pending | Pending |
| Codex trusted physical approval cue | Pending | Pending | Pending | Pending |

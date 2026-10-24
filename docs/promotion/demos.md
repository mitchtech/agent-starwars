# Media and live capture scripts

## Available previews

These assets are illustrated previews assembled from the bundled WAV files and
the site's fonts. They do not show a native host, a real approval dialog, or
physical speaker playback. Keep their labels visible and describe them as previews.

| Asset | Duration | Use |
|---|---|---|
| [Sound preview](../../assets/promotion/sound-preview.mp4) | 27 seconds | Main sound posts, in duo mode; cues at 0.5 s (R2-D2's greeting), 4.5 s (excuse me), 8.5 s (we're doomed, with a force push on screen), 13.5 s (oh, thank the Maker), 17.5 s (I'm doomed) |
| [Droid preview](../../assets/promotion/droid-preview.mp4) | 15 seconds | Droid-mode post; cues at 0.5 s (duo: an R2 prompt chirp), 5.5 s (r2d2: R2 cheering), 10.5 s (c3po: don't get technical with me) |

Each MP4 is 1080 x 1080, 15 fps, H.264/yuv420p with AAC audio, burned-in
captions, and a fast-start header. A hologram panel sweeps each clip's waveform
in sync with its audio, gold for C-3PO and blue for R2-D2. Matching `.srt` files
and PNG posters live beside the videos. The
[manifest](../../assets/promotion/manifest.json) records hashes, source files,
tool versions, and limitations. The README's
[waveform GIFs](../../assets/previews/c3po-thank-the-maker.gif) remain available.

Build locally with existing Pillow and FFmpeg installations:

```bash
python3 docs/promotion/build-media.py
```

This script never installs tools, plays audio through speakers, uses account
credentials, or publishes files. Code is MIT. Video composition does not grant
rights to the Star Wars audio, which belongs to Lucasfilm Ltd. and the games'
publishers. Never add Lucasfilm logos, posters, film stills, or game footage.
Preserve the [audio notice](../../audio/NOTICE.md) and
[font notice](../../site/fonts/OFL.md).

## Native approval recording - 20-30 seconds

Use this script when a verified host recording is available. Capture a fresh
disposable project and only the relevant host window. Keep your normal permission
settings. Capture application/system audio if supported; a screen recording
without an audio track does not establish an audible cue.

| Time | Capture | Caption |
|---|---|---|
| 0-3 s | Host and exact version visible; harmless task underway | Your agent is waiting for approval |
| 3-8 s | A real approval request and the corresponding cue | Excuse me. |
| 8-15 s | Your response to the dialog; retain enough context to understand it | You make the decision |
| 15-22 s | Verified install commands for that host | Agent Star Wars - local sound cues |
| 22-27 s | Repository address | github.com/mitchtech/agent-starwars |

Use a request to write a temporary text file in the disposable project if it
requires approval under the existing policy. If it is already approved, do not
manufacture an approval dialog or substitute a `play` invocation while claiming
native behavior. Match the caption to the actual cue: file-edit requests play a
change line ("Be careful.", "Goodness gracious me.") rather than "Excuse me.".

## Destructive-command recording - 10-15 seconds

In a disposable directory containing only a throwaway `build/` folder, ask the
agent to delete it with `rm -rf build`. Record the approval dialog and the
"We're doomed.", "This is madness!", or "Oh no! I'm under attack!" cue, then
deny or approve as you would normally. Never point the demonstration at
anything you would mind losing, and never weaken permissions to stage it.
Caption it as a cue, not a safeguard.

Pass criteria for both recordings: visible native dialog, matching audio track,
exact host/version noted in the capture record, readable captions at phone
width, no private content, and no dubbed cue presented as live playback. Replace
the preview disclaimer in the relevant post only after these criteria pass.

## Out-of-power recording

Do not burn through a real usage limit to stage this. Record it only if a rate
limit happens during ordinary work, with the StopFailure message visible.
Otherwise use the sound preview, labeled as a preview, or show the status-line
meter with a low `power.lowPercent` so the "This looks very bad." cue plays
honestly.

## Quiet configuration recording - 10-15 seconds

Show the current status; invoke `preset attention` or `droid r2d2` through the
bundled skill or repository CLI; show the resulting enabled events and droid.
Caption session/prompt cues as disabled and attention events as host-dependent.
Do not claim a silent event was observed merely because no audio was captured.

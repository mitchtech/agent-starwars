# Audio provenance and rights

The WAV files in this directory are derived from Star Wars films and licensed
Star Wars games. Lucasfilm Ltd. and the games' publishers retain all rights to
this audio, including every voice line and sound here. C-3PO is performed by
Anthony Daniels; R2-D2's voice was created by sound designer Ben Burtt. Star
Wars, R2-D2, and C-3PO are trademarks of Lucasfilm Ltd. No ownership of these
clips is claimed, and no affiliation with or endorsement by Lucasfilm Ltd.,
The Walt Disney Company, or any game publisher is implied.

The repository's MIT license covers source code and configuration only. It
does not cover these recordings or grant any rights to them.

The clips are included for personal, non-commercial use. This notice records
their provenance; it is not a license from the rights holders. They will be
removed on request from Lucasfilm Ltd. or a rights holder.

## Sources and processing

[`sources.json`](sources.json) lists every source URL, its SHA-256, the archive
member where one applies, any trim, and the hash of each committed output. The
sources are community archives of game files and film clips: The Sounds
Resource rips of *LEGO Star Wars: The Skywalker Saga*, *Disney Infinity 3.0*,
and a *Star Wars Soundboard*, and WavSource film clips. None publishes a
license for the recordings. Every C-3PO clip's words were checked against a
speech-to-text transcript after processing; R2-D2 clips come from emotion-named
game files (agree, attention, fear, win, lose, and so on) and were matched to
events by those names.

The Sounds Resource sits behind a browser challenge, so rebuilding those clips
needs each archive downloaded once in a browser and saved in the build cache
under its SHA-256 (`--cache DIR`; the error message names the file).

[`scripts/build-audio.py`](../scripts/build-audio.py) trims leading and trailing
room tone, applies one linear gain to reach -16 LUFS integrated with a peak
limiter, adds 10-20 ms fades, and writes 16-bit mono PCM WAV at 32 kHz.
`--check` verifies the committed files without downloading anything.

| File | Droid | Line | Length | Source |
|---|---|---|---|---|
| `r2-hello.wav` | R2-D2 | (bright greeting whistle) | 0.97 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_FOUND_04.wav`) |
| `r2-beeps.wav` | R2-D2 | (a burst of beeps and boops) | 1.52 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`DX_CHR_R2D2_BEEPSANDBOOPS1.wav`) |
| `r2-agree.wav` | R2-D2 | (affirmative chirp) | 0.63 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_AGREE_01.wav`) |
| `r2-agree-short.wav` | R2-D2 | (quick affirmative beep) | 0.43 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_AGREE_04.wav`) |
| `r2-agree-bright.wav` | R2-D2 | (bright affirmative beep) | 0.36 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_AGREE_05.wav`) |
| `r2-annoyed.wav` | R2-D2 | (indignant raspberry) | 1.01 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_ANGERMED_08.wav`) |
| `r2-angry.wav` | R2-D2 | (angry blat) | 0.97 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_ANGERLRG_02.wav`) |
| `r2-attention.wav` | R2-D2 | (insistent attention beeps) | 0.94 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_ATTENTION_08.wav`) |
| `r2-alert.wav` | R2-D2 | (two-tone alert) | 0.79 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_ATTENTION_11.wav`) |
| `r2-huh.wav` | R2-D2 | (curious rising warble) | 0.55 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_HUH_07.wav`) |
| `r2-query.wav` | R2-D2 | (questioning beep) | 0.52 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_HUH_02.wav`) |
| `r2-fear.wav` | R2-D2 | (alarmed warble) | 0.90 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_FEAR_09.wav`) |
| `r2-scream.wav` | R2-D2 | (R2-D2 scream) | 1.42 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_SCREAMLNG_02.WAV`) |
| `r2-thinking.wav` | R2-D2 | (thoughtful burble) | 1.25 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_THOUGHTFUL_01.wav`) |
| `r2-pondering.wav` | R2-D2 | (pondering chatter) | 1.26 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_THOUGHTFUL_06.wav`) |
| `r2-win.wav` | R2-D2 | (excited trill) | 0.65 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_WIN_01.wav`) |
| `r2-cheer.wav` | R2-D2 | (happy whistle) | 0.63 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_WIN_03.wav`) |
| `r2-sad.wav` | R2-D2 | (sad descending whistle) | 1.10 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_LOSE_05.wav`) |
| `r2-worried.wav` | R2-D2 | (worried warble) | 0.79 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_FEAR_07.wav`) |
| `r2-static.wav` | R2-D2 | (electrocuted static) | 1.70 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_ELECTROCUTED_02.wav`) |
| `r2-disagree.wav` | R2-D2 | (short raspberry) | 0.64 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_DISAGREE_09.wav`) |
| `r2-off-he-goes.wav` | R2-D2 | (rolling-off chirp) | 0.88 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_FOUND_01.wav`) |
| `r2-power-down.wav` | R2-D2 | (power-down moan) | 1.23 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_DEATH_01.wav`) |
| `r2-laugh.wav` | R2-D2 | (R2-D2 laughing) | 1.34 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_LAUGHLRG_01.wav`) |
| `r2-singing.wav` | R2-D2 | (R2-D2 singing) | 1.06 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (R2-D2) (`VO_R2D2_SINGING_03.wav`) |
| `c3po-hello-assistance.wav` | C-3PO | Oh, hello. I am C-3PO. How may I be of assistance? | 5.00 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_OHHELLOIAMC3POHOW_ENG.wav`) |
| `c3po-glad-you-are-here.wav` | C-3PO | I am glad you are here. | 1.56 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0155.wav`) |
| `c3po-greetings.wav` | C-3PO | Greetings. | 0.52 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0151.wav`) |
| `c3po-certainly.wav` | C-3PO | I can certainly be of assistance here. | 2.17 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_ICANCERTAINLYBEOF_ENG.wav`) |
| `c3po-where-i-come-in.wav` | C-3PO | I believe this is where I come in. | 1.79 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_IBELIEVETHISISWHERE_ENG.wav`) |
| `c3po-see-your-point.wav` | C-3PO | I see your point, sir. | 0.93 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_10.mp3`) |
| `c3po-technical.wav` | C-3PO | Don't get technical with me. | 0.98 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_07.mp3`) |
| `c3po-your-fault.wav` | C-3PO | I don't know what all this trouble is about, but I'm sure it must be your fault. | 3.03 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_19.mp3`) |
| `c3po-had-enough.wav` | C-3PO | I've just about had enough of you. | 1.87 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_08.mp3`) |
| `c3po-dont-like-you.wav` | C-3PO | I don't like you either. | 0.86 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_09.mp3`) |
| `c3po-how-rude.wav` | C-3PO | How rude! | 0.81 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_12.mp3`) |
| `c3po-gone-too-far.wav` | C-3PO | This time you have gone too far. | 1.44 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_11.mp3`) |
| `c3po-on-purpose.wav` | C-3PO | I believe you did that on purpose. | 1.40 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0171.wav`) |
| `c3po-switch-off.wav` | C-3PO | Oh, switch off! | 1.16 s | WavSource (`switch-off.wav`) |
| `c3po-excuse-me.wav` | C-3PO | Excuse me. | 1.13 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0168.wav`) |
| `c3po-assist-me.wav` | C-3PO | Would you assist me, please? | 1.51 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0278.wav`) |
| `c3po-did-you-hear.wav` | C-3PO | Did you hear that? | 0.68 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_01.mp3`) |
| `c3po-alerted.wav` | C-3PO | All systems have been alerted to your presence, sir. | 2.48 s | WavSource (`alerted.wav`) |
| `c3po-be-careful.wav` | C-3PO | Be careful. I am rather attached to all my parts. | 3.34 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_BECAREFULIMQUITE_ENG.wav`) |
| `c3po-goodness.wav` | C-3PO | Goodness gracious me. | 0.75 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_13.mp3`) |
| `c3po-please-be-careful.wav` | C-3PO | Please be careful. | 1.79 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0167.wav`) |
| `c3po-doomed.wav` | C-3PO | We're doomed. | 0.63 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_04.mp3`) |
| `c3po-madness.wav` | C-3PO | This is madness! | 0.88 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_03.mp3`) |
| `c3po-under-attack.wav` | C-3PO | Oh no! I'm under attack! | 1.71 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_OHNOIMUNDERATTACK_ENG.wav`) |
| `c3po-talking-about.wav` | C-3PO | What are you talking about? | 0.75 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_06.mp3`) |
| `c3po-what-is-that.wav` | C-3PO | What is that? | 0.59 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_18.mp3`) |
| `c3po-what-is-happening.wav` | C-3PO | What is happening? | 1.59 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0176.wav`) |
| `c3po-where-have-you-been.wav` | C-3PO | At last! Where have you been? | 1.72 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_05.mp3`) |
| `c3po-forgotten-us.wav` | C-3PO | Artoo, do you think they have forgotten about us? | 2.49 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0161.wav`) |
| `c3po-stand-here.wav` | C-3PO | I shall stand here for as long as it takes to be of service. | 3.54 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0162.wav`) |
| `c3po-thank-the-maker.wav` | C-3PO | Oh, thank the Maker. | 1.16 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0190.wav`), from 1.88 s |
| `c3po-how-wonderful.wav` | C-3PO | Oh, how wonderful! | 1.41 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_HOWWONDERFUL_ENG.wav`) |
| `c3po-im-doomed.wav` | C-3PO | I'm doomed. | 1.29 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0179.wav`) |
| `c3po-deserve-this.wav` | C-3PO | What have I done to deserve this? | 1.41 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0172.wav`) |
| `c3po-looks-bad.wav` | C-3PO | This looks very bad. | 1.09 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0185.wav`) |
| `c3po-sensors.wav` | C-3PO | My sensors tell me enemies are approaching. | 3.00 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0181.wav`) |
| `c3po-not-quite-sure.wav` | C-3PO | I'm not quite sure if you... | 1.24 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0264.wav`) |
| `c3po-try-again.wav` | C-3PO | I am not quite sure if you fully understood me previously. I will try again. | 3.99 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0219.wav`) |
| `c3po-unpleasant.wav` | C-3PO | That was very unpleasant. | 1.28 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_THATWASVERY_ENG.wav`) |
| `c3po-not-built-for-this.wav` | C-3PO | I wasn't built for this! | 2.40 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0240.wav`) |
| `c3po-oh-dear.wav` | C-3PO | Oh dear. | 0.83 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0188.wav`) |
| `c3po-not-programmed.wav` | C-3PO | I have not been programmed to do this, I'm afraid. | 2.40 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_IHAVENTBEEN_ENG.wav`) |
| `c3po-embark.wav` | C-3PO | If we must embark on a mission together, could I please ask that you refrain from pulling me apart? | 5.33 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_IFWEMUSTEMBARKONA_ENG.wav`) |
| `c3po-where-did-i-go.wav` | C-3PO | Where did I go? | 0.66 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_WHEREDIDIGO_ENG.wav`) |
| `c3po-traumatic.wav` | C-3PO | What a traumatic experience. I do hope we won't have to suffer through that sort of thing again. | 4.65 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0800.wav`) |
| `c3po-good-day.wav` | C-3PO | Good day. | 0.50 s | The Sounds Resource, *Disney Infinity 3.0* (C-3PO) (`THP0156.wav`) |
| `c3po-not-the-droid.wav` | C-3PO | I am terribly sorry, but I am not the droid you're looking for. | 3.55 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_IAMTERRIBLYSORRYBUT_ENG.wav`) |
| `c3po-fluent.wav` | C-3PO | I am fluent in over six million forms of communication, if that is of any use today. | 5.34 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_IAMFLUENTINSIX_ENG.wav`) |
| `c3po-some-sort-of-god.wav` | C-3PO | I do believe they think I am some sort of god. | 2.95 s | The Sounds Resource, *Star Wars Soundboard* (C-3PO) (`c3po_16.mp3`) |
| `c3po-not-scrap.wav` | C-3PO | Just to let you know, I am not scrap and I am not for sale, so good day to you. | 5.13 s | The Sounds Resource, *LEGO Star Wars: The Skywalker Saga* (C-3PO) (`DX_CHR_C3PO_JUSTTOLETYOUKNOWIAM_ENG.wav`) |

Use the user audio directory setting to supply your own replacement recordings
without editing installed plugin files.

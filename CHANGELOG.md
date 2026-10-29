# Changelog

## 0.1.1 - 2026-10-28

- Link the Agent Rocky and Agent StarCraft sibling projects in the README, site, control skill, and promotion kit.

## 0.1.0 - 2026-10-24

First release, built on the Agent Warcraft v0.3.0 runtime.

- Play 75 clips (25 R2-D2, 50 C-3PO) for Claude Code, Codex, and Gemini CLI, plus a generic `play` interface for other agents.
- Add a `droid` setting: `duo` (the default) gives R2-D2's short beeps to frequent, low-stakes cues (session start, prompts, tool failures, subagents, session end) and lets C-3PO speak for approvals, questions, completion, usage alarms, errors, and compaction; `r2d2` and `c3po` keep to one droid; `both` mixes them at random. Every default cue has clips for both droids.
- Map approvals to "Excuse me." and "Would you assist me, please?", questions to "What are you talking about?", idle notifications to "At last! Where have you been?", and finished turns to "Oh, thank the Maker." (on by default).
- Play "We're doomed.", "This is madness!", or R2's scream when an approval's command is destructive (`rm -rf`, force push, `git reset --hard`, `DROP TABLE`, and similar). Only a yes/no flag leaves the hook; the command is never stored.
- Play `out_of_power` ("I'm doomed.") when Claude Code stops on `rate_limit`, `billing_error`, or `account_on_hold`, or when a usage-limit wait ends without resuming, and `transmission_cut` (a C-3PO line that stops mid-sentence) on `max_output_tokens`. Other API errors keep the optional `error` cue.
- Add `agent-starwars statusline`, a power meter for Claude Code's status line that reads the 5-hour, 7-day, and spend-limit percentages and an optional per-session dollar budget. It warns once per session with `power_low` ("This looks very bad.") and plays `out_of_power` at 100%.
- Play C-3PO's annoyed lines ("Don't get technical with me.", "How rude!") on the third prompt sent within ten seconds. Only timestamps are stored.
- Add optional `subagent_started`, `tool_failed` ("Oh dear."), `context_compacting` ("Where did I go?"), and `session_ended` cues.
- Add a 2% easter egg ("I am terribly sorry, but I am not the droid you're looking for.", R2 laughing) limited to non-urgent cues, with `mute easter-egg`.
- Record every clip's source URL, archive member, trim, droid, and output hash in `audio/sources.json`, with a reproducible ffmpeg build and an offline `--check`; clips are loudness-matched at -16 LUFS, and every C-3PO clip was checked against a speech-to-text transcript.
- Ship R2-D2 and C-3PO Codex pet slots as manifest-only stubs: `pet status [r2d2|c3po]` reports `not-bundled`, and installer, validation, and release packaging enable themselves when the art lands.
- Add the `starwars-control` skill for natural-language control ("switch to C-3PO", "beeps only", "mute the droids").
- Add a Pages site with an R2-D2 (dark, hyperspace) / C-3PO (light, Tatooine) toggle that follows the system theme on first visit, a clickable droid portrait that gets annoyed, a comlink with twelve hotkeys, a demo power cell, and an event map with each event's duo droid.

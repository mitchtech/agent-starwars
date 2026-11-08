---
name: starwars-control
disable-model-invocation: false
description: >-
  Inspect and control Agent Star Wars R2-D2 and C-3PO sound notifications without changing pet selection.
  TRIGGER when: the user says "mute R2", "mute R2-D2", "mute C-3PO", "mute threepio",
  "mute the droids", "unmute the droids", "droid status", "Agent Star Wars status",
  "switch to C-3PO", "switch to R2-D2", "R2-D2 mode", "C-3PO mode", "only beeps",
  "only threepio", "duo mode", "use both droids", "mix the droids", "stop the beeps",
  "turn off prompt sounds", "turn off thank the maker", "turn off completion sounds",
  "enable approval sounds", "droid attention mode", "turn off easter eggs",
  "stop the annoyed lines", "stop don't get technical with me", "enable subagent sounds",
  "enable tool failure sounds", "enable compaction sounds", "turn on session end sounds",
  "we're doomed sound", "power alarm", "out of power sound", "set a power budget",
  "statusline power meter", "preview a droid sound", "play thank the maker", or asks to
  inspect or adjust Agent Star Wars notifications.
  DO NOT TRIGGER when: the user wants operating system volume controls, unrelated
  notification settings, Agent Navi controls (use navi-control), Agent Johnny 5
  controls (use johnny5-control), Agent Warcraft controls (use warcraft-control),
  Agent Rocky controls (use rocky-control), Agent StarCraft controls (use
  starcraft-control), pet artwork, or pet selection through the host picker.
---

# Agent Star Wars sound controls

Resolve this installed SKILL.md's directory. The bundled CLI is
`../../scripts/starwars.mjs` relative to it. Run it with Node and a quoted absolute
path, rather than assuming a global `agent-starwars` executable is installed.

- Inspect: `status`, `status --json`, `list`, or `config --effective`.
- Mute/unmute: `mute EVENT|easter-egg|all` or `unmute EVENT|easter-egg|all`.
- Droid: `droid duo`, `droid r2d2`, `droid c3po`, or `droid both`.
- Presets: `preset attention` or `preset default`.
- Requested sound preview: `preview CLIP`.

Use `list` to resolve supported event and clip names. Translate a clear request
into the corresponding event:

| Request | Event |
|---|---|
| Prompt sounds (R2's acknowledging chirps, "I can certainly be of assistance") | `prompt_submitted` |
| Annoyed lines on rapid prompts ("Don't get technical with me.") | `annoyed` |
| Approval sounds, including the destructive-command alarm | `approval_required` |
| Questions ("What are you talking about?") | `input_required` |
| Idle or ready notices ("At last! Where have you been?") | `ready_for_input` |
| "Thank the Maker" / completion sounds | `turn_completed` |
| Rate limit, billing, or budget exhausted ("We're doomed.") | `out_of_power` |
| Status-line low-power warning ("This looks very bad.") | `power_low` |
| Output token limit (the line that cuts off mid-sentence) | `transmission_cut` |
| Other API errors | `error` |
| Failed tool calls ("Oh dear.") | `tool_failed` |
| Subagents starting | `subagent_started` |
| Compaction ("Where did I go?") | `context_compacting` |
| Session end | `session_ended` |
| Rare extras ("I am not the droid you're looking for.", R2 laughing) | `easter-egg` |

Droid modes: `duo` (the default) gives R2-D2's short beeps to frequent, low-stakes
cues (session start, prompts, tool failures, subagents, session end) and lets
C-3PO speak for everything you should act on or notice. `r2d2` plays only beeps,
`c3po` only C-3PO, and `both` picks randomly from both droids for every cue.
"Only beeps" or "just R2" means `droid r2d2`; "just threepio" means `droid c3po`.
The destructive alarm ("We're doomed.") is part of `approval_required`; it
cannot be muted separately without muting approvals. Ask only when the
requested event is unclear.

The power meter is a status-line command, not a hook. When asked to set it up or
to set a budget, explain the `power.budgetUsd` and `power.lowPercent` settings in
the config file and the `statusline` command documented in `docs/budget.md`, and
show the user the line to add. Do not edit the host's settings or status line yourself.

Change preferences only when the user requests that change. Inspection and
troubleshooting do not imply muting, unmuting, switching droids, applying a
preset, or playing audio. Always specify an event or explicit `all`. Global
mute/unmute preserves event preferences. Presets change event enablement and
preserve clips, droid, and global mute.

Changes persist outside plugin caches and take effect on the next hook. Report
the resulting status. If `AGENT_STARWARS_MUTE` overrides the saved preference, explain
that the user must change it in the agent's launch environment. Do not modify
shell startup files or host configuration automatically.

Pet installation and selection are independent. These controls never change
pets, register hooks, or approve agent actions.

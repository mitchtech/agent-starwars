# Response sheet

Use these as factual starting points. Answer the person's question directly
and link only the relevant documentation.

**What is Agent Star Wars?** A free sound-notification plugin for coding agents
that plays R2-D2 and C-3PO. Native sounds support Claude Code, Codex, and Gemini
CLI; other tools can call the shared event interface. It is a sibling of Agent
Warcraft, Agent Navi, and Agent Johnny 5 and shares their runtime design.

**What is duo mode?** The default. R2-D2's short beeps play for frequent,
low-stakes events (session start, prompts, tool failures, subagents, session
end); C-3PO speaks for approvals, questions, completion, usage alarms, errors,
and compaction. `agent-starwars droid r2d2` plays only beeps, `droid c3po`
only C-3PO, and `droid both` picks either droid at random for every cue.

**Is it constantly talking?** Session, prompt, completion, and attention events
are enabled by default where supported, but in duo mode the frequent ones are
R2's beeps. Use the attention preset to keep only approvals, questions, ready
notices, and usage alarms; mute individual events; or mute everything. Error,
tool-failure, subagent, compaction, and session-end cues are off by default.

**Why does C-3PO say "Don't get technical with me"?** You sent three prompts
within ten seconds. `agent-starwars mute annoyed` turns that off. Only
timestamps are stored, never prompt text.

**When does it say "I'm doomed"?** When Claude Code stops a turn with a
`rate_limit`, `billing_error`, or `account_on_hold` error, or when a usage-limit
wait ends without resuming. With the optional status-line power meter it also
warns at 80% of your tightest limit ("This looks very bad.") and plays the
out-of-power cue at 100%. Codex and Gemini do not report API failures to hooks.
See [budget](../budget.md).

**Why does a C-3PO line cut off mid-sentence?** That is `transmission_cut`: the
reply hit the output token limit, so the line stops too.

**Does the power meter know my real bill?** No. It reads the percentages Claude
Code sends to the status line and, if you set a budget, Claude Code's own
client-side cost estimate. It stores one level per session.

**What is the "We're doomed" alarm?** When an approval's command matches a short
list of destructive patterns (recursive force deletes, force pushes, hard
resets, `git clean -f`, dropped or truncated tables, `mkfs`, `dd of=`,
`chmod -R 777`, and PowerShell recursive force removal), the approval plays
"We're doomed.", "This is madness!", or "Oh no! I'm under attack!" instead of
the ordinary cue. In R2-D2 mode, he screams.

**Is the alarm a safety feature?** No. It is a louder sound. It never blocks or
approves anything, and an indirect or obfuscated command gets the ordinary cue.
Keep your normal permission settings.

**Does it read my commands?** Only to set a yes/no flag inside the short-lived
hook process. The command is never passed to the playback worker, logged, or
stored. Local playback state stores hashed identifiers with timestamps or power
levels only.

**What are the easter eggs?** About 2% of session, prompt, ready, and completion
cues are replaced by an extra ("I am terribly sorry, but I am not the droid
you're looking for.", R2 laughing or singing). They never replace approval,
question, error, or alarm cues. `agent-starwars mute easter-egg` turns them off.

**Does it send telemetry?** No. It runs locally without runtime telemetry, and
the site loads no analytics. GitHub and social platforms keep their own aggregate
metrics.

**Why do I hear nothing?** Check Node.js on the hook process's PATH, restart the
agent, verify the local audio player/device, and inspect the mute state. Codex
also requires hook trust review. Use `doctor` for diagnostics and
`preview c3po-thank-the-maker` for an explicit audio check.

**I hear a peon and a droid.** Agent Warcraft, Agent Navi, or Agent Johnny 5 is
installed too. Enable one per host; see the
[install walkthrough](install.md#already-using-a-sibling-plugin).

**Will it play on my laptop from SSH, WSL, or a container?** Not automatically.
Audio plays where the hook runs. A working audio bridge must already exist if
the execution environment and speakers are on different machines.

**Do all hosts expose the same events?** No. Claude has question, idle, usage,
tool-failure, and error mappings that Codex and Gemini lack. Completion is not
a task success detector. See [compatibility](../compatibility.md).

**Is there a Codex pet?** Not yet. R2-D2 and C-3PO pet slots ship ready:
`agent-starwars pet status` and `pet status c3po` report `not-bundled` and
change nothing. The installer and release packaging switch on when the art
lands. See [pets](../pets.md).

**Where do the clips come from?** Mostly game voice files (*LEGO Star Wars: The
Skywalker Saga*, *Disney Infinity 3.0*) and a soundboard rip, plus a few film
clips. The [audio notice](../../audio/NOTICE.md) lists every source and hash.

**Is this official Lucasfilm software?** No. Star Wars, R2-D2, and C-3PO belong
to Lucasfilm Ltd. Code and configuration use MIT; the bundled audio is excluded,
and its provenance notice is not permission from the rights holders. If a
rights holder asks, the clips come out.

**Can I use my own audio?** Yes. Configure your own audio directory with a
`<clip>.wav` for every name in `agent-starwars list`, using 16-bit PCM WAV for
player compatibility. See [configuration](../../README.md#configuration).

**Was every platform physically tested?** CI exercises Node 22/24 on macOS,
Linux, and Windows with simulated players. Package tests exercise installed
bundles. Neither proves physical speaker output on every surface. Current
campaign checks are recorded in [validation](validation.md).

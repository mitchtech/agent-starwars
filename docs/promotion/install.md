# From install to first cue

Agent Star Wars is free to try. Sounds require Node.js 22+ on the agent's PATH
and local audio: `afplay` on macOS, a supported Linux player, or Windows
PowerShell on Windows. Remote hooks play on the remote machine unless an audio
bridge is already configured.

## Claude Code

Run in a terminal:

```bash
claude plugin marketplace add mitchtech/agent-starwars
claude plugin install starwars@agent-starwars
```

Restart Claude Code. A new session should greet you with R2-D2's whistle, each
prompt should get a short R2 chirp, and the end of each turn should play "Oh,
thank the Maker." or "Oh, how wonderful!". In a disposable project, request a
harmless operation that requires approval under your existing permission
settings; it should play a C-3PO approval line, or for a file edit, "Be careful.
I am rather attached to all my parts." Do not weaken permissions to make the
demonstration work. Use the explicit preview below to check audio separately.

## Codex

```bash
codex plugin marketplace add mitchtech/agent-starwars
codex plugin add starwars@agent-starwars
```

Review and trust the installed hooks in Codex's hook settings, then restart.
Repeat the harmless approval check under your normal permission settings.
Installing or enabling the plugin alone does not establish hook trust.

## Codex pets

The R2-D2 and C-3PO pet slots ship as stubs; the art is not bundled yet.
`agent-starwars pet status` reports `not-bundled` and installation changes
nothing. Codex's native pet feature can create a pet in the meantime.

## Already using a sibling plugin?

Agent Warcraft, Agent Navi, Agent Johnny 5, and Agent Star Wars answer the same
events. Enable one per host. For example,
`claude plugin disable warcraft@agent-warcraft` for Claude Code, or
`enabled = false` under `[plugins."warcraft@agent-warcraft"]` in
`~/.codex/config.toml` for Codex.

## Diagnose and preview without a global install

The bundled control skill supports requests such as "check the droids' sound
status," "mute the droids," "switch to C-3PO," "beeps only," "turn off easter
eggs," and "use the attention preset." For an explicit terminal preview, use
the repository CLI:

```bash
git clone https://github.com/mitchtech/agent-starwars.git
cd agent-starwars
node scripts/starwars.mjs doctor
node scripts/starwars.mjs preview c3po-thank-the-maker
```

`doctor` does not play audio or change settings. `preview` explicitly plays a
clip even when muted; it is an audio check, not proof that a host hook fired.
These commands need no npm install. To hear the destructive-command path without
an agent:

```bash
node scripts/starwars.mjs play approval_required --tool Bash --command "rm -rf build"
```

That passes the string to the matcher only; nothing is executed. The usage
alarms and droid modes can be heard the same way:

```bash
node scripts/starwars.mjs play out_of_power
node scripts/starwars.mjs droid r2d2
node scripts/starwars.mjs play out_of_power
node scripts/starwars.mjs droid duo
```

To keep only attention-related events:

```bash
node scripts/starwars.mjs preset attention
node scripts/starwars.mjs status
```

The attention preset turns off session, prompt, annoyed, completion, error,
tool-failure, subagent, compaction, and session-end cues. Approval, question,
ready, and usage-alarm events remain enabled where the host exposes them.

```bash
node scripts/starwars.mjs mute all
node scripts/starwars.mjs unmute all
node scripts/starwars.mjs preset default
```

Mute/unmute preserves individual event preferences. The default preset restores
event enablement and preserves global mute, droid, and custom clip choices.

## Remove sounds

Use the command for the host you installed:

```bash
claude plugin uninstall starwars@agent-starwars
```

```bash
codex plugin remove starwars@agent-starwars
```

Restart the host. Persistent sound settings are stored separately from plugin
caches.

If a check fails, report the host/version, operating system, expected event,
and redacted diagnostic error through [GitHub Issues](https://github.com/mitchtech/agent-starwars/issues).
Do not include prompts, transcripts, credentials, or private configuration.

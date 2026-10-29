# Public post drafts

Owner review required before publishing. These drafts describe documented
behavior, not fabricated user results. Attach the matching captioned preview
from [demos.md](demos.md). Keep its preview label visible. Substitute a live clip
only after the native capture checklist passes. Recheck community rules and
flair on publication day. Use one primary destination per post.

## R1 - r/ClaudeCode weekly showcase

I built Agent Star Wars, a free sound-notification plugin for Claude Code. R2-D2
chirps when you send a prompt, and C-3PO speaks when you should look up:
"Excuse me." for an approval, "Oh, thank the Maker." when a turn finishes, and
"We're doomed." when the approval is for `rm -rf` or a force push.

The attached clip is an illustrated sound preview, not a live hook recording.

Install from your terminal:

```bash
claude plugin marketplace add mitchtech/agent-starwars
claude plugin install starwars@agent-starwars
```

It needs Node.js 22+ and local audio. Restart Claude Code after installation.
It runs locally with no runtime telemetry, and the hooks never approve or block
actions. The destructive-command line is a louder cue, not a safety check.
Send three prompts in ten seconds and C-3PO tells you not to get technical
with him.

When Claude Code stops on a rate limit, C-3PO says "I'm doomed." There is an
optional status-line power meter that warns once when your 5-hour or weekly
limit runs low. Prefer only beeps? `agent-starwars droid r2d2`.

Install details: https://github.com/mitchtech/agent-starwars#install

Is the R2-for-routine, C-3PO-for-attention split right, or would you rather
hear one droid?

## R2 - r/codex showcase

Title: I built Agent Star Wars: R2-D2 and C-3PO sound cues for Codex

I made Agent Star Wars, a free plugin that plays R2-D2 and C-3PO in local Codex
sessions. Session start gets R2's greeting whistle, prompts get his chirps,
approvals get C-3PO's "Excuse me.", and a finished turn gets "Oh, thank the
Maker." Approvals whose command matches a short destructive list (`rm -rf`,
`git push --force`, `git reset --hard`, `DROP TABLE`, and similar) get "We're
doomed." Only a yes/no flag leaves the hook; the command is never logged or
stored.

The attached video illustrates the sound; it is not a live Codex recording.

```bash
codex plugin marketplace add mitchtech/agent-starwars
codex plugin add starwars@agent-starwars
```

Requirements: Node.js 22+, a local audio player/device, and a restart. Review
and trust the installed commands in Codex's hook settings. Installation alone
does not trust hooks.

There are no npm runtime dependencies or runtime telemetry. Hooks return
promptly and do not supply approval decisions. The rate-limit alarm is Claude
Code only, because Codex does not report API failures to hooks. SSH/container
execution plays where the hook runs, not automatically on your laptop. Codex
pet slots for both droids are ready; the art is not out yet.

Install and compatibility details:
https://github.com/mitchtech/agent-starwars#install

Where does setup get confusing: adding the marketplace, hook trust, or local
audio? If something fails, the host version and operating system would help me
reproduce it. Please leave private prompts and credentials out of reports.

## X1 - sound introduction

I built Agent Star Wars: R2-D2 and C-3PO sound cues for Claude Code, Codex, and Gemini CLI.

Turn finished: "Oh, thank the Maker."
git push --force approval: "We're doomed."

Local. No telemetry. Free. Clip: illustrated preview.

https://github.com/mitchtech/agent-starwars#install

## X2 - usage alarms

Claude Code tells hooks why a turn failed. C-3PO has opinions.

rate_limit, billing_error: "I'm doomed."
max_output_tokens: "I'm not quite sure if you..." (it cuts off, on purpose)
Status-line meter at 80%: "This looks very bad."

https://github.com/mitchtech/agent-starwars#power-meter-and-usage-alarms

## X3 - duo mode

Two droids, one job each.

R2-D2 beeps for the things that happen constantly: prompts, session start.
C-3PO talks only when you should look up: approvals, questions, "Thank the Maker."

Send three prompts in ten seconds: "Don't get technical with me."

https://github.com/mitchtech/agent-starwars#droids

## X4 - useful follow-up

Trying Agent Star Wars? Add the marketplace, install the plugin, then restart.

Codex also requires hook trust review. Remote sessions play audio on the
machine running the hook. Already running another Agent plugin (Warcraft, Navi, Johnny 5, Rocky, or StarCraft)? Enable one per host.

https://github.com/mitchtech/agent-starwars#install

## X5 - pick a droid

agent-starwars droid duo    R2 for routine, C-3PO for attention (default)
agent-starwars droid r2d2   beeps only
agent-starwars droid c3po   C-3PO for everything

Clip: the droid preview.

https://github.com/mitchtech/agent-starwars#droids

## L1 - LinkedIn maker introduction

I built Agent Star Wars, a small sound-notification plugin for Claude Code,
Codex, and Gemini CLI. R2-D2 beeps for routine agent events, and C-3PO speaks
when a coding agent needs attention or finishes work: "Excuse me." for an
approval, "Oh, thank the Maker." for a finished turn.

The attached video is an illustrated preview of the cues, rather than a live
agent recording. The project is free to try.

The engineering problem was making a notification useful without making it
part of the agent's control flow. The hooks return promptly, leave approval
decisions alone, and tolerate missing audio or malformed input. The runtime
requires Node.js 22+ and has no npm dependencies or telemetry.

Code and installation:
https://github.com/mitchtech/agent-starwars#install

If you use local coding agents, which event deserves a sound: approval, a
finished turn, or running out of usage?

## L2 - LinkedIn engineering follow-up

The most useful design decision in Agent Star Wars was giving each sound a
cost.

Some agent events happen dozens of times an hour: a session starting, every
prompt you send. Others are rare and need you: an approval, a question, a
rate limit. A full spoken sentence for the first kind is tiring within a day.
So by default the cues are split between two voices. R2-D2's short, wordless
beeps take the frequent events. C-3PO's spoken lines are reserved for the ones
you should act on. It is one table in the runtime, and a single `droid`
setting switches to one voice or a random mix.

The same restraint applies everywhere else. The destructive-command alarm
reduces a command to a single boolean inside the hook process, the annoyed
cue stores three timestamps and never prompt text, and the status-line power
meter stores one number per session under a hashed name and always prints
something, because a status line that crashes is worse than none.

The implementation and its tests are public:
https://github.com/mitchtech/agent-starwars

## Replies and follow-up

Successful install: "Thank the Maker. Which host and OS are you using, and
which droid mode did you keep?"

Continued use, after at least a week and only in a willing conversation:
"Have you kept the droids enabled? If you muted or removed them, what led to that?"

Install problem: "Which host/version and OS are you using? Please share the
error with private paths and credentials removed. The diagnostics and hook
trust notes are in the README."

Alarm as safety: "It is only a louder sound. It never blocks anything, and an
indirect or obfuscated command gets the ordinary cue. Keep your normal
permission settings."

Pet questions: "The R2-D2 and C-3PO Codex pet slots are ready but the art has
not shipped yet. `agent-starwars pet status` will say when it has."

When someone has found it useful: "A GitHub star helps other people find it if
you'd like to support the project." Do not ask for Reddit votes or coordinated
engagement.

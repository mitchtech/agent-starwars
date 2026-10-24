# Budget alarms and the power meter

Agent Star Wars has two ways to tell you that usage is running out: hook events
when a turn has already failed, and an optional status-line meter that warns you
before it does.

## Hook events

Claude Code runs `StopFailure` instead of `Stop` when a turn ends on an API
error. Its `error` field names the failure type:

| `error` | Shared event | R2-D2 / C-3PO | Default |
|---|---|---|---|
| `rate_limit`, `billing_error`, `account_on_hold` | `out_of_power` | sad descending whistle / "We're doomed." "I'm doomed." "What have I done to deserve this?" | On |
| `max_output_tokens` | `transmission_cut` | electrocuted static / "I'm not quite sure if you..." "I will try again." | On |
| Any other type, or none | `error` | R2 scream / "That was very unpleasant." "I wasn't built for this!" | Off |

Claude Code's usage-limit notifications map as follows:

| `notification_type` | Shared event | Why |
|---|---|---|
| `quota_auto_resume_disabled` | `out_of_power` | The wait for a usage limit ended without continuing your task |
| `quota_auto_resume_stale` | `ready_for_input` | The limit reset while the computer slept; Claude Code is waiting for Enter |
| `quota_auto_resume_fired` | none | The task continued on its own |

Codex and Gemini CLI do not report API failures to hooks. Wrappers around them
can call `agent-starwars play out_of_power` themselves.

## The power meter

`agent-starwars statusline` reads the JSON that Claude Code sends to a status
line command on stdin. It prints one line and exits.

```text
⚡ 62% power (5h)
⚡ 18% power (7d) low
⚡ $1.25 power low
⚡ 0% power (spend) out
⚡
```

Power is whatever is left of your **tightest** limit, chosen from these sources:

- `rate_limits.five_hour.used_percentage` (5h). Claude.ai Pro and Max plans
  report this after the first response in a session.
- `rate_limits.seven_day.used_percentage` (7d), reported on the same plans.
- `rate_limits.spend_limit.used_percentage` (spend), reported behind a Claude
  apps gateway with a spend limit.
- `cost.total_cost_usd` against `power.budgetUsd`, when you set a budget. This
  is Claude Code's client-side estimate at list price. It resets when `/clear`
  starts a new session, so treat it as a per-session budget.

A bare `⚡` means no limit is reported yet, which is normal for API-key sessions
without a budget. The same bare line appears if the input or configuration
can't be read: the meter never fails the status line.

### Cues

- Crossing `power.lowPercent` used (default 80) plays `power_low`: "This looks
  very bad." or R2's worried warble.
- Reaching 100% plays `out_of_power`.

Each cue plays once per session per rise. When usage falls back, as when a
5-hour window resets, the meter re-arms, and the next crossing plays again.
Mute either with `agent-starwars mute power_low` or `agent-starwars mute out_of_power`.

### Setup

The status line runs outside the plugin, so it needs the standalone command:

```bash
npm install -g github:mitchtech/agent-starwars
```

If you have no status line yet, add this to `~/.claude/settings.json`:

```json
{ "statusLine": { "type": "command", "command": "agent-starwars statusline" } }
```

If you already have a status line script, keep it and append the meter. The
script receives the JSON once on stdin, so save it before using it twice:

```bash
#!/bin/sh
input=$(cat)
mine=$(printf '%s' "$input" | your-existing-statusline)
power=$(printf '%s' "$input" | agent-starwars statusline)
printf '%s  %s\n' "$mine" "$power"
```

### Settings

```json
{ "power": { "budgetUsd": 20, "lowPercent": 75 } }
```

| Setting | Default | Meaning |
|---|---|---|
| `power.budgetUsd` | `null` | Per-session dollar budget, or `null` to use rate limits only |
| `power.lowPercent` | `80` | Percent used at which `power_low` plays; between 0 and 100 |

The meter stores one power level per session under a hashed name in the state
directory. Nothing about your usage or cost is written anywhere else.

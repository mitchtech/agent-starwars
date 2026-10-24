# Why I built Agent Star Wars

Coding agents spend part of their time waiting for a person, and part of it
finishing work you are not watching. I had already built Agent Navi, Agent
Johnny 5, and Agent Warcraft to give those moments a familiar sound. Agent Star
Wars gives them two familiar voices, and that turned out to be the interesting
part.

The earlier siblings use one voice for everything. That works when every cue is
a short line, but a coding agent's events are not equal. A session starts and
you send prompts constantly; an approval, a question, or a rate limit is rare and
needs you. R2-D2 and C-3PO split that naturally. R2's beeps are short and
wordless, so he takes the frequent, low-stakes cues. C-3PO talks, so he gets the
ones where you should look up: "Excuse me." for an approval, "What are you
talking about?" for a question, and "Oh, thank the Maker." when a turn finishes.
That default is called duo mode, and a single setting switches to beeps only,
C-3PO only, or a random mix.

The usage alarms came from Agent Warcraft's gold meter. Claude Code's
`StopFailure` hook names the error type, so a rate limit, a billing error, and
an account hold can be told apart from a server error; C-3PO answers those with
"I'm doomed." Hitting the output token limit plays a C-3PO line that cuts off
mid-sentence, which is the most literal sound effect in the project. An optional
status-line power meter warns once per session before the cell runs dry: "This
looks very bad."

C-3PO also has a temper. The third prompt inside ten seconds gets "Don't get
technical with me." or "How rude!" instead of R2's chirp. The hook keeps three
timestamps to decide that, never the prompt text.

The rest of the design is inherited from its siblings. Host hooks return
promptly and fail open on malformed input, missing audio, invalid configuration,
and playback failure. They never approve or block actions. Approvals for `rm
-rf` or a force push play "We're doomed.", a cue and not a safety check; the
command is reduced to a yes/no flag inside the hook and never stored. The shared
player uses Node.js 22+ with no npm runtime dependencies across macOS, Linux,
and Windows.

The audio took the most care. Most of the clips come from game files rather than
film audio, because game voice files are clean single lines without a score
underneath. R2-D2's files in one game are named by emotion (agree, attention,
fear, win, lose), which mapped onto agent events almost without translation. A
build script records each source URL and hash, the archive member, any trim,
and the output hash, and matches loudness across all 75 clips. I transcribed
every C-3PO clip after processing to confirm the words survived. The one that
failed was a soft "Oh dear." that speech-to-text heard as "Yeah." until it was
given a moment of silence first, which seems fitting for C-3PO.

The droids have Codex pet slots ready, but no art yet. `agent-starwars pet
status` says so plainly, and the installer, validation, and packaging switch
on when the sprite sheets arrive.

The project separates its licenses: MIT for code and configuration, and a
separate notice for the Star Wars recordings, which belong to Lucasfilm Ltd. and
the games' publishers. The droid drawings on the site are simple original
shapes. There is no claim of official affiliation or ownership of the
characters or the audio.

If you try it, I would like to know whether the duo split feels right, or
whether you switched to one droid. That answer is more useful than another
feature imagined in advance of someone needing it.

[Install Agent Star Wars](https://github.com/mitchtech/agent-starwars#install)
or [hear every clip](https://mitchtech.github.io/agent-starwars/).

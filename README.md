# Attention Jump

A tiny [herdr](https://herdr.dev) plugin that focuses the next agent needing
attention — one keypress.

Think "go to next error" in an IDE, but for your agents. Hit the key and herdr
switches to the workspace/tab/pane of the most urgent agent and drops your cursor
in it.

When you're running a dozen agents across tabs and workspaces, the hard part isn't
seeing that *something* needs you — the sidebar shows that — it's getting *there*
fast without hunting. This is that: a keyboard warp to the thing that's waiting.

## Behavior

On each invocation it lists all agents and jumps to the highest-priority one that
needs attention:

1. **`blocked`** — an agent is waiting on you (approval / question / permission).
2. **`done`** — finished work to review.

The currently-focused agent is skipped, so repeated presses **cycle** through
everything. Because focusing a `done` agent clears its status (and you'll resolve
the `blocked` prompt), each press just surfaces the next thing until a toast says
*"Nothing needs attention."* No cursor state is stored.

`herdr agent focus <pane_id>` does the heavy lifting — it switches workspace, tab,
and pane in one call, so jumps work across the whole session, not just the current
tab.

## What it looks like

Say you've got five agents running:

```
w1:p1   working    ← you are here
w1:pA   done
w1:pF   blocked
w2:p1   working
w2:p7   done
```

Press **`prefix+a`**:

```
→ jumps to w1:pF  (blocked — most urgent)   toast: "→ claude blocked (+2 more)"
```

Answer its prompt, press **`prefix+a`** again:

```
→ jumps to w1:pA  (done)                    toast: "→ claude done (+1 more)"
```

…and again to `w2:p7`. Once nothing is left:

```
toast: "Nothing needs attention"
```

## How it works

```
prefix+a
   │
   ├─ herdr agent list           → every agent + its agent_status
   ├─ keep blocked | done,        skip the one you're already focused on
   ├─ sort: blocked before done,  tie-break by pane id (stable)
   └─ herdr agent focus <pane_id> → switches workspace + tab + pane in one call
```

No state is persisted between presses — focusing clears `done`, and you clear the
`blocked` prompt yourself, so the list naturally shrinks each press.

## Install

```bash
herdr plugin install milkyskies/herdr-attention   # from GitHub
# or, for local dev:
herdr plugin link /path/to/herdr-attention
```

## Use

Add a keybinding to your `~/.config/herdr/config.toml` (the manifest ships a
suggested `prefix+a`, but herdr binds keys from *your* config, so you need this
block), then run `herdr server reload-config`:

```toml
[[keys.command]]
key = "prefix+a"                    # "attention" — change if it collides
type = "plugin_action"
command = "attention.jump.next"
description = "jump to next agent needing attention"
```

You can also run it anytime without a key:

```bash
herdr plugin action invoke next --plugin attention.jump
```

## Requirements

- herdr ≥ 0.7.0
- Node.js (plain JS, no build step)

## Notes / limitations

- herdr only marks `blocked` when the on-screen prompt matches a known
  approval/question/permission UI; agents without that detection fall back to
  `idle` and won't be caught.
- Detached workspaces are included (agent focus will attach). If you'd rather only
  cycle attached workspaces, filter on `workspace_id` in `jump.js`.

## License

MIT — see [LICENSE](LICENSE).

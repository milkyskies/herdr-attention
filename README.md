# Attention Jump

A tiny herdr plugin that focuses the next agent needing attention — one keypress.

Think "go to next error" in an IDE, but for your agents. Hit the key and herdr
switches to the workspace/tab/pane of the most urgent agent and drops your cursor
in it.

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

## Install

```bash
herdr plugin install milkyskies/herdr-attention   # from GitHub
# or, for local dev:
herdr plugin link /path/to/herdr-attention
```

## Use

- Default keybinding: **`prefix+a`** ("attention"). Rebind in your herdr config if
  it collides.
- Or run it from the command palette: **"Jump to next agent needing attention"**.

## Requirements

- herdr ≥ 0.7.0
- Node.js (plain JS, no build step)

## Notes / limitations

- herdr only marks `blocked` when the on-screen prompt matches a known
  approval/question/permission UI; agents without that detection fall back to
  `idle` and won't be caught.
- Detached workspaces are included (agent focus will attach). If you'd rather only
  cycle attached workspaces, filter on `workspace_id` in `jump.js`.

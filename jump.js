#!/usr/bin/env node
"use strict";

// Attention Jump — focus the next agent that needs attention.
//
// Priority: `blocked` (something is waiting on YOU) before `done` (finished work
// to review). The currently-focused agent is skipped so repeated presses cycle
// through everything. Focusing a `done` agent clears its status and resolving a
// `blocked` prompt clears that, so each press just surfaces the next thing until
// there is nothing left — no cursor state to persist.

const { spawnSync } = require("node:child_process");

const HERDR = process.env.HERDR_BIN_PATH || "herdr";

// Lower number = more urgent. Anything not listed here is "not attention".
const PRIORITY = { blocked: 0, done: 1 };

function herdr(args) {
  const r = spawnSync(HERDR, args, { encoding: "utf8" });
  if (r.status !== 0) {
    const msg = (r.stderr || r.stdout || "").trim() || `exit ${r.status}`;
    throw new Error(`herdr ${args.join(" ")}: ${msg}`);
  }
  return r.stdout;
}

function notify(title, sound) {
  // Best-effort; never let a failed toast crash the jump.
  try {
    herdr([
      "notification", "show", title,
      "--position", "top-right",
      "--sound", sound || "none",
    ]);
  } catch (_) { /* ignore */ }
}

function main() {
  let agents;
  try {
    const out = herdr(["agent", "list"]);
    agents = JSON.parse(out).result.agents || [];
  } catch (err) {
    notify("Attention Jump failed", "none");
    process.stderr.write(String(err && err.message || err) + "\n");
    process.exit(1);
  }

  const candidates = agents
    .filter((a) => a.pane_id && a.agent_status in PRIORITY && !a.focused)
    .sort((a, b) => {
      const d = PRIORITY[a.agent_status] - PRIORITY[b.agent_status];
      if (d !== 0) return d;
      // Stable, predictable tie-break by pane id.
      return String(a.pane_id).localeCompare(String(b.pane_id));
    });

  if (candidates.length === 0) {
    notify("Nothing needs attention", "none");
    return;
  }

  const target = candidates[0];
  herdr(["agent", "focus", target.pane_id]);

  const others = candidates.length - 1;
  const tail = others > 0 ? ` (+${others} more)` : "";
  notify(`→ ${target.agent} ${target.agent_status}${tail}`, "none");
}

main();

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOK = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'hooks', 'turn-guard.py');
const WRITE = "const f = figma.createFrame(); f.name = 'x';";
const READ = 'return figma.currentPage.children.map(n => n.name);';

/** Roda o hook com um registro `design/figma-sync.md` contendo `line`; devolve a saída JSON (ou null). */
function run(line, { event = 'PreToolUse', code = WRITE } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'dsx-turn-'));
  mkdirSync(join(dir, 'design'));
  writeFileSync(join(dir, 'design', 'figma-sync.md'), `# Sincronia com o Figma\n\nfile: abc\n${line}\n`);
  const payload = { hook_event_name: event, cwd: dir, tool_name: 'mcp__figma__use_figma', tool_input: { code } };
  const out = execFileSync('python3', [HOOK], { input: JSON.stringify(payload), encoding: 'utf8' }).trim();
  return out ? JSON.parse(out) : null;
}
const denied = (r) => r?.hookSpecificOutput?.permissionDecision === 'deny';

test('turn-guard: turn: design denies writing', () => {
  assert.ok(denied(run('turn: design')));
});

test('turn-guard: legacy vez: design also denies writing', () => {
  assert.ok(denied(run('vez: design')));
});

test('turn-guard: turn: design lets reading through', () => {
  assert.equal(run('turn: design', { code: READ }), null);
});

test('turn-guard: turn: code allows writing', () => {
  assert.equal(run('turn: code'), null);
});

test('turn-guard: legacy value codigo is read as code and SessionStart warns about old names', () => {
  assert.equal(run('vez: codigo'), null);
  const ctx = run('vez: codigo', { event: 'SessionStart' }).hookSpecificOutput.additionalContext;
  assert.match(ctx, /CÓDIGO/);
  assert.match(ctx, /renomeie para `turn:`/);
  assert.match(ctx, /renomeie para `code`/);
});

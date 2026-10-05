// Deprecated aliases (Round 4 — English, DSX 0.9.0): every old skill and agent name stays
// invocable as a minimal stub that points to an existing renamed skill or agent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const SKILL_ALIASES = {
  acessibilidade: 'accessibility', 'arranjar-tela': 'arrange-screen', 'auditar-ds': 'audit-ds',
  'auditar-ux': 'audit-ux', 'confirmar-mapas': 'confirm-maps', 'construir-ui': 'build-ui',
  'escolher-ds': 'choose-ds', 'figma-ciclo': 'figma-cycle', 'figma-cobertura': 'figma-coverage',
  'figma-convencoes': 'figma-conventions', 'figma-espelhar': 'figma-mirror',
  'figma-fundacoes': 'figma-foundations', 'figma-iniciar': 'figma-init', 'figma-levar': 'figma-push',
  'figma-primeiro': 'figma-first', 'figma-propostas': 'figma-proposals', 'figma-trazer': 'figma-pull',
  'figma-vez': 'figma-turn', iniciar: 'init', mapear: 'map-ux', padroes: 'patterns',
  pesquisa: 'research', 'repensar-ux': 'rethink-ux', 'revisar-ux': 'review-ux',
};

export const AGENT_ALIASES = {
  'analisador-specs': 'spec-analyzer', 'extrator-design-system': 'design-system-extractor',
  'juiz-de-evals': 'eval-judge', 'leitor-figma': 'figma-reader', 'mapeador-dominio': 'domain-mapper',
  'mapeador-fluxos': 'flow-mapper', 'mapeador-jornada': 'journey-mapper',
  'mapeador-projeto': 'project-mapper', 'mapeador-tarefas': 'task-mapper', 'mapeador-ui': 'ui-mapper',
  'revisor-ux': 'ux-reviewer',
};

const frontMatter = (file) => readFileSync(file, 'utf8').split('---')[1];
const field = (fm, key) => (fm.match(new RegExp(`^${key}: "?(.*?)"?$`, 'm')) || [])[1];

test('every old skill name is a stub that points to an existing renamed skill', () => {
  for (const [old, now] of Object.entries(SKILL_ALIASES)) {
    const stub = join(ROOT, 'skills', old, 'SKILL.md');
    const target = join(ROOT, 'skills', now, 'SKILL.md');
    assert.ok(existsSync(stub), `skills/${old}/SKILL.md is missing`);
    assert.ok(existsSync(target), `skills/${now}/SKILL.md (target of ${old}) is missing`);
    const fm = frontMatter(stub);
    assert.equal(field(fm, 'name'), old, `skills/${old}: name`);
    assert.equal(field(fm, 'description'), `Deprecated alias of ${now} — use ${now}.`, `skills/${old}: description`);
    assert.ok(readFileSync(stub, 'utf8').includes(`skills/${now}/SKILL.md`), `skills/${old}: body points to ${now}`);
    assert.equal(field(frontMatter(target), 'name'), now, `skills/${now}: name`);
    // A stub stays a stub: no procedure duplicated in the old folder.
    assert.deepEqual(readdirSync(join(ROOT, 'skills', old)), ['SKILL.md'], `skills/${old}: only the stub`);
  }
});

test('every old agent name is a stub that points to an existing renamed agent', () => {
  for (const [old, now] of Object.entries(AGENT_ALIASES)) {
    const stub = join(ROOT, 'agents', `${old}.md`);
    const target = join(ROOT, 'agents', `${now}.md`);
    assert.ok(existsSync(stub), `agents/${old}.md is missing`);
    assert.ok(existsSync(target), `agents/${now}.md (target of ${old}) is missing`);
    const fm = frontMatter(stub);
    assert.equal(field(fm, 'name'), old);
    assert.equal(field(fm, 'description'), `Deprecated alias of ${now} — use ${now}.`);
    assert.ok(readFileSync(stub, 'utf8').includes(`agents/${now}.md`), `agents/${old}: body points to ${now}`);
    assert.equal(field(frontMatter(target), 'name'), now, `agents/${now}: name`);
  }
});

test('no deprecated stub points to another stub, and every non-stub is a current name', () => {
  const stubSkills = new Set(Object.keys(SKILL_ALIASES));
  const stubAgents = new Set(Object.keys(AGENT_ALIASES));
  for (const now of Object.values(SKILL_ALIASES)) assert.ok(!stubSkills.has(now), `${now} is itself an alias`);
  for (const now of Object.values(AGENT_ALIASES)) assert.ok(!stubAgents.has(now), `${now} is itself an alias`);
  for (const d of readdirSync(join(ROOT, 'skills'))) {
    const f = join(ROOT, 'skills', d, 'SKILL.md');
    if (!existsSync(f) || stubSkills.has(d)) continue;
    const desc = field(frontMatter(f), 'description') || '';
    assert.ok(!desc.startsWith('Deprecated alias'), `skills/${d}: undeclared alias (add it to SKILL_ALIASES)`);
  }
  for (const f of readdirSync(join(ROOT, 'agents'))) {
    if (!f.endsWith('.md') || stubAgents.has(f.slice(0, -3))) continue;
    const desc = field(frontMatter(join(ROOT, 'agents', f)), 'description') || '';
    assert.ok(!desc.startsWith('Deprecated alias'), `agents/${f}: undeclared alias (add it to AGENT_ALIASES)`);
  }
});

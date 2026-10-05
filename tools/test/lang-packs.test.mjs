// Language packs of the text detectors (tools/ux-lint/lib/lang/): same shape in every pack, tag resolution and unions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACKS, LANGS, DEFAULT_LANG, resolveLang, langPack, unionList, unionVerbGroups, anyEmptyText } from '../ux-lint/lib/lang/index.mjs';
import { configFrom } from '../ux-lint/lib/config.mjs';

test('lang packs: pt-BR and en, pt-BR is the default', () => {
  assert.deepEqual([...LANGS].sort(), ['en', 'pt-BR']);
  assert.equal(DEFAULT_LANG, 'pt-BR');
  assert.equal(langPack().id, 'pt-BR');
  assert.equal(langPack(configFrom({})).id, 'pt-BR');
  assert.equal(langPack(configFrom({ content: { language: 'en' } })).id, 'en');
});

test('lang packs: every pack has the same keys and value types', () => {
  const ref = PACKS['pt-BR'];
  for (const [id, p] of Object.entries(PACKS)) {
    assert.deepEqual(Object.keys(p).sort(), Object.keys(ref).sort(), `${id}: keys`);
    for (const k of Object.keys(ref)) {
      const kind = (v) => (Array.isArray(v) ? 'array' : v instanceof RegExp ? 'regexp' : typeof v);
      assert.equal(kind(p[k]), kind(ref[k]), `${id}.${k}: type`);
    }
    assert.deepEqual(Object.keys(p.verbGroups).sort(), Object.keys(ref.verbGroups).sort(), `${id}: verb groups`);
    assert.ok(p.emptyOpenings.every((re) => re instanceof RegExp), `${id}: emptyOpenings`);
    for (const list of ['labelsWithoutVerb', 'stopWords', 'guidance', 'onlyFailure', 'dismiss', 'instructionVerbs']) {
      assert.ok(p[list].every((x) => x === x.toLowerCase()), `${id}.${list}: lowercase`);
    }
  }
});

test('lang packs: tag resolution', () => {
  for (const t of ['pt', 'pt-BR', 'pt-br', 'pt_BR', 'pt-PT']) assert.equal(resolveLang(t), 'pt-BR', t);
  for (const t of ['en', 'en-US', 'en-GB', 'EN']) assert.equal(resolveLang(t), 'en', t);
  for (const t of ['', null, undefined, 'fr', 'es-ES']) assert.equal(resolveLang(t), null, String(t));
  assert.equal(langPack('fr').id, 'pt-BR', 'unknown tag falls back to the default pack');
});

test('lang packs: verbs, unions and empty wording', () => {
  assert.ok(PACKS['pt-BR'].isVerb('Salvar') && !PACKS['pt-BR'].isVerb('Novo'));
  assert.ok(PACKS.en.isVerb('Save') && !PACKS.en.isVerb('New') && !PACKS.en.isVerb('Settings'));
  const groups = unionVerbGroups();
  assert.equal(groups.delete[0], 'excluir', 'pt-BR verbs come first (stable C1 text)');
  assert.ok(groups.delete.includes('delete') && groups.delete.includes('remover'));
  assert.ok(unionList('dismiss').includes('cancelar') && unionList('dismiss').includes('cancel'));
  assert.ok(anyEmptyText('Nenhum pedido ainda') && anyEmptyText('No orders yet') && !anyEmptyText('Pedidos de hoje'));
});

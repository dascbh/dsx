// Language pack: English (en). Product-text vocabulary the text detectors judge against when UX.md declares
// `content.language: en`. Same keys as ./pt-BR.mjs; lists are lowercase.

const VERBS = new Set(`
accept activate add adjust allow apply approve archive assign attach authorize back browse buy calculate call cancel change
check choose clear click close collapse compare complete configure confirm connect contact continue convert copy create
customize cut decline delete deny deselect disable disconnect discard dismiss display done download drag drop duplicate edit
email enable end enter erase expand explore export fill filter find finish fix follow forward generate get give go grant hide
import include insert install invite join keep learn leave link list load lock log manage mark merge minimize move mute name
next notify open order pause pay pick pin place play post preview print proceed publish purchase quit rate read receive record
redo refresh register reject reload remind remove rename reopen reorder repeat replace reply report request resend reset
resolve restart restore resume retry return review revoke run save scan schedule search see select send set settle share show
sign skip sort split star start stop submit subscribe swap switch sync tag take test track transfer try turn type undo unlink
unlock unpin unsubscribe update upgrade upload use validate verify view vote watch withdraw write zoom
`.trim().split(/\s+/));

export default Object.freeze({
  id: 'en',
  name: 'English',

  // ---------- text.mjs (X1–X11) ----------
  labelsWithoutVerb: ['ok', 'yes', 'no', 'confirm', 'submit', 'send'],
  emptyOpenings: [
    /^here you (can|will find|see)\b/i,
    /^(on|in) this (screen|page|section|tab|area)\b/i,
    /^this (page|screen|section|area|tab) (lets|allows|shows|is where)\b/i,
    /^use (this|these|the)\b.*\bto\b/i,
    /^see below\b/i,
    /^click here\b/i,
    /^below (you|are|is)\b/i,
    /^welcome to\b/i,
  ],
  stopWords: 'a an the and or but nor of to in on at by for from with without into onto over per as is are be your our its this that these those here more than via'.split(' '),
  companyName: /\b(inc|llc|ltd|corp|plc|gmbh|co)\b\.?/i,
  /** English imperatives have no suffix to test: a curated list of interface verbs. */
  isVerb: (word) => VERBS.has(String(word).toLowerCase().replace(/[^\p{L}-]/gu, '')),
  optionalMarker: /^(optional|required)$/i,
  ocrExplained: /recogni/i,
  flagDashes: true,
  examples: {
    emptyValue: 'Not provided',
    buttonWithObject: 'Send order',
    verbObject: 'Create order',
    object: 'object',
  },

  // ---------- states.mjs (S1–S3) ----------
  emptyText: /^(no (results|items|data|records|\w+ yet)|nothing|none|empty|there (are|is) no)\b|\bnot .{0,20}yet\b/i,
  guidance: ['try', 'retry', 'check', 'reload', 'refresh', 'contact', 'again', 'later', 'go back', 'return', 'select', 'choose',
    'fill in', 'correct', 'fix', 'review', 'send', 'resend', 'upload', 'open', 'click', 'use', 'enter', 'type', 'sign in', 'log in',
    'ask', 'request', 'wait', 'create', 'connect', 'remove', 'in a moment'],
  onlyFailure: ['error', 'failed', 'failure', 'something went wrong', 'an error occurred'],
  dismiss: ['cancel', 'close', 'back', 'no'],

  // ---------- consistency.mjs (C1–C3) ----------
  verbGroups: {
    delete: ['delete', 'remove', 'erase'],
    save: ['save', 'store'],
    dismiss: ['cancel', 'close', 'back'],
    create: ['create', 'new'],
    add: ['add', 'include'],
    edit: ['edit', 'change', 'modify'],
    download: ['download', 'export'],
  },
  knownSynonyms: [
    ['settings', 'preferences'], ['template', 'model'], ['dashboard', 'overview'], ['history', 'log'],
    ['trash', 'bin'], ['notifications', 'alerts'], ['search', 'find'], ['user', 'account'], ['report', 'statement'],
  ],
  actionStopWords: 'the of to a an this these that those and or with without for by'.split(' '),
  destinationWords: ['to', 'into', 'onto', 'in', 'on'],
  singular: (w) => (w.length > 4 && /ies$/.test(w) ? `${w.slice(0, -3)}y` : w.length > 3 && /[^s]s$/.test(w) ? w.slice(0, -1) : w),

  // ---------- option text (cases.json, variations) ----------
  instructionVerbs: ['keep', 'move', 'swap', 'replace', 'use', 'badge', 'remove', 'show', 'hide', 'take', 'bring', 'leave',
    'split', 'merge', 'declare', 'record', 'collapse', 'put', 'pass', 'drop'],

  // ---------- screen.mjs (T1–T7) ----------
  /** T5: generic label on a destructive action (it should say what happens). */
  genericDestructiveLabels: ['confirm', 'ok', 'yes', 'continue'],
  /** T5 suggestion: a destructive label that says what happens (product language). */
  destructiveExample: 'Delete order',

  // ---------- lib/geometry.mjs (L9 step-trail) ----------
  /** Words that open a wizard step label ("Passo 2", "Step 2"). */
  stepWords: ['step'],
});

// Component-kit selector profiles for the ux-lint (one source of truth for kit-specific class names).
// A project picks its kit in the UX.md front matter (`verification.kit`); explicit
// `verification.selectors.*` keys always win over the profile. Every profile is layered on top of the
// GENERIC profile (roles, ARIA and plain HTML), so a kit only adds what roles cannot express
// (which button is the primary one, where a dialog footer is).
//
// `auto` (the default when `verification.kit` is omitted) is the union of every profile: it keeps the
// behavior of projects written before kits existed (MUI was the only built-in) and works reasonably on
// any kit. Choosing a kit narrows the selectors and avoids false matches from other kits' class names.
//
// Confidence: `mui`, `antd` and `bootstrap` rely on stable public class names. `shadcn` relies on the
// default Tailwind classes and `data-slot` attributes of the generated components; `chakra` on the
// `chakra-*` class names (v2) and `data-scope`/`data-part` (v3). Override in the UX.md when the project
// customized them.

const join = (...xs) => xs.filter(Boolean).join(', ');

/** Selectors that hold for any kit: roles, ARIA, HTML elements and explicit data attributes. */
export const GENERIC = Object.freeze({
  primary: '[data-variant=primary], [data-variant=solid], [data-variant=contained], [data-dsx-primary]',
  destructive: '[data-variant=destructive], [data-variant=danger], [data-dsx-destructive]',
  'dialog-title': '[role=dialog] h1, [role=dialog] h2, dialog h1, dialog h2',
  regions: {
    'dialog-header': '[role=dialog] > header, dialog > header',
    'dialog-body': '',
    'dialog-footer': '[role=dialog] footer, dialog footer',
    'step-trail': '[aria-label*=step i], ol[aria-label*=etapa i]',
    'list-footer': 'nav[aria-label*=pagination i], nav[aria-label*=pagina i]',
    toolbar: '[role=toolbar]',
  },
  cards: 'article, [role=article]',
  containers: '',
  disabled: '[aria-disabled=true]',
});

/** Kit profiles. Keys mirror GENERIC; an empty string means "nothing beyond the generic profile". */
export const KITS = Object.freeze({
  mui: {
    primary: '.MuiButton-contained',
    destructive: '.MuiButton-containedError, .MuiButton-colorError',
    'dialog-title': '.MuiDialogTitle-root',
    regions: {
      'dialog-header': '.MuiDialogTitle-root', 'dialog-body': '.MuiDialogContent-root', 'dialog-footer': '.MuiDialogActions-root',
      'step-trail': '.MuiStepper-root', 'list-footer': '.MuiTablePagination-root', toolbar: '',
    },
    cards: '.MuiCard-root, .MuiPaper-outlined',
    containers: '.MuiPaper-root, .MuiCard-root, .MuiDialogTitle-root, .MuiDialogContent-root, .MuiDialogActions-root, .MuiStepper-root, .MuiTablePagination-root',
    disabled: '.Mui-disabled',
  },
  shadcn: {
    primary: 'button[class*="bg-primary"], a[class*="bg-primary"]',
    destructive: 'button[class*="bg-destructive"], button[class*="text-destructive"]',
    'dialog-title': '[data-slot=dialog-title], [data-slot=alert-dialog-title], [data-slot=sheet-title]',
    regions: {
      'dialog-header': '[data-slot=dialog-header], [data-slot=alert-dialog-header], [data-slot=sheet-header]',
      'dialog-body': '', 'dialog-footer': '[data-slot=dialog-footer], [data-slot=alert-dialog-footer], [data-slot=sheet-footer]',
      'step-trail': '', 'list-footer': '[data-slot=pagination]', toolbar: '',
    },
    cards: '[data-slot=card]',
    containers: '[data-slot=card], [data-slot=dialog-header], [data-slot=dialog-footer], [data-slot=sheet-header], [data-slot=sheet-footer]',
    disabled: '',
  },
  chakra: {
    primary: '.chakra-button[data-variant=solid]',
    destructive: '.chakra-button[data-color-palette=red]',
    'dialog-title': '.chakra-modal__header, .chakra-dialog__title',
    regions: {
      'dialog-header': '.chakra-modal__header, .chakra-dialog__header', 'dialog-body': '.chakra-modal__body, .chakra-dialog__body',
      'dialog-footer': '.chakra-modal__footer, .chakra-dialog__footer', 'step-trail': '.chakra-stepper, .chakra-steps__root',
      'list-footer': '.chakra-pagination__root', toolbar: '',
    },
    cards: '.chakra-card, .chakra-card__root',
    containers: '.chakra-card, .chakra-card__root, .chakra-modal__header, .chakra-modal__body, .chakra-modal__footer, .chakra-dialog__header, .chakra-dialog__body, .chakra-dialog__footer',
    disabled: '',
  },
  antd: {
    primary: '.ant-btn-primary',
    destructive: '.ant-btn-dangerous',
    'dialog-title': '.ant-modal-title',
    regions: {
      'dialog-header': '.ant-modal-header', 'dialog-body': '.ant-modal-body', 'dialog-footer': '.ant-modal-footer',
      'step-trail': '.ant-steps', 'list-footer': '.ant-pagination', toolbar: '',
    },
    cards: '.ant-card',
    containers: '.ant-card, .ant-modal-header, .ant-modal-body, .ant-modal-footer, .ant-steps, .ant-pagination',
    disabled: '.ant-btn-disabled',
  },
  bootstrap: {
    primary: '.btn-primary',
    destructive: '.btn-danger, .btn-outline-danger',
    'dialog-title': '.modal-title',
    regions: {
      'dialog-header': '.modal-header', 'dialog-body': '.modal-body', 'dialog-footer': '.modal-footer',
      'step-trail': '', 'list-footer': '.pagination', toolbar: '.btn-toolbar',
    },
    cards: '.card',
    containers: '.card, .modal-header, .modal-body, .modal-footer, .pagination',
    disabled: '.disabled',
  },
});

export const KIT_IDS = Object.freeze(['auto', 'generic', ...Object.keys(KITS)]);

/**
 * Resolved selector profile for a kit id: GENERIC + the kit (or + every kit for `auto`).
 * Unknown ids resolve like `auto` and are reported by the UX.md lint.
 */
export function kitProfile(kit = 'auto') {
  const id = KIT_IDS.includes(kit) ? kit : 'auto';
  const layers = id === 'generic' ? [] : id === 'auto' ? Object.values(KITS) : [KITS[id]];
  const all = [...layers, GENERIC];
  const pick = (k) => join(...all.map((l) => l[k]));
  const regions = {};
  for (const r of Object.keys(GENERIC.regions)) {
    const s = join(...all.map((l) => l.regions?.[r]));
    if (s) regions[r] = s;
  }
  return Object.freeze({
    id, primary: pick('primary'), destructive: pick('destructive'), 'dialog-title': pick('dialog-title'),
    regions: Object.freeze(regions), cards: pick('cards'), containers: pick('containers'), disabled: pick('disabled'),
  });
}

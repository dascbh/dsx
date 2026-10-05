// DSX theme switcher — floating selector with a badge naming the active option. Development only.
// Styled with CSS system colors (Canvas, CanvasText, GrayText, Highlight): it stays readable under any option being
// tested and adds no raw color to the project. The data-dsx-design-lab attribute is the marker that
// `lab.mjs bundle-check` looks for in a production build.
import { useId, useState } from 'react';
import type { DesignOptionState } from './useDesignOption';
import { DEFAULT_LABELS } from './selection';
import type { DesignLabLabels } from './selection';

export function DesignLabPanel({ state, labels = DEFAULT_LABELS }: { state: DesignOptionState; labels?: DesignLabLabels }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = state.choices.find((c) => c.name === state.active);
  const base = { fontFamily: 'system-ui, sans-serif', fontSize: 13, color: 'CanvasText', background: 'Canvas', border: '1px solid GrayText', borderRadius: 8 } as const;
  return (
    <div data-dsx-design-lab="" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 2147483000, display: 'grid', gap: 8, justifyItems: 'end' }}>
      {open && (
        <div role="dialog" aria-labelledby={`${id}-t`} style={{ ...base, padding: 12, display: 'grid', gap: 8, minWidth: 260, borderWidth: 2 }}>
          <label id={`${id}-t`} htmlFor={`${id}-s`} style={{ fontWeight: 600 }}>{labels.choose}</label>
          <select id={`${id}-s`} value={state.active} onChange={(e) => state.setActive(e.target.value)} style={{ ...base, padding: 8, minHeight: 36 }}>
            {state.choices.map((c) => <option key={c.name} value={c.name}>{c.name === 'official' ? `${labels.official} · ${c.label}` : c.label}</option>)}
          </select>
          {state.error && <p role="alert" style={{ margin: 0, color: 'LinkText' }}>{state.error}</p>}
          <p style={{ margin: 0, color: 'GrayText' }}>{labels.hint}</p>
          <button type="button" onClick={() => setOpen(false)} style={{ ...base, paddingBlock: 6, paddingInline: 10, cursor: 'pointer', justifySelf: 'start' }}>{labels.close}</button>
        </div>
      )}
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{ ...base, paddingBlock: 6, paddingInline: 12, minHeight: 36, cursor: 'pointer', fontWeight: 600, borderColor: state.active === 'official' ? 'GrayText' : 'Highlight', borderWidth: 2 }}>
        {labels.badge}: {state.active === 'official' ? labels.official : current?.name ?? state.active}
      </button>
    </div>
  );
}

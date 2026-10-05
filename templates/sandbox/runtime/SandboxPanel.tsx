// DSX sandbox — floating panel: scenario, persona, latency and the call log (orange = no mock, red = blocked).
// Styled with CSS system colors (Canvas, CanvasText, GrayText, Highlight, Mark, LinkText) so it reads under any theme
// and adds no raw color to the project. data-dsx-sandbox is the marker `sandbox.mjs bundle-check` looks for: it must
// never appear in the official production build.
import { useEffect, useId, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CONFIG, label } from './config';
import { entries, onLog, type LogEntry } from './intercept';
import { PREFS } from './install';
import { SCENARIOS, writeStored, type Preferences } from './scenarios';

function save(next: Preferences, reload: boolean) {
  try { writeStored(window.localStorage, CONFIG.storage_key, next); } catch { /* storage blocked: session-only */ }
  if (reload) {
    const url = new URL(location.href);
    url.searchParams.delete('scenario');
    url.searchParams.delete('persona');
    location.replace(url.href);
  }
}

const tone = (e: LogEntry) => (e.kind === 'blocked' ? 'LinkText' : e.kind === 'no-mock' ? 'Mark' : e.status >= 400 ? 'Highlight' : 'GrayText');

export function SandboxPanel() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>(entries());
  const [latency, setLatency] = useState(PREFS.latency_ms);
  const id = useId();
  useEffect(() => onLog(() => setLog(entries())), []);
  const noMock = log.filter((e) => e.kind === 'no-mock').length;
  const blocked = log.filter((e) => e.kind === 'blocked').length;
  const base = { fontFamily: 'system-ui, sans-serif', fontSize: 12, color: 'CanvasText', background: 'Canvas', border: '1px solid GrayText', borderRadius: 8 } as const;
  const persona = CONFIG.personas.find((p) => p.id === PREFS.persona);
  return (
    <div data-dsx-sandbox="" style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 2147483001, display: 'grid', gap: 8, justifyItems: 'start' }}>
      {open && (
        <div role="dialog" aria-label={label('badge')} style={{ ...base, padding: 12, display: 'grid', gap: 8, width: 360, maxHeight: '60vh', overflow: 'auto', borderWidth: 2 }}>
          <label htmlFor={`${id}-s`}>{label('scenario')}</label>
          <select id={`${id}-s`} value={PREFS.scenario} style={{ ...base, padding: 6 }}
            onChange={(e) => save({ ...PREFS, scenario: e.target.value as Preferences['scenario'] }, true)}>
            {SCENARIOS.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          {CONFIG.personas.length > 0 && (<>
            <label htmlFor={`${id}-p`}>{label('persona')}</label>
            <select id={`${id}-p`} value={PREFS.persona ?? ''} style={{ ...base, padding: 6 }}
              onChange={(e) => save({ ...PREFS, persona: e.target.value }, true)}>
              {CONFIG.personas.map((p) => <option key={p.id} value={p.id}>{p.label ?? p.id}</option>)}
            </select>
          </>)}
          <label htmlFor={`${id}-l`}>{label('latency')}</label>
          <select id={`${id}-l`} value={latency} style={{ ...base, padding: 6 }}
            onChange={(e) => { const v = Number(e.target.value); setLatency(v); PREFS.latency_ms = v; save({ ...PREFS, latency_ms: v }, false); }}>
            {[0, 250, 800, 1500].map((ms) => <option key={ms} value={ms}>{ms} ms</option>)}
          </select>
          <button type="button" onClick={() => location.reload()} style={{ ...base, paddingBlock: 4, paddingInline: 10, cursor: 'pointer', justifySelf: 'start' }}>{label('reload')}</button>
          <strong>{label('log')}</strong>
          <ol style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 2 }}>
            {log.slice(0, 80).map((e, i) => (
              <li key={i} style={{ color: tone(e), wordBreak: 'break-all' }}>
                {e.kind === 'blocked' ? 'BLOCKED' : e.status} {e.method} {e.url}{e.kind === 'no-mock' ? ` — ${label('no-mock')}` : ''}
              </li>
            ))}
          </ol>
        </div>
      )}
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{ ...base, paddingBlock: 6, paddingInline: 12, cursor: 'pointer', fontWeight: 600, borderWidth: 2, borderColor: noMock || blocked ? 'LinkText' : 'Highlight' }}>
        {label('badge')} · {label(PREFS.scenario)}{persona ? ` · ${persona.label ?? persona.id}` : ''}
        {noMock > 0 && ` · ${noMock} ${label('no-mock')}`}{blocked > 0 && ` · ${blocked} ${label('blocked')}`}
      </button>
    </div>
  );
}

/** Mounted in its own root, outside the app tree and its theme. */
export function mountPanel() {
  const host = document.createElement('div');
  host.setAttribute('data-dsx-sandbox-host', '');
  document.body.appendChild(host);
  createRoot(host).render(<SandboxPanel />);
}

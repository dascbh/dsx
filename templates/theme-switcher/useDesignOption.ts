// DSX theme switcher — React hook: the active design option, its parsed DESIGN.md and a setter that updates the URL
// (?ds=<name>) and remembers the choice in this browser. Development only: import it from a file that is itself
// loaded behind `import.meta.env.DEV` (see main.example.tsx).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseDesignMd } from './design-md';
import type { DesignMd } from './design-md';
import { OFFICIAL, chooseOption, entryOf, readStored, urlWith, writeStored } from './selection';
import type { DesignManifest } from './selection';

export interface DesignOptionState {
  /** Official first, then the options: [{ name, label }]. */
  choices: { name: string; label: string }[];
  active: string;
  setActive: (name: string) => void;
  /** Parsed DESIGN.md of the active option; null for official (the product theme applies unchanged). */
  design: DesignMd | null;
  /** Parse error of the active option, shown by the panel instead of a broken theme. */
  error: string | null;
}

export function useDesignOption(manifest: DesignManifest): DesignOptionState {
  const pick = () => chooseOption(manifest, { search: globalThis.location?.search ?? '', stored: readStored() });
  const [active, setState] = useState<string>(pick);
  useEffect(() => {
    const onPop = () => setState(pick());
    globalThis.addEventListener?.('popstate', onPop);
    return () => globalThis.removeEventListener?.('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest]);
  const setActive = useCallback((name: string) => {
    writeStored(name);
    if (globalThis.location && globalThis.history) globalThis.history.replaceState(globalThis.history.state, '', urlWith(globalThis.location.href, name));
    setState(name);
  }, []);
  const { design, error } = useMemo(() => {
    if (active === OFFICIAL) return { design: null, error: null };
    const entry = entryOf(manifest, active);
    if (!entry) return { design: null, error: `option "${active}" is not in the manifest` };
    try { return { design: parseDesignMd(entry.markdown), error: null }; } catch (e) { return { design: null, error: (e as Error).message }; }
  }, [manifest, active]);
  const choices = useMemo(() => [
    { name: OFFICIAL, label: manifest.official?.label ? `${manifest.official.label} (official)` : 'Official' },
    ...manifest.options.map((o) => ({ name: o.name, label: o.label && o.label !== o.name ? `${o.name} · ${o.label}` : o.name })),
  ], [manifest]);
  return { choices, active, setActive, design, error };
}

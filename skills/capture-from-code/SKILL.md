---
name: capture-from-code
description: "Captures EXISTING screens from the code with pixel fidelity — no server, no browser session, no back end: renders the real UI components in the project's test runner (jsdom) with a fake API and fictional data, serializes DOM + CSS (CSS-in-JS, CSS modules, Tailwind) into self-contained static HTML named <nn>-<screen>[.<state>].html, and feeds the DSX audit, variations and Stitch. Also sends captures to Google Stitch in journey order, arranges the canvas by journey and builds the journey page from the flow map. Use whenever a screen, tab, state or dialog that already exists must be audited, measured, compared, reproduced or shown in Stitch; never rebuild an existing screen from a text description."
argument-hint: "<module> [screen or area]"
---

# Capture from code

> **DSX root:** two levels above this skill's folder. `templates/`, `tools/`, `knowledge/`, `docs/` are relative to it; paths without a prefix (`UX.md`, `.dsx/`, `src/`) belong to the project.

## Why this exists

Describing an existing screen in words and generating it again (`generate_screen_from_text`, any "recreate this screen" prompt) is a lossy translation: borders, icons, radii, badges and spacing get reinterpreted, elements get invented, and every edit reinterprets again. A screen that exists goes to review, to Stitch or to a comparison **rendered from its code**. Text generation is for what does not exist yet (skill `stitch`, Generate mode).

And it must not depend on a running environment: a dev server, a back end, a login or seed data are often unavailable. The capture runs inside the test runner the front end already has.

```
real components (src/**) ──render in jsdom──▶ DOM + injected <style> ──serialize──▶ static HTML ──▶ audit · variations · Stitch
  ▲ contexts mocked (auth, org, flags)          ▲ images from public/ as data URIs
  ▲ API faked per "METHOD /path"                 ▲ CSS for what jsdom cannot lay out
  ▲ real vocabulary, fictional data
```

## Where things go (project configuration)

Paths are the project's, resolved by `tools/ux-lint/lib/project-paths.mjs` (`docs/project-paths.md`): flag > `.dsx/config.json` (or `--config` / `$DSX_CONFIG`) > `paths` block of the `UX.md` > defaults.

| What | Default | Key |
|---|---|---|
| Captures of module `<m>` | `.dsx/captures/<m>/<nn>-<screen>[.<state>].html` | `paths.captures` |
| Geometry measured from them | `.dsx/captures/<m>/geometry/` | `paths.geometry` |
| Flow map | `.dsx/maps/flows-<m>.json` | `paths.map` |
| Code where UI text is born | detected from the stack (the `src` of each front-end package) | `paths.code` |
| Real-data blocklist for anything sent out | none — **the project must declare it** | `capture.blocklist`, `capture.blocklist-file` |

```json
{
  "paths": { "captures": ".dsx/captures/<module>", "code": ["web/src", "server/strings"] },
  "capture": { "blocklist": ["Real Client Inc", "/\\b\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}\\b/"], "blocklist-file": "capture-blocklist.txt" }
}
```

Captures written by older versions in `.stitch/<m>/code` are still read (with a warning) until the project moves them.

## Set up once (React + Vitest + jsdom)

Copy `templates/capture/` into the project's test folder (e.g. `web/tests/capture/`):

| File | Role | Adapt |
|---|---|---|
| `serialize.ts` | `saveCapture(title, file, options)` and `captureName(nn, screen, state?)` | only the `CAPTURE_CONFIG` block: `publicDir`, `outDir`, `lang` (the product's interface language), `fonts`, `extraCss`, selectors of the kit's overlays |
| `fake-api.ts` | framework-free core: `FakeResponse`, `ok`/`fail`/`PENDING`, the route matcher (`"METHOD [base:]/path/:param"`, answer queues, handler functions). No Vitest: the sandbox (skill `sandbox`) loads it in the browser | `ok`/`fail`: the API envelope |
| `environment.tsx` | `CAPTURE` guard, `fakeStorage`, `fakeFetch`, `assertAllRoutesSimulated`, `waitForDialog`, `mountPage`; re-exports `fake-api.ts` | `mountPage`: the app's providers and layout route |
| `orders.capture.test.tsx` + `orders.data.ts` | example capture of a page and a dialog; `*.data.ts` imports its helpers from `./fake-api` (never from `./environment`) so the same data also feeds the sandbox | copy per area |
| `states.capture.test.tsx` | loading / empty / error per main screen, table-driven | the deciding route and what proves each state |
| `vitest.capture.config.ts` | jsdom, CSS processing on (CSS modules, Tailwind via the app's PostCSS) | the include glob |
| `design-option.ts`, `design-option-mui.tsx` | design options (skill `design-lab`): read `DSX_DESIGN_MD` (legacy `STITCH_THEME`), parse it with the theme adapter and apply it over the product theme | the import path of the adapter copy |

Captures only run with `DSX_CAPTURE=1` (`it.runIf(CAPTURE)`): CI and the normal suite skip them and write nothing.

## Capture a module

1. **Inventory the surface.** Route, page component, state (tab, filter, open dialog) and **every API call** the screen and its children make (search the components for the API client). A dialog = its parent page + the action that opens it. Take labels and order from the flow map when there is one (skill `map-ux`, checked with `node <DSX>/tools/capture/validate-flow.mjs .dsx/maps/flows-<m>.json --root .`).
2. **Real vocabulary, fictional data.** Labels that come from the back end: generate the fixture from the back end's own source, never type it by hand. Data: in `<area>.data.ts`, in the exact shape the API returns (copy it from the API client's normalizer or the test fixtures), with invented companies, people and ids. **Never** real customer data — the HTML leaves the machine.
3. **Write the capture test** from the example: mocks in the test file itself; mount with `mountPage`; wait for the final state with `findBy*` (data on screen, the tab present), never a timer; for a dialog or menu, click the real trigger and `await waitForDialog(name)`; call `assertAllRoutesSimulated()` so a missing route fails instead of capturing an error banner; save with `captureName(nn, screen[, state])` — `nn` in flow order, `screen` the flow map's screen id.
4. **Run:** `DSX_CAPTURE=1 DSX_CAPTURE_MODULE=<m> npx vitest run --config vitest.capture.config.ts tests/capture/<area>.capture.test.tsx`.
5. **Look at it** (recommended): `node <DSX>/tools/capture/render.mjs <capture.html> --out /tmp/x.png` from a project folder with Playwright, then read the PNG. It must match the app: logo, icons, badges, borders, active tab, no error banner. The command also flags images that did not load and empty bodies.
6. **States.** For each main screen, the states its archetype requires (`UX.md` → `states`; `archetypes/<id>.md`): `<nn>-<screen>.loading.html`, `.empty.html`, `.error.html`, `.no-access.html`… with the same `nn` and screen id.

Then the DSX tools read them with no extra flags: `node <DSX>/tools/ux-lint/audit.mjs --module <m> --root <project> --measure` (skill `audit-ux`), variations (skill `rethink-ux`), `ux-writing`, `review-ux`.

## Known fixes (already in `serialize.ts` — do not redo them in tests)

| Symptom in the static HTML | Cause | Fix |
|---|---|---|
| Active tab has no indicator | the kit measures the tab with `getBoundingClientRect` (0 in jsdom) | indicator hidden; inset line on `[role=tab][aria-selected=true]` |
| Only the first fold appears | the app shell scrolls inside `main` | `main` and its ancestors grow with the content (`fullPage`, default on); wide tables still scroll sideways inside `main` |
| Typed values and checked boxes are gone | they live in DOM properties | copied to attributes/content; auto-sizing textareas lose their 0 height and fall back to `rows` |
| Dialog backdrop covers only the top | overlay is `position: fixed` | the overlay's portal container and backdrop become `position: absolute` over the whole body |
| Content below a scrolling dialog is cut | static HTML has no scroll position | `fullDialog: true` grows the dialog to its end |
| Broken image | `src="/x.png"` served from `public/` | inlined as data URI (also CSS `url(/x.png)`); other asset imports: add the file to `extraCss` or `publicDir` |
| Empty styles | emotion "speedy" inserts with `insertRule` | rules read from the CSSOM |

Limits that stay: virtualized lists, canvas charts and sizes computed in JS need a state without virtualization or a note in the title; PDFs in iframes render blank; date inputs follow the runner's locale. Anything else wrong in the capture is the code's (fix it in the code, not in Stitch).

## Send to Stitch, arrange the canvas, build the journey page

All Node, no dependencies; the API key comes from `$STITCH_API_KEY` or the `stitch` MCP server in `~/.claude.json` and is never printed. Every upload is checked against the project's blocklist first (exit 3 and the matching entry; fix the data, never the list).

```bash
# one screen, or the whole module in journey order (capture-order.json: [{nn, id, name, route}])
node <DSX>/tools/stitch/send.mjs <projectId> .dsx/captures/<m>/02-orders.html --title "02 · Orders · /orders"
node <DSX>/tools/stitch/send.mjs <projectId> --order .dsx/captures/<m>/capture-order.json --module <m>   # writes stitch-screens.json
# one row per journey (label card + screens in visit order), rest in a last row; rerunnable
node <DSX>/tools/stitch/arrange-canvas.mjs <projectId> --map .dsx/maps/flows-<m>.json --registry .dsx/captures/<m>/stitch-screens.json
# comparisons (current × design-system options, current × variations): explicit rows, same column = same screen
node <DSX>/tools/stitch/arrange-canvas.mjs <projectId> --rows rows.json --registry <registry>
# journey page: thumbnails + checked flow map, self-contained HTML (publish it as an artifact)
node <DSX>/tools/capture/render.mjs --module <m> --thumbnails
node <DSX>/tools/stitch/journeys.mjs .dsx/maps/flows-<m>.json --module <m> --out .dsx/captures/<m>/journeys.html
```

All of them accept `--dry-run` where they would touch the network. Verify in Stitch with `get_screen` (download the screenshot) and record screen ids in `.stitch/metadata.json` (skill `stitch`).

Comparing design systems on real screens (skills `choose-ds`, `design-lab`): `apply_design_system` does not work on captured screens (their CSS is real and fixed). Render the same flow with each option's theme on top of the product theme: `DSX_DESIGN_MD=<option file>` (legacy `STITCH_THEME`) makes `design-option.ts` parse the option, `design-option-mui.tsx` (a provider in `mountPage`) apply it with the same adapter as the live switcher, and `serialize.ts` save under `options/<option>/`. `node <DSX>/tools/design-md/lab.mjs compare` sets the variables and runs the project's `capture.command` per option, then writes the comparison page; to use Stitch instead, send each set and arrange with `--rows`.

## Other stacks

`serialize.ts` works on any DOM, so only the mount changes:

- **Vue 3 + Vitest:** `@vue/test-utils` `mount(Page, { global: { plugins: [router, pinia], stubs } })` with `attachTo: document.body`; scoped styles are injected as `<style>` when Vitest processes CSS. Mock the API module with `vi.mock` in the test file; `await flushPromises()` before saving.
- **Angular + Jest/Vitest (jsdom):** `TestBed.configureTestingModule({ imports: [Page], providers: [provideRouter([]), { provide: ApiService, useValue: fake }] })`, `fixture.autoDetectChanges()`, `await fixture.whenStable()`; component styles (emulated encapsulation) are already `<style>` tags in `<head>`. Material overlays render in `.cdk-overlay-container` (add it to `overlaySelectors`).
- **Svelte + Vitest:** `@testing-library/svelte` `render(Page, { props })`; enable CSS processing so component styles reach `<head>`; `await tick()` before saving.
- **No component test runner at all:** render the built app with Playwright against a static preview and save `page.content()` with the same post-processing (the fixes are DOM-level); the audit only needs the HTML.

## Don't

- Rebuild or "fix" an existing screen with text generation (`generate_screen_from_text`, `edit_screens`) or treat Stitch's HTML as a source for the code — the code is the source.
- Use real data, a real tenant or a production capture; capture inside the normal suite (without `DSX_CAPTURE=1` it is skipped on purpose).
- Save before the final state (spinners and half-open dialogs make false findings).
- Keep `vi.mock` in a shared file (Vitest will not hoist it) or edit the shared `environment.tsx`/`serialize.ts` from parallel work fronts — common changes go there afterwards, once.

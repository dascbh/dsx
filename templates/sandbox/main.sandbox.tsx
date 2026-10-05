// DSX sandbox — entry point. Order matters (ES modules evaluate in import order):
// 1. install the interception (before any app code can make a request);
// 2. register the mocks;
// 3. run the app's REAL entry from the mirror (`@dsx-entry`, configured in vite.sandbox.config.ts) — it renders with
//    the same providers as production, except the modules swapped by the sandbox (auth);
// 4. mount the scenario panel in its own root.
import './runtime/install';
import './mocks';
import '@dsx-entry';
import { mountPanel } from './runtime/SandboxPanel';

mountPanel();

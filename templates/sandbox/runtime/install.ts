// DSX sandbox — first module of the sandbox entry: reads the viewer's preferences and installs the interception before
// any app module runs. The mocks register next (main.sandbox.tsx imports ../mocks right after this file).
import { CONFIG, personaById } from './config';
import { install } from './intercept';
import { router } from './router';
import { choosePreferences, readStored, type Preferences } from './scenarios';

function localStore(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

export const PREFS: Preferences = choosePreferences(CONFIG, location.search, readStored(localStore(), CONFIG.storage_key));
export const currentPersona = () => personaById(PREFS.persona);

install(router, CONFIG, PREFS);

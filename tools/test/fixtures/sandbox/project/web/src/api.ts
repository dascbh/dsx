const API = import.meta.env.VITE_API_URL;
const FILES = import.meta.env.VITE_API_FILES_URL;
export const ATTACHMENTS_HOST = import.meta.env.VITE_ATTACHMENTS_HOST;
export const apiFetch = (path: string, init?: RequestInit) => fetch(`${API}${path}`, init).then((r) => r.json());
export const filesFetch = (path: string) => fetch(`${FILES}${path}`).then((r) => r.json());
export const isOrgDenial = (e: { error?: { code?: string } }) => e.error?.code === 'ORG_FORBIDDEN';
export const DENIAL_LAYER: Record<string, string> = { MODULE_FORBIDDEN: 'module', ORG_FORBIDDEN: 'org' };

// Index of all scenarios, by language. Used by the React app and by the Node server.
import { zh } from './zh.js';
import { ms } from './ms.js';
import { ta } from './ta.js';

const byLanguage = { zh, ms, ta };

export const scenariosFor = (langId) => byLanguage[langId] ?? [];
export const getScenario = (langId, id) => scenariosFor(langId).find((s) => s.id === id);

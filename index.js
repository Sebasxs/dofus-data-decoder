import jobs from './src/modules/Jobs.js';
import hints from './src/modules/Hints.js';
import breeds from './src/modules/Breeds.js';
import documents from './src/modules/Documents.js';
import descriptions from './src/modules/FeatureDescriptions.js';
import recipes from './src/modules/Recipes.js';
import quests from './src/modules/Quests.js';
import DownloadMapImages from './src/modules/DownloadMapImages.js';
import Maps from './src/modules/Maps.js';
import SubAreas from './src/modules/SubAreas.js';
import Npcs from './src/modules/Npcs.js';
import AddMapCoordsViaCanvas from './src/modules/AddCoordsViaCanvas.js';

import NPCS from './src/input/Npcs.json' assert {type: 'json'};
import i18n from './src/input/i18n_es.json' assert {type: 'json'};
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import ConvertBoneImages from './src/modules/ConvertBoneImages.js';
const filename = dirname(fileURLToPath(import.meta.url));

(async () => {
   // jobs();
   // breeds();
   // documents();
   // descriptions();
   // hints();
   // recipes();
   // quests();

   // DownloadMapImages();
   // AddMapCoordsViaCanvas();
   ConvertBoneImages();

   // Maps();
   // SubAreas();
   // Npcs();


   // const dir = readdirSync(join(filename, '/src/output/npcs/dialogs'), { encoding: 'utf-8' });
   // const json = [];
   // for (const dialogFile of dir) {
   //    const [id] = dialogFile.split('.');
   //    const file = readFileSync(join(filename, `/src/output/npcs/dialogs/${dialogFile}`), { encoding: 'utf-8' });
   //    const nameId = NPCS.find(npc => npc.id == id).nameId;
   //    const name = i18n.texts[nameId];
   //    json.push({ id: parseInt(id), name, summary: file.split('\r\n\r\n') });
   // }
   // writeFileSync(join(filename, '/src/output/npcs/dialogSummaries.json'), JSON.stringify(json), { encoding: 'utf-8' });
})();

import axios from 'axios';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import DB from '../modules/DB.js';
import { chromium } from 'playwright';
import NPCS from '../input/Npcs.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};

const filename = fileURLToPath(import.meta.url);
const browser = await chromium.launch();
const page = await browser.newPage();
let counter = 0;
for (const { id, look, nameId } of Monsters) {
   const requireSWFBuilder = look.match(/^{1\|/);
   if (!requireSWFBuilder) continue;
   await page.goto(`https://dofusdb.fr/es/database/monster/${id}`);
   let hasImage;
   while (!hasImage) {
      hasImage = await page.$('#q-app > div > div > main > div.row.text-white.bg-primary.q-pa-md.items-start > div.text-white.monster.monster-img.bg-dark.q-mr-md.q-img.overflow-hidden > div.q-img__image.absolute-full');
   };

   const style = await hasImage.getAttribute('style');
   const imageUrl = style.match(/https:[./\w]+/)?.at(0);
   const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
   writeFileSync(join(dirname(filename), `./images/monsters/skin${id}.jpg`), response.data);

   let npcId = null;
   let npcName = null;
   const npcsWithSameLook = NPCS.filter(npc => npc.look === look);
   for (const npc of npcsWithSameLook) {
      counter++;
      npcId = npc.id;
      npcName = i18n.texts[npc.nameId];
      DB(`dofus_npcs/${npcId}/image_id`).set(-id);
   };

   const monsterName = i18n.texts[nameId];
   console.log({ counter, monsterName, id, npcName, npcId, });
};
browser.close();
console.log('Images downloaded!');
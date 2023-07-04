import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { readdirSync, copyFileSync, rmSync } from 'fs';
const _dirname = dirname(fileURLToPath(import.meta.url));

const statesPriorityOrder = ['AnimAttaque4', 'AnimAttaque3', 'AnimAttaque2', 'AnimAttaque1', 'AnimAttaque0', 'AnimMarche', "AnimState1"];
const imagesPath = join(_dirname, `src/images`);
const npcBonesDir = readdirSync(imagesPath + '/output', { encoding: 'utf-8' });
for (const folder of npcBonesDir) {
   const [imageId] = folder.split('.');
   const npcDir = readdirSync(imagesPath + `/output/${folder}/sprites`, { encoding: 'utf-8' });
   for (const anim of statesPriorityOrder) {
      const animationFolder = npcDir.find(spriteFolder => {
         return ['_1', '_3', '_0'].some(state => spriteFolder.includes(anim + state))
      });

      if (!animationFolder) continue;
      copyFileSync(
         imagesPath + `/output/${folder}/sprites/${animationFolder}/frames.gif`,
         imagesPath + `/temp/${imageId}_${anim}.gif`
      );
   };

   const staticAnimFolder = npcDir.find(spriteFolder => {
      return ['ique_1', 'ique_3', 'e0_0', 'ique_0'].some(state => spriteFolder.includes('AnimStat' + state))
   });

   copyFileSync(
      imagesPath + `/output/${folder}/sprites/${staticAnimFolder}/1.png`,
      imagesPath + `/temp/${imageId}.png`
   );
   rmSync(imagesPath + `/output/${folder}`, { recursive: true, force: true });
};

/*
#1: skin
#2: hair
#3: primary
#4: primary
#5: secondary

Feca:       { 1 | 10 & 11 }
Osamodas:   { 1 | 20 & 21 }
Anutrof:    { 1 | 30 & 31 }
Sram:       { 1 | 40 & 41 }
Xelor:      { 1 | 50 & 51 }
Zurcarak:   { 1 | 60 & 61 }
Aniripsa:   { 1 | 70 & 71 }
Yopuka:     { 1 | 80 & 81 }
Ocra:       { 1 | 90 & 91 }
Sadida:     { 1 | 100 & 101 }
Sacrógrito: { 1 | 110 & 111 }
Pandawa:    { 1 | 120 & 121 }
Tymador:    { 1 | 1405 & 1407 }
Zobal:      { 1 | 1437 & 1438 }
Steamer:    { 1 | 1663 & 1664 }
Selotrop:   { 1 | 3179 & 3180 }
Forjalanza: { 1 | 3221 & 3633 }
Hipermago:  { 1 | 3285 & 3286 }
Uginak:     { 1 | 3498 & 3499 }
Plenitud:   { 1 | 4156 }
NPC Negro:  { 1 | 3252 }
Gultar:     { 1 | 1463 }
*/
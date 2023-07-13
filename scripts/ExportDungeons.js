import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Challenges from '../input/Challenges.json' assert{type: 'json'};
import Achievements from '../input/Achievements.json' assert{type: 'json'};
import Monsters from '../input/Monsters.json' assert{type: 'json'};

const DOCS = new Map();
const Maps = await DB('dofus_maps').once('value');
const Dungeons = await DB('dofus_dungeons').once('value');
const formatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });

function AddDoc({ level, doc }) {
   const docArray = DOCS.get(level);
   if (!docArray) {
      DOCS.set(level, [doc]);
   } else {
      docArray.push(doc);
      DOCS.set(level, docArray);
   };
};

function GetMonsters({ bosses, minions }) {
   let output = 'El guardián es ';
   const bossesArr = [];
   bosses.forEach(boss => {
      const bossName = boss.val();
      bossesArr.push(bossName);
   });

   if (bossesArr.length > 1) output = 'Los guardianes son ';
   output += formatter.format(bossesArr) + ', y sus esbirros son ';
   const minionsArr = [];
   minions.forEach(minion => {
      const minionName = minion.val();
      minionsArr.push(minionName);
   });

   output += formatter.format(minionsArr) + '.';
   return output;
};

function GetAchievements(achievements) {
   let output = '';
   achievements.forEach(achievement => {
      const achievementId = parseInt(achievement.key);
      const achievementName = achievement.val();
      const achvData = Achievements.find(achv => achv.id === achievementId);
      const achvDescriptionId = achvData.descriptionId;
      const AchvDescription = i18n.texts[achvDescriptionId];
      const challengeId = AchvDescription.match(/(?<=\[challenge,)\d+/)?.[0];
      if (challengeId) {
         const challenge = Challenges.find(chal => chal.id === parseInt(challengeId));
         const { descriptionId, targetMonsterId, completionCriterion } = challenge;
         let description = i18n.texts[descriptionId];
         if (targetMonsterId && description.includes('%1')) {
            const monster = Monsters.find(monster => monster.id === targetMonsterId);
            const monsterNameId = monster.nameId;
            const monsterName = i18n.texts[monsterNameId];
            description = description.replace('%1', monsterName);
         };
         if (description.includes('%2')) {
            const rounds = completionCriterion.match(/(?<=ST.)\d+/)[0];
            description = description.replace('%2', rounds);
         };
         output += `\n- ${achievementName}: ${description.replace(/\n+/g, ' ')}`;
      } else {
         output += `\n- ${achievementName}: ${AchvDescription.replace(/\n+/g, ' ')}`;
         console.log({ achievementName });
      }
   });

   if (!output) return '';
   return `En esta mazmorra puedes desbloquear los siguientes logros:${output}\n\n`;
};

function GetQuests(quests) {
   let output = '';
   quests.forEach(quest => {
      const questName = quest.val();
      output += `\n- ${questName}.`;
   });

   if (!output) return '';
   return `Deberás ir a esta mazmorra durante las siguientes misiones:${output}\n\n`;
};

Dungeons.forEach(dungeon => {
   const achievements = dungeon.child('achievements');
   const areaName = dungeon.child('area_name').val();
   const bosses = dungeon.child('bosses');
   const coords = dungeon.child('coords').val();
   const level = dungeon.child('level').val();
   const mapId = dungeon.child('map_id').val();
   const minions = dungeon.child('minions');
   const name = dungeon.child('name').val();
   const quests = dungeon.child('quests');
   const monsters = GetMonsters({ bosses, minions });
   const achievementList = GetAchievements(achievements);
   const questList = GetQuests(quests);
   const mapImg = Maps.child(`${mapId}/image_url`).val();

   const doc =
      `## ${name}, ID: ${dungeon.key}\n` +
      `La mazmorra «${name}» es de nivel ${level} y se encuentra en ${coords} (${areaName}). ` +
      `${monsters}\n` +
      `${achievementList}` +
      `${questList}` +
      `Este es el mapa de la entrada a ${name}:\n![dungeon_img](${mapImg})`;

   AddDoc({ level, doc });
});

const filename = fileURLToPath(import.meta.url);
for (const [level, docs] of DOCS) {
   writeFileSync(
      join(dirname(filename), `../pages/dungeons/${level}.md`),
      docs.join('\n\n')
   );
};

console.log('Dungeons exported!');
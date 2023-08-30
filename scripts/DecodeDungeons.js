import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DB from '../modules/DB.js';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Areas from '../input/Areas.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import Dungeons from '../input/Dungeons.json' assert {type: 'json'};
import Challenges from '../input/Challenges.json' assert {type: 'json'};
import Achievements from '../input/Achievements.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

function FixMonsters({ id, bosses, minions }) {
   const bossesToRemove = [];
   const bossesToAdd = [];
   const minionsToRemove = [];
   const minionsToAdd = [];
   if (id === 53) minionsToRemove.push(3740); // Minogolem secular from Minotot
   else if (id === 71) bossesToRemove.push(3384, 3391, 3397, 3409); // Conde kontatras
   else if (id === 13) minionsToRemove.push(2680); // Ghambona, la bwork ingenua
   else if (id === 18) minionsToRemove.push(826); // kirbola lerosionao
   else if (id === 34) minionsToRemove.push(3235); // Boostacho prepuberto
   else if (id === 94) minionsToRemove.push(4265); // Ush galesh - clon
   else if (id === 4) { //Minotauroro
      bossesToRemove.push(827); // Minotot
      minionsToRemove.push(3740); // Minogolem secular
   } else if (id === 49) { //Blop multicolor
      bossesToRemove.push(1184, 1185, 1186, 1187); // Blops reales
      minionsToAdd.push(1184, 1185, 1186, 1187); // Blops reales
   };

   for (const bossId of bossesToRemove) bosses[bossId] = null;
   for (const monsterId of minionsToRemove) minions[monsterId] = null;
   for (const bossId of bossesToAdd) {
      const boss = Monsters.find(monster => monster.id === bossId);
      bosses[bossId] = i18n.texts[boss.nameId];
   };
   for (const monsterId of minionsToAdd) {
      const monster = Monsters.find(monster => monster.id === monsterId);
      minions[monsterId] = i18n.texts[monster.nameId];
   };
};

function FixAchievements({ id, achievements }) {
   const toRemove = [];
   const toAdd = [];
   if (id === 4) toRemove.push(536, 744, 745, 6213); // Minotot rmvd Minotauroro
   else if (id === 44) toRemove.push(5189, 5190, 5191, 6186); // Rata Blanca rmvd from Sfinter Cell
   else if (id === 53) toRemove.push(522, 716, 717, 6193); // Minotauroro rmvd from Minotot
   else if (id === 49) toRemove.push(503, 684, 685, 6164); // Blops reales from Blop multicolor
   else if (id === 11) toAdd.push(503, 684, 685, 6164); // Blops reales
   else if ([117, 118, 119, 120].includes(id)) toRemove.push(2286, 2287, 2288); // Tormenta from individual Jinetes
   else if (id === 71) toAdd.push(899, 900, 901, 902); // Conde kontatras

   for (const id of toRemove) achievements[id] = null;
   for (const id of toAdd) {
      const achievement = Achievements.find(achv => achv.id === id);
      achievements[id] = i18n.texts[achievement.nameId];
   };
};

function GetAchievements({ id, favoriteSubareaIds, subarea_id, bosses }) {
   const achievements = {};
   Challenges.forEach(({ id, activationCriterion }) => {
      if (!activationCriterion.match(/Gm=d/)) return;
      const mainBossIds = Object.keys(bosses).filter(bossId => {
         const favoriteSubareaId = favoriteSubareaIds.get(parseInt(bossId));
         return favoriteSubareaId === subarea_id;
      });

      const isMainBossChallenge = mainBossIds.some(bossId => {
         return activationCriterion.match(new RegExp(`GM>0,${bossId},1`));
      });

      const includeAllBosses = Object.keys(bosses).every(bossId => {
         return activationCriterion.match(new RegExp(`GM>0,${bossId},1`));
      });

      const belongToThisDungeon = isMainBossChallenge || includeAllBosses;
      if (!belongToThisDungeon) return;

      const achievement = Achievements.find(({ descriptionId }) => {
         const description = i18n.texts[descriptionId];
         return description.includes(`[challenge,${id}]`);
      });

      if (!achievement) return;
      achievements[achievement.id] = i18n.texts[achievement.nameId];
   });

   FixAchievements({ id, achievements });
   return achievements;
};

function GetMonsters({ id, subarea_id }) {
   const bosses = {};
   const minions = {};
   const favoriteSubareaIds = new Map();
   Monsters.forEach(({ subareas, id, isBoss, nameId, favoriteSubareaId }) => {
      const belongToThisDungeon = subareas.some(subareaId => subareaId === subarea_id);
      if (!belongToThisDungeon) return;
      const monsterName = i18n.texts[nameId];
      if (isBoss) {
         bosses[id] = monsterName;
         favoriteSubareaIds.set(id, favoriteSubareaId);
      } else {
         minions[id] = monsterName;
      };
   });

   FixMonsters({ id, bosses, minions });
   return { bosses, minions, favoriteSubareaIds };
};

const data = {};
Dungeons.forEach(dungeon => {
   const id = dungeon.id;
   const name = i18n.texts[dungeon.nameId];
   const level = dungeon.optimalPlayerLevel;
   const dungeonMapIds = dungeon.mapIds;
   const map_id = dungeon.entranceMapId;
   const map = MapPositions.find(map => map.id === map_id);
   const coords = `[${map.posX},${map.posY}]`;
   const subarea = SubAreas.find(subarea => {
      const subareaMapIds = subarea.mapIds;
      return subareaMapIds.find(mapId => mapId === dungeonMapIds.at(0));
   });
   const subarea_id = subarea.id;
   const area_id = subarea.areaId;
   const area = Areas.find(area => area.id === area_id);
   const area_name = i18n.texts[area.nameId];

   const { bosses, minions, favoriteSubareaIds } = GetMonsters({ id, subarea_id });
   const achievements = GetAchievements({ id, favoriteSubareaIds, subarea_id, bosses });
   if (!Object.keys(achievements).length) console.log({ name });

   data[`dofus_dungeons/${id}/name`] = name;
   data[`dofus_dungeons/${id}/area_name`] = area_name;
   data[`dofus_dungeons/${id}/level`] = level;
   data[`dofus_dungeons/${id}/coords`] = coords;
   data[`dofus_dungeons/${id}/bosses`] = bosses;
   data[`dofus_dungeons/${id}/minions`] = minions;
   data[`dofus_dungeons/${id}/achievements`] = achievements;
   data[`dofus_dungeons/${id}/map_id`] = map_id;
   data[`dofus_dungeons/${id}/subarea_id`] = subarea_id;
});

const filename = fileURLToPath(import.meta.url);
writeFileSync(join(dirname(filename), '../output/dungeons.json'), JSON.stringify(data));
DB().update(data).finally(() => { console.log('Dungeons updated!') });
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DB from './src/modules/DB.js';
import i18n from './src/input/i18n_es.json' assert {type: 'json'};
import Areas from './src/input/Areas.json' assert {type: 'json'};
import Monsters from './src/input/Monsters.json' assert {type: 'json'};
import SubAreas from './src/input/SubAreas.json' assert {type: 'json'};
import Dungeons from './src/input/Dungeons.json' assert {type: 'json'};
import Achievements from './src/input/Achievements.json' assert {type: 'json'};
import MapPositions from './src/input/MapPositions.json' assert {type: 'json'};

const filename = fileURLToPath(import.meta.url);
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
   const bosses = {};
   const minions = {};
   Monsters.forEach(monster => {
      const monsterSubareas = monster.subareas;
      const belongToThisDungeon = monsterSubareas.some(subareaId => subareaId === subarea_id);
      if (!belongToThisDungeon) return;
      const monsterId = monster.id;
      const monsterName = i18n.texts[monster.nameId];
      if (monster.isBoss) bosses[monsterId] = monsterName;
      else minions[monsterId] = monsterName;
   });
   const achievements = {};
   Achievements.forEach(achv => {
      const achvName = i18n.texts[achv.nameId];
      if (!achvName.includes('(')) return;
      const belongToThisDungeon = Object.values(bosses).some(bossName => {
         return achvName.toLowerCase().includes(bossName.toLowerCase())
      });
      if (!belongToThisDungeon) return;
      achievements[achv.id] = achvName;
   });
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

// writeFileSync(join(dirname(filename), 'src/output/dungeons/data.json'), JSON.stringify(data));
DB().update(data).then(() => { console.log('Dungeons updated!') });
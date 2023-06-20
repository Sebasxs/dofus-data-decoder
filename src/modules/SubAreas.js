import DB from './DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { encode } from 'gpt-3-encoder';
import Items from '../input/Items.json' assert {type: 'json'};
import Areas from '../input/Areas.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import WorldMaps from '../input/WorldMaps.json' assert {type: 'json'};
import MapUrls from '../output/maps/mapUrls.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

const PATHS = {};
const npcPositions = {};
const ignoredSubareas = [1021];
function UpdateNpcs(npcs) {
   for (const [npcId, npcMapId] of npcs) {
      npcPositions[`${parseInt(npcId)}/map_id`] = parseInt(npcMapId);
      const npcMap = MapPositions.find(map => map.id === npcMapId);
      const coords = `[${npcMap.posX},${npcMap.posY}]`;
      npcPositions[`${parseInt(npcId)}/coords`] = coords;
   };
};

function GroupNamedMapsBySubarea(subareaMaps, areaName) {
   const maps = new Map();
   for (const mapId of subareaMaps) {
      const map = MapPositions.find(map => map.id === mapId);
      const mapName = map.nameId ? i18n.texts[map.nameId] : null;
      if (!mapName) continue;

      let [name, room] = mapName.split(' - ');
      const coords = `[${map.posX},${map.posY}]`;
      const url = MapUrls[parseInt(mapId)];

      if (!room) room = '';
      else if (name === areaName) {
         name = room;
         room = '';
      };

      if (!maps.has(name)) {
         maps.set(name, [{ room, coords, mapId: parseInt(mapId), url }]);
         continue;
      };

      const currentValue = maps.get(name);
      currentValue.push({ room, coords, mapId: parseInt(mapId), url });
      maps.set(name, currentValue);
   };
   return maps;
};

function AddSubareaImages(hasOnlyOneCoords, arrayOfMaps) {
   let imageList = '';
   if (hasOnlyOneCoords) {
      for (const { room, mapId, url } of arrayOfMaps) {
         const image = `![img_${mapId}](${url})`;
         if (room) imageList += `\n- ${room}: ${image}`;
         else imageList += `\n- ${image}`;
      };

      return imageList;
   };

   for (const { room, coords, mapId, url } of arrayOfMaps) {
      const image = `![img_${mapId}](${url})`;
      if (room) imageList += `\n- ${room} en ${coords}: ${image}`;
      else imageList += `\n- En ${coords}: ${image}`;
   };

   return imageList;
};

function FormatNamedMaps({ subarea, subareaName, areaName, worldmapName }) {
   const { id, mapIds } = subarea;
   const groupedMaps = GroupNamedMapsBySubarea(mapIds, areaName);
   if (!groupedMaps.size) return null;

   let markdown = '';
   for (const [name, data] of groupedMaps) {
      let place =
         `\n\n## ${name}` +
         `\nLugar: ${name}.` +
         `\nZona: ${areaName}.`;

      if (!name.includes(subareaName) && areaName !== subareaName) place += `\nSubzona: ${subareaName}.`;
      if (worldmapName && areaName !== worldmapName && subareaName !== worldmapName) place += `\nMundo: ${worldmapName}.`;

      const [{ coords: baseCoords }] = data;
      const arrayOfMaps = data.sort((a, b) => a.room.localeCompare(b.room));
      const hasOnlyOneCoords = data.every(map => map.coords === baseCoords);

      if (hasOnlyOneCoords) place += `\nPosición en el mapa: ${baseCoords}.\nPrevisualización de los mapas o salas:`;
      else place += `\nPrevisualización de mapas y sus posiciones:`;

      place += AddSubareaImages(hasOnlyOneCoords, arrayOfMaps);

      const tokensCount = encode(place).length;
      if (tokensCount > 600) console.log({ id, name, tokensCount });
      markdown += place;
   };

   return markdown.trim();
}

export default function () {
   const filename = fileURLToPath(import.meta.url);

   for (const subarea of SubAreas) {
      if (ignoredSubareas.includes(subarea.id)) continue;
      const subareaName = i18n.texts[subarea.nameId];
      const area = Areas.find(area => area.id === subarea.areaId);
      const areaName = i18n.texts[area.nameId];
      const worldmapNameId = WorldMaps.find(worldmap => worldmap.id === subarea.worldmapId)?.nameId;
      const worldmapName = worldmapNameId ? i18n.texts[worldmapNameId] : null;

      PATHS[`dofus_subareas/${subarea.id}`] = {
         associatedZaapMapId: subarea.associatedZaapMapId,
         area: areaName,
         level: subarea.level,
         worldmap: worldmapName,
         name: subareaName,
         monsters: subarea.monsters.reduce((acc, cur) => {
            const monster = Monsters.find(monster => monster.id === cur);
            acc[cur] = i18n.texts[monster.nameId];
            return acc;
         }, {}),
         harvestables: subarea.harvestables.reduce((acc, cur) => {
            const item = Items.find(item => item.id === cur);
            if (item.typeId === 226) return acc;
            acc[cur] = i18n.texts[item.nameId];
            return acc;
         }, {})
      };

      UpdateNpcs(subarea.npcs);

      const markdown = FormatNamedMaps({ subarea, subareaName, areaName, worldmapName });
      if (markdown) writeFileSync(
         join(dirname(filename), `../pages/subareas/${subarea.id}.md`),
         markdown, { encoding: 'utf-8' }
      );
   };

   writeFileSync(join(dirname(filename), '../output/subareas/subareas.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
   writeFileSync(join(dirname(filename), '../output/npcs/positions.json'), JSON.stringify(npcPositions), { encoding: 'utf-8' });
   DB().update(PATHS);
};
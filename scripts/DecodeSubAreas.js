import DB from '../src/modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Items from '../src/input/Items.json' assert {type: 'json'};
import Areas from '../src/input/Areas.json' assert {type: 'json'};
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import Monsters from '../src/input/Monsters.json' assert {type: 'json'};
import SubAreas from '../src/input/SubAreas.json' assert {type: 'json'};
import WorldMaps from '../src/input/WorldMaps.json' assert {type: 'json'};
import MapPositions from '../src/input/MapPositions.json' assert {type: 'json'};

const PATHS = {};
const ignoredSubareaIds = [1021];
const filename = fileURLToPath(import.meta.url);
const MapUrls = await DB('dofus_maps').once('value');

function UpdateNpcs(subareaNpcs) {
   for (const [npcId, npcMapId] of subareaNpcs) {
      PATHS[`dofus_npcs/${parseInt(npcId)}/map_id`] = parseInt(npcMapId);
      const npcMap = MapPositions.find(map => map.id === npcMapId);
      PATHS[`dofus_npcs/${parseInt(npcId)}/coords`] = `[${npcMap.posX},${npcMap.posY}]`;
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
      const url = MapUrls.child(`${parseInt(mapId)}/image_url`).val();

      if (!room) {
         room = '';
      } else if (name === areaName) {
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
         else imageList += `\n${image}`;
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

function ExportNamedMaps({ subarea, subareaName, areaName, worldmapName }) {
   const { id, mapIds } = subarea;
   const groupedMaps = GroupNamedMapsBySubarea(mapIds, areaName);
   if (!groupedMaps.size) return;

   let doc = '';
   for (const [name, data] of groupedMaps) {
      let section = `\n\n## ${name}\n${name} se encuentra en ${areaName}`;
      if (!name.includes(subareaName) && areaName !== subareaName) section += ` (${subareaName})`;
      if (worldmapName && areaName !== worldmapName && subareaName !== worldmapName) section += ` de ${worldmapName}`;

      const [{ coords: baseCoords }] = data;
      const arrayOfMaps = data.sort((a, b) => a.room.replace(/\D+/g, '') - b.room.replace(/\D+/g, ''));
      const hasOnlyOneCoords = data.every(map => map.coords === baseCoords);

      if (hasOnlyOneCoords) section += ` y sus coordenadas son ${baseCoords}.`;
      else section += ` y comprende varios mapas con diferentes coordenadas.`;

      if (arrayOfMaps.length > 1) section += `\nImágenes de los mapas que conforman ${name}:`;

      section += AddSubareaImages(hasOnlyOneCoords, arrayOfMaps);
      doc += section;
   };

   writeFileSync(join(dirname(filename), `../pages/subareas/${subarea.id}.md`), doc.trim(), { encoding: 'utf-8' });
};

for (const subarea of SubAreas) {
   if (ignoredSubareaIds.includes(subarea.id)) continue;
   const subareaName = i18n.texts[subarea.nameId];
   const area = Areas.find(area => area.id === subarea.areaId);
   const areaName = i18n.texts[area.nameId];
   const worldmapNameId = WorldMaps.find(worldmap => worldmap.id === subarea.worldmapId)?.nameId;
   const worldmapName = worldmapNameId ? i18n.texts[worldmapNameId] : null;
   const monsters = subarea.monsters.reduce((acc, cur) => {
      const monster = Monsters.find(monster => monster.id === cur);
      acc[cur] = i18n.texts[monster.nameId];
      return acc;
   }, {});

   const harvestables = subarea.harvestables.reduce((acc, cur) => {
      const item = Items.find(item => item.id === cur);
      if (item.typeId !== 226) acc[cur] = i18n.texts[item.nameId];
      return acc;
   }, {});

   PATHS[`dofus_subareas/${subarea.id}/name`] = subareaName;
   PATHS[`dofus_subareas/${subarea.id}/area`] = areaName;
   PATHS[`dofus_subareas/${subarea.id}/level`] = subarea.level;
   PATHS[`dofus_subareas/${subarea.id}/worldmap`] = worldmapName;
   PATHS[`dofus_subareas/${subarea.id}/associated_zaap_map_id`] = subarea.associatedZaapMapId;
   PATHS[`dofus_subareas/${subarea.id}/monsters`] = monsters;
   PATHS[`dofus_subareas/${subarea.id}/harvestables`] = harvestables;

   UpdateNpcs(subarea.npcs);
   ExportNamedMaps({ subarea, subareaName, areaName, worldmapName });
};

DB('dofus_subareas').update(PATHS);
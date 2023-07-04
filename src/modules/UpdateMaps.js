import DB from './DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Areas from '../input/Areas.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import WorldMaps from '../input/WorldMaps.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

const PATHS = {};
for (const map of MapPositions) {
   const mapId = parseInt(map.id);
   const coords = `[${map.posX},${map.posY}]`;
   const mapName = map.nameId ? i18n.texts[map.nameId] : null;
   const subarea = SubAreas.find(subarea => subarea.id === map.subAreaId);
   const subareaName = i18n.texts[subarea.nameId];
   const area = Areas.find(area => area.id === subarea.areaId);
   const areaName = i18n.texts[area.nameId];
   const worldmapNameId = WorldMaps.find(worldmap => worldmap.id === map.worldMap)?.nameId;
   const worldmapName = worldmapNameId ? i18n.texts[worldmapNameId] : null;

   PATHS[mapId] = {
      coords: coords,
      outdoor: map.outdoor,
      name: mapName,
      has_public_paddock: map.hasPublicPaddock,
      area: areaName,
      subarea: subareaName,
      worldmap: worldmapName,
      level: subarea.level
   };
};

const filename = fileURLToPath(import.meta.url);
// writeFileSync(join(dirname(filename), '../output/maps/maps.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
DB('dofus_maps').update(PATHS);
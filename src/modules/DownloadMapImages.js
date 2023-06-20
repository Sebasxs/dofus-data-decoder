import axios from 'axios';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

export default async function () {
   const filename = fileURLToPath(import.meta.url);
   for (const map of MapPositions) {
      const mapId = parseInt(map.id);
      const response = await axios.get(
         `https://api.dofusdb.fr/img/maps/1/${parseInt(mapId)}.jpg`,
         { responseType: 'arraybuffer' }
      );

      writeFileSync(join(dirname(filename), `../output/maps/images/${mapId}.jpg`), response.data);
   }
};
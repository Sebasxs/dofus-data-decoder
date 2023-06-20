import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import Areas from '../input/Areas.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

export default async function () {
   const filename = fileURLToPath(import.meta.url);
   const mapsFolder = [dirname(filename), '../output/maps'];
   // registerFont(join(dirname(filename), '../fonts/RobotoCondensed-Bold.ttf'), { family: 'Roboto Condensed', weight: 'bold' });
   const canvas = createCanvas(1910, 970);
   const context = canvas.getContext('2d');
   const seiWatermarkImg = await loadImage(join(...mapsFolder, `/watermark.png`));
   context.font = "bold 23px 'Roboto'";
   context.fillStyle = "#ffffff";
   context.shadowColor = '#000000';
   context.shadowBlur = 3;
   context.shadowOffsetX = 1;
   context.shadowOffsetY = 1;
   const coordsPosX = 20;
   const coordsPosY = 36;
   let counter = 0;

   for (const { id, posX, posY, subAreaId, nameId } of MapPositions) {
      if (!nameId) continue;
      counter++;
      console.log({ counter, id });
      const mapId = parseInt(id);
      const mapImg = await loadImage(join(...mapsFolder, `/map-images/${mapId}.jpg`));
      const subarea = SubAreas.find(sub => sub.id === subAreaId);
      context.drawImage(mapImg, 0, 0);
      context.drawImage(seiWatermarkImg, 1700, 913);

      if (nameId) {
         const mapName = i18n.texts[nameId];
         context.fillText(mapName, coordsPosX, coordsPosY);
      } else {
         const subareaName = i18n.texts[subarea.nameId];
         const areaNameId = Areas.find(area => area.id === subarea.areaId).nameId;
         const areaName = i18n.texts[areaNameId];
         context.fillText(`${areaName} (${subareaName})`, coordsPosX, coordsPosY);
      };

      context.fillText(`${posX},${posY}, Nivel ${subarea.level}`, coordsPosX, coordsPosY + 27);
      const buffer = canvas.toBuffer('image/jpeg');
      writeFileSync(join(...mapsFolder, `/map-coords/${mapId}.jpg`), buffer, { encoding: 'base64' });
   }
};
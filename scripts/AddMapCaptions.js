import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createCanvas, loadImage } from 'canvas';
import Areas from '../src/input/Areas.json' assert {type: 'json'};
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import SubAreas from '../src/input/SubAreas.json' assert {type: 'json'};
import MapPositions from '../src/input/MapPositions.json' assert {type: 'json'};

const filename = fileURLToPath(import.meta.url);
const mapsFolder = [dirname(filename), '../output/maps'];
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

for (const { id, posX, posY, subAreaId, nameId } of MapPositions) {
   if (!nameId) continue;
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
};
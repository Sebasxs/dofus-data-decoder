import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { loadImage, createCanvas } from 'canvas';
import { readdirSync, writeFileSync } from 'fs';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Challenges from '../input/Challenges.json' assert{type: 'json'};

const filename = fileURLToPath(import.meta.url);
const canvas = createCanvas(474, 88);
const context = canvas.getContext('2d');
const background = await loadImage(join(dirname(filename), '../images/challenges/bg.png'));
context.fillStyle = '#fff';
context.font = 'bold 18pt Roboto';
context.quality = 'best';
const folder = readdirSync(join(dirname(filename), '../images/challenges'));
for (const file of folder) {
   if (file === 'bg.jpg') continue;
   const [iconId] = file.split('.');
   const challenge = Challenges.find(chal => chal.iconId === parseInt(iconId));
   if (!challenge) continue;

   const image = await loadImage(join(dirname(filename), `../images/challenges/${file}`));
   context.drawImage(background, 0, 0);
   context.drawImage(image, 22, 20);

   const challengeName = i18n.texts[challenge.nameId];
   const words = challengeName.split(' ');
   let line1 = '';
   let line2 = '';
   for (const word of words) {
      const newLength = (line1 + ' ' + word).length;
      if (line2 || newLength > 28) {
         line2 += ' ' + word;
         continue;
      };
      line1 += ' ' + word;
   };

   if (line2) {
      context.fillText(line1, 113, 37);
      context.fillText(line2, 113, 67);
   } else {
      context.fillText(line1, 113, 53);
   };

   const buffer = canvas.toBuffer('image/jpeg');
   writeFileSync(join(dirname(filename), `../images/output/${file}`), buffer);
};
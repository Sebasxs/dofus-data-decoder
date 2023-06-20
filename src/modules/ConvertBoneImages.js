import { readFileSync, readdirSync, writeFileSync, unlink, createWriteStream, copyFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Npcs from '../input/Npcs.json' assert {type: 'json'};
import GIFEncoder from 'gif-encoder-2';
import { createCanvas, Image, loadImage } from 'canvas';
const _dirname = dirname(fileURLToPath(import.meta.url));


/**@param {String} look */
async function PngToGif(look) {
   // "look": "{1|80,2124,1101,192|5=#b81a1a,2=#e8e8e8,4=#b81a1a,1=#ffd27c,3=#ebecec|140}"
};

async function RemoveJsonFiles(dir) {
   const bonesDir = readdirSync(join(_dirname, `../images/swf/${dir}`), { encoding: 'utf-8' });
   for (const file of bonesDir) {
      if (file.includes('.swf')) continue;
      unlink(join(_dirname, `../images/swf/${dir}/${file}`), (err) => {
         if (err) throw err;
         console.log(file, 'deleted');
      });
   }
};

async function RemoveNotUsedNpcFiles() {
   const imageIdSet = new Set();
   for (const { id, look } of Npcs) {
      const [imageId, skins, colors] = look.replace(/[{}]/g, '').split('|');
      if (imageId !== 1) imageIdSet.add(imageId);
   };
   const bonesDir = readdirSync(join(_dirname, `../images/swf/bones`), { encoding: 'utf-8' });
   for (const file of bonesDir) {
      const [imageId] = file.split('.');
      if (imageIdSet.has(imageId)) continue;
      unlink(join(_dirname, `../images/swf/bones/${file}`), () => { });
      console.log(imageId);
   };
};

async function ExportImages() {
   const statesPriorityOrder = ['AnimAttaque4', 'AnimAttaque3', 'AnimAttaque2', 'AnimAttaque1', 'AnimAttaque0', 'AnimMarche'];
   const imagesPath = join(_dirname, `../images`);
   const npcBonesDir = readdirSync(imagesPath + '/output', { encoding: 'utf-8' });
   for (const folder of npcBonesDir) {
      const [imageId] = folder.split('.');
      const npcDir = readdirSync(imagesPath + `/output/${folder}/sprites`, { encoding: 'utf-8' });
      for (const anim of statesPriorityOrder) {
         const animationFolder = npcDir.find(spriteFolder => spriteFolder.includes(anim + '_1'));
         if (!animationFolder) continue;
         copyFileSync(imagesPath + `/output/${folder}/sprites/${animationFolder}/frames.gif`, imagesPath + `/temp/${imageId}_${anim}.gif`);
      };

      const staticAnimFolder = npcDir.find(spriteFolder => spriteFolder.includes('AnimStatique_1'));
      copyFileSync(imagesPath + `/output/${folder}/sprites/${staticAnimFolder}/1.png`, imagesPath + `/temp/${imageId}.png`);
      // const staticAnimFolder = npcDir.find(npcState => npcState.includes('AnimStatique_1'));
      // const framesPath = imagesPath + `/png/${folder}/sprites/${animationFolder}`;
      // const frames = readdirSync(framesPath, { encoding: 'utf-8' });
      // const firstImage = await loadImage(framesPath + `/1.png`);
      // const { width, height } = firstImage;
      // const canvas = createCanvas(width, height);
      // const ctx = canvas.getContext('2d');
      // if (frames.length === 1) continue;

      // const writeStream = createWriteStream(imagesPath + `/result/${imageId}_anim.gif`);
      // const encoder = new GIFEncoder(width, height, 'neuquant', true);
      // encoder.createReadStream().pipe(writeStream);
      // encoder.start();
      // encoder.setDelay(40);
      // encoder.setTransparent('#262729');

      // for (const frame of frames) {
      //    const image = await loadImage(framesPath + `/${frame}`);
      //    ctx.drawImage(image, 0, 0, width, height);
      //    encoder.addFrame(ctx);
      //    ctx.clearRect(0, 0, width, height);
      // };

      // encoder.end();
      rmSync(imagesPath + `/output/${folder}`, { recursive: true, force: true });
   };
};

export default async function () {
   // RemoveJsonFiles('bones');
   // RemoveJsonFiles('skins');
   // RemoveNotUsedNpcFiles();
   ExportImages();

};
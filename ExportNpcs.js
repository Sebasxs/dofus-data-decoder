import DB from './src/modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { encode } from 'gpt-3-encoder';

const filename = fileURLToPath(import.meta.url);
const npcs = await DB('dofus_npcs').once('value');
const looks = await DB('dofus_looks').once('value');
const maps = await DB('dofus_maps').once('value');
const formatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });

function GetDescriptionSections({ name, description }) {
   const sections = [];
   if (!description) return sections;
   const nameSplitted = name.split(' ');
   const firstName = nameSplitted.at(0);
   const secondName = nameSplitted.at(-1);
   const npcMention = new RegExp(`${firstName}|${secondName}`);

   const paragraphs = description.split('\n');
   let section = '';
   for (const paragraph of paragraphs) {
      const tokens = encode(section).length;
      if (tokens > 400 && section.match(npcMention)) {
         sections.push(section.trim());
         section = '';
         continue;
      };
      section += `${paragraph}\n`;
   };

   if (section) sections.push(section.trim());
   if (sections.length === 1) return sections;

   const lastSection = sections.at(-1);
   const lastSectionTokens = encode(lastSection).length;
   if (lastSectionTokens < 200 || !lastSection.match(npcMention)) {
      const sectionsToCombine = sections.splice(-2).join('\n');
      sections.push(sectionsToCombine);
   };
   return sections;
};

function GetTraits({ gender, breed, colors }) {
   const traits = [`Su género es ${gender}`];
   if (breed) traits.push(`es un ${breed}`);
   if (colors.exists()) {
      let text = 'puedes identificarle por sus colores: ';
      const temp = [];
      colors.forEach(color => { temp.push(color.val()) });
      text += formatter.format(temp);
      traits.push(text);
   };
   return '\n' + formatter.format(traits);
};

function GetPositions({ questPositions, mapId }) {
   const uniquePositions = new Set();
   let mapUrl;
   if (mapId) {
      const coords = maps.child(`${mapId}/coords`).val();
      const subarea = maps.child(`${mapId}/subarea`).val();
      uniquePositions.add(`${coords} de ${subarea}`);
      mapUrl = maps.child(`${mapId}/image_url`).val();
   };

   if (questPositions.exists()) questPositions.forEach(pos => {
      mapUrl ??= maps.child(`${pos.key}/image_url`).val();
      const coords = maps.child(`${pos.key}/coords`).val();
      const subarea = maps.child(`${pos.key}/subarea`).val();
      uniquePositions.add(`${coords} de ${subarea}`);
   });

   if (!uniquePositions.size) return { positions: 'Desconozco su ubicación exacta.', mapUrl };

   const positions = [...uniquePositions];
   const mainMap = positions.shift();
   let content = `Se encuentra en ${mainMap}`;
   if (!positions.length) return { positions: content + ' y no parece moverse de allí.', mapUrl };
   return {
      positions: content + `, pero también puedes encontrarle en ${formatter.format(positions)} según las misiones que tengas activas.`,
      mapUrl
   };
};

const npcDocs = new Map();
const alreadyAdded = new Set();
npcs.forEach(npc => {
   const id = npc.key;
   const name = npc.child('name').val().replace('[!] ', '');
   if (alreadyAdded.has(name)) return;

   alreadyAdded.add(name);
   const key = name.at(0).normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
   const gender = npc.child('gender').val();
   const colors = npc.child('colors');
   const mapId = npc.child('map_id').val();
   const imageId = npc.child('imageId').val();
   const breed = npc.child('breed').val();
   const questPositions = npc.child('quest_positions');
   const imageUrl = looks.hasChild(`${imageId}/anim_image_url`)
      ? looks.child(`${imageId}/anim_image_url`).val()
      : looks.child(`${imageId}/static_image_url`).val();

   let doc = '';
   const infoArr = npcDocs.get(key);
   const description = npc.child('description').val();
   const descriptionSections = GetDescriptionSections({ name, description });
   const { positions, mapUrl } = GetPositions({ mapId, questPositions });
   descriptionSections.forEach((section, i) => {
      doc += `## ${name}, ID${id} - ${i}\n${section}`;
      if (i === 0) {
         if (!breed && imageUrl) doc += `\n${name} tiene la siguiente apariencia:\n![npc_img](${imageUrl})`;
         doc += GetTraits({ breed, gender, colors });
         doc += (colors.exists() ? '.\n' : ', ') + positions;
         if (mapUrl) doc += ` Esta es una imagen del mapa donde está:\n![map_img](${mapUrl})`;
      };

      if (infoArr) {
         infoArr.push(doc);
         npcDocs.set(key, infoArr);
      } else npcDocs.set(key, [doc]);
      doc = '';
   });
});

for (const [key, info] of npcDocs) {
   const file = info.join('\n\n');
   writeFileSync(join(dirname(filename), `/src/pages/npcs/${key}.md`), file, { encoding: 'utf-8' });
};
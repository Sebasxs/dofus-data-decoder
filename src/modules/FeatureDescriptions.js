import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Descriptions from '../input/FeatureDescriptions.json' assert {type: 'json'};
import IllustrationUrls from '../data/guildBookIllusUrls.json' assert {type: 'json'};

/**@param {String} _text*/
const textCleaner = (_text) => {
   let text = _text;
   const removeHtmlTags = /(<([^>]+)>)/gi;
   const mapReferences = _text.matchAll(/{map,(?<pos>-?\d+,-?\d+),1::(?<place>.+?)}/g);
   if (mapReferences) {
      for (const reference of mapReferences) {
         const { pos, place } = reference.groups;
         text = text.replace(reference[0], `${place} en [${pos}]`);
      };
   };

   return text
      .replace(removeHtmlTags, '')
      .replace(/({.+?::)|(})/g, '')
      .replace(/(\n\s?)+/g, '\n')
      .trim();
};

export default function () {
   const _filename = fileURLToPath(import.meta.url);
   const descriptionsAdded = new Set();
   // const images = [];
   for (const { nameId, descriptionId, children, id } of Descriptions) {
      if (descriptionsAdded.has(id)) continue;
      descriptionsAdded.add(id);

      const name = i18n.texts[nameId];
      const description = i18n.texts[descriptionId];
      let markdown = `## ${name}\n${name} en Dofus: ${textCleaner(description)}`;

      const imageMatches = description.match(/(?<=<illu name=").+?(?=")/g);
      if (imageMatches) {
         for (const image of imageMatches) {
            // images.push(image);
            const imgName = image.split('-').at(0);
            const imgUrl = IllustrationUrls[image];
            markdown += `\n![${imgName}](${imgUrl})`;
         };
      };

      for (const childId of children) {
         descriptionsAdded.add(childId);
         const child = Descriptions.find(description => description.id === childId);
         const childName = i18n.texts[child.nameId];
         const childDescription = i18n.texts[child.descriptionId];
         const context = childName.toLowerCase().includes(name.toLowerCase())
            ? ''
            : ` (en el contexto de ${name})`;
         markdown += `\n\n## ${childName}\n${childName}${context}: ${textCleaner(childDescription)}`;

      };
      writeFileSync(join(dirname(_filename), `../pages/guides/${id}.md`), markdown, { encoding: 'utf-8' });
   };
   // writeFileSync(join(dirname(_filename), `../data/guideBookIllus.json`), JSON.stringify(images), { encoding: 'utf-8' });
};
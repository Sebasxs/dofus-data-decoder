import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Quests from '../input/Quests.json' assert {type: 'json'};
import Documents from '../input/Documents.json' assert {type: 'json'};
import ImageUrls from '../data/documentImages.json' assert {type: 'json'};

const DocumentIdsIgnored = [
   71,
   133,
   134,
   140,
   186,
   191,
   193,
   272,
   273,
   308,
   310,
   312,
   313,
   314,
   320,
   321,
   342,
   375,
   380,
   381,
   421,
   422,
   423,
   424,
   425,
   426,
   427,
   428,
   429,
   430,
   431,
   432,
   433,
   434,
   435,
   437,
   446,
   447,
   451,
   485,
   519,
   520,
   521,
   522,
   523,
   524,
   525,
   526,
   527,
   528,
   529,
   530,
   531,
   532,
   533,
   536,
   538,
   539,
   540,
   542,
   544,
   565,
   571,
   572,
   573,
   574,
   575,
   584,
   586,
   593,
   597,
   598,
   601,
   602,
   608,
   612,
   614,
   615,
   620,
   624,
   630,
   631,
   632,
   633,
   641,
   644,
   646,
   652,
   660,
   665
];

export default function () {
   const _filename = fileURLToPath(import.meta.url);
   for (const { id, titleId, subTitleId, contentId, authorId } of Documents) {
      if (DocumentIdsIgnored.find(doc => doc === id)) continue;
      const removeHtmlTags = /(<([^>]+)>)/gi;
      const subtitle = i18n.texts[subTitleId]?.replace(removeHtmlTags, '');
      let title = i18n.texts[titleId]?.replace(removeHtmlTags, '');
      if (subtitle) title += `. ${subtitle}`;
      title = `"${title}"`;
      const author = i18n.texts[authorId]?.replace(removeHtmlTags, '').replace(/^Por |^Autor /i, '');

      /**@type {string} */
      const content = i18n.texts[contentId];
      let pages = content.split('<pagefeed/>');
      const firstPageIsBookIndex = pages.at(0).match(/<p>.+?p\.\s\d.+?>/);
      if (firstPageIsBookIndex) pages = pages.slice(1);

      let markdown = `## ${title}\nLibro: ${title}`;
      if (pages.length > 1) markdown += `, página 1`;
      const startQuest = content.match(/((?<=event:startquest,)\d+)/);
      if (startQuest) {
         const questId = parseInt(startQuest[0]);
         const questNameId = Quests.find(quest => quest.id === questId).nameId;
         const questName = i18n.texts[questNameId];
         markdown += `\nEn Dofus este libro inicia la misión: "${questName}"`;
      };
      if (author) markdown += `\nAutor: ${author}`;

      pages.forEach((page, index) => {
         let paragraph = page;
         const images = page.match(/(?<=<img.+)((?:png|jpg),\d+)/g);
         if (images) {
            for (const image of images) {
               const [extension, imageId] = image.split(',');
               const imageRef = imageId + '.' + extension;
               const imageTag = new RegExp(`<img.+${image}.+?>`);
               paragraph = paragraph.replace(imageTag, `\n![book_image_${imageId}](${ImageUrls[imageRef]})\n`);
            };
         };

         paragraph = paragraph
            .replace(/<\/p>/g, '\n')
            .replace(removeHtmlTags, '')
            .replace(/(\s?\n\s?)+/g, '\n')
            .replace(/^RESUMIENDO\n|^Su captura está reservada.+\.\n|^Ir en busca de .+\n/gm, '')
            .trim();

         const prevPageContent = markdown
            .split('\n\n').at(-1)
            .split('\n')
            .slice(2)
            .join('\n');

         const isImageOnly = paragraph.startsWith('!') && paragraph.endsWith(')') && !markdown.endsWith(')');
         const prevPageIsImageOnly = prevPageContent.startsWith('!') && prevPageContent.endsWith(')') && !paragraph.startsWith('!');
         if (isImageOnly || prevPageIsImageOnly) {
            markdown += '\n' + paragraph;
            return;
         };

         if (index > 0) markdown += `\n\n## ${title} - Página ${index + 1}\nLibro: ${title}, página ${index + 1}`;
         markdown += '\n' + paragraph;
      });
      writeFileSync(join(dirname(_filename), `../pages/documents/${id}.md`), markdown, { encoding: 'utf-8' });
   };
};
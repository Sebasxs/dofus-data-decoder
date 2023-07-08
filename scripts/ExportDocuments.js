import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import Quests from '../src/input/Quests.json' assert {type: 'json'};
import Documents from '../src/input/Documents.json' assert {type: 'json'};
import ImageUrls from '../src/data/documentImages.json' assert {type: 'json'};

const removeHtmlTags = /(<([^>]+)>)/gi;
const _filename = fileURLToPath(import.meta.url);
const DocumentIdsIgnored = [71, 133, 134, 140, 186, 191, 193, 272, 273, 308, 310, 312, 313, 314, 320, 321, 342, 375, 380, 381, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 437, 446, 447, 451, 485, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 536, 538, 539, 540, 542, 544, 565, 571, 572, 573, 574, 575, 584, 586, 593, 597, 598, 601, 602, 608, 612, 614, 615, 620, 624, 630, 631, 632, 633, 641, 644, 646, 652, 660, 665];

function GetPagesContent({ title, pages }) {
   let BOOK_CONTENT = '';
   pages.forEach((page, index) => {
      let paragraph = page;
      const images = page.match(/(?<=<img.+)((?:png|jpg),\d+)/g) || [];
      for (const image of images) {
         const [extension, imageId] = image.split(',');
         const imageRef = imageId + '.' + extension;
         const imageTag = new RegExp(`<img.+${image}.+?>`);
         paragraph = paragraph.replace(imageTag, `\n![book_image_${imageId}](${ImageUrls[imageRef]})\n`);
      };

      paragraph = paragraph
         .replace(/<\/p>/g, '\n')
         .replace(removeHtmlTags, '')
         .replace(/(\s?\n\s?)+/g, '\n')
         .replace(/^RESUMIENDO\n|^Su captura está reservada.+\.\n|^Ir en busca de .+\n/gm, '')
         .trim();

      const prevPageContent = BOOK_CONTENT
         .split('\n\n').at(-1)
         .split('\n')
         .slice(2)
         .join('\n');

      const currentPageIsImageOnly = paragraph.startsWith('!') && paragraph.endsWith(')') && !BOOK_CONTENT.endsWith(')');
      const prevPageIsImageOnly = prevPageContent.startsWith('!') && prevPageContent.endsWith(')') && !paragraph.startsWith('!');
      if (currentPageIsImageOnly || prevPageIsImageOnly) {
         BOOK_CONTENT += '\n' + paragraph;
         return;
      };

      if (index > 0) BOOK_CONTENT += `\n\n## ${title} - Página ${index + 1}\nLibro: ${title}, página ${index + 1}`;
      BOOK_CONTENT += '\n' + paragraph;
   });
   return BOOK_CONTENT;
};

for (const { id, titleId, subTitleId, contentId, authorId } of Documents) {
   if (DocumentIdsIgnored.find(doc => doc === id)) continue;
   let _title = i18n.texts[titleId]?.replace(removeHtmlTags, '');
   const _subtitle = i18n.texts[subTitleId]?.replace(removeHtmlTags, '');
   if (_subtitle) _title += `. ${_subtitle}`;

   const title = `"${_title}"`;
   const content = i18n.texts[contentId];
   let pages = content.split('<pagefeed/>');
   const firstPageIsBookIndex = pages.at(0).match(/<p>.+?p\.\s\d.+?>/);
   if (firstPageIsBookIndex) pages = pages.slice(1);

   let HEADER = `## ${title}\nLibro: ${title}`;
   if (pages.length > 1) HEADER += `, página 1`;

   const startQuest = content.match(/((?<=event:startquest,)\d+)/);
   if (startQuest) {
      const questId = parseInt(startQuest[0]);
      const questNameId = Quests.find(quest => quest.id === questId).nameId;
      const questName = i18n.texts[questNameId];
      HEADER += `\nEn Dofus este libro inicia la misión: "${questName}"`;
   };

   const author = i18n.texts[authorId]?.replace(removeHtmlTags, '').replace(/^Por\s|^Autor\s/i, '');
   if (author) HEADER += `\nAutor: ${author}`;

   const doc = HEADER + GetPagesContent({ title, pages });
   writeFileSync(join(dirname(_filename), `../pages/documents/${id}.md`), doc, { encoding: 'utf-8' });
};
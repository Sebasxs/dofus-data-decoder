import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Documents from '../input/Documents.json' assert {type: 'json'};
import ImageUrls from '../data/documentImages.json' assert {type: 'json'};

export default function () {
   // const json = [];
   const _filename = fileURLToPath(import.meta.url);
   for (const { id, titleId, subTitleId, contentId, authorId } of Documents) {
      /**@type {string} */
      let content = i18n.texts[contentId];
      // const imageIds = content.match(/((?:png|jpg),\d+)/g)?.map(value => {
      //    const [extension, imageId] = value.split(',');
      //    return `${imageId}.${extension}`;
      // });

      // const isEvent = content.match(/((?<=event:)\w+,\d+(?:,-?\d+)?)/g);
      content = content.replace(/<a.+quest.+\/\w+>/g, '').trim();

      const removeHtmlTags = /(<([^>]+)>)/gi;
      const subtitle = i18n.texts[subTitleId]?.replace(removeHtmlTags, '');
      const author = i18n.texts[authorId]?.replace(removeHtmlTags, '').replace(/^Por |^Autor /i, '');
      let title = i18n.texts[titleId]?.replace(removeHtmlTags, '');
      if (subtitle) title += ` (${subtitle})`;

      // const doc = {
      //    id: id,
      //    title: title,
      //    pages: []
      // };

      let markdown = `## ${title}\nDocumento: ${title}`;

      let pages = content.split('<pagefeed/>');
      const firstPageIsBookIndex = pages.at(0).match(/<p>.+?p\.\s\d.+?>/);
      if (firstPageIsBookIndex) pages = pages.slice(1);
      if (pages.length > 1) markdown += `, página 1`;

      if (subtitle) {
         // doc['reference'] = subtitle;
         markdown += `\nReferencia: ${subtitle}`;
      };
      if (author) {
         // doc['author'] = author;
         markdown += `\nAutor: ${author}`;
      };
      pages.forEach((page, index) => {
         let paragraph = page;
         const images = page.match(/(?<=<img.+)((?:png|jpg),\d+)/g);
         if (images) {
            for (const image of images) {
               const [extension, imageId] = image.split(',');
               const imageRef = imageId + '.' + extension;
               const regex = new RegExp(`<img.+${image}.+?>`);
               paragraph = paragraph.replace(regex, `\n![book_image_${imageId}](${ImageUrls[imageRef]})\n`);
            };
         };

         if (index > 0) {
            markdown += `\n## ${title} - Página ${index + 1}\nDocumento: ${title}, página ${index + 1}`;
            if (subtitle) markdown += `\nReferencia: ${subtitle}`;
            if (author) markdown += `\nAutor: ${author}`;
         };

         paragraph = paragraph
            .replace(/<\/p>/g, '\n')
            .replace(removeHtmlTags, '')
            .replace(/(\s?\n\s?)+/g, '\n')
            .trim();

         paragraph = `\n${paragraph}\n`;
         markdown += paragraph;
         // doc['pages'].push(paragraph.trim());
      });
      // if (imageIds) {
      //    doc['imageIds'] = imageIds;
      // };
      // if (isEvent) {
      //    const [type, value] = isEvent[0].split(/(?<=\w+),/);
      //    doc[type] = value
      // };
      // json.push(doc);
      // json.sort((a, b) => a.id - b.id);

      writeFileSync(join(dirname(_filename), `../pages/documents/${id}.md`), markdown, { encoding: 'utf-8' });
   };
   // writeFileSync(join(dirname(_filename), `../output/documents/documents.json`), JSON.stringify(json), { encoding: 'utf-8' });
};
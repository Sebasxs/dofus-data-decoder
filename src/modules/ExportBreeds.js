import DB from './DB.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFile } from 'fs/promises';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Breeds from '../input/Breeds.json' assert {type: 'json'};
import SpellVariants from '../input/SpellVariants.json' assert {type: 'json'};

const BreedIllus = {
   1: "https://cdn.discordapp.com/attachments/1103795819691376721/1103795922716078251/1.png",
   2: "https://cdn.discordapp.com/attachments/1103795819691376721/1103795986746323004/2.png",
   3: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796048268374116/3.png",
   4: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796107441618994/4.png",
   5: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796135635714058/5.png",
   6: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796199728881755/6.png",
   7: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796265684320286/7.png",
   8: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796313553911808/8.png",
   9: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796358302928916/9.png",
   10: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796397901353123/10.png",
   11: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796784955932682/11.png",
   12: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796842996699146/12.png",
   13: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796896604110938/13.png",
   14: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796943026667561/14.png",
   15: "https://cdn.discordapp.com/attachments/1103795819691376721/1103796993442193438/15.png",
   16: "https://cdn.discordapp.com/attachments/1103795819691376721/1103797046038757376/16.png",
   17: "https://cdn.discordapp.com/attachments/1103795819691376721/1103797117299990598/17.png",
   18: "https://cdn.discordapp.com/attachments/1103795819691376721/1103797165505138738/18.png",
   20: "https://cdn.discordapp.com/attachments/1103795819691376721/1103797217497723020/20.png"
};

(async () => {
   const data = {};
   const __filename = fileURLToPath(import.meta.url);
   for (const { id, shortNameId, descriptionId, gameplayClassDescriptionId, breedSpellsId } of Breeds) {
      const spells = [];
      const spellVariants = [];
      for (const id of breedSpellsId) {
         const [spellId, variantId] = SpellVariants.find(item => item.spellIds.at(0) === id).spellIds;
         spells.push(spellId);
         spellVariants.push(variantId);
      };

      const breedName = i18n.texts[shortNameId];
      const description = i18n.texts[descriptionId];
      const gameplay = i18n.texts[gameplayClassDescriptionId]
         .replace(/<title(.|\n)+?subtitle>/g, '')
         .replace(/<li>/g, '• ')
         .replace(/<(sub)?title.*?>/g, '##')
         .replace(/(<([^>]+)>)/gi, '')
         .replace(/\n+/g, '\n')
         .replace(/\n(?=\()/g, ' ')
         .split('##')
         .slice(1)
         .map(skill => {
            return {
               skill: skill.split('\n').at(0),
               description: skill.split('\n').slice(1).join('\n').trim()
            }
         });

      data[id] = {
         name: breedName,
         description: description,
         gameplay: gameplay,
         spells: spells,
         spell_variants: spellVariants
      };

      let markdown = `## ${breedName}\n${description}\n![${breedName}_image](${BreedIllus[id]})`;
      for (const { skill, description } of gameplay) {
         markdown += `\n\n## ${skill}\n${description}`;
      };
      await writeFile(join(dirname(__filename), `../pages/breeds/${id}.md`), markdown, { encoding: 'utf-8' });
   };

   await writeFile(join(dirname(__filename), '../output/breeds/breeds.json'), JSON.stringify(data), { encoding: 'utf-8' });
   DB('dofus_breeds').update(data);
})();
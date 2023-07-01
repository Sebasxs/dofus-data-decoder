import DB from './DB.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFile } from 'fs/promises';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Breeds from '../input/Breeds.json' assert {type: 'json'};
import BreedIllus from '../data/breedIllus.json' assert {type: 'json'};
import SpellVariants from '../input/SpellVariants.json' assert {type: 'json'};

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
         spellVariants: spellVariants
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
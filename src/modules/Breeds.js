import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFile } from 'fs/promises';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Breeds from '../input/Breeds.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import BreedIllus from '../data/breedIllus.json' assert {type: 'json'};
import SpellLevels from '../input/SpellLevels.json' assert {type: 'json'};
import SpellVariants from '../input/SpellVariants.json' assert {type: 'json'};
import DestructSpellStates from './DestructSpellStates.js';
import GetSpellEffects from './SpellEffects.js';

/**@param {Number} spellId */
function getSpellData(spellId) {
   const spell = Spells.find(spell => spell.id === spellId);
   const spellLevelId = spell.spellLevels.at(-1);
   const spellLevel = SpellLevels.find(spell => spell.id === spellLevelId);
   const spellName = i18n.texts[spell.nameId];
   const effects = GetSpellEffects(spellLevel.effects);
   const spellData = {
      apCost: spellLevel.apCost,
      minRange: spellLevel.minRange,
      range: spellLevel.range,
      minPlayerLevel: spellLevel.minPlayerLevel,
      details: {
         castTestLos: spellLevel.castTestLos,
         rangeCanBeBoosted: spellLevel.rangeCanBeBoosted,
         castInLine: spellLevel.castInLine,
         castInDiagonal: spellLevel.castInDiagonal,
         needFreeCell: spellLevel.needFreeCell,
         needTakenCell: spellLevel.needTakenCell,
         maxCastPerTurn: spellLevel.maxCastPerTurn,
         maxCastPerTarget: spellLevel.maxCastPerTarget,
         maxStack: spellLevel.maxStack
      },
      effects: effects
   };
   if (spellLevel.criticalHitProbability) {
      spellData['criticalHitProbability'] = spellLevel.criticalHitProbability;
      spellData['criticalEffects'] = GetSpellEffects(spellLevel.criticalEffect);
   };
   if (!['null', ''].includes(spellLevel.statesCriterion)) {
      spellData['castConditionPaths'] = DestructSpellStates(spellLevel.statesCriterion);
   };

   return {
      spellId: spellId,
      spellLevelId: spellLevelId,
      spellName: spellName,
      spellDescription: i18n.texts[spell.descriptionId].replace(/[{<]+.+?[>}]+/g, ''),
      spellIconId: spell.iconId,
      spellData: spellData
   };
};

export default async function () {
   const json = {};
   const __filename = fileURLToPath(import.meta.url);
   for (const { id, shortNameId, descriptionId, gameplayClassDescriptionId, breedSpellsId } of Breeds) {
      const spellTupleIds = [];
      for (const id of breedSpellsId) {
         const spellTuple = SpellVariants.find(item => item.spellIds.at(0) === id).spellIds;
         spellTupleIds.push(spellTuple);
      };

      const spells = [];
      const spellVariants = [];
      for (const [spellId, variantId] of spellTupleIds) {
         const spellData = getSpellData(spellId);
         spells.push(spellData);
         const variantData = getSpellData(variantId);
         spellVariants.push(variantData);
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

      json[id] = {
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
      markdown += `\n\n## Menú de hechizos\nPuedes ver en detalle todos los hechizos de los ${breedName} y sus variantes usando el siguiente menú:\n<component type={${breedName.toUpperCase()}_SPELLS_MENU}>`;
      await writeFile(join(dirname(__filename), `../output/breeds/${id}.md`), markdown, { encoding: 'utf-8' });
   };

   await writeFile(join(dirname(__filename), '../output/breeds/breeds.json'), JSON.stringify(json), { encoding: 'utf-8' });
   return json;
};
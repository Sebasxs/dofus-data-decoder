import DB from '../src/modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Jobs from '../src/input/Jobs.json' assert {type: 'json'};
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import Recipes from '../src/input/Recipes.json' assert {type: 'json'};
import ItemTypes from '../src/input/ItemTypes.json' assert {type: 'json'};

const PATHS = {};
const ignoreTypes = [226];
for (const { resultId, resultNameId, resultLevel, resultTypeId, ingredientIds, quantities, jobId } of Recipes) {
   if (ignoreTypes.includes(resultTypeId)) continue;
   const typeNameId = ItemTypes.find(type => type.id === resultTypeId).nameId;
   const jobNameId = Jobs.find(job => job.id === jobId).nameId;
   const ingredients = ingredientIds.reduce((acc, cur, i) => {
      acc[cur] = quantities[i];
      return acc;
   }, {});

   PATHS[resultId] = {
      name: i18n.texts[resultNameId],
      type: i18n.texts[typeNameId],
      level: resultLevel,
      job: i18n.texts[jobNameId],
      ingredients: ingredients
   };
};
const _filename = fileURLToPath(import.meta.url);
// writeFileSync(join(dirname(_filename), '../output/recipes/recipes.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
DB('dofus_recipes').update(PATHS).then(() => { console.log('Recipes updated!') });
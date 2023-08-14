import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Jobs from '../input/Jobs.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Recipes from '../input/Recipes.json' assert {type: 'json'};
import ItemTypes from '../input/ItemTypes.json' assert {type: 'json'};

const PATHS = {};
const ignoreTypes = [226];
for (const { resultId, resultNameId, resultLevel, resultTypeId, ingredientIds, quantities, jobId } of Recipes) {
   if (ignoreTypes.includes(resultTypeId)) continue;
   const ingredients = ingredientIds.reduce((acc, cur, i) => {
      PATHS[`dofus_items/${cur}/uses/craft/${resultId}`] = quantities[i];
      acc[cur] = quantities[i];
      return acc;
   }, {});

   PATHS[`dofus_items/${resultId}/obtaining/recipe`] = resultId;

   const typeNameId = ItemTypes.find(type => type.id === resultTypeId).nameId;
   const jobNameId = Jobs.find(job => job.id === jobId).nameId;
   PATHS[`dofus_recipes/${resultId}`] = {
      name: i18n.texts[resultNameId],
      type: i18n.texts[typeNameId],
      level: resultLevel,
      job: i18n.texts[jobNameId],
      ingredients: ingredients
   };
};

DB().update(PATHS).then(() => { console.log('Recipes updated!') });
// const _filename = fileURLToPath(import.meta.url);
// writeFileSync(join(dirname(_filename), '../output/recipes.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
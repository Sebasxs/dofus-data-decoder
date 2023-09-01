import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Items from '../input/Items.json' assert{type: 'json'};
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Effects from '../input/Effects.json' assert{type: 'json'};
import Subareas from '../input/SubAreas.json' assert{type: 'json'};
import ItemTypes from '../input/ItemTypes.json' assert{type: 'json'};
import CriterionValues from '../modules/CriterionValues.js';
import GetEffectDescriptions from '../modules/GetEffectDescriptions.js';

function GetRecyclingSubareas(favoriteRecyclingSubareas) {
   return favoriteRecyclingSubareas.reduce((acc, cur) => {
      const subarea = Subareas.find(subarea => subarea.id === cur);
      if (subarea) acc[cur] = i18n.texts[subarea.nameId];
      return acc;
   }, {});
};

function GetResourcesBySubarea(resourcesBySubarea) {
   const output = {};
   for (const [subareaId, quantity] of resourcesBySubarea) {
      output[subareaId] = quantity;
   };
   return output;
};

function GetEffects(effects) {
   if (!effects.length) return null;
   return effects
      .filter(effect => {
         const { diceNum, diceSide, value, effectId } = effect;
         const descriptionId = Effects.find(e => e.id === effectId).descriptionId;
         return effect.visibleInTooltip && (descriptionId || diceNum || diceSide || value);
      })
      .map(effect => GetEffectDescriptions(effect));
};

const filename = fileURLToPath(import.meta.url);
for (const item of Items) {
   const { id, nameId, descriptionId, typeId, itemSetId } = item;
   if (typeId === 203) continue;
   const { favoriteRecyclingSubareas, resourcesBySubarea, craftConditional } = item;
   const type = ItemTypes.find(type => type.id === typeId);

   const PATHS = {};
   PATHS[`dofus_items/${id}/name`] = i18n.texts[nameId];
   PATHS[`dofus_items/${id}/type`] = i18n.texts[type.nameId];
   PATHS[`dofus_items/${id}/description`] = i18n.texts[descriptionId].replace(/\n+/g, '\n');
   PATHS[`dofus_items/${id}/icon_id`] = item.iconId;
   PATHS[`dofus_items/${id}/type_id`] = typeId;
   PATHS[`dofus_items/${id}/set_id`] = (itemSetId > 0) ? itemSetId : null;
   PATHS[`dofus_items/${id}/pods`] = item.realWeight;
   PATHS[`dofus_items/${id}/level`] = item.level;
   PATHS[`dofus_items/${id}/exchangeable`] = item.exchangeable;
   PATHS[`dofus_items/${id}/favorite_recycling_subareas`] = GetRecyclingSubareas(favoriteRecyclingSubareas);
   PATHS[`dofus_items/${id}/details`] = {
      min_range: item.minRange || null,
      max_range: item.range || null,
      ap_cost: item.apCost || null,
      cast_in_diagonal: item.castInDiagonal || null,
      cast_in_line: item.castInLine || null,
      line_of_sight: item.castTestLos || null,
      max_cast_per_turn: item.maxCastPerTurn || null,
      is_legendary: item.isLegendary || null,
      is_colorable: item.isColorable || null,
      critical_hit_probability: item.criticalHitProbability || null,
      critical_hit_bonus: item.criticalHitBonus || null,
      etheral: item.etheral || null,
   };
   PATHS[`dofus_items/${id}/resources_by_subarea`] = GetResourcesBySubarea(resourcesBySubarea);
   PATHS[`dofus_items/${id}/craft_conditional`] = CriterionValues({ startCriterion: craftConditional });
   PATHS[`dofus_items/${id}/criteria`] = CriterionValues({ startCriterion: item.criteria });
   PATHS[`dofus_items/${id}/effects`] = GetEffects(item.possibleEffects);

   await DB().update(PATHS).finally(() => { console.log(`Item ${id} updated!`) });
};

// writeFileSync(join(dirname(filename), '../output/items.json'), JSON.stringify(PATHS));
console.log('All items were updated!');
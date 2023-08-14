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
   for (const [resourceId, quantity] of resourcesBySubarea) {
      output[resourceId] = quantity;
   };
   return output;
};

function GetCriteria(criteria) {

   return {};
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
const PATHS = {};
for (const item of Items) {
   const { id, nameId, descriptionId, typeId, itemSetId } = item;
   if (typeId === 203) continue;
   const { favoriteRecyclingSubareas, resourcesBySubarea, craftConditional } = item;
   const type = ItemTypes.find(type => type.id === typeId);

   PATHS[id] = {
      name: i18n.texts[nameId],
      type: i18n.texts[type.nameId],
      description: i18n.texts[descriptionId].replace(/\n+/g, '\n'),
      icon_id: item.iconId,
      set_id: (itemSetId > 0) ? itemSetId : null,
      pods: item.realWeight,
      level: item.level,
      exchangeable: item.exchangeable,
      favorite_recycling_subareas: GetRecyclingSubareas(favoriteRecyclingSubareas),
      details: {
         min_range: item.minRange,
         max_range: item.range,
         ap_cost: item.apCost,
         cast_in_diagonal: item.castInDiagonal,
         cast_in_line: item.castInLine,
         line_of_sight: item.castTestLos,
         max_cast_per_turn: item.maxCastPerTurn,
         is_legendary: item.isLegendary,
         is_colorable: item.isColorable,
         critical_hit_probability: item.criticalHitProbability,
         critical_hit_bonus: item.criticalHitBonus,
         etheral: item.etheral,
      },
      resources_by_subarea: GetResourcesBySubarea(resourcesBySubarea),
      craft_conditional: CriterionValues({ startCriterion: craftConditional }),
      criteria: GetCriteria(item.criteria),
      effects: GetEffects(item.possibleEffects),
   };
};

writeFileSync(join(dirname(filename), '../output/items.json'), JSON.stringify(PATHS));
// DB().update(PATHS).finally(() => { console.log('Items updated!') });
console.log('Items updated!');
import DB from '../modules/DB.js';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import GetEffectDescriptions from '../modules/GetEffectDescriptions.js';
import SpellStates from '../input/SpellStates.json' assert {type: 'json'};
import SpellLevels from '../input/SpellLevels.json' assert {type: 'json'};

function GetStateCombinations(groups) {
   let combinations = [[]];
   for (let i = 0; i < groups.length; i++) {
      const currentArray = groups[i];
      let tempCombinations = [];
      for (let j = 0; j < currentArray.length; j++) {
         const currentElement = currentArray[j];
         for (let k = 0; k < combinations.length; k++) {
            const currentCombination = combinations[k];
            tempCombinations.push([...currentCombination, currentElement]);
         };
      };
      combinations = tempCombinations;
   };
   return combinations;
};

function GetStateNames(stateArray) {
   return stateArray.map(state => {
      const stateId = parseInt(state.replace(/\D+/, ''));
      const stateNameId = SpellStates.find(state => state.id === stateId)?.nameId;
      if (!stateNameId) return 'undefined';
      return i18n.texts[stateNameId].replace(/{.+?>|<.+?}/g, '');
   });
};

/**@param {String} expression */
function GetCastConditions(expression) {
   if (['null', ''].includes(expression)) return null;
   let nonGroupedExpression = expression
      .replace(/\(((HS[=!]\d+\|)+)(HS[=!]\d+)\)/g, '')
      .replace(/[()]/g, '')
      .replace(/^&|&$/g, '')
      .split('|');

   const groupsToCombine = [];
   if (nonGroupedExpression) groupsToCombine.push(nonGroupedExpression);
   const disjuntiveGroups = expression.match(/\(((HS[=!]\d+\|)+)(HS[=!]\d+)\)/g);
   if (disjuntiveGroups) {
      disjuntiveGroups.forEach(group => {
         const states = group.replace(/[^HS=!0-9\|]/g, '').split('|');
         groupsToCombine.push(states);
      });
   };

   const combinations = GetStateCombinations(groupsToCombine);
   return combinations.map(combination => {
      const states = combination.join('&').split('&');
      const requiredStateExpressions = states.filter(state => state.includes('='));
      const forbiddenStateExpressions = states.filter(state => state.includes('!'));
      const requiredStates = GetStateNames(requiredStateExpressions);
      const forbiddenStates = GetStateNames(forbiddenStateExpressions);
      return { requiredStates, forbiddenStates };
   });
};

function GetSpellEffects(effects) {
   if (!effects.length) return null;
   return effects
      .filter(effect => effect.visibleInTooltip)
      .map(effect => GetEffectDescriptions(effect));
};

const PATHS = {};
for (const { id, nameId, descriptionId, iconId, spellLevels } of Spells) {
   const spellLevelId = spellLevels.at(-1);
   const spellLevel = SpellLevels.find(spellLevel => spellLevel.id === spellLevelId);
   const description = i18n.texts[descriptionId]?.replace(/[{<]+.+?[>}]+/g, '') || null;

   PATHS[`dofus_spells/${id}/name`] = i18n.texts[nameId];
   PATHS[`dofus_spells/${id}/description`] = description;
   PATHS[`dofus_spells/${id}/icon_id`] = iconId;
   PATHS[`dofus_spells/${id}/level_id`] = spellLevelId;
   PATHS[`dofus_spells/${id}/ap_cost`] = spellLevel.apCost;
   PATHS[`dofus_spells/${id}/range`] = spellLevel.range;
   PATHS[`dofus_spells/${id}/min_range`] = spellLevel.minRange;
   PATHS[`dofus_spells/${id}/min_player_level`] = spellLevel.minPlayerLevel;
   PATHS[`dofus_spells/${id}/effects`] = GetSpellEffects(spellLevel.effects);
   PATHS[`dofus_spells/${id}/cast_condition_paths`] = GetCastConditions(spellLevel.statesCriterion);
   PATHS[`dofus_spells/${id}/critical_effects`] = GetSpellEffects(spellLevel.criticalEffect);
   PATHS[`dofus_spells/${id}/details`] = {
      line_of_sight: spellLevel.castTestLos,
      range_can_be_boosted: spellLevel.rangeCanBeBoosted,
      cast_in_line: spellLevel.castInLine,
      cast_in_diagonal: spellLevel.castInDiagonal,
      need_free_cell: spellLevel.needFreeCell,
      need_taken_cell: spellLevel.needTakenCell,
      max_cast_per_turn: spellLevel.maxCastPerTurn,
      max_cast_per_target: spellLevel.maxCastPerTarget,
      max_stack: spellLevel.maxStack,
      critical_hit_probability: spellLevel.criticalHitProbability
   };
};

DB().update(PATHS).then(() => { console.log('Spells updated.') });
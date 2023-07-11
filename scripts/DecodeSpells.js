import DB from '../modules/DB.js';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import EFFECT_ZONE_PATTERNS from '../data/effectZonePatterns.js';
import Effects from '../input/Effects.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
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
      .replace(/\(((HS[=!]\d+\|)+)(HS[=!]\d+)\)|[()]|^&|&$/g, '')
      .split('|');

   const groupsToCombine = [nonGroupedExpression];
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

function SetDescriptionValues(description, v1, v2, v3) {
   const values = { '#1': v1, '#2': v2, '#3': v3 };
   if (description === '#1' || description.includes('hechizo ')) {
      let refValue = '#1';
      const refValueMatched = description.match(/(?<=hechizo )#\d/)?.at(0);
      if (refValueMatched) refValue = refValueMatched;
      const spellId = values[refValue];
      const spellNameId = Spells.find(spell => spell.id === spellId)?.nameId || 11665;
      const spellName = i18n.texts[spellNameId];
      description = description.replace(refValue, spellName);
   } else if (description.toLowerCase().includes('invoca')) {
      const refValue = description.match(/(?<=invoca.*:\s)#\d/gi)?.at(0);
      if (refValue) {
         const monsterId = values[refValue];
         const monsterNameId = Monsters.find(monster => monster.id === monsterId)?.nameId || 11665;
         const monsterName = i18n.texts[monsterNameId];
         description = description.replace(refValue, monsterName);
      };
   } else if (description.toLowerCase().includes('estado')) {
      const refValue = description.match(/(?<=estado\s«?)#\d+/gi)?.at(0);
      if (refValue) {
         const spellStateId = values[refValue];
         const spellStateNameId = SpellStates.find(spellState => spellState.id === spellStateId)?.nameId || 11665;
         const spellStateName = i18n.texts[spellStateNameId];
         description = description.replace(refValue, `${spellStateName}`);
      };
   };

   if (v2 === 0) description = description.replace(/{~1~2\sa -?}#2/g, '');
   else description = description.replace(/{~1~2/g, '').replace('}#2', v2);

   return description
      .replace('#1', v1)
      .replace('#2', v2)
      .replace('#3', v3)
      .replace(/[{<]+.+?[>}]+/g, '');
};

function FormatEffectZone(rawZone) {
   if (['P1', 'A1'].includes(rawZone) || rawZone.match(/[a-z]/)) return null;
   const type = rawZone.match(/\D+/)?.at(0);
   const size = rawZone.split(',').at(0).match(/\d+/)?.at(0);
   if (size > 1) return `${EFFECT_ZONE_PATTERNS[type]} de ${size} casillas`;
   return `${EFFECT_ZONE_PATTERNS[type]} de 1 casilla`;
};

function GetSpellEffects(effects) {
   if (!effects.length) return null;
   return effects
      .filter(effect => effect.visibleInTooltip)
      .map(effect => {
         const { diceNum: v1, diceSide: v2, value: v3 } = effect;

         let duration = '';
         if (effect.duration === 1) duration = ' (1 turno)';
         else if (effect.duration > 0) duration = ` (${effect.duration} turnos)`;

         const descriptionId = Effects.find(e => e.id === effect.effectId).descriptionId;
         const description = i18n.texts[descriptionId];

         let result = SetDescriptionValues(description, v1, v2, v3) + duration;
         const effectZone = FormatEffectZone(effect.rawZone);

         if (effectZone) result += `\n> ${effectZone}`;
         return result;
      });
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
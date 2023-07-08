import DB from './src/modules/DB.js';
import GetSpellEffects from './src/modules/GetSpellEffects.js';
import i18n from './src/input/i18n_es.json' assert {type: 'json'};
import Spells from './src/input/Spells.json' assert {type: 'json'};
import GetCastConditions from './src/modules/GetSpellCastConditions.js';
import SpellLevels from './src/input/SpellLevels.json' assert {type: 'json'};

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
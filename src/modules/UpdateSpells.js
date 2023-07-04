import DB from './DB.js';
import GetSpellEffects from './GetSpellEffects.js';
import GetCastConditions from './GetSpellCastConditions.js';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import SpellLevels from '../input/SpellLevels.json' assert {type: 'json'};

const data = {};
for (const { id, nameId, descriptionId, iconId, spellLevels } of Spells) {
   const spellLevelId = spellLevels.at(-1);
   const spellLevel = SpellLevels.find(spellLevel => spellLevel.id === spellLevelId);
   const spellName = i18n.texts[nameId];
   const effects = GetSpellEffects(spellLevel.effects);
   const details = {
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

   data[id] = {
      level_id: spellLevelId,
      name: spellName,
      description: i18n.texts[descriptionId]?.replace(/[{<]+.+?[>}]+/g, '') || null,
      icon_id: iconId,
      effects: effects,
      ap_cost: spellLevel.apCost,
      min_range: spellLevel.minRange,
      range: spellLevel.range,
      min_player_level: spellLevel.minPlayerLevel,
      details: details,
      cast_condition_paths: GetCastConditions(spellLevel.statesCriterion),
      critical_effects: GetSpellEffects(spellLevel.criticalEffect)
   };
};

DB('dofus_spells').update(data).then(() => { console.log('Spells updated.') });
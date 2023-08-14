import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Items from '../input/Items.json' assert{type: 'json'};
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Spells from '../input/Spells.json' assert{type: 'json'};
import Monsters from '../input/Monsters.json' assert{type: 'json'};
import Subareas from '../input/SubAreas.json' assert{type: 'json'};
import Races from '../input/MonsterRaces.json' assert{type: 'json'};
import Challenges from '../input/Challenges.json' assert{type: 'json'};

const PATHS = {};

function GetStats(grades) {
   const grade = grades.at(-1);
   return {
      level: grade.level,
      life_points: grade.lifePoints,
      action_points: grade.actionPoints,
      movement_points: grade.movementPoints,
      pa_dodge: grade.paDodge,
      pm_dodge: grade.pmDodge,
      wisdom: grade.wisdom,
      damage_reflect: grade.damageReflect,
      strength: grade.strength,
      intelligence: grade.intelligence,
      chance: grade.chance,
      agility: grade.agility
   };
};

function GetResistances(grades) {
   const grade = grades.at(-1);
   return {
      earth: grade.earthResistance,
      air: grade.airResistance,
      fire: grade.fireResistance,
      water: grade.waterResistance,
      neutral: grade.neutralResistance
   };
};

function GetSubareas(subareas) {
   return subareas.reduce((acc, cur) => {
      const subarea = Subareas.find(subarea => subarea.id === cur);
      acc[cur] = i18n.texts[subarea.nameId];
      return acc;
   }, {});
};

function GetSpells(spells) {
   return spells.reduce((acc, cur) => {
      const spell = Spells.find(spell => spell.id === cur);
      if (spell) acc[cur] = i18n.texts[spell.nameId];
      return acc;
   }, {});
};

function GetIncompatibleChallenges(incompatibleChallenges) {
   return incompatibleChallenges.reduce((acc, cur) => {
      const challenge = Challenges.find(chal => chal.id === cur);
      if (challenge) acc[cur] = i18n.texts[challenge.nameId];
      return acc;
   }, {});
};

function GetDrops(monsterId, drops) {
   return drops
      .filter(drop => Items.find(item => item.id === drop.objectId))
      .map(({ objectId, percentDropForGrade5, hasCriteria }) => {
         const item = Items.find(item => item.id === objectId);
         PATHS[`dofus_items/${objectId}/obtaining/monsters/${monsterId}`] = percentDropForGrade5;
         return {
            item_id: objectId,
            item_name: i18n.texts[item.nameId],
            probability: percentDropForGrade5,
            has_criteria: hasCriteria
         };
      });
};

for (const monster of Monsters) {
   const { id, nameId, race: raceId, look, grades, isBoss, drops } = monster;
   const { subareas, spells, favoriteSubareaId, isMiniBoss, isQuestMonster } = monster;
   const { correspondingMiniBossId, canTackle, canBePushed, canSwitchPos } = monster;
   const { canBeCarried, canUsePortal, incompatibleChallenges } = monster;

   const race = Races.find(race => race.id === raceId);
   if (!race) continue;
   let lookId = parseInt(look.match(/(?<={)\d+/)[0]);
   const favoriteSubarea = Subareas.find(subarea => subarea.id === favoriteSubareaId);
   const correspondingMonsterId = Monsters.find(m => m.correspondingMiniBossId === id)?.id;

   PATHS[`dofus_monsters/${id}`] = {
      name: i18n.texts[nameId],
      race: i18n.texts[race.nameId],
      race_id: raceId,
      image_id: (lookId === 1) ? -id : lookId,
      stats: GetStats(grades),
      resistances: GetResistances(grades),
      is_boss: isBoss,
      subareas: GetSubareas(subareas),
      favorite_subarea: favoriteSubarea ? i18n.texts[favoriteSubarea.nameId] : null,
      is_quest_monster: isQuestMonster,
      can_tackle: canTackle,
      can_be_pushed: canBePushed,
      can_switch_pos: canSwitchPos,
      can_be_carried: canBeCarried,
      can_use_portal: canUsePortal,
      is_mini_boss: isMiniBoss,
      corresponding_monster_id: correspondingMonsterId || null,
      corresponding_mini_boss_id: correspondingMiniBossId || null,
      spells: GetSpells(spells),
      incompatible_challenges: GetIncompatibleChallenges(incompatibleChallenges),
      drops: GetDrops(id, drops)
   };
};

const filename = fileURLToPath(import.meta.url);
writeFileSync(join(dirname(filename), '../output/monsters.json'), JSON.stringify(PATHS));
DB().update(PATHS).then(() => { console.log('Monsters updated!') });
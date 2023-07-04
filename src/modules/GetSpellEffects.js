import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import Effects from '../input/Effects.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
import SpellStates from '../input/SpellStates.json' assert {type: 'json'};

function SetDescriptionValues(description, v1, v2, v3) {
   const values = {
      '#1': v1,
      '#2': v2,
      '#3': v3
   };

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
   if (v2 === 0) {
      description = description.replace(/{~1~2\sa -?}#2/g, '');
   } else {
      description = description.replace(/{~1~2/g, '').replace('}#2', v2);
   };
   return description
      .replace('#1', v1)
      .replace('#2', v2)
      .replace('#3', v3)
      .replace(/[{<]+.+?[>}]+/g, '');
};

function FormatEffectZone(rawZone) {
   const patterns = {
      A: 'Infinito',
      B: 'Búmerang',
      C: 'Círculo',
      F: 'Cono',
      G: 'Cuadrado',
      L: 'Línea',
      O: 'Anillo',
      P: 'Una casilla',
      Q: 'Cruz',
      R: 'Línea',
      T: 'Línea perpendicular',
      U: 'Semicírculo',
      V: 'Cono',
      W: 'Cuadrado sin diagonal',
      X: 'Cruz',
      '#': 'Cruz en diagonal',
      '/': 'Reparto diagonal',
      '-': 'Diagonal',
      '+': 'Cruz en diagonal',
      '*': 'Estrella'
   };

   if (['P1', 'A1'].includes(rawZone) || rawZone.match(/[a-z]/)) return null;
   const type = rawZone.match(/\D+/)?.at(0);
   const size = rawZone.split(',').at(0).match(/\d+/)?.at(0);
   if (size > 1) {
      return `${patterns[type]} de ${size} casillas`;
   };
   return `${patterns[type]} de 1 casilla`;
};

export default function (effects) {
   if (!effects.length) return null;
   return effects
      .filter(effect => effect.visibleInTooltip)
      .map(effect => {
         const v1 = effect.diceNum;
         const v2 = effect.diceSide;
         const v3 = effect.value;
         let duration = '';
         if (effect.duration > 0) {
            duration = effect.duration === 1
               ? ` (1 turno)`
               : ` (${effect.duration} turnos)`;
         };
         const descriptionId = Effects.find(e => e.id === effect.effectId).descriptionId;
         const description = i18n.texts[descriptionId];
         let result = SetDescriptionValues(description, v1, v2, v3) + duration;
         const effectZone = FormatEffectZone(effect.rawZone);
         if (effectZone) result += `\n> ${effectZone}`;
         return result;
      });
};
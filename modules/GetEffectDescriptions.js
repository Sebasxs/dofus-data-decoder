import QuestObjectiveData from './QuestObjectiveData.js';
import Items from '../input/Items.json' assert{type: 'json'};
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Quests from '../input/Quests.json' assert{type: 'json'};
import Titles from '../input/Titles.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import Effects from '../input/Effects.json' assert{type: 'json'};
import EFFECT_ZONE_PATTERNS from '../data/effectZonePatterns.js';
import Monsters from '../input/Monsters.json' assert{type: 'json'};
import Emoticons from '../input/Emoticons.json' assert{type: 'json'};
import ItemTypes from '../input/ItemTypes.json' assert{type: 'json'};
import Documents from '../input/Documents.json' assert {type: 'json'};
import QuestSteps from '../input/QuestSteps.json' assert{type: 'json'};
import Alterations from '../input/Alterations.json' assert{type: 'json'};
import SpellLevels from '../input/SpellLevels.json' assert {type: 'json'};
import SmileyPacks from '../input/SmileyPacks.json' assert {type: 'json'};
import FinishMoves from '../input/FinishMoves.json' assert {type: 'json'};
import InfoMessages from '../input/InfoMessages.json' assert {type: 'json'};
import HavenbagThemes from '../input/HavenbagThemes.json' assert {type: 'json'};
import QuestObjectives from '../input/QuestObjectives.json' assert{type: 'json'};

function FormatEffectZone(rawZone) {
   if (['P1', 'A1'].includes(rawZone) || rawZone.match(/[a-z]/)) return '';
   const type = rawZone.match(/\D+/)?.at(0);
   const size = rawZone.split(',').at(0).match(/\d+/)?.at(0);
   if (!size) return '';
   if (size > 1) return `${EFFECT_ZONE_PATTERNS[type]} de ${size} casillas`;
   return `${EFFECT_ZONE_PATTERNS[type]} de 1 casilla`;
};

function ReplaceVariables(description, diceNum, diceSide, value) {
   if (diceSide === 0) description = description.replace(/{~1~2\sa -?}#2/g, '');
   else description = description.replace(/{~1~2/g, '').replace('}#2', diceSide);

   return description
      .replace('#1', diceNum)
      .replace('#2', diceSide)
      .replace('#3', value)
      .replace('#4', '{nombre}')
      .replace(/[{<]+.+?[>}]+/g, '')
      .replace(/\n+/g, ' ');
};

export default function (effect) {
   const { diceNum, diceSide, value, effectId } = effect;
   const EffectData = Effects.find(effect => effect.id === effectId);
   const compatibleItemTypes = [1179, 973];
   const ignoreEffectIds = [350, 805, 808, 974, 1161, 1169, 2882];
   const spellEffectIds = [281, 282, 283, 285, 286, 287, 288, 289, 290, 291, 293, 297];

   const description = i18n.texts[EffectData.descriptionId];
   let result = description;

   if (ignoreEffectIds.includes(effectId)) {
      return null;
   } else if (spellEffectIds.includes(effectId)) {
      const spell = Spells.find(spell => spell.id === diceNum);
      if (!spell) return null;
      const spellName = i18n.texts[spell.nameId];
      result = ReplaceVariables(description, spellName, diceSide, value);
   } else if (compatibleItemTypes.includes(effectId)) {
      const type = ItemTypes.find(type => type.id === value);
      if (!type) return null;
      const typeName = i18n.texts[type.nameId];
      result = `Compatible con ${typeName}`;
   } else if (effectId === 10) {
      const emote = Emoticons.find(emote => emote.id === diceNum);
      if (!emote) return null;
      const emoteName = i18n.texts[emote.nameId];
      result = `Actitud: ${emoteName}`;
   } else if (effectId === 30) {
      const { typeId, parameters, stepId } = QuestObjectives.find(objective => objective.id === value);
      const questId = QuestSteps.find(step => step.id === stepId).questId;
      const quest = Quests.find(quest => quest.id === questId);
      const questName = i18n.texts[quest.nameId];
      const objectiveText = QuestObjectiveData({ typeId, parameters }).text;
      result = `Valida el objetivo «${objectiveText}» de la misión *${questName}*`;
   } else if (effectId === 192) {
      const item = Items.find(item => item.id === diceNum);
      if (!item) return null;
      const itemName = i18n.texts[item.nameId];
      result = `Pierdes «${itemName}»`;
   } else if (effectId === 193) {
      const item = Items.find(item => item.id === diceNum);
      if (!item) return null;
      const itemName = i18n.texts[item.nameId];
      result = `Recibes «${itemName}»`;
   } else if (effectId === 197) {
      const monster = Monsters.find(monster => monster.id === diceNum);
      if (!monster) return null;
      const monsterName = i18n.texts[monster.nameId];
      result = ReplaceVariables(description, monsterName, diceSide, value);
   } else if (effectId === 237) {
      const spell = Spells.find(spell => spell.id === diceSide);
      if (!spell) return null;
      const spellName = i18n.texts[spell.nameId];
      result = `Lanza la animación de ${spellName}`
   } else if (effectId === 604) {
      const spellLevel = SpellLevels.find(level => level.id === value);
      if (!spellLevel) return null;
      const spell = Spells.find(spell => spell.id === spellLevel.spellId);
      const spellName = i18n.texts[spell.nameId];
      result = `Aprende el hechizo ${spellName}`;
   } else if (effectId === 620) {
      const titleId = Documents.find(doc => doc.id === value).titleId;
      const documentTitle = i18n.texts[titleId];
      result = `Consultar «${documentTitle}»`;
   } else if (effectId === 621) {
      const monster = Monsters.find(monster => monster.id === diceSide);
      if (!monster) return null;
      const monsterName = i18n.texts[monster.nameId];
      result = `Invoca el monstruo: ${monsterName} (grado ${diceNum})`;
   } else if (effectId === 630) {
      const message = InfoMessages.find(message => message.messageId === value);
      if (!message) return null;
      const messageText = i18n.texts[message.textId];
      result = `Muestra el mensaje: \"${messageText}\"`;
   } else if (effectId === 724) {
      const title = Titles.find(title => title.id === diceNum);
      if (!title) return null;
      const titleNameMale = i18n.texts[title.nameMaleId];
      const titleNameFemale = i18n.texts[title.nameFemaleId];
      if (titleNameMale === titleNameFemale) {
         result = ReplaceVariables(description, diceNum, diceSide, titleNameMale);
      } else {
         const inclusiveTitle = `«${titleNameMale}» o «${titleNameFemale}»`;
         result = ReplaceVariables(description, diceNum, diceSide, inclusiveTitle);
      };
   } else if (effectId === 814) {
      const item = Items.find(item => item.id === diceNum);
      result = i18n.texts[item.nameId];
   } else if (effectId === 983) {
      if (value === 0) result = 'No intercambiable';
      else result = `Intercambiable en ${value} días`;
   } else if (effectId === 1154) {
      result = `Módulo de prisma: Teleportación`;
   } else if (effectId === 1175) {
      const spell = Spells.find(spell => spell.id === diceNum);
      if (!spell) return null;
      result = i18n.texts[spell.descriptionId];
   } else if (effectId === 1177) {
      result = `Teleporta al futuro (Xelorium)`;
   } else if (effectId === 1178) {
      result = `Teleporta al pasado (Xelorium)`;
   } else if (effectId === 1185) {
      result = `Reinicia los efectos de un objeto de nivel inferior o igual a ${value}`;
   } else if (effectId === 2021) {
      result = `Distribuye ${diceNum}% de las pepitas al jugador y ${diceSide}% a la alianza`;
   } else if (effectId === 2030) {
      const move = FinishMoves.find(move => move.id === value);
      if (!move) return null;
      const moveName = i18n.texts[move.nameId];
      result = `Aprende: ${moveName}`;
   } else if (effectId === 2031) {
      const havenbag = HavenbagThemes.find(havenbag => havenbag.id === value);
      if (!havenbag) return null;
      const havenbagName = i18n.texts[havenbag.nameId];
      result = `Merkasako: ${havenbagName}`;
   } else if (effectId === 2797) {
      const smiley = SmileyPacks.find(smiley => smiley.id === value);
      if (!smiley) return null;
      const smileyName = i18n.texts[smiley.nameId];
      result = `Pack de emoticonos: ${smileyName}`;
   } else if (effectId === 2826) {
      result = `Densidad: ${value}`;
   } else if (effectId === 2827) {
      result = `${value}% de probabilidades de éxito`;
   } else if (effectId === 2833) {
      result = `Expira en ${value} minutos`;
   } else if (effectId === 2875) {
      const spell = Spells.find(spell => spell.id === value);
      if (!spell) return null;
      const spellName = i18n.texts[spell.nameId];
      result = ReplaceVariables(description, diceNum, diceSide, spellName);
   } else if (effectId === 2892) {
      const alteration = Alterations.find(alteration => alteration.id === diceNum);
      const alterationName = i18n.texts[alteration.nameId];
      result = `Agrega la alteración: ${alterationName}`;
   } else if (effectId === 2893) {
      const alteration = Alterations.find(alteration => alteration.id === diceNum);
      const alterationName = i18n.texts[alteration.nameId];
      result = `Quita la alteración: ${alterationName}`;
   };

   if (!result) return null;
   const effectZone = FormatEffectZone(effect.rawZone);
   if (effectZone) result += `\n> ${effectZone}`;

   let duration = '';
   if (effect.duration === 1) duration = ' (1 turno)';
   else if (effect.duration > 0) duration = ` (${effect.duration} turnos)`;

   return ReplaceVariables(result, diceNum, diceSide, value) + duration;
};
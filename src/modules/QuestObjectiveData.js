import Npcs from '../input/Npcs.json' assert {type: 'json'};
import Items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

function ObjectiveType0(param) {
   const text = i18n.texts[param.parameter0];
   return {
      text: text,
   };
};

function ObjectiveType1(param) {
   const npcNameId = Npcs.find(npc => npc.id === param.parameter0).nameId;
   const npcName = i18n.texts[npcNameId];
   const text = `Ve a ver a ${npcName}`;
   return {
      text: text,
      npc: param.parameter0,
   };
};

function ObjectiveType2(param) {
   const npcNameId = Npcs.find(npc => npc.id === param.parameter0).nameId;
   const npcName = i18n.texts[npcNameId];
   const item = Items.find(item => item.id === param.parameter1);
   const itemListed = item.exchangeable;
   const itemName = i18n.texts[item.nameId];
   const text = `Enséñale a ${npcName}: ${param.parameter2} x ${itemName}`;
   return {
      text: text,
      npc: param.parameter0,
      item: itemListed ? { id: param.parameter1, quantity: param.parameter2 } : null
   };
};

function ObjectiveType3(param) {
   const npcNameId = Npcs.find(npc => npc.id === param.parameter0).nameId;
   const npcName = i18n.texts[npcNameId];
   const item = Items.find(item => item.id === param.parameter1);
   const itemListed = item.exchangeable;
   const itemName = i18n.texts[item.nameId];
   const text = `Entrégale a ${npcName}: ${param.parameter2} x ${itemName}`;
   return {
      text: text,
      npc: param.parameter0,
      item: itemListed ? { id: param.parameter1, quantity: param.parameter2 } : null
   };
};

function ObjectiveType4(param) {
   const mapName = i18n.texts[param.parameter0];
   const text = `Descubre el mapa: ${mapName}`;
   return {
      text: text
   };
};

function ObjectiveType5(param) {
   const subareaNameId = SubAreas.find(sa => sa.id === param.parameter0).nameId;
   const subareaName = i18n.texts[subareaNameId];
   const text = `Explora la zona ${subareaName}`;
   return {
      text: text
   };
};

function ObjectiveType6(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Vence a ${param.parameter1} x ${monsterName} en un solo combate`;
   return {
      text: text
   };
};

function ObjectiveType9(param) {
   const npcNameId = Npcs.find(npc => npc.id === param.parameter0).nameId;
   const npcName = i18n.texts[npcNameId];
   const text = `Vuelve a ver a ${npcName}`;
   return {
      text: text,
      npc: param.parameter0
   };
};

function ObjectiveType10(param) {
   const name = i18n.texts[param.parameter0];
   const text = `Escolta a ${name}`;
   return {
      text: text
   };
};

function ObjectiveType12(param) {
   const npcNameId = Npcs.find(npc => npc.id === param.parameter0).nameId;
   const npcName = i18n.texts[npcNameId];
   const monster = Monsters.find(monster => monster.id === param.parameter1);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Lleva ${param.parameter2} alma(s) de ${monsterName} a ${npcName}`;
   return {
      text: text,
      npc: param.parameter0
   };
};

function ObjectiveType14(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Vence ${param.parameter1} x ${monsterName}`;
   return {
      text: text
   };
};

function ObjectiveType16(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const mapId = param.parameter2;
   const map = MapPositions.find(map => parseInt(map.id) === mapId);
   const mapName = map.nameId !== 0 ? ` (${i18n.texts[map.nameId]})` : '';
   const text = `Vence a ${param.parameter1} x ${monsterName} en el mapa [${map.posX},${map.posY}]${mapName} en un solo combate`;
   return {
      text: text
   };
};

function ObjectiveType17(param) {
   const itemNameId = Items.find(item => item.id === param.parameter0).nameId;
   const itemName = i18n.texts[itemNameId];
   const text = `Fabrica ${param.parameter1} ${itemName} y cierra la interfaz`;
   return {
      text: text
   };
};

export default function (typeId, parameters) {
   const objectiveTypes = {
      0: ObjectiveType0,
      1: ObjectiveType1,
      2: ObjectiveType2,
      3: ObjectiveType3,
      4: ObjectiveType4,
      5: ObjectiveType5,
      6: ObjectiveType6,
      9: ObjectiveType9,
      10: ObjectiveType10,
      12: ObjectiveType12,
      14: ObjectiveType14,
      16: ObjectiveType16,
      17: ObjectiveType17
   };

   return objectiveTypes[typeId](parameters);
}
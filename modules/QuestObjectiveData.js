import Npcs from '../input/Npcs.json' assert {type: 'json'};
import Items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Monsters from '../input/Monsters.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};

function ObjectiveType0(param) {
   const text = i18n.texts[param.parameter0];
   return { text, exchangeableItem: {} };
};

function ObjectiveType1(param) {
   const npcId = param.parameter0;
   const npcNameId = Npcs.find(npc => npc.id === npcId).nameId;
   const npcName = i18n.texts[npcNameId];
   const text = `Ve a ver a ${npcName}`;
   return { text, npcId, exchangeableItem: {} };
};

function ObjectiveType2(param) {
   const npcId = param.parameter0;
   const npcNameId = Npcs.find(npc => npc.id === npcId).nameId;
   const npcName = i18n.texts[npcNameId];
   const itemId = param.parameter1;
   const item = Items.find(item => item.id === itemId);
   const itemName = i18n.texts[item.nameId];
   const itemQuantity = param.parameter2;
   const text = `Enséñale a ${npcName}: ${itemQuantity} x ${itemName}`;
   const exchangeableItem = item.exchangeable ? { itemId, itemQuantity } : {};
   return { text, npcId, exchangeableItem };
};

function ObjectiveType3(param) {
   const npcId = param.parameter0;
   const npcNameId = Npcs.find(npc => npc.id === npcId).nameId;
   const npcName = i18n.texts[npcNameId];
   const itemId = param.parameter1;
   const item = Items.find(item => item.id === itemId);
   const itemName = i18n.texts[item.nameId];
   const itemQuantity = param.parameter2;
   const text = `Entrégale a ${npcName}: ${itemQuantity} x ${itemName}`;
   const exchangeableItem = item.exchangeable ? { itemId, itemQuantity } : {};
   return { text, npcId, exchangeableItem };
};

function ObjectiveType4(param) {
   const mapName = i18n.texts[param.parameter0];
   const text = `Descubre el mapa: ${mapName}`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType5(param) {
   const subareaNameId = SubAreas.find(sa => sa.id === param.parameter0).nameId;
   const subareaName = i18n.texts[subareaNameId];
   const text = `Explora la zona ${subareaName}`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType6(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Vence a ${param.parameter1} x ${monsterName} en un solo combate`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType9(param) {
   const npcId = param.parameter0;
   const npcNameId = Npcs.find(npc => npc.id === npcId).nameId;
   const npcName = i18n.texts[npcNameId];
   const text = `Vuelve a ver a ${npcName}`;
   return { text, npcId, exchangeableItem: {} };
};

function ObjectiveType10(param) {
   const name = i18n.texts[param.parameter0];
   const text = `Escolta a ${name}`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType12(param, DungeonByBossId) {
   const npcId = param.parameter0;
   const npcNameId = Npcs.find(npc => npc.id === npcId).nameId;
   const npcName = i18n.texts[npcNameId];
   const monster = Monsters.find(monster => monster.id === param.parameter1);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Lleva ${param.parameter2} alma(s) de ${monsterName} a ${npcName}`;
   const dungeonId = DungeonByBossId.get(param.parameter1);
   return { text, npcId, dungeonId, exchangeableItem: {} };
};

function ObjectiveType14(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const text = `Vence ${param.parameter1} x ${monsterName}`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType16(param) {
   const monster = Monsters.find(monster => monster.id === param.parameter0);
   const monsterName = i18n.texts[monster.nameId];
   const mapId = param.parameter2;
   const map = MapPositions.find(map => parseInt(map.id) === mapId);
   const mapName = map.nameId !== 0 ? ` (${i18n.texts[map.nameId]})` : '';
   const text = `Vence a ${param.parameter1} x ${monsterName} en el mapa [${map.posX},${map.posY}]${mapName} en un solo combate`;
   return { text, exchangeableItem: {} };
};

function ObjectiveType17(param) {
   const itemNameId = Items.find(item => item.id === param.parameter0).nameId;
   const itemName = i18n.texts[itemNameId];
   const text = `Fabrica ${param.parameter1} ${itemName} y cierra la interfaz`;
   return { text, exchangeableItem: {} };
};

export default function ({ typeId, parameters, DungeonByBossId }) {
   switch (typeId) {
      case 0: return ObjectiveType0(parameters);
      case 1: return ObjectiveType1(parameters);
      case 2: return ObjectiveType2(parameters);
      case 3: return ObjectiveType3(parameters);
      case 4: return ObjectiveType4(parameters);
      case 5: return ObjectiveType5(parameters);
      case 6: return ObjectiveType6(parameters);
      case 9: return ObjectiveType9(parameters);
      case 10: return ObjectiveType10(parameters);
      case 12: return ObjectiveType12(parameters, DungeonByBossId);
      case 14: return ObjectiveType14(parameters);
      case 16: return ObjectiveType16(parameters);
      case 17: return ObjectiveType17(parameters);
   };
};
import DB from '../src/modules/DB.js';
import { chromium } from 'playwright';
import CriterionValues from '../src/modules/CriterionValues.js';
import GetObjectiveData from '../src/modules/QuestObjectiveData.js';
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import Quests from '../src/input/Quests.json' assert {type: 'json'};
import Dungeons from '../src/input/Dungeons.json' assert {type: 'json'};
import Emoticons from '../src/input/Emoticons.json' assert {type: 'json'};
import QuestSteps from '../src/input/QuestSteps.json' assert {type: 'json'};
import MapPositions from '../src/input/MapPositions.json' assert {type: 'json'};
import Objectives from '../src/input/QuestObjectives.json' assert {type: 'json'};
import QuestCategory from '../src/input/QuestCategory.json' assert {type: 'json'};
import QuestStepRewards from '../src/input/QuestStepRewards.json' assert {type: 'json'};

const PATHS = {};
const DungeonByBossId = new Map();
const DungeonsData = await DB('dofus_dungeons').once('value');
DungeonsData.forEach(dungeon => {
   dungeon.child('bosses').forEach(boss => {
      const bossId = parseInt(boss.key);
      const dungId = parseInt(dungeon.key);
      DungeonByBossId.set(bossId, dungId);
   });
});

function AddNpcPosition(npcId, mapId, questId) {
   const quest = Quests.find(q => q.id === questId);
   const questName = i18n.texts[quest.nameId];
   PATHS[`dofus_npcs/${npcId}/quest_positions/${mapId}/${questId}`] = questName;
};

function AddItemDropQuest(itemId, questId, quantity) {
   PATHS[`dofus_items/${itemId}/obtaining/quests/${questId}`] = quantity;
};

function AddItemUses(itemId, questId, quantity) {
   PATHS[`dofus_items/${itemId}/uses/quests/${questId}`] = quantity;
};

function GetDungeonByMapId(mapId) {
   return Dungeons.find(dung => {
      const dungMaps = [...dung.mapIds, dung.exitMapId];
      return dungMaps.some(map => parseInt(map) === parseInt(mapId));
   });
};

function GetMapId(coords) {
   if (!coords) return null;
   const mapsFilteredByCoords = MapPositions.filter(map => map.posX === coords.x && map.posY === coords.y);
   const map = mapsFilteredByCoords.find(map => GetDungeonByMapId(map.id)) || mapsFilteredByCoords.at(0);
   if (!map) return null;
   return parseInt(map.id);
};

/**@param { Number[] } objectiveIds @param { Number } questId */
function GetObjectives(objectiveIds, questId) {
   const stepObjectives = [];
   const stepRequiredItems = new Map();
   const stepRequiredDungeons = new Set();
   for (const objectiveId of objectiveIds) {
      const { mapId, coords, typeId, parameters } = Objectives.find(obj => obj.id === objectiveId);
      const { text, exchangeableItem, npcId, dungeonId } = GetObjectiveData({ typeId, parameters, DungeonByBossId });
      if (dungeonId) stepRequiredDungeons.add(dungeonId);
      const thereIsExchangeableItem = Object.keys(exchangeableItem).length;
      if (thereIsExchangeableItem) {
         const { itemId, itemQuantity } = exchangeableItem;
         const currentQuantity = stepRequiredItems.get(itemId);
         if (!currentQuantity) stepRequiredItems.set(itemId, itemQuantity);
         else stepRequiredItems.set(itemId, itemQuantity + currentQuantity);
      };

      stepObjectives.push(text);
      const objectiveMapId = mapId || GetMapId(coords);
      if (!objectiveMapId) continue;

      if (npcId) AddNpcPosition(npcId, objectiveMapId, questId);
      const dungeon = GetDungeonByMapId(objectiveMapId);
      if (dungeon) stepRequiredDungeons.add(dungeon.id);
   };
   return { stepRequiredItems, stepRequiredDungeons, stepObjectives };
};

/**@param {{ requiredItems: Map<Number,Number>, requiredDungeons: Set<Number>, questId: Number }} */
function FormatQuestRequirements({ requiredItems, requiredDungeons, questId }) {
   const items = [...requiredItems].reduce((acc, cur) => {
      const [itemId, quantity] = cur;
      AddItemUses(itemId, questId, quantity);
      acc[itemId] = quantity;
      return acc;
   }, {});

   const dungeons = [...requiredDungeons].reduce((acc, cur) => {
      const dungeon = Dungeons.find(dung => dung.id === cur);
      acc[cur] = i18n.texts[dungeon.nameId];
      return acc;
   }, {});

   return { items, dungeons };
};

/**@param {{ rewardItems: Map<Number,Number>, rewardEmotes: Set<Number>, questId: Number }} */
function FormatQuestRewards({ rewardItems, rewardEmotes, questId }) {
   const items = [...rewardItems].reduce((acc, cur) => {
      const [itemId, quantity] = cur;
      AddItemDropQuest(itemId, questId, quantity);
      acc[itemId] = quantity;
      return acc;
   }, {});

   const emotes = [...rewardEmotes].reduce((acc, cur) => {
      const emoticon = Emoticons.find(emoticon => emoticon.id === cur);
      if (emoticon) acc[cur] = i18n.texts[emoticon.nameId];
      return acc;
   }, {});

   return { items, emotes };
};

/**@param { Number[] } stepIds @param { Number } questId */
function GetSteps(stepIds, questId) {
   const steps = [];
   const rewardItems = new Map();
   const rewardEmotes = new Set();
   const requiredItems = new Map();
   const requiredDungeons = new Set();
   for (const stepId of stepIds) {
      const { nameId, descriptionId, objectiveIds, rewardsIds } = QuestSteps.find(step => step.id === stepId);
      const stepName = i18n.texts[nameId];
      const stepDescription = i18n.texts[descriptionId].replace(/\n+/g, ' ').replace(/{.+?::|}/g, '');
      const higherRewardId = rewardsIds.at(-1);
      if (higherRewardId) {
         const rewards = QuestStepRewards.find(reward => reward.id === higherRewardId);
         for (const [itemId, quantity] of rewards.itemsReward) {
            const currentQuantity = rewardItems.get(itemId);
            if (!currentQuantity) rewardItems.set(itemId, quantity);
            else rewardItems.set(itemId, currentQuantity + quantity);
         };
         rewardEmotes.add(...rewards.emotesReward);
      };

      const { stepObjectives, stepRequiredDungeons, stepRequiredItems } = GetObjectives(objectiveIds, questId);
      for (const dungId of stepRequiredDungeons) requiredDungeons.add(dungId);
      for (const [itemId, itemQuantity] of stepRequiredItems) {
         const currentQuantity = requiredItems.get(itemId);
         if (currentQuantity) requiredItems.set(itemId, currentQuantity + itemQuantity);
         else requiredItems.set(itemId, itemQuantity);
      };

      steps.push({ name: stepName, description: stepDescription, objectives: stepObjectives });
   };

   const requirements = FormatQuestRequirements({ requiredItems, requiredDungeons, questId });
   const rewards = FormatQuestRewards({ rewardItems, rewardEmotes, questId });
   return { steps, requirements, rewards };
};

async function FetchQuestInfo(page, questId) {
   await page.goto(`https://dofusdb.fr/es/database/quest/${questId}`);
   await page.waitForTimeout(4000);
   let mapId = null;
   let coords = null;
   const hasCoords = await page.$('.q-mr-md > span > span');
   if (hasCoords) {
      coords = '[' + (await page.textContent('.q-mr-md > span > span')).replace(/[^\d,-]+/g, '') + ']';
      await hasCoords.hover();
      await page.waitForTimeout(2000);
      const mapElement = (await page.$$('.q-img__image.absolute-full')).at(-1);
      const mapElementStyle = await mapElement.getAttribute('style');
      const mapIdStr = mapElementStyle.match(/\d+(?=\.jpg)/)?.at(0);
      mapId = mapIdStr ? parseInt(mapIdStr) : null;
   };
   const xpStr = await page.textContent('.text-body1 > div:nth-child(1) > div');
   const xp = parseInt(xpStr.replace(/\s+/g, ''));
   const kamasStr = await page.textContent('.text-body1 > div:nth-child(2) > div');
   const kamas = parseInt(kamasStr.replace(/\s+/g, ''));
   return { xp, kamas, mapId, coords };
};

const browser = await chromium.launch();
const page = await browser.newPage();
const categoriesToIgnore = [24, 47];
for (const { id, nameId, repeatType, isPartyQuest, startCriterion, stepIds, categoryId } of Quests) {
   if (categoriesToIgnore.includes(categoryId)) continue;
   console.log('Working on quest#' + id);
   const category = QuestCategory.find(category => category.id === categoryId);
   const categoryName = i18n.texts[category.nameId];
   const questName = i18n.texts[nameId];
   const { steps, requirements, rewards } = GetSteps(stepIds, id);
   const { xp, kamas, mapId, coords } = await FetchQuestInfo(page, id);

   PATHS[`dofus_quests/${id}/name`] = questName;
   PATHS[`dofus_quests/${id}/steps`] = steps;
   PATHS[`dofus_quests/${id}/category`] = categoryName;
   PATHS[`dofus_quests/${id}/criterion`] = CriterionValues({ startCriterion, DungeonByBossId });
   PATHS[`dofus_quests/${id}/map_id`] = mapId;
   PATHS[`dofus_quests/${id}/coords`] = coords;
   PATHS[`dofus_quests/${id}/rewards/items`] = rewards.items;
   PATHS[`dofus_quests/${id}/rewards/emotes`] = rewards.emotes;
   PATHS[`dofus_quests/${id}/rewards/xp`] = xp;
   PATHS[`dofus_quests/${id}/rewards/kamas`] = kamas;
   PATHS[`dofus_quests/${id}/requirements`] = requirements;
   PATHS[`dofus_quests/${id}/repeatable`] = repeatType ? true : false;
   PATHS[`dofus_quests/${id}/is_party_quest`] = isPartyQuest;

   const dungeons = Object.keys(requirements.dungeons);
   for (const dungeonId of dungeons) {
      PATHS[`dofus_dungeons/${dungeonId}/quests/${id}`] = questName;
   };
};

await browser.close();
DB().update(PATHS).then(() => { console.log('Quests updated!') });
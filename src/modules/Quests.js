import DB from './DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { chromium } from 'playwright';
import CriterionValues from './CriterionValues.js';
import QuestObjectiveData from './QuestObjectiveData.js';
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Quests from '../input/Quests.json' assert {type: 'json'};
import Dungeons from '../input/Dungeons.json' assert {type: 'json'};
import QuestSteps from '../input/QuestSteps.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};
import QuestCategory from '../input/QuestCategory.json' assert {type: 'json'};
import QuestObjectives from '../input/QuestObjectives.json' assert {type: 'json'};
import QuestStepRewards from '../input/QuestStepRewards.json' assert {type: 'json'};

const PATHS = {};
const NpcPositions = {};
function AddNpcPosition(npcId, mapId, questId) {
   const quest = Quests.find(q => q.id === questId);
   const questName = i18n.texts[quest.nameId];
   PATHS[`dofus_npcs/${npcId}/map_ids/${mapId}/${questId}`] = questName;
   NpcPositions[`${npcId}/map_ids/${mapId}/${questId}`] = questName;
};

function AddItemDropQuest(itemId, questId, quantity) {
   PATHS[`dofus_items/${itemId}/obtaining/quests/${questId}`] = quantity;
};

function AddItemUses(itemId, questId, quantity) {
   PATHS[`dofus_items/${itemId}/uses/quests/${questId}`] = quantity;
};

function GetDungeonByMap(_mapId) {
   return Dungeons.find(dung => {
      const dungMaps = [...dung.mapIds, dung.exitMapId];
      return dungMaps.some(map => parseInt(map) === parseInt(_mapId));
   });
};

function GetMapId(mapId, coords) {
   if (!mapId && !coords) return null;
   if (mapId) return mapId;
   const mapsFilteredByCoords = MapPositions.filter(map => map.posX === coords.x && map.posY === coords.y);
   const map = mapsFilteredByCoords.reverse().find(map => GetDungeonByMap(map.id)) || mapsFilteredByCoords.at(-1);
   if (map) return parseInt(map.id);
   return null;
};

/**@param { Number[] } objectiveIds @param { Number } questId */
function GetStepObjectives(objectiveIds, questId) {
   const requiredItems = new Map();
   const requiredDungeons = new Set();
   for (const objectiveId of objectiveIds) {
      const objective = QuestObjectives.find(objective => objective.id === objectiveId);
      const { mapId, coords, typeId, parameters } = objective;
      const { text, npc, item } = QuestObjectiveData(typeId, parameters);

      if (item) {
         const currentQuantity = requiredItems.get(item.id);
         if (!currentQuantity) requiredItems.set(item.id, item.quantity);
         else requiredItems.set(item.id, item.quantity + currentQuantity);
      };

      const _mapId = GetMapId(mapId, coords);
      if (!_mapId) continue;

      if (npc) AddNpcPosition(npc, _mapId, questId);

      const dungeon = GetDungeonByMap(_mapId);
      if (dungeon) requiredDungeons.add(dungeon.id);
   };
   return {
      items: requiredItems,
      dungeons: requiredDungeons
   };
};

function FormatStepRequirements(requiredItems, requiredDungeons, questId) {
   return {
      items: [...requiredItems].reduce((acc, cur) => {
         const [itemId, quantity] = cur;
         AddItemUses(itemId, questId, quantity);
         acc[itemId] = quantity;
         return acc;
      }, {}),
      dungeons: [...requiredDungeons].reduce((acc, cur) => {
         const dungeon = Dungeons.find(dung => dung.id === cur);
         acc[cur] = i18n.texts[dungeon.nameId];
         return acc;
      }, {})
   };
};

function FormatStepRewards(itemsReward, emotesReward, questId) {
   return {
      items: [...itemsReward].reduce((acc, cur) => {
         const [itemId, quantity] = cur;
         AddItemDropQuest(itemId, questId, quantity);
         acc[itemId] = quantity;
         return acc;
      }, {}),
      emotes: emotesReward.reduce((acc, cur) => {
         acc[cur] = true;
         return acc;
      }, {})
   };
};

/**@param { Number[] } stepIds @param { Number } questId */
function GetQuestSteps(stepIds, questId) {
   const descriptions = [];
   const emotesReward = [];
   const itemsReward = new Map();
   const requiredItems = new Map();
   const requiredDungeons = new Set();

   for (const stepId of stepIds) {
      const { nameId, descriptionId, objectiveIds, rewardsIds } = QuestSteps.find(step => step.id === stepId);
      const stepName = i18n.texts[nameId];
      const stepDescription = i18n.texts[descriptionId];
      descriptions.push({ name: stepName, description: stepDescription });

      const higherRewardId = rewardsIds.at(-1);
      if (higherRewardId) {
         const rewards = QuestStepRewards.find(reward => reward.id === higherRewardId);
         for (const [itemId, quantity] of rewards.itemsReward) {
            const currentQuantity = itemsReward.get(itemId);
            if (!currentQuantity) itemsReward.set(itemId, quantity);
            else itemsReward.set(itemId, currentQuantity + quantity);
         };
         emotesReward.push(...rewards.emotesReward);
      };

      const stepObjectives = GetStepObjectives(objectiveIds, questId);
      for (const dungId of stepObjectives.dungeons) {
         requiredDungeons.add(dungId);
      };

      for (const [itemId, itemQuantity] of stepObjectives.items) {
         const currentQuantity = requiredItems.get(itemId);
         if (currentQuantity) requiredItems.set(itemId, currentQuantity + itemQuantity);
         else requiredItems.set(itemId, itemQuantity);
      };
   };

   return {
      steps: descriptions,
      requirements: FormatStepRequirements(requiredItems, requiredDungeons, questId),
      rewards: FormatStepRewards(itemsReward, emotesReward, questId)
   };
};

async function fetchQuestInfo(page, questId) {
   await page.goto(`https://dofusdb.fr/es/database/quest/${questId}`);
   await page.waitForTimeout(4000);
   const hasCoords = await page.$('.q-mr-md > span > span');
   let coords = null;
   let mapId = null;
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

export default async function () {
   const _filename = fileURLToPath(import.meta.url);
   const questData = {};
   const questWebData = {};
   const questCategoriesToIgnore = [24, 47];
   const browser = await chromium.launch();
   const page = await browser.newPage();
   const listFormatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });
   for (const { id, nameId, questIds } of QuestCategory) {
      if (questCategoriesToIgnore.includes(id)) continue;
      const categoryName = i18n.texts[nameId];
      let markdown = '';
      for (const questId of questIds) {
         console.log('Working on quest#' + questId);
         const quest = Quests.find(quest => quest.id === questId);
         if (!quest) continue;
         const { nameId, repeatType, isPartyQuest, startCriterion, stepIds } = quest;
         const questName = i18n.texts[nameId];
         const { steps, requirements, rewards } = GetQuestSteps(stepIds, questId);
         const { xp, kamas, mapId, coords } = await fetchQuestInfo(page, questId);
         rewards['xp'] = xp;
         rewards['kamas'] = kamas;
         questWebData[questId] = { xp, kamas, mapId, coords };

         const questDescription = steps
            .map((step, i) => {
               let stepStr = `${i + 1}. `;
               if (step.name !== questName) stepStr += step.name + ': ';
               stepStr += step.description.replace(/\n/g, ' ').replace(/{.+?::|}/g, '');
               return stepStr;
            })
            .join('\n');

         const questDetails = [];
         if (isPartyQuest) questDetails.push('Esta misión es grupal')
         else questDetails.push('Esta misión es individual');

         if (repeatType) questDetails.push('repetible');
         else questDetails.push('no repetible');

         if (coords) questDetails.push(`se toma en ${coords}`);

         markdown +=
            `\n\n## ${questName}, ID: ${questId}\n` +
            `Nombre de la misión: «${questName}».\n` +
            `Categoría: "${categoryName}".\n` +
            `Detalles: ${listFormatter.format(questDetails)}.\n` +
            `Etapas de la misión:\n${questDescription}\n` +
            `Encuentra los requisitos, recompensas y guías de esta misión usando el siguiente menú:\n` +
            `<component type={${questId}_QUEST_MENU}>`;

         questData[questId] = {
            name: questName,
            category: categoryName,
            steps: steps,
            criterion: CriterionValues(startCriterion) || 'Ninguno',
            mapId: mapId,
            coords: coords,
            requirements: requirements,
            rewards: rewards
         };
      };
      writeFileSync(join(dirname(_filename), `../pages/quests/${id}.md`), markdown.trim(), { encoding: 'utf-8' });
   };

   await browser.close();
   writeFileSync(join(dirname(_filename), `../output/quests/quests.json`), JSON.stringify(questData), { encoding: 'utf-8' });
   writeFileSync(join(dirname(_filename), `../output/npcs/questMapIds.json`), JSON.stringify(NpcPositions), { encoding: 'utf-8' });
   writeFileSync(join(dirname(_filename), `../output/quests/questWebData.json`), JSON.stringify(questWebData), { encoding: 'utf-8' });
   PATHS['dofus_quests'] = questData;
   DB().update(PATHS);
   console.log('Quests updated');
};
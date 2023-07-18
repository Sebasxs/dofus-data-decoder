import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { chromium } from 'playwright';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Spells from '../input/Spells.json' assert{type: 'json'};
import Titles from '../input/Titles.json' assert{type: 'json'};
import Monsters from '../input/Monsters.json' assert{type: 'json'};
import Ornaments from '../input/Ornaments.json' assert{type: 'json'};
import Emoticons from '../input/Emoticons.json' assert{type: 'json'};
import Challenges from '../input/Challenges.json' assert{type: 'json'};
import Achievements from '../input/Achievements.json' assert{type: 'json'};
import Rewards from '../input/AchievementRewards.json' assert{type: 'json'};
import Objectives from '../input/AchievementObjectives.json' assert{type: 'json'};
import Categories from '../input/AchievementCategories.json' assert{type: 'json'};

function GetDescription(descId) {
   let description = i18n.texts[descId].replace(/{itemHover,\d+::|}/g, '');
   const challengeId = description.match(/(?<=\[challenge,)\d+(?=\])/)?.at(0);
   if (!challengeId) return description;
   const challenge = Challenges.find(chal => chal.id === parseInt(challengeId));
   const { descriptionId, targetMonsterId, completionCriterion } = challenge;
   description = i18n.texts[descriptionId];
   if (targetMonsterId && description.includes('%1')) {
      const monster = Monsters.find(monster => monster.id === targetMonsterId);
      const monsterName = i18n.texts[monster.nameId];
      description = description.replace('%1', monsterName);
   };
   if (description.includes('%2')) {
      const rounds = completionCriterion.match(/(?<=ST.)\d+/)[0];
      description = description.replace('%2', rounds);
   };
   return description;
};

function GetItems({ rewards, itemsReward, itemsQuantityReward }) {
   for (let index = 0; index < itemsReward.length; index++) {
      const item = itemsReward[index];
      if (typeof rewards.items === 'undefined') rewards['items'] = {};
      rewards['items'][item] = itemsQuantityReward[index];
   };
};

function GetEmotes({ rewards, emotesReward }) {
   for (const emoteId of emotesReward) {
      const emote = Emoticons.find(emote => emote.id === emoteId);
      if (!emote) continue;
      const name = i18n.texts[emote.nameId];
      if (!name) continue;
      if (typeof rewards.emotes === 'undefined') rewards['emotes'] = {};
      rewards['emotes'][emoteId] = name;
   };
};

function GetSpells({ rewards, spellsReward }) {
   for (const spellId of spellsReward) {
      const spell = Spells.find(spell => spell.id === spellId);
      if (!spell) continue;
      const name = i18n.texts[spell.nameId];
      if (!name) continue;
      if (typeof rewards.spells === 'undefined') rewards['spells'] = {};
      rewards['spells'][spellId] = name;
   };
};

function GetTitles({ rewards, titlesReward }) {
   for (const titleId of titlesReward) {
      const title = Titles.find(title => title.id === titleId);
      if (!title) continue;
      const name = i18n.texts[title.nameId];
      if (!name) continue;
      if (typeof rewards.titles === 'undefined') rewards['titles'] = {};
      rewards['titles'][titleId] = name;
   };
};

function GetOrnaments({ rewards, ornamentsReward }) {
   for (const ornamentId of ornamentsReward) {
      const ornament = Ornaments.find(ornament => ornament.id === ornamentId);
      if (!ornament) continue;
      const name = i18n.texts[ornament.nameId];
      if (!name) continue;
      if (typeof rewards.ornaments === 'undefined') rewards['ornaments'] = {};
      rewards['ornaments'][ornamentId] = name;
   };
};

async function FetchNotExplicitRewards({ rewards, achievementId }) {
   rewards.xp = null;
   rewards.kamas = null;
   try {
      await page.goto(`https://dofusdb.fr/es/database/achievements/${achievementId}`);
      await page.waitForTimeout(500);
      let elements = await page.$$('#q-app > div > div > main > div > div > div:nth-child(3) > div.row.q-ml-sm > div.column.text-body1.q-mr-md > div');
      if (elements.length === 1) {
         const img = await page.$('#q-app > div > div > main > div > div > div:nth-child(3) > div.row.q-ml-sm > div.column.text-body1.q-mr-md > div:nth-child(1) > img');
         const attribute = await img.getAttribute('alt');
         const div = elements.at(0);
         const innerText = await div.innerText();
         if (!innerText) return;
         const value = innerText.replace(/\D+/g, '');
         if (value && attribute) rewards[attribute] = parseInt(value);
      } else {
         const [xp, kamas] = elements;
         const xpInnerText = await xp?.innerText();
         const xpValue = xpInnerText?.replace(/\D+/g, '');
         const kamasInnerText = await kamas?.innerText();
         const kamasValue = kamasInnerText?.replace(/\D+/g, '');
         if (xpValue) rewards['xp'] = parseInt(xpValue);
         if (kamasValue) rewards['kamas'] = parseInt(kamasValue);
      };
   } catch (error) {
      console.log(error);
      await page.waitForTimeout(2000);
      await FetchNotExplicitRewards({ rewards, achievementId });
   };
};

async function GetRewards(rewardIds, achievementId) {
   const rewards = {};
   if (!rewardIds.length) return rewards;
   const reward = Rewards.find(reward => reward.id === rewardIds.at(0));
   if (!reward) {
      console.log({ achievementId, rewardId: reward.at(0), error: 'Reward not found!' });
      return rewards;
   };
   const { itemsReward, itemsQuantityReward } = reward;
   const { emotesReward, spellsReward, titlesReward, ornamentsReward } = reward;
   GetItems({ rewards, itemsReward, itemsQuantityReward });
   GetEmotes({ rewards, emotesReward });
   GetSpells({ rewards, spellsReward });
   GetTitles({ rewards, titlesReward });
   GetOrnaments({ rewards, ornamentsReward });
   await FetchNotExplicitRewards({ rewards, achievementId });
   return rewards;
};

const PATHS = {};
const browser = await chromium.launch();
const page = await browser.newPage();
for (const achievement of Achievements) {
   const { id, descriptionId, iconId, points, level, objectiveIds, rewardIds } = achievement;
   console.log({ id });
   const name = i18n.texts[achievement.nameId];
   const category = Categories.find(category => category.id === achievement.categoryId);
   const categoryName = i18n.texts[category.nameId];
   const description = GetDescription(descriptionId);
   const rewards = await GetRewards(rewardIds, id);
   const objectives = objectiveIds.reduce((acc, cur) => {
      const objective = Objectives.find(obj => obj.id === cur);
      if (!objective) return acc;
      const objectiveName = i18n.texts[objective.nameId];
      if (objectiveName) acc[cur] = objectiveName;
      return acc;
   }, {});

   const obj = {
      name,
      category: categoryName,
      description,
      icon_id: iconId,
      level,
      points,
      objectives,
      rewards
   };

   PATHS[id] = obj;
   console.log(obj);
   DB(`dofus_achievements/${id}`).set(obj);
};

await browser.close();
// const filename = fileURLToPath(import.meta.url);
// writeFileSync(join(dirname(filename), `../output/achievement.json`), JSON.stringify(PATHS));
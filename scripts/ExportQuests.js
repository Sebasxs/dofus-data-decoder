import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Items from '../input/Items.json' assert{type: 'json'};
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import GenDescriptions from "../modules/GenQuestDescriptions.js";

// await GenDescriptions();
const DOCS = new Map();
const Maps = await DB('dofus_maps').once('value');
const Quests = await DB('dofus_quests').once('value');
const formatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });

function GetRewardList(quest) {
   const rewardKamas = quest.child('rewards/kamas').val();
   const rewardXp = quest.child('rewards/xp').val();
   const rewardList = [`${rewardKamas} kamas`, `${rewardXp} puntos de experiencia`];

   quest.child('rewards/items').forEach(item => {
      const itemId = parseInt(item.key);
      const quantity = item.val();
      const itemNameId = Items.find(i => i.id === itemId).nameId;
      const name = i18n.texts[itemNameId];
      rewardList.push(`${quantity} ${name}`);
   });
   quest.child('rewards/emotes').forEach(emote => {
      const emoteName = emote.val();
      rewardList.push(`actitud "${emoteName}"`);
   });

   return rewardList;
};

function GetRequirementList(quest) {
   const requirementList = [];
   quest.child('requirements/items').forEach(item => {
      const itemId = parseInt(item.key);
      const quantity = item.val();
      const itemNameId = Items.find(i => i.id === itemId).nameId;
      const name = i18n.texts[itemNameId];
      requirementList.push(`${quantity} ${name}`);
   });
   quest.child('requirements/dungeons').forEach(dungeon => {
      const dungeonName = dungeon.val();
      requirementList.push(`Mazmorra "${dungeonName}"`);
   });
   const requirements = quest.hasChild('requirements')
      ? `\nDurante esta misión necesitarás:\n\`\`\`\n${requirementList.join('\n')}\n\`\`\``
      : '';

   return requirements;
};

function GetStartingPosition({ coords, mapId }) {
   let startingPosition = 'No tengo información del lugar donde inicia esta misión.';
   if (mapId) {
      const subarea = Maps.child(`${mapId}/subarea`).val();
      const imageUrl = Maps.child(`${mapId}/image_url`).val();
      startingPosition = `Esta misión inicia en ${coords} (${subarea}) y esta es una imagen del mapa:\n![map_image](${imageUrl})`;
   };

   return startingPosition;
};

function AddDoc({ categoryId, doc }) {
   const docArray = DOCS.get(categoryId);
   if (!docArray) {
      DOCS.set(categoryId, [doc]);
   } else {
      docArray.push(doc);
      DOCS.set(categoryId, docArray);
   };
};

Quests.forEach(quest => {
   const category = quest.child('category').val();
   const categoryId = quest.child('category_id').val();
   const coords = quest.child('coords').val();
   const criterion = quest.child('criterion').val();

   let description = quest.child('description').val();
   const startsWithQuestName = /la\smisión\s["«].+?["»],?/i;
   if (description.match(startsWithQuestName)) {
      const fixedDesc = description.replace(startsWithQuestName, 'esta misión');
      description = fixedDesc.substring(0, 1).toUpperCase() + fixedDesc.substring(1);
   };

   const isPartyQuest = quest.child('is_party_quest').val() ? 'es grupal' : 'es individual';
   const mapId = quest.child('map_id').val();
   const name = quest.child('name').val();
   const repeatable = quest.child('repeatable').val() ? 'es repetible' : 'no es repetible';
   const rewardList = GetRewardList(quest);
   const requirements = GetRequirementList(quest);
   const startingPosition = GetStartingPosition({ coords, mapId });

   const doc =
      `## ${name}, ID: ${quest.key}\n` +
      `La misión «${name}» está en la categoría de ${category}, ${isPartyQuest} y ${repeatable}.\n` +
      `${description}\n` +
      `Las recompensas de esta misión son ${formatter.format(rewardList)}.` +
      `${requirements}\n` +
      `Criterios que debes cumplir para tomar esta misión:\n` +
      `\`\`\`\n${criterion}\n\`\`\`\n` +
      `${startingPosition}`;

   AddDoc({ categoryId, doc });
});

const filename = fileURLToPath(import.meta.url);
for (const [categoryId, docs] of DOCS) {
   writeFileSync(
      join(dirname(filename), `../pages/quests/${categoryId}.md`),
      docs.join('\n\n')
   );
};

console.log('Quests exported!');
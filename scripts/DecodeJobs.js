import DB from '../modules/DB.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFileSync } from 'fs';
import JobDescriptions from '../data/jobDescriptions.js';
import Items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import InputJobs from '../input/Jobs.json' assert {type: 'json'};
import Skills from '../input/Skills.json' assert {type: 'json'};
import ItemTypes from '../input/ItemTypes.json' assert {type: 'json'};

const PATHS = {};
const Jobs = InputJobs.slice(1, -2);
const filename = fileURLToPath(import.meta.url);

function GetModifiableItemTypes(itemIds) {
   return itemIds.reduce((acc, cur) => {
      const nameId = ItemTypes.find(type => type.id === cur)?.nameId;
      if (nameId) acc[cur] = i18n.texts[nameId];
      return acc;
   }, {});
};

function GetJobSkills(jobId) {
   const filteredSkills = [];
   Skills.forEach(({ gatheredRessourceItem, parentJobId, nameId, isForgemagus, levelMin, craftableItemIds, modifiableItemTypeIds }) => {
      const isDuplicated = filteredSkills.find(skill => skill.gathered_ressource_item === gatheredRessourceItem);
      if (parentJobId !== jobId || isDuplicated) return;

      filteredSkills.push({
         name: i18n.texts[nameId],
         is_forgemagus: isForgemagus,
         modifiable_item_type_ids: GetModifiableItemTypes(modifiableItemTypeIds),
         craftable_item_ids: craftableItemIds,
         level_min: levelMin,
         gathered_ressource_item: (gatheredRessourceItem > 0) ? gatheredRessourceItem : null
      });
   });

   return filteredSkills.sort((a, b) => a.level_min - b.level_min);
};

for (const { id, nameId, iconId } of Jobs) {
   const ressources = [];
   const jobSkills = GetJobSkills(id);
   const jobName = i18n.texts[nameId];

   PATHS[`dofus_jobs/${id}/name`] = jobName;
   PATHS[`dofus_jobs/${id}/icon_id`] = iconId;
   PATHS[`dofus_jobs/${id}/skills`] = jobSkills;
   PATHS[`dofus_jobs/${id}/description`] = JobDescriptions[id];

   let doc = `## ${jobName}\n${JobDescriptions[id]}`;
   for (const { name, gathered_ressource_item, craftable_item_ids } of jobSkills) {
      if (craftable_item_ids.length) doc += `\nExisten ${craftable_item_ids.length} objetos diferentes que puedes fabricar con la habilidad "${name}" de este oficio.`;
      else if (gathered_ressource_item) {
         const ressourceNameId = Items.find(item => item.id === gathered_ressource_item).nameId;
         const ressourceName = i18n.texts[ressourceNameId];
         ressources.push(ressourceName);
      } else doc += `\nPuedes ${name} con este oficio.`;
   };

   if (ressources.length) {
      const formatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });
      doc += `\nCon este oficio puedes recolectar ${formatter.format(ressources)}.`;
   };

   writeFileSync(join(dirname(filename), `../pages/jobs/${id}.md`), doc, { encoding: 'utf-8' });
};

// writeFileSync(join(dirname(filename), '../output/jobs.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
DB().update(PATHS).then(() => { console.log('Jobs updated!') });
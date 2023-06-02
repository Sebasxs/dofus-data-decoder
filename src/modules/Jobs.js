import DB from './DB.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFile } from 'fs/promises';
import items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import allJobs from '../input/Jobs.json' assert {type: 'json'};
import skills from '../input/Skills.json' assert {type: 'json'};
import itemTypes from '../input/ItemTypes.json' assert {type: 'json'};
import descriptions from '../data/jobDescriptions.json' assert {type: 'json'};

export default async function () {
   const json = {};
   const jobs = allJobs.slice(1, -2);
   const __filename = fileURLToPath(import.meta.url);

   for (const { id, nameId, iconId } of jobs) {
      const jobSkills = skills
         .reduce((accSkills, currentSkill) => {
            const modifiableItemTypeIds = currentSkill.modifiableItemTypeIds.reduce((acc, cur) => {
               const nameId = itemTypes.find(type => type.id === cur)?.nameId;
               if (nameId) acc[cur] = i18n.texts[nameId];
               return acc;
            }, {});

            const gatheredRessourceItem = currentSkill.gatheredRessourceItem === -1
               ? null
               : currentSkill.gatheredRessourceItem;

            const isDuplicated = accSkills.find(skill =>
               skill.gatheredRessourceItem === currentSkill.gatheredRessourceItem
            );

            if (currentSkill.parentJobId === id && !isDuplicated) {
               accSkills.push({
                  name: i18n.texts[currentSkill.nameId],
                  isForjamagus: currentSkill.isForgemagus,
                  modifiableItemTypeIds: modifiableItemTypeIds,
                  gatheredRessourceItem: gatheredRessourceItem,
                  craftableItemIds: currentSkill.craftableItemIds,
                  levelMin: currentSkill.levelMin
               });
            };

            return accSkills;
         }, [])
         .sort((a, b) => a.levelMin - b.levelMin);

      const jobName = i18n.texts[nameId];
      json[id] = {
         name: jobName,
         iconId: iconId,
         skills: jobSkills,
         description: descriptions[id]
      };

      let markdown = `## ${jobName}\n${descriptions[id]}`;
      const ressources = [];
      for (const { name, gatheredRessourceItem, craftableItemIds } of jobSkills) {
         if (craftableItemIds.length) markdown += `\nExisten ${craftableItemIds.length} objetos diferentes que puedes fabricar con la habilidad "${name}" de este oficio.`;
         else if (gatheredRessourceItem) {
            const ressourceNameId = items.find(item => item.id === gatheredRessourceItem).nameId;
            const ressourceName = i18n.texts[ressourceNameId];
            ressources.push(ressourceName);
         } else markdown += `\nPuedes ${name} con este oficio.`;
      };
      if (ressources.length) {
         const formatter = new Intl.ListFormat('es', { style: 'short', type: 'conjunction' });
         markdown += `\nCon este oficio puedes recolectar ${formatter.format(ressources)}.`;
      };

      await writeFile(join(dirname(__filename), `../output/jobs/${id}.md`), markdown, { encoding: 'utf-8' });
   };

   await writeFile(join(dirname(__filename), '../output/jobs/jobs.json'), JSON.stringify(json), { encoding: 'utf-8' });
   DB('dofus_jobs').update(json);
};
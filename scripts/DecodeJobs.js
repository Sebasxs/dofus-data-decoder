import DB from '../src/modules/DB.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { writeFileSync } from 'fs';
import Items from '../src/input/Items.json' assert {type: 'json'};
import i18n from '../src/input/i18n_es.json' assert {type: 'json'};
import InputJobs from '../src/input/Jobs.json' assert {type: 'json'};
import Skills from '../src/input/Skills.json' assert {type: 'json'};
import ItemTypes from '../src/input/ItemTypes.json' assert {type: 'json'};

const PATHS = {};
const Jobs = InputJobs.slice(1, -2);
const filename = fileURLToPath(import.meta.url);

const descriptions = {
   2: "El leñador tala árboles. También puede fabricar tablas y concentrados que se utilizan para fabricar otros objetos.",
   11: "El herrero fabrica espadas, palas, martillos, hachas, dagas y lanzas.",
   13: "El escultor fabrica varitas, arcos y bastones.",
   15: "El zapatero fabrica botas y cinturones.",
   16: "El joyero fabrica anillos y amuletos.",
   24: "El minero recolecta minerales. También puede fabricar aleaciones y pulir piedras.",
   26: "El alquimista recolecta plantas que pueden utilizarse para fabricar pócimas con las que recuperar puntos de vida o de energía, o teletransportarse.",
   27: "El sastre confecciona capas, sombreros y mochilas.",
   28: "El campesino cosecha los cereales y puede hacer pan, que permite recuperar puntos de vida o de energía.",
   36: "El pescador consigue peces que luego pueden consumirse como pescado para recuperar puntos de vida o de energía.",
   41: "El cazador recupera la carne de las criaturas a las que se enfrenta. Una vez preparadas, estas carnes permiten recuperar puntos de vida o de energía.",
   44: "El forjamago puede modificar los efectos de las espadas, de las hachas, de los martillos, de las palas, de las dagas y de las lanzas utilizando runas de forjamagia.",
   48: "El escultomago puede modificar los efectos de las varitas, de los arcos y de los bastones utilizando runas de forjamagia.",
   60: "El fabricante crea trofeos, ídolos y escudos.",
   62: "El zapateromago puede modificar los efectos de los cinturones y de las botas utilizando runas de forjamagia.",
   63: "El joyeromago puede modificar los efectos de los anillos y de los amuletos utilizando runas de forjamagia.",
   64: "El sastremago puede modificar los efectos de las capas, de los sombreros y de las mochilas utilizando runas de forjamagia.",
   65: "El manitas puede fabricar el material necesario para la cría de monturas y las llaves de mazmorra.",
   74: "El fabricamago puede modificar los efectos de los escudos utilizando runas de forjamagia."
};

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
   PATHS[`dofus_jobs/${id}/description`] = descriptions[id];

   let doc = `## ${jobName}\n${descriptions[id]}`;
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

   writeFileSync(join(dirname(filename), `../output/jobs/${id}.md`), doc, { encoding: 'utf-8' });
};

// writeFileSync(join(dirname(filename), '../output/jobs/jobs.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
DB().update(PATHS).then(() => { console.log('Jobs updated!') });
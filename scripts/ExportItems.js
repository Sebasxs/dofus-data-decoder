import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { encode } from 'gpt-3-encoder';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import ItemSets from '../input/ItemSets.json' assert{type: 'json'};
import Subareas from '../input/SubAreas.json' assert{type: 'json'};

function AddPage({ typeId, page }) {
   const pages = Types.get(typeId);
   if (pages) {
      pages.push(page);
      Types.set(typeId, pages);
   } else {
      Types.set(typeId, [page]);
   };
};

function AddBasicInfo({ item, name }) {
   const type = item.child('type').val();
   const level = item.child('level').val();
   let output = `${name} está en la categoría de ${type}, es de nivel ${level}`;
   const setId = item.child('set_id').val();
   if (setId) {
      const set = ItemSets.find(set => set.id === parseInt(setId));
      const setName = i18n.texts[set.nameId];
      output += ` perteneciente al set **${setName}**`;
   };

   const pods = item.child('pods').val();
   const exchangeable = item.child('exchangeable').val() ? 'es' : 'no es';
   output += `, pesa ${pods} pods y ${exchangeable} intercambiable.\n`;

   const resourcesBySubarea = item.child('resources_by_subarea');
   if (resourcesBySubarea.exists()) {
      output += 'Este recurso se encuentra en las siguientes zonas:\n```';
      resourcesBySubarea.forEach(resource => {
         const subareaId = resource.key;
         const quantity = resource.val();
         const subarea = Subareas.find(sub => sub.id === parseInt(subareaId));
         const subareaName = i18n.texts[subarea.nameId];
         output += `\nx${quantity} en ${subareaName}`;
      });
      output += '\n```\n';
   };

   const description = item.child('description').val();
   if (!description) return output;
   output += `Según la descripción de este item:\n> ${description.replace('\n', '\n> ')}\n\n`;

   return output;
};

function FormatCriterionValues(values) {
   if (!values.hasChildren()) return '\nNinguno';
   let output = '';
   values.forEach(value => {
      output += `\n${value.val()}`;
   });

   return output;
};

function AddMoreInfo({ item, name }) {
   const effects = item.child('effects');
   let output = `Los efectos de ${name} son:\n\`\`\`${FormatCriterionValues(effects)}\n\`\`\`\n`;
   const criteria = item.child('criteria');
   output += `Las condiciones que se deben cumplir para usarlo son:\n\`\`\`${FormatCriterionValues(criteria)}\n\`\`\`\n`;
   const craftConditional = item.child('craft_conditional');
   output += `Criterios que se deben cumplir para su fabricación:\n\`\`\`${FormatCriterionValues(craftConditional)}\n\`\`\`\n`;
   return output;
};

function AddDetails({ item, name }) {
   let output = `Detalles de ${name}:\n\`\`\``;
   const minRange = item.child('details/min_range').val();
   const maxRange = item.child('details/max_range').val();
   if (minRange > 0) output += `\nRango de ${minRange} a ${maxRange} AL`;
   const apCost = item.child('details/ap_cost').val();
   if (apCost > 0) output += `\nCuesta ${apCost} PA`;
   const criticalHitProbability = item.child('details/critical_hit_probability').val();
   const criticalHitBonus = item.child('details/critical_hit_bonus').val();
   if (criticalHitProbability > 0) output += `\nGolpes críticos ${criticalHitProbability}% (+${criticalHitBonus})`;
   const maxCastPerTurn = item.child('details/max_cast_per_turn').val();
   if (maxCastPerTurn > 0) output += `\nPuede lanzarse ${maxCastPerTurn} veces por turno`;
   const diagonal = item.child('details/cast_in_diagonal').val();
   if (diagonal) output += `\nLanzamiento en diagonal`;
   const line = item.child('details/cast_in_line').val();
   if (line) output += `\nLanzamiento en línea`;
   const los = item.child('details/line_of_sight').val();
   if (los) output += `\nRequiere línea de visión`;
   const isLegendary = item.child('details/is_legendary').val();
   if (isLegendary) output += `\nEste es un item legendario`;
   output += '\n```\n';

   return output;
};

const filename = fileURLToPath(import.meta.url);
const Images = await DB('dofus_icons/items').once('value');
const Types = new Map();
const Items = await DB('dofus_items').once('value');
Items.forEach(item => {
   const typeId = item.child('type_id').val();
   if (!typeId) return;

   const id = item.key;
   const name = item.child('name').val();
   let page = `## ${name}, ID${id}\n`;
   page += AddBasicInfo({ item, name });
   page += AddMoreInfo({ item, name });
   if (item.child('details').exists()) page += AddDetails({ item, name });

   const imageId = item.child('icon_id').val();
   const imageUrl = Images.child(imageId).val();
   page += `${name} tiene la siguiente apariencia:\n![item_img](${imageUrl})`;

   // const tokens = encode(page).length;
   // if (tokens > 500) console.log(id, name, tokens);

   AddPage({ typeId, page });
});

for (const [type, pages] of Types) {
   const doc = pages.join('\n\n');
   writeFileSync(join(dirname(filename), `../pages/items/${type}.md`), doc);
};

console.log('Items exported!');
//10207 Manojo de llaves 1616
import DB from './DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { encode } from 'gpt-3-encoder';
import { Configuration, OpenAIApi } from 'openai';
import { setTimeout } from 'node:timers/promises';
import Npcs from '../input/Npcs.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Saints from '../output/npcs/saints.json' assert {type: 'json'};
import QuestPositions from '../output/npcs/questMapIds.json' assert {type: 'json'};
import DialogSummaries from '../output/npcs/dialogSummaries.json' assert {type: 'json'};
import { config } from 'dotenv';
config();

const configuration = new Configuration({
   organization: 'org-r9a4GtQNE7dQVbp9zr25VXcN',
   apiKey: process.env.OPENAI_API_KEY,
});

const filename = fileURLToPath(import.meta.url);
const openai = new OpenAIApi(configuration);

/**@param {{model: 'gpt-3.5-turbo-0613'|'gpt-3.5-turbo-16k-0613'}} */
async function completion({ prompt, model }) {
   try {
      const response = await openai.createChatCompletion({
         model: model,
         messages: prompt,
         temperature: 0.7
      });

      const output = response.data.choices.at(0).message.content
         .replace(/\n+/g, '\n')
         .replace(/(?<=\n)-(?=\w)/g, '- ')
         .replace(/((En\sresumen|En\sdefinitiva|En\sgeneral|Sinopsis|En\sconclusión)[,:].+)|"{2,}/g, '')
         .trim();

      console.log(output);
      console.table(response.data?.usage);
      // await setTimeout(30000);
      if (output.match(/daniela|daneris|gluten|sebastian|matica/gi)) return await completion({ prompt, model });
      return output;
   } catch (error) {
      if (error.response) {
         console.log(error.response.status, error.response.data);
      } else {
         console.log(error.message);
      };
      return await completion({ prompt, model });
   }
}

async function GetDescription({ name, dialogs }) {
   const prompt = [{
      role: 'system',
      content: 'Eres un escritor que redacta artículos informativos y a partir de diálogos de un PNJ de Dofus.\nRecibirás un documento donde cada párrafo es un diálogo y no necesariamente están relacionados entre sí. Debes generar un escrito detallado describiendo el PNJ y ofreciendo datos o historias que encuentres en sus diálogos, siempre conservando los nombres propios.'
   }, {
      role: 'system',
      name: 'user-example-1',
      content:
         `Diálogos de Sebastian:
"""
Hace una semana hubo diluvios y muchas personas fueron afectadas perdiendo sus hogares tras derrumbes generados por la lluvia en el barrio La Matica; sin embargo, los últimos días ha habido un calor insoportable.

Vuelve a verme cuando tengas 5 manzanas.

Daniela es mi novia. Ella es abogada y le encanta la cerveza, pero no ha vuelto a consumir debido al gluten.

Podría darte un dragopavo a cambio de algunas manzanas.
"""`
   }, {
      role: 'assistant',
      name: 'assistant-example-1',
      content:
         `Sebastian es un PNJ que intercambia un dragopavo por algunas manzanas. Su novia se llama Daniela y es abogada; le fascina la cerveza pero desde que supo que es celiaca no ha podido consumir más.
Sebastian habla sobre lo fuerte e inestable que ha estado el clima recientemente.
El barrio La Matica sufrió derrumbes generados por las fuertes lluvias y muchas personas perdieron sus hogares.`
   }, {
      role: 'system',
      name: 'user-example-2',
      content:
         `Diálogos de Daneris:
"""
01001100 00101110 10011001
"""`
   }, {
      role: 'assistant',
      name: 'assistant-example-2',
      content:
         `Daneris es una PNJ extraña que se comunica únicamente mediante lenguaje binario. Podría ser perfectamente un robot.`
   }, {
      role: 'user',
      content: `Diálogos de ${name}:\n"""\n${dialogs.join('\n\n')}\n"""`
   }];

   const tokens = encode(JSON.stringify(prompt)).length;
   let description = '';

   if (tokens > 2500) description = await completion({ prompt, model: 'gpt-3.5-turbo-16k-0613' });
   else description = await completion({ prompt, model: 'gpt-3.5-turbo-0613' });

   return description;
};

export default async function () {
   const PATHS = {};
   const cache = new Map();
   const genderType = { 0: 'Masculino', 1: 'Femenino', 2: 'No definido' };

   for (const { id, nameId, dialogMessages, gender: genderId, look } of Npcs) {
      const name = i18n.texts[nameId];
      const imageId = parseInt(look.match(/(?<={)\d+/)[0]);
      const gender = genderType[genderId];
      const dialogs = dialogMessages.reduce((acc, cur) => {
         const [dialogId, dialogStrId] = cur;
         const currentDialog = i18n.texts[dialogStrId]?.replace(/[,.\s]*#\d+|{.+::|}/g, '');
         const invalidVariables = /\$map/;
         const dungeonNpc = /(manojo\sde\s)?llaves?\.*\spa[wr]a\sent[wr]a[wr]\?/;
         if (!currentDialog || currentDialog.match(invalidVariables)) return acc;
         if (currentDialog.match(dungeonNpc)) acc.push('Puedo darte acceso a esta mazmorra si me entregas la llave.');
         else acc.push(currentDialog);
         return acc;
      }, []);

      if (cache.has(name)) {
         const cached = cache.get(name);
         cached.dialogs.push(...dialogs);
         cache.set(name, cached);
         continue;
      };

      cache.set(name, { id, name, gender, imageId, dialogs });
   };

   const saintNames = ['Otul', 'Kimykay', 'multa', 'broma', 'Siluate', 'el santo', 'El santo', 'la santa', 'Igmar', 'decena', 'equivocas', 'Vermo', 'oficio'];
   for (const saintId in Saints) {
      const { name, info } = Saints[saintId];
      saintNames.push(name);
   };

   let index = 0;
   const startFrom = 0;
   for (const [name, { id, gender, imageId, dialogs: allDialogs }] of cache) {
      index++;
      if (index < startFrom || id !== 0) continue;
      console.log({ index, id, name });

      const dialogSummarized = DialogSummaries.find(dialog => dialog.id === id)?.summary;
      const dialogs = dialogSummarized || allDialogs.filter((dialog, i) => {
         if (id === 1625 && saintNames.some(saintName => dialog.includes(saintName))) return false;
         return allDialogs.findIndex(_dialog => _dialog === dialog) === i;
      });

      const saintDialog = Saints[id];
      if (saintDialog) dialogs.push(saintDialog.info);
      if (!dialogs.length) {
         DB(`dofus_npcs/${id}`).update({ name, gender, imageId });
         continue;
      };

      const description = await GetDescription({ name, dialogs });
      const data = { name, gender, imageId, dialogs, description };
      DB(`dofus_npcs/${id}`).update(data);
      PATHS[id] = data;
   };

   // await DB('dofus_npcs').update(PATHS);
   // await DB('dofus_npcs').update(QuestPositions);

   // writeFileSync(join(dirname(filename), '../output/npcs/npcs.json'), JSON.stringify(PATHS), { encoding: 'utf-8' });
};
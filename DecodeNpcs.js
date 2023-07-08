import DB from './src/modules/DB.js';
import { encode } from 'gpt-3-encoder';
import { Configuration, OpenAIApi } from 'openai';
import Npcs from './src/input/Npcs.json' assert {type: 'json'};
import i18n from './src/input/i18n_es.json' assert {type: 'json'};
import Saints from './src/data/saintsInformation.json' assert {type: 'json'};
import LongerDialogSummaries from './src/data/longerNpcDialogsSummarized.json' assert {type: 'json'};
import { config } from 'dotenv';
config();

const configuration = new Configuration({
   organization: 'org-r9a4GtQNE7dQVbp9zr25VXcN',
   apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const Skins = {
   10: 'Feca',
   11: 'Feca',
   20: 'Osamodas',
   21: 'Osamodas',
   30: 'Anutrof',
   31: 'Anutrof',
   40: 'Sram',
   41: 'Sram',
   50: 'Xelor',
   51: 'Xelor',
   60: 'Zurcarak',
   61: 'Zurcarak',
   70: 'Aniripsa',
   71: 'Aniripsa',
   80: 'Yopuka',
   81: 'Yopuka',
   90: 'Ocra',
   91: 'Ocra',
   100: 'Sadida',
   101: 'Sadida',
   110: 'Sacrógrito',
   111: 'Sacrógrito',
   120: 'Pandawa',
   121: 'Pandawa',
   1405: 'Tymador',
   1407: 'Tymador',
   1437: 'Zobal',
   1438: 'Zobal',
   1663: 'Steamer',
   1664: 'Steamer',
   3179: 'Selotrop',
   3180: 'Selotrop',
   3221: 'Forjalanza',
   3633: 'Forjalanza',
   3285: 'Hipermago',
   3286: 'Hipermago',
   3498: 'Uginak',
   3499: 'Uginak'
};

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
      if (output.match(/daniela|daneris|gluten|sebastian|matica/gi)) return await completion({ prompt, model });
      return output;
   } catch (error) {
      if (error.response) {
         console.log(error.response.status, error.response.data);
      } else {
         console.log(error.message);
      };
      return await completion({ prompt, model });
   };
};

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

/**@param {String} look */
function GetLookData(look) {
   const lookdId = parseInt(look.match(/(?<={)\d+/)[0]);
   const colorData = look.match(/(?<={\d*\|.*\|)(\d=#?[a-f0-9]+,?)+/i);
   let colors = {};
   if (colorData) {
      const colorArr = colorData[0].split(',');
      for (const color of colorArr) {
         const [id, value] = color.split('=');
         colors[id] = (color.includes('#')) ? value : '#' + parseInt(value).toString(16);
      };
   };

   let breed = null;
   let imageId = lookdId;
   if (lookdId === 1) {
      imageId = null;
      const skinId = look.match(/(?<={1\|)\d+/)?.[0];
      breed = Skins[skinId] ?? null;
   };

   return { imageId, breed, colors };
};

function FilterDuplicatedNames() {
   const cache = new Map();
   const genderType = { 0: 'Masculino', 1: 'Femenino', 2: 'No definido' };

   for (const { id, nameId, dialogMessages, gender: genderId, look } of Npcs) {
      const name = i18n.texts[nameId];
      const lookData = GetLookData(look);
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

      cache.set(name, { id, name, gender, dialogs, ...lookData });
   };

   return cache;
};

const saintNames = ['Otul', 'Kimykay', 'multa', 'broma', 'Siluate', 'el santo', 'El santo', 'la santa', 'Igmar', 'decena', 'equivocas', 'Vermo', 'oficio'];
for (const saintId in Saints) {
   const { name, info } = Saints[saintId];
   saintNames.push(name);
};

let counter = 0;
const PATHS = {};
const filteredNpcs = FilterDuplicatedNames();
const NPCS_TO_UPDATE = [];
for (const [name, { id, gender, imageId, breed, colors, dialogs: allDialogs }] of filteredNpcs) {
   counter++;
   if (NPCS_TO_UPDATE.length && !NPCS_TO_UPDATE.includes(id)) continue;
   console.log({ counter, id, name });

   const isOntoralZo = id === 1625;
   const dialogSummarized = LongerDialogSummaries.find(dialog => dialog.id === id)?.summary;
   const dialogs = dialogSummarized || allDialogs.filter((dialog, i) => {
      if (isOntoralZo && saintNames.some(saintName => dialog.includes(saintName))) return false;
      const firstDialogIndex = allDialogs.findIndex(_dialog => _dialog === dialog);
      const shouldAddDialog = i === firstDialogIndex;
      return shouldAddDialog;
   });

   const saintDialog = Saints[id];
   if (saintDialog) dialogs.push(saintDialog.info);
   if (!dialogs.length) {
      PATHS[`dofus_npcs/${id}`] = { name, gender, breed, colors, image_id: imageId };
      continue;
   };

   const description = await GetDescription({ name, dialogs });
   PATHS[`dofus_npcs/${id}`] = { name, gender, dialogs, description, breed, colors, image_id: imageId };
};

DB().update(PATHS).then(() => { console.log('Npcs updated!') });
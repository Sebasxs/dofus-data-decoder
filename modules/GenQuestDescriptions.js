import DB from './DB.js';
import { encode } from 'gpt-3-encoder';
import { Configuration, OpenAIApi } from 'openai';
import { config } from 'dotenv';
config();

const configuration = new Configuration({
   organization: 'org-r9a4GtQNE7dQVbp9zr25VXcN',
   apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const model = 'gpt-3.5-turbo-0613';

async function completion(prompt) {
   try {
      const response = await openai.createChatCompletion({
         model: model,
         messages: prompt,
         temperature: 0.4,
         frequency_penalty: 0.7,
         presence_penalty: 0.5
      });

      const output = response.data.choices.at(0).message.content
         .replace(/\n+/g, '\n')
         .replace(/(?<=\n)-(?=\w)/g, '- ')
         .replace(/((En\sresumen|En\sdefinitiva|En\sgeneral|Sinopsis|En\sconclusión)[,:].+)|"{2,}/g, '')
         .trim();

      console.log(output);
      console.table(response.data?.usage);
      return output;
   } catch (error) {
      if (error.response) {
         console.log(error.response.status, error.response.data);
      } else {
         console.log(error.message);
      };
      return await completion(prompt);
   };
};

async function GeneratePrompts() {
   const data = [];
   const quests = await DB('dofus_quests').once('value');
   quests.forEach(quest => {
      const id = parseInt(quest.key);
      const name = quest.child('name').val();
      let content = `La misión «${name}» se compone de las siguientes etapas:`;
      const steps = quest.child('steps');
      let stepCounter = 0;
      steps.forEach(step => {
         stepCounter++;
         const stepName = step.child('name').val();
         const stepDescription = step.child('description').val();
         content += `\n${stepCounter}. ${stepName}: ${stepDescription}\nObjetivos de esta etapa:`;
         step.child('objectives').forEach(objective => {
            content += `\n- ${objective.val()}`;
         });
      });
      const tokens = encode(content).length;
      if (tokens > 2000) return;

      const prompt = [{
         role: 'system',
         content: `Explicas de manera general de qué trata una misión de Dofus a partir de información suministrada. Debes interpretar las etapas y objetivos, y unirlos como si fuese una corta historia rolera. Es importante que tu explicación sea corta.`
         // content: `Eres un escritor que crea historias roleras a partir de información sobre misiones de Dofus. Las misiones están compuestas de una o más etapas y cada etapa tiene una descripción y objetivos que debe cumplir el jugador. Tus historias deben desarrollarse en el contexto de la información que te suministren, ser concisas e incluir nombres propios.`
      }, {
         role: 'user',
         content: content
      }];

      data.push({ id, name, prompt });
   });

   return data;
};

export default async function () {
   const data = await GeneratePrompts();
   let questCounter = 0;
   for (const { id, name, prompt } of data) {
      questCounter++;
      console.log({ questCounter, id, name });
      const questDescription = await completion(prompt);
      DB(`dofus_quests/${id}/description`).set(questDescription)
   };

   console.log('Quest descriptions generated!');
};


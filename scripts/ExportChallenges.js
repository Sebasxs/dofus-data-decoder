import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

function GetIncompatibleList(incompatible) {
   if (!incompatible.exists()) return '';
   let output = `La naturaleza de este reto lo hace incompatible con estos otros:`;
   incompatible.forEach(chal => {
      const chalName = chal.val();
      output += `\n- ${chalName}`;
   });
   return output + '\n\n';
};

const filename = fileURLToPath(import.meta.url);
const Challenges = await DB('dofus_challenges').once('value');
const Icons = await DB('dofus_icons/challenges').once('value');
Challenges.forEach(challenge => {
   const id = challenge.key;
   const name = challenge.child('name').val();
   const description = challenge.child('description').val();
   const criterion = challenge.child('criterion').val();
   const iconId = challenge.child('icon_id').val();
   const incompatibleChallenges = challenge.child('incompatible');
   const incompatibleStr = GetIncompatibleList(incompatibleChallenges);
   const imageUrl = Icons.child(iconId).val();
   const criterionStr = criterion ? `Para que este reto sea elegible en combate es necesario que se cumplan los siguientes criterios de activación:\n\`\`\`\n${criterion}\n\`\`\`` : 'Este reto no tiene criterios de activación, por lo tanto puede ser elegible en cualquier combate.';

   let doc =
      `## ${name}, ID: ${id}\n` +
      `En el reto «${name}» ${description.substring(0, 1).toLowerCase() + description.substring(1)}\n` +
      `${incompatibleStr}` +
      `${criterionStr}\n` +
      `Este es el ícono representativo del reto "${name}":\n` +
      `![challenge_icon](${imageUrl})`;

   writeFileSync(join(dirname(filename), `../pages/challenges/${id}.md`), doc);
});
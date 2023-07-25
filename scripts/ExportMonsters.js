import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Monsters from '../input/Monsters.json' assert{type: 'json'};

function AddPage({ raceId, page }) {
   const pages = Races.get(raceId);
   if (pages) {
      pages.push(page);
      Races.set(raceId, pages);
   } else {
      Races.set(raceId, [page]);
   };
};

function AddBasicInfo({ monster, name }) {
   const race = monster.child('race').val();
   const level = monster.child('stats/level').val();
   let output = `El monstruo **${name}** es de nivel ${level}, pertenece a la familia de *${race}*`;
   const isBoss = monster.child('is_boss').val();
   const favoriteSubarea = monster.child('favorite_subarea').val();
   if (isBoss) {
      output += ` y es el guardián de la mazmorra **${favoriteSubarea}**.\n`;
      return output;
   };

   const correspondingMonsterId = monster.child('corresponding_monster_id').val();
   const correspondingMiniBossId = monster.child('corresponding_mini_boss_id').val();
   if (correspondingMonsterId) {
      const correspondingMonster = Monsters.find(monster => monster.id === correspondingMonsterId);
      const name = i18n.texts[correspondingMonster.nameId];
      output += `, es equivalente al monstruo **${name}** y `;
   } else if (correspondingMiniBossId) {
      const correspondingMiniBoss = Monsters.find(monster => monster.id === correspondingMiniBossId);
      const name = i18n.texts[correspondingMiniBoss.nameId];
      output += `, su archimonstruo es **${name}** y `;
   } else {
      output += ` y `;
   };

   const subareas = monster.child('subareas');
   if (!subareas.exists()) {
      output += `no habita en una zona específica.\n`;
   } else if (subareas.numChildren() > 1) {
      output += `puedes encontrarle en las siguientes zonas:`;
      subareas.forEach(subarea => { output += `\n- ${subarea.val()}` });
      output += `\n\n`;
   } else {
      output += `su zona favorita es **${favoriteSubarea}**.\n`;
   };

   return output;
};

function AddStats({ monster, name }) {
   let output = `Estas son las características de ${name}:`;
   const lifePoints = monster.child('stats/life_points').val();
   output += `\n- ${lifePoints} puntos de vida`;
   const strength = monster.child('stats/strength').val();
   output += `\n- ${strength} puntos de fuerza`;
   const intelligence = monster.child('stats/intelligence').val();
   output += `\n- ${intelligence} puntos de inteligencia`;
   const chance = monster.child('stats/chance').val();
   output += `\n- ${chance} puntos de suerte`;
   const agility = monster.child('stats/agility').val();
   output += `\n- ${agility} puntos de agilidad`;
   const actionPoints = monster.child('stats/action_points').val();
   output += `\n- ${actionPoints} puntos de acción`;
   const movementPoints = monster.child('stats/movement_points').val();
   output += `\n- ${movementPoints} puntos de movimiento\n\n`;

   return output;
};

function AddResis({ monster, name }) {
   let output = `Estas son las resistencias de ${name}:`;
   const earth = monster.child('resistances/earth').val();
   output += `\n- ${earth}% a tierra`;
   const air = monster.child('resistances/air').val();
   output += `\n- ${air}% al aire`;
   const fire = monster.child('resistances/fire').val();
   output += `\n- ${fire}% a fuego`;
   const water = monster.child('resistances/water').val();
   output += `\n- ${water}% al agua`;
   const neutral = monster.child('resistances/neutral').val();
   output += `\n- ${neutral}% neutral\n\n`;

   return output;
};

function AddMoreInfo({ monster, name }) {
   let output = `Más información sobre ${name}:`;
   const canBeCarried = monster.child('can_be_carried').val();
   if (canBeCarried) output += `\n- Puede ser portado`;
   else output += `\n- No puede ser portado`;
   const canBePushed = monster.child('can_be_pushed').val();
   if (canBePushed) output += `\n- Puede ser desplazado`;
   else output += `\n- No puede ser desplazado`;
   const canSwitchPos = monster.child('can_switch_pos').val();
   if (canSwitchPos) output += `\n- Puedes cambiar posiciones con él`;
   else output += `\n- No puedes cambiar posiciones con él`;
   const canUsePortal = monster.child('can_use_portal').val();
   if (canUsePortal) output += `\n- Puede usar portales\n\n`;
   else output += `\n- No puede usar portales\n\n`;

   return output;
};

function AddImage({ monster, name }) {
   const imageId = monster.child('image_id').val();
   const image = Images.child(imageId);
   let imageUrl;

   if (image.hasChild('anim_image_url')) imageUrl = image.child('anim_image_url').val();
   else imageUrl = image.child('static_image_url').val();

   return `${name} tiene la siguiente apariencia:\n![monster_img](${imageUrl})`;
};

const filename = fileURLToPath(import.meta.url);
const Images = await DB('dofus_looks').once('value');
const Races = new Map();
const MonstersFiltered = await DB('dofus_monsters').once('value');
MonstersFiltered.forEach(monster => {
   const id = monster.key;
   const name = monster.child('name').val();
   let page = `## ${name}, ID${id}\n`
   page += AddBasicInfo({ monster, name });
   page += AddStats({ monster, name });
   page += AddResis({ monster, name });

   const spells = monster.child('spells');
   if (spells.exists()) {
      page += `Estos son los hechizos que usa ${name}:`;
      spells.forEach(spell => { page += `\n- ${spell.val()}` });
      page += `\n\n`;
   };

   const incompatibleChallenges = monster.child('incompatible_challenges');
   if (incompatibleChallenges.exists()) {
      page += `${name} es incompatible con los siguientes retos:`;
      incompatibleChallenges.forEach(challenge => { page += `\n- ${challenge.val()}` });
      page += `\n\n`;
   };

   page += AddMoreInfo({ monster, name });
   page += AddImage({ monster, name });

   const raceId = monster.child('race_id').val();
   AddPage({ raceId, page });
});

for (const [race, pages] of Races) {
   const doc = pages.join('\n\n');
   writeFileSync(join(dirname(filename), `../pages/monsters/${race}.md`), doc);
};

console.log('Monsters exported!');

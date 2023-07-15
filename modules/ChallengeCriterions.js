import i18n from '../input/i18n_es.json' assert{type: 'json'};
import Spells from '../input/Spells.json' assert{type: 'json'};
import Monsters from '../input/Monsters.json' assert{type: 'json'};

const BreedIds = {
   1: 'Feca',
   2: 'Osamodas',
   3: 'Anutrof',
   4: 'Sram',
   5: 'Xelor',
   6: 'Zurcarak',
   7: 'Aniripsa',
   8: 'Yopuka',
   9: 'Ocra',
   10: 'Sadida',
   11: 'Sacrógrito',
   12: 'Pandawa',
   13: 'Tymador',
   14: 'Zobal',
   15: 'Steamer',
   16: 'Selotrop',
   17: 'Hipermago',
   18: 'Uginak',
   20: 'Forjalanza'
};

export default function (criterion) {
   const groupLevel = criterion.matchAll(/GL[<>]\d+,\d(,\w+)?/gm);
   for (const [GL] of groupLevel) {
      const operator = GL.includes('>') ? 'mayor' : 'menor';
      const [value, type] = GL.replace(/[^\d,]/g, '').split(',');
      const groupType = type > 0 ? 'mob' : 'grupo';
      const GLText = `Nivel del ${groupType} ${operator} a ${value}`;
      criterion = criterion.replace(GL, GLText);
   };

   const groupLevelRatio = criterion.matchAll(/Gl[<>]\d+(\.\d+)?/gm);
   for (const [Gl] of groupLevelRatio) {
      const operator = Gl.includes('>') ? 'mayor' : 'menor';
      const value = Gl.replace(/[^\d\.]/g, '') * 100;
      const GlText = `Nivel del grupo debe ser ${operator} al ${value}% del nivel del mob`;
      criterion = criterion.replace(Gl, GlText);
   };

   const groupSize = criterion.matchAll(/GN[<=>]\d+,\d(,\w+)?/gm);
   for (const [GN] of groupSize) {
      let operator = 'igual';
      if (GN.includes('>')) operator = 'mayor';
      else if (GN.includes('<')) operator = 'menor';
      const [value, type] = GN.replace(/[^\d,]/g, '').split(',');
      const groupType = type > 0 ? 'monstruos' : 'jugadores';
      const GNText = `Número de ${groupType} ${operator} a ${value}`;
      criterion = criterion.replace(GN, GNText);
   };

   const groupDistance = criterion.matchAll(/GD[<>]\d+,\d/gm);
   for (const [GD] of groupDistance) {
      const operator = GD.includes('>') ? 'mayor' : 'menor';
      const [value, type] = GD.replace(/[^\d,]/g, '').split(',');
      const GDText = `Distancia mínima entre aliados y enemigos ${operator} a ${value} casillas`;
      criterion = criterion.replace(GD, GDText);
   };

   const groupDiferentLevel = criterion.matchAll(/Gd[<>]\d+,\d/gm);
   for (const [Gd] of groupDiferentLevel) {
      const operator = Gd.includes('>') ? 'Más' : 'Menos';
      const [value, type] = Gd.replace(/[^\d,]/g, '').split(',');
      const groupType = type > 0 ? 'mob' : 'grupo';
      const GdText = `${operator} de ${value} niveles diferentes en el ${groupType}`;
      criterion = criterion.replace(Gd, GdText);
   };

   const groupMonsters = criterion.matchAll(/GM[!=<>]\d,\d+,\d/gm);
   for (const [GM] of groupMonsters) {
      const [value, monsterId, type] = GM.replace(/[^\d,]/g, '').split(',');
      const groupType = type > 0 ? 'enemigo' : 'aliado';
      const monster = Monsters.find(monster => monster.id === parseInt(monsterId));
      const monsterName = monster ? i18n.texts[monster.nameId] : 'undefined';
      let GMText = `Debe haber ${value} ${monsterName} en el equipo ${groupType}`;
      if (GM.includes('>')) GMText = `Debe haber ${+value + 1} o más ${monsterName} en el equipo ${groupType}`;
      else if (GM.includes('<')) GMText = `Debe haber ${value - 1} o menos ${monsterName} en el equipo ${groupType}`;
      if (GM.includes('!')) GMText = `No deben haber ${monsterName} en el equipo ${groupType}`;
      criterion = criterion.replace(GM, GMText);
   };

   const groupSpells = criterion.matchAll(/GS>\d,\d+,\d/gm);
   for (const [GS] of groupSpells) {
      const [value, spellId, type] = GS.replace(/[^\d,]/g, '').split(',');
      const groupType = type > 0 ? 'monstruos' : 'jugadores';
      const spell = Spells.find(spell => spell.id === parseInt(spellId));
      const spellName = i18n.texts[spell.nameId];
      const GSText = GS.includes('>')
         ? `Debe haber ${+value + 1} o más ${groupType} con el hechizo ${spellName}`
         : `Debe haber ${value - 1} o menos ${groupType} con el hechizo ${spellName}`;
      criterion = criterion.replace(GS, GSText);
   };

   const groupBreeds = criterion.matchAll(/GB[<>]\d,\d+,\d/gm);
   for (const [GB] of groupBreeds) {
      const [value, breedId] = GB.replace(/[^\d,]/g, '').split(',');
      const breedName = BreedIds[breedId];
      const GBText = GB.includes('>')
         ? `Debe haber al menos un ${breedName} en el equipo`
         : `No puede haber ${breedName} en el equipo`;
      criterion = criterion.replace(GB, GBText);
   };

   const dungeonRequirement = criterion.matchAll(/Gm=d/gm);
   for (const [Gm] of dungeonRequirement) {
      criterion = criterion.replace(Gm, 'El mapa debe pertenecer a una mazmorra');
   };

   return criterion;
};
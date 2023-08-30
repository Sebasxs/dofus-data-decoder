import QuestObjectiveData from './QuestObjectiveData.js';
import Npcs from '../input/Npcs.json' assert {type: 'json'};
import Jobs from '../input/Jobs.json' assert {type: 'json'};
import Areas from '../input/Areas.json' assert {type: 'json'};
import Items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Titles from '../input/Titles.json' assert {type: 'json'};
import Breeds from '../input/Breeds.json' assert {type: 'json'};
import Months from '../input/Months.json' assert {type: 'json'};
import Quests from '../input/Quests.json' assert {type: 'json'};
import Spells from '../input/Spells.json' assert {type: 'json'};
import Mounts from '../input/Mounts.json' assert {type: 'json'};
import ItemSets from '../input/ItemSets.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import Emoticons from '../input/Emoticons.json' assert {type: 'json'};
import SmileyPacks from '../input/SmileyPacks.json' assert {type: 'json'};
import Alterations from '../input/Alterations.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};
import Achievements from '../input/Achievements.json' assert {type: 'json'};
import AlignmentRank from '../input/AlignmentRank.json' assert {type: 'json'};
import AllianceRights from '../input/AllianceRights.json' assert {type: 'json'};
import HavenbagThemes from '../input/HavenbagThemes.json' assert {type: 'json'};
import QuestObjectives from '../input/QuestObjectives.json' assert {type: 'json'};
import AlmanaxCalendars from '../input/AlmanaxCalendars.json' assert {type: 'json'};

function GetQuestName(questId) {
   const questNameId = Quests.find(quest => quest.id === parseInt(questId)).nameId;
   return i18n.texts[questNameId];
};

function GetMapCoords(mapId) {
   if (!mapId) return null;
   const map = MapPositions.find(map => parseInt(map.id) === mapId);
   if (!map) return null;
   return {
      x: map.posX,
      y: map.posY
   };
};

function ReplaceCriterionValues({ criterion, DungeonByBossId }) {
   const playerLevel = criterion.matchAll(/PL[<>]\d+/gm);
   for (const [PL] of playerLevel) {
      const operator = PL.includes('>') ? 'mayor' : 'menor';
      const value = PL.replace(/\D+/, '');
      const PLText = `Nivel ${operator} a ${value}`;
      criterion = criterion.replace(PL, PLText);
   };

   const playerItems = criterion.matchAll(/PO[<>!=E]\d+(,\d+)?/gm);
   for (const [PO] of playerItems) {
      const [first, second] = PO.split(',');
      const itemId = first.replace(/\D+/, '');
      const itemNameId = Items.find(item => item.id === parseInt(itemId)).nameId;
      const itemName = i18n.texts[itemNameId];
      const quantity = second ? parseInt(second) : 1;
      let POText = `Poseer x${quantity} ${itemName}`;
      if (PO.includes('!')) POText = `No poseer el objeto «${itemName}»`;
      else if (PO.includes('>')) POText = `Poseer x${quantity} ${itemName} o más`;
      else if (PO.includes('<')) POText = `Poseer x${quantity} ${itemName} o menos`;
      else if (PO.includes('E')) POText = `Estar equipado con «${itemName}»`;
      criterion = criterion.replace(PO, POText);
   };

   const activeQuest = criterion.matchAll(/Qa[=!]\d+/gm);
   for (const [Qa] of activeQuest) {
      const operator = Qa.includes('=') ? 'Tener' : 'No tener';
      const questId = Qa.replace(/\D+/, '');
      const questName = GetQuestName(questId);
      const QaText = `${operator} activa la misión «${questName}»`;
      criterion = criterion.replace(Qa, QaText);
   };

   const availableQuest = criterion.matchAll(/Qc[=!]\d+/gm);
   for (const [Qc] of availableQuest) {
      const operator = Qc.includes('=') ? 'Tener' : 'No tener';
      const questId = Qc.replace(/\D+/, '');
      const questName = GetQuestName(questId);
      const QcText = `${operator} disponible la misión «${questName}»`;
      criterion = criterion.replace(Qc, QcText);
   };

   const completedQuest = criterion.matchAll(/Q[Ff][=!>]\d+(,0)?/gm);
   for (const [Qf] of completedQuest) {
      const operator = (Qf.includes('=') || Qf.includes('>')) ? 'Haber' : 'No haber';
      const questId = Qf.replace(',0', '').replace(/\D+/, '');
      const questName = GetQuestName(questId);
      const QfText = `${operator} completado la misión «${questName}»`;
      criterion = criterion.replace(Qf, QfText);
   };

   const questObjective = criterion.matchAll(/Qo[>=<]\d+/gm);
   for (const [Qo] of questObjective) {
      let operator = 'Estar en';
      if (Qo.includes('>')) operator = 'Tener cumpido';
      else operator = 'No tener cumplido';
      const objectiveId = parseInt(Qo.replace(/\D+/, ''));
      const { typeId, parameters } = QuestObjectives.find(objective => objective.id === objectiveId);
      const { text } = QuestObjectiveData({ typeId, parameters, DungeonByBossId });
      const QoText = `${operator} el objetivo: «${text}»`;
      criterion = criterion.replace(Qo, QoText);
   };

   const alignmentType = criterion.matchAll(/Ps[=!]\d+/gm);
   for (const [Ps] of alignmentType) {
      const operator = Ps.includes('=') ? 'Tener' : 'No tener';
      const value = Ps.replace(/\D+/, '');
      const alignment = value === 1 ? 'Bontariano' : 'Brakmariano';
      const PsText = `${operator} alineamiento ${alignment}`;
      criterion = criterion.replace(Ps, PsText);
   };

   const alignmentLevel = criterion.matchAll(/Pa[=>]\d+/gm);
   for (const [Pa] of alignmentLevel) {
      const operator = Pa.includes('=') ? 'igual' : 'superior';
      const value = Pa.replace(/\D+/, '');
      const PaText = `Nivel de alineamiento ${operator} a ${value}`;
      criterion = criterion.replace(Pa, PaText);
   };

   const alignmentRank = criterion.matchAll(/Pr=\d+/gm);
   for (const [Pr] of alignmentRank) {
      const rankId = Pr.replace(/\D+/, '');
      const rankNameId = AlignmentRank.find(rank => rank.id === parseInt(rankId)).nameId;
      const rankName = i18n.texts[rankNameId];
      const PrText = `Ser ${rankName}`;
      criterion = criterion.replace(Pr, PrText);
   };

   const playerPosition = criterion.matchAll(/Pm[!=]\d+/gm);
   for (const [Pm] of playerPosition) {
      const mapId = parseInt(Pm.replace(/\D+/, ''));
      const coords = GetMapCoords(mapId);
      const subAreaId = MapPositions.find(map => parseInt(map.id) === mapId).subAreaId;
      const subAreaNameId = SubAreas.find(subarea => subarea.id === subAreaId).nameId;
      const subAreaName = i18n.texts[subAreaNameId];
      const operator = Pm.includes('=') ? 'Estar' : 'No estar';
      const PmText = `${operator} en la posición [${coords.x},${coords.y}] (${subAreaName})`;
      criterion = criterion.replace(Pm, PmText);
   };

   const playerJob = criterion.matchAll(/P[Jj][>=<](a|\d+)(,\d+)?/gm);
   for (const [PJ] of playerJob) {
      const [jobId, jobLevel] = PJ.replace(/P[Jj][>=<]/, '').split(',');
      if (jobId === 'a') criterion = criterion.replace(PJ, 'Tener algún oficio nivel 200');
      else {
         const jobNameId = Jobs.find(job => job.id === parseInt(jobId)).nameId;
         const jobName = i18n.texts[jobNameId];
         let PJText = `Ser ${jobName}`;
         if (jobLevel && PJ.includes('>')) PJText += ` con nivel mayor a ${jobLevel}`;
         else if (jobLevel && PJ.includes('<')) PJText += ` con nivel menor a ${jobLevel}`;
         criterion = criterion.replace(PJ, PJText);
      };
   };

   const playerSubscribed = criterion.matchAll(/PZ=[01]/gmi);
   for (const [PJ] of playerSubscribed) {
      criterion = criterion.replace(PJ, 'Estar abonado');
   };

   const playerBreed = criterion.matchAll(/PG[!=]\d+/gm);
   for (const [PG] of playerBreed) {
      const breedId = parseInt(PG.replace(/\D+/, ''));
      const shortNameId = Breeds.find(breed => breed.id === breedId).shortNameId;
      const breedName = i18n.texts[shortNameId];
      const operator = PG.includes('=') ? 'Ser' : 'No ser';
      const PGText = `${operator} ${breedName}`;
      criterion = criterion.replace(PG, PGText);
   };

   const achievementUnlocked = criterion.matchAll(/OA=\d+/gm);
   for (const [OA] of achievementUnlocked) {
      const achievementId = parseInt(OA.replace(/\D+/, ''));
      const achievementNameId = Achievements.find(achv => achv.id === achievementId).nameId;
      const achievementName = i18n.texts[achievementNameId];
      const OAText = `Haber desbloqueado el logro «${achievementName}»`;
      criterion = criterion.replace(OA, OAText);
   };

   const activeAlterations = criterion.matchAll(/HA[!=]\d+/gm);
   for (const [HA] of activeAlterations) {
      const alterationId = parseInt(HA.replace(/\D+/, ''));
      const alterationNameId = Alterations.find(alt => alt.id === alterationId).nameId;
      const alterationName = i18n.texts[alterationNameId];
      const operator = HA.includes('=') ? 'Poseer' : 'No poseer';
      const HAText = `${operator} la alteración «${alterationName}»`;
      criterion = criterion.replace(HA, HAText);
   };

   const almanaxDay = criterion.matchAll(/Ad=\d+/gm);
   for (const [Ad] of almanaxDay) {
      const dayId = parseInt(Ad.replace(/\D+/, ''));
      const saintId = AlmanaxCalendars.find(day => day.id === dayId).npcId;
      const saintNameId = Npcs.find(npc => npc.id === saintId).nameId;
      const saintName = i18n.texts[saintNameId];
      const AdText = `Día del meridiano de ${saintName}`;
      criterion = criterion.replace(Ad, AdText);
   };

   const itemReceivedMinutesAgo = criterion.matchAll(/DM>\d+,\d+/gm);
   for (const [DM] of itemReceivedMinutesAgo) {
      const [minutes, itemId] = DM.replace('DM>', '').split(',');
      const itemNameId = Items.find(item => item.id === parseInt(itemId)).nameId;
      const itemName = i18n.texts[itemNameId];
      const DMText = `Haber recibido «${itemName}» hace más de ${minutes} minutos`;
      criterion = criterion.replace(DM, DMText);
   };

   const itemReceivedDaysAgo = criterion.matchAll(/DD[><]\d+,\d+/gm);
   for (const [DD] of itemReceivedDaysAgo) {
      const [days, itemId] = DD.replace(/DD[><]/, '').split(',');
      const itemNameId = Items.find(item => item.id === parseInt(itemId)).nameId;
      const itemName = i18n.texts[itemNameId];
      const operator = DD.includes('>') ? 'más' : 'menos';
      const DDText = `Haber recibido «${itemName}» hace ${operator} de ${days} días`;
      criterion = criterion.replace(DD, DDText);
   };

   const itemReceivedHoursAgo = criterion.matchAll(/DH>\d+,\d+/gm);
   for (const [DH] of itemReceivedHoursAgo) {
      const [hours, itemId] = DH.replace('DH>', '').split(',');
      const itemNameId = Items.find(item => item.id === parseInt(itemId)).nameId;
      const itemName = i18n.texts[itemNameId];
      const DHText = `Haber recibido «${itemName}» hace más de ${hours} horas`;
      criterion = criterion.replace(DH, DHText);
   };

   const characteristics = criterion.matchAll(/C[a-z][><=]\d+/gmi);
   for (const [characteristic] of characteristics) {
      const typeRef = characteristic.substring(0, 2);
      const operatorSymbol = characteristic.substring(2, 3);
      let operator = 'igual a';
      if (operatorSymbol === '>') operator = 'mayor a';
      else if (operatorSymbol === '<') operator = 'menor a';
      const value = characteristic.substring(3);
      let type;
      if (typeRef.toUpperCase() === 'CC') type = 'Suerte';
      else if (typeRef.toUpperCase() === 'CI') type = 'Inteligencia';
      else if (typeRef.toUpperCase() === 'CV') type = 'Vitalidad';
      else if (typeRef.toUpperCase() === 'CA') type = 'Agilidad';
      else if (typeRef.toUpperCase() === 'CW') type = 'Sabiduría';
      else if (typeRef.toUpperCase() === 'CS') type = 'Fuerza';
      else if (typeRef.toUpperCase() === 'CP') type = 'Puntos de acción';
      else if (typeRef.toUpperCase() === 'CM') type = 'Puntos de movimiento';
      const CText = `${type} ${operator} ${value}`;
      criterion = criterion.replace(characteristic, CText);
   };

   const emoticons = criterion.matchAll(/PE[=!]\d+/gm);
   for (const [PE] of emoticons) {
      const operator = PE.includes('=') ? 'Conocer' : 'No conocer';
      const emoteId = PE.replace(/\D+/, '');
      const emote = Emoticons.find(emote => emote.id === parseInt(emoteId));
      const emoteName = i18n.texts[emote.nameId]
      const PEText = `${operator} la actitud «${emoteName}»`;
      criterion = criterion.replace(PE, PEText);
   };

   const unequippable = criterion.matchAll(/BI=\d+/gm);
   for (const [BI] of unequippable) {
      const BIText = `Objeto no equipable`;
      criterion = criterion.replace(BI, BIText);
   };

   const gameMaster = criterion.match(/PX=./gm)?.[0];
   if (gameMaster) criterion = criterion.replace(gameMaster, 'Ser un Game Master');

   const singleOnly = criterion.match(/PR=0/gm)?.[0];
   if (singleOnly) criterion = criterion.replace(singleOnly, 'Estar soltero/a');

   const beOnTheServer = criterion.match(/SI=\d+/)?.[0];
   if (beOnTheServer) {
      const serverId = beOnTheServer.replace(/\D+/, '');
      criterion = criterion.replace(beOnTheServer, `Estar en el servidor ${serverId}`);
   };

   const hasKamas = criterion.match(/PK>\d+/)?.[0];
   if (hasKamas) {
      const kamas = hasKamas.replace(/\D+/, '');
      criterion = criterion.replace(hasKamas, `Tener más de ${kamas} kamas`);
   };

   const beOnTheCell = criterion.match(/PC=\d+/)?.[0];
   if (beOnTheCell) {
      const cellId = beOnTheCell.replace(/\D+/, '');
      criterion = criterion.replace(beOnTheCell, `Estar en la celda ${cellId}`);
   };

   const requireGuild = criterion.match(/Pw=1/)?.[0];
   if (requireGuild) criterion = criterion.replace(requireGuild, 'Pertenecer a un gremio');

   const requireAlliance = criterion.match(/Ow=[12]/)?.[0];
   if (requireAlliance) criterion = criterion.replace(requireAlliance, 'Pertenecer a una alianza');

   const prismOnMap = criterion.match(/Mp=3/)?.[0];
   if (prismOnMap) criterion = criterion.replace(prismOnMap, 'Hay un prisma en estado vulnerable puesto en el mapa');

   const petmounts = criterion.match(/Mw=0/)?.[0];
   if (petmounts) criterion = criterion.replace(petmounts, 'No tener equipadas mascoturas o encarnaciones');

   const guildMaster = criterion.match(/GM=1/)?.[0];
   if (guildMaster) criterion = criterion.replace(guildMaster, 'Ser jefe de gremio');

   const allianceMaster = criterion.match(/AM=1/)?.[0];
   if (allianceMaster) criterion = criterion.replace(allianceMaster, 'Ser general de alianza');

   const subareaFree = criterion.match(/Oc=R/)?.[0];
   if (subareaFree) criterion = criterion.replace(subareaFree, 'Subarea no capturada por una alianza');

   const notFullLife = criterion.match(/OL!0/)?.[0];
   if (notFullLife) criterion = criterion.replace(notFullLife, 'No tener todos los puntos de vida');

   const requireGuildLevel = criterion.match(/Py>\d+/)?.[0];
   if (requireGuildLevel) {
      const guildLevel = requireGuildLevel.replace(/\D+/, '');
      criterion = criterion.replace(requireGuildLevel, `Nivel de gremio mayor a ${guildLevel}`);
   };

   const singleSetEquipped = criterion.match(/OS=\d+/gm)?.[0];
   if (singleSetEquipped) {
      const setId = singleSetEquipped.replace(/\D+/, '');
      const set = ItemSets.find(set => set.id === parseInt(setId));
      const setName = i18n.texts[set.nameId];
      criterion = criterion.replace(singleSetEquipped, `Solamente deben ocuparse los objetos del set «${setName}»`);
   };

   const playerSex = criterion.match(/PS=[01]/gm)?.[0];
   if (playerSex) {
      const value = playerSex.replace(/\D+/, '');
      const sex = value === '0' ? 'masculino' : 'femenino';
      criterion = criterion.replace(playerSex, `Ser del sexo ${sex}`);
   };

   const harness = criterion.match(/Of=\d/)?.[0];
   if (harness) {
      const value = harness.replace(/\D+/, '');
      let harnessType;
      if (value === '1') harnessType = 'Dragopavo';
      else if (value === '5') harnessType = 'Mulagua';
      else if (value === '6') harnessType = 'Vueloceronte';
      criterion = criterion.replace(harness, `Tener equipada una montura ${harnessType}`);
   };

   const pods = criterion.matchAll(/PW[><]\d+/gm);
   for (const [PW] of pods) {
      const operator = PW.includes('>') ? 'más' : 'menos';
      const value = PW.replace(/\D+/, '');
      const PWText = `Tener ${operator} de ${value} pods`;
      criterion = criterion.replace(PW, PWText);
   };

   const itemEquiped = criterion.matchAll(/POX\d+/gm);
   for (const [POX] of itemEquiped) {
      const itemId = POX.replace(/\D+/, '');
      const item = Items.find(item => item.id === parseInt(itemId));
      const itemName = i18n.texts[item.nameId];
      const POXText = `No tener equipado ${itemName}`;
      criterion = criterion.replace(POX, POXText);
   };

   const areas = criterion.matchAll(/Po[!=]\d+/gm);
   for (const [Po] of areas) {
      const areaId = Po.replace(/\D+/, '');
      const area = Areas.find(area => area.id === parseInt(areaId));
      const areaName = i18n.texts[area.nameId];
      const operator = Po.includes('=') ? 'Zona: ' : 'Zona distinta de';
      const PoText = `${operator} ${areaName}`;
      criterion = criterion.replace(Po, PoText);
   };

   const currentMonth = criterion.match(/SG=\d+/)?.[0];
   if (currentMonth) {
      const monthNumber = currentMonth.replace(/\D+/, '');
      const month = Months.find(month => month.id === parseInt(monthNumber));
      const monthName = i18n.texts[month.nameId];
      criterion = criterion.replace(currentMonth, `Estar en el mes de ${monthName}`);
   };

   const daysOfMonth = criterion.matchAll(/Sd[><]\d+/gm);
   for (const [Sd] of daysOfMonth) {
      const day = Sd.replace(/\D+/, '');
      const operator = Sd.includes('<') ? 'menor a' : 'mayor a';
      const SdText = `Día del mes ${operator} ${day}`;
      criterion = criterion.replace(Sd, SdText);
   };

   const subareaLevel = criterion.matchAll(/SL[><]\d+/gm);
   for (const [SL] of subareaLevel) {
      const level = SL.replace(/\D+/, '');
      const operator = SL.includes('>') ? 'superior' : 'inferior';
      const SLText = `Estar en un territorio de nivel ${operator} a ${level}`;
      criterion = criterion.replace(SL, SLText);
   };

   const allianceRight = criterion.matchAll(/Ox=\d+/gm);
   for (const [Ox] of allianceRight) {
      const rightId = Ox.replace(/\D+/, '');
      const right = AllianceRights.find(ar => ar.id === parseInt(rightId));
      const rightName = i18n.texts[right.nameId];
      const OxText = `Posesión del derecho de alianza: ${rightName}`;
      criterion = criterion.replace(Ox, OxText);
   };

   const mountForbidden = criterion.matchAll(/Pf!\d+/gm);
   for (const [Pf] of mountForbidden) {
      const mountId = Pf.replace(/\D+/, '');
      const mount = Mounts.find(mount => mount.id === parseInt(mountId));
      const mountName = i18n.texts[mount.nameId];
      const PfText = `No tener equipado: ${mountName}`;
      criterion = criterion.replace(Pf, PfText);
   };

   const spells = criterion.matchAll(/PT[!=]\d+/gm);
   for (const [PT] of spells) {
      const spellId = PT.replace(/\D+/, '');
      const spell = Spells.find(spell => spell.id === parseInt(spellId));
      const spellName = i18n.texts[spell.nameId];
      const operator = PT.includes('=') ? 'Conocer' : 'No conocer';
      const PTText = `${operator} el hechizo ${spellName}`;
      criterion = criterion.replace(PT, PTText);
   };

   const smileys = criterion.matchAll(/Os!\d+/gm);
   for (const [Os] of smileys) {
      const smileyId = Os.replace(/\D+/, '');
      const smiley = SmileyPacks.find(smiley => smiley.id === parseInt(smileyId));
      const smileyName = i18n.texts[smiley.nameId];
      const OsText = `No poseer los emoticonos «${smileyName}»`;
      criterion = criterion.replace(Os, OsText);
   };

   const havenbags = criterion.matchAll(/OH!\d+/gm);
   for (const [OH] of havenbags) {
      const havenbagId = OH.replace(/\D+/, '');
      const havenbag = HavenbagThemes.find(havenbag => havenbag.id === parseInt(havenbagId));
      if (!havenbag) return null;
      const havenbagName = i18n.texts[havenbag.nameId];
      const OHText = `No poseer el tema de merkasako «${havenbagName}»`;
      criterion = criterion.replace(OH, OHText);
   };

   const slots = criterion.matchAll(/Pn!\d+/gm);
   for (const [Os] of slots) {
      let slotName = '';
      const slotId = Os.replace(/\D+/, '');
      if (slotId === '8') slotName = 'Mascota, Equipo de montura';
      else if (['22', '23'].includes(slotId)) slotName = 'Bendición';
      else if (['24', '25'].includes(slotId)) slotName = 'Maldición';
      else if (slotId === '26') slotName = 'Bono de juego de roles';
      else if (slotId === '27') slotName = 'Seguidor';
      else if (slotId === '30') slotName = 'Traje';
      const OsText = `Tener libre el slot «${slotName}»`;
      criterion = criterion.replace(Os, OsText);
   };

   const titles = criterion.matchAll(/Ot!\d+/gm);
   for (const [Ot] of titles) {
      const titleId = Ot.replace(/\D+/, '');
      const title = Titles.find(title => title.id === parseInt(titleId));
      const titleNameMale = i18n.texts[title.nameMaleId];
      const titleNameFemale = i18n.texts[title.nameFemaleId];
      let OtText = `No poseer el título «${titleNameMale}»`;
      if (titleNameMale !== titleNameFemale) OtText = `No poseer el título ${titleNameMale} / ${titleNameFemale}`;
      criterion = criterion.replace(Ot, OtText);
   };

   const totalAchievements = criterion.matchAll(/Oa>\d+/gm);
   for (const [Oa] of totalAchievements) {
      const numAchievements = Oa.replace(/\D+/, '');
      let OaText = `Tener más de ${numAchievements} puntos de logro`;
      criterion = criterion.replace(Oa, OaText);
   };

   const setBonus = criterion.matchAll(/Pk<\d+/gm);
   for (const [Pk] of setBonus) {
      const currentBonus = Pk.replace(/\D+/, '');
      let PkText = `Tener menos de ${currentBonus} bonus de set`;
      criterion = criterion.replace(Pk, PkText);
   };

   const accumulatedSubscription = criterion.matchAll(/OV>\d+/gm);
   for (const [OV] of accumulatedSubscription) {
      const days = OV.replace(/\D+/, '');
      let OVText = `Tener más de ${days} días de abono acumulado`;
      criterion = criterion.replace(OV, OVText);
   };

   return criterion
      .replace(/UF!0,0|BT=1|Pc=11\ny /gi, '')
      .replace(/\n?\t*([yo]\s)?PX=./gi, '')
      .replace(/\n?\t*([yo]\s)?(SC|ST|PB)[=!]\d+,?\d*(\ny\s)?/gi, '')
      .replace(/^\n\ty\s/, '\t');
};

function FormatCriterionRecursively(criterion) {
   if (!criterion.match(/[()]/)) return criterion;
   if (criterion.includes('(')) {
      const [first, ...rest] = criterion.split('(');
      const restIndentation = '\t' + rest.join('(').replace(/\n/g, '\n\t');
      return FormatCriterionRecursively(first + restIndentation);
   };
   const [first, ...rest] = criterion.split(')');
   const restIndentation = rest.join(')').replace(/\n\t/g, '\n');
   return first + FormatCriterionRecursively(restIndentation);
};

export default function ({ startCriterion, DungeonByBossId }) {
   if (!startCriterion) return 'Ninguno';
   const _startCriterion = startCriterion
      .replace(/(\()([a-z]+[=!<>]\d+,?\w*,?\w*)(\))/gi, '$2')
      .replace(/(^\()(([a-z]+[=!<>]\d+,?\w*,?\w*\|?)+)(\)$)/gi, '$2')
      .replace(/&(?!\()/g, '\ny ')
      .replace(/&(?=\()/g, '\ny\n')
      .replace(/\|(?=\()/g, '\no \n')
      .replace(/\|/g, '\no ');

   const criterion = FormatCriterionRecursively(_startCriterion);
   const criterionAsText = ReplaceCriterionValues({ criterion, DungeonByBossId });
   return criterionAsText || 'Ninguno';
};
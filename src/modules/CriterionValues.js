import QuestObjectiveData from './QuestObjectiveData.js';
import Npcs from '../input/Npcs.json' assert {type: 'json'};
import Jobs from '../input/Jobs.json' assert {type: 'json'};
import Items from '../input/Items.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Breeds from '../input/Breeds.json' assert {type: 'json'};
import Quests from '../input/Quests.json' assert {type: 'json'};
import SubAreas from '../input/SubAreas.json' assert {type: 'json'};
import Alterations from '../input/Alterations.json' assert {type: 'json'};
import MapPositions from '../input/MapPositions.json' assert {type: 'json'};
import Achievements from '../input/Achievements.json' assert {type: 'json'};
import AlignmentRank from '../input/AlignmentRank.json' assert {type: 'json'};
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

function ReplaceCriterionValues(criterion) {
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

   const questObjective = criterion.matchAll(/Qo[=>]\d+/gm);
   for (const [Qo] of questObjective) {
      const operator = Qo.includes('=') ? 'Estar en' : 'Tener cumplido';
      const objectiveId = parseInt(Qo.replace(/\D+/, ''));
      const { typeId, parameters } = QuestObjectives.find(objective => objective.id === objectiveId);
      const { text } = QuestObjectiveData(typeId, parameters);
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

   const playerPosition = criterion.matchAll(/Pm=\d+/gm);
   for (const [Pm] of playerPosition) {
      const mapId = parseInt(Pm.replace(/\D+/, ''));
      const coords = GetMapCoords(mapId);
      const subAreaId = MapPositions.find(map => parseInt(map.id) === mapId).subAreaId;
      const subAreaNameId = SubAreas.find(subarea => subarea.id === subAreaId).nameId;
      const subAreaName = i18n.texts[subAreaNameId];
      const PmText = `Estar en [${coords.x},${coords.y}] (${subAreaName})`;
      criterion = criterion.replace(Pm, PmText);
   };

   const playerJob = criterion.matchAll(/P[Jj]>(a|\d+),\d+/gm);
   for (const [PJ] of playerJob) {
      const [jobId, jobLevel] = PJ.replace(/P[Jj]>/, '').split(',');
      if (jobId === 'a') criterion = criterion.replace(PJ, 'Tener algún oficio nivel 200');
      else {
         const jobNameId = Jobs.find(job => job.id === parseInt(jobId)).nameId;
         const jobName = i18n.texts[jobNameId];
         const PJText = `Oficio ${jobName} mayor a ${jobLevel}`;
         criterion = criterion.replace(PJ, PJText);
      }
   };

   const playerSubscribed = criterion.matchAll(/PZ=1/gm);
   for (const [PJ] of playerSubscribed) {
      criterion = criterion.replace(PJ, 'Estar abonado');
   };

   const playerBreed = criterion.matchAll(/PG=\d+/gm);
   for (const [PG] of playerBreed) {
      const breedId = parseInt(PG.replace(/\D+/, ''));
      const shortNameId = Breeds.find(breed => breed.id === breedId).shortNameId;
      const breedName = i18n.texts[shortNameId];
      const PGText = `Ser ${breedName}`;
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

   const activeAlterations = criterion.matchAll(/HA=\d+/gm);
   for (const [HA] of activeAlterations) {
      const alterationId = parseInt(HA.replace(/\D+/, ''));
      const alterationNameId = Alterations.find(alt => alt.id === alterationId).nameId;
      const alterationName = i18n.texts[alterationNameId];
      const HAText = `Poseer la alteración «${alterationName}»`;
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

   const itemReceivedDaysAgo = criterion.matchAll(/DD>\d+,\d+/gm);
   for (const [DD] of itemReceivedDaysAgo) {
      const [days, itemId] = DD.replace('DD>', '').split(',');
      const itemNameId = Items.find(item => item.id === parseInt(itemId)).nameId;
      const itemName = i18n.texts[itemNameId];
      const DDText = `Haber recibido «${itemName}» hace más de ${days} días`;
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

   return criterion.replace(/BT=1|\n?\t*(y\s)?(Sc|Sv)=\d+,?\d+?/g, '');
};

function FormatCriterion(criterion) {
   if (!criterion.match(/[()]/)) return criterion;
   if (criterion.includes('(')) {
      const [first, ...rest] = criterion.split('(');
      const restIndentation = '\t' + rest.join('(').replace(/\n/g, '\n\t');
      criterion = first + restIndentation;
      return FormatCriterion(criterion);
   }
   const [first, ...rest] = criterion.split(')');
   const restIndentation = rest.join(')').replace(/\n\t/g, '\n');
   return first + FormatCriterion(restIndentation);
};

export default function (_criterion) {
   const criterion = _criterion
      .replace(/&(?!\()/g, '\ny ')
      .replace(/&(?=\()/g, '\ny\n')
      .replace(/\|/g, '\no\n');

   const formattedCriterion = FormatCriterion(criterion);
   return ReplaceCriterionValues(formattedCriterion);
};
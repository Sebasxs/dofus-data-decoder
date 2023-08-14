import DB from '../modules/DB.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import i18n from '../input/i18n_es.json' assert{type: 'json'};
import ReplaceExpressions from '../modules/ChallengeCriterions.js';
import Challenges from '../input/Challenges.json' assert{type: 'json'};

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

function GetCriterion(expression) {
   const mainOperatorsReplaced = expression
      .replace(/&?\(?g[cve][>=<!]\d+(,\w+)*\)?\|?/gi, '')
      .replace(/(\()([a-z]+[=!<>]\d+,?\w*,?\w*)(\))/gi, '$2')
      .replace(/(^\()(([a-z]+[=!<>]\d+,?\w*,?\w*\|?)+)(\)$)/gi, '$2')
      .replace(/&(?!\()/g, '\ny ')
      .replace(/&(?=\()/g, '\ny\n')
      .replace(/\|(?=\()/g, '\no \n')
      .replace(/\|/g, '\no ');

   const expressionFormatted = FormatCriterionRecursively(mainOperatorsReplaced);
   const criterion = ReplaceExpressions(expressionFormatted);
   return criterion;
};

const cache = new Set();
function ValidateChallenge({ categoryId, nameId, activationCriterion }) {
   const name = i18n.texts[nameId];
   const notAllowedCategory = [3, 10, 11].includes(categoryId);
   const isDungeonChallenge = activationCriterion.includes('BV');
   if (cache.has(name) || notAllowedCategory || isDungeonChallenge) return false;
   cache.add(name);
   return true;
};

function FilterIncompatibleChallenges(incompatibleChallenges) {
   const cache = new Set();
   return incompatibleChallenges.reduce((acc, cur) => {
      const currentChal = Challenges.find(chal => chal.id === cur);
      if (!currentChal) return acc;
      const chalName = i18n.texts[currentChal.nameId];
      if (cache.has(chalName)) return acc;
      cache.add(chalName);
      acc[cur] = chalName;
      return acc;
   }, {});
};

const PATHS = {};
for (const challenge of Challenges) {
   const { id, nameId, iconId, categoryId, descriptionId } = challenge;
   const { activationCriterion, incompatibleChallenges } = challenge;
   if (!ValidateChallenge(challenge)) continue;

   const name = i18n.texts[nameId];
   const description = i18n.texts[descriptionId].replace(/\n+/g, '\n');
   const criterion = GetCriterion(activationCriterion);
   const incompatible = FilterIncompatibleChallenges(incompatibleChallenges);

   PATHS[id] = {
      name,
      criterion,
      description,
      incompatible,
      icon_id: iconId,
      category_id: categoryId,
   };
};

const filename = fileURLToPath(import.meta.url);
writeFileSync(
   join(dirname(filename), '../output/challenges.json'),
   JSON.stringify(PATHS)
);

DB('dofus_challenges').update(PATHS);
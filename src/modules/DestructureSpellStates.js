import i18n from '../input/i18n_es.json' assert {type: 'json'};
import SpellStates from '../input/SpellStates.json' assert { type: 'json'};

function GetCombinations(arrays) {
   let combinations = [[]];
   for (let i = 0; i < arrays.length; i++) {
      const currentArray = arrays[i];
      let tempCombinations = [];
      for (let j = 0; j < currentArray.length; j++) {
         const currentElement = currentArray[j];
         for (let k = 0; k < combinations.length; k++) {
            const currentCombination = combinations[k];
            tempCombinations.push([...currentCombination, currentElement]);
         };
      };
      combinations = tempCombinations;
   };
   return combinations;
};

function FormatCombinations(combinations) {
   const GetStateNames = (stateArray) => {
      return stateArray.map(state => {
         const stateId = parseInt(state.replace(/\D+/, ''));
         const stateNameId = SpellStates.find(state => state.id === stateId)?.nameId;
         if (!stateNameId) return 'undefined';
         return i18n.texts[stateNameId].replace(/{.+?>|<.+?}/g, '');
      });
   };

   return combinations.map(combination => {
      const states = combination.join('&').split('&');

      const requiredStates = states.filter(state => state.includes('='));
      const requiredStateNames = GetStateNames(requiredStates);

      const forbiddenStates = states.filter(state => state.includes('!'));
      const forbiddenStateNames = GetStateNames(forbiddenStates);

      return {
         requiredStates: requiredStateNames,
         forbiddenStates: forbiddenStateNames,
      }
   });
};

/**@param {String} expression */
export default function (expression) {
   if (['null', ''].includes(expression)) return null;
   let nonGroupedExpression = expression
      .replace(/\(((HS[=!]\d+\|)+)(HS[=!]\d+)\)|[()]/g, '')
      .replace(/^&/, '')
      .replace(/&$/, '')
      .split('|');

   const groupsToCombine = [nonGroupedExpression];

   const disjuntiveGroups = expression.match(/\(((HS[=!]\d+\|)+)(HS[=!]\d+)\)/g);
   if (disjuntiveGroups) {
      disjuntiveGroups.forEach(group => {
         const states = group.replace(/[^HS=!0-9\|]/g, '').split('|');
         groupsToCombine.push(states);
      });
   };

   const combinations = GetCombinations(groupsToCombine);
   return FormatCombinations(combinations);
};
import DB from './src/modules/DB.js';
import jobs from './src/modules/Jobs.js';
import hints from './src/modules/Hints.js';
import breeds from './src/modules/Breeds.js';
import documents from './src/modules/Documents.js';
import descriptions from './src/modules/FeatureDescriptions.js';
import recipes from './src/modules/Recipes.js';

(async () => {
   // const jobsObject = await jobs();
   // DB('dofus_jobs').update(jobsObject);

   // const breedObject = await breeds();
   // DB('dofus_breeds').update(breedObject);

   // documents();
   // descriptions();
   // hints();
   recipes();
})();
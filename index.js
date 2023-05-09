import DB from './src/modules/DB.js';
import jobs from './src/modules/Jobs.js';
import breeds from './src/modules/Breeds.js';

(async () => {
   // const jobsObject = await jobs();
   // DB('dofus_jobs').update(jobsObject);

   const breedObject = await breeds();
   DB('dofus_breeds').update(breedObject);
})();
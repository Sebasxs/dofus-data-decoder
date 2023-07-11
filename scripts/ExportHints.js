import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Hints from '../input/Hints.json' assert {type: 'json'};
import Areas from '../input/Areas.json' assert {type: 'json'};
import i18n from '../input/i18n_es.json' assert {type: 'json'};
import Subareas from '../input/SubAreas.json' assert {type: 'json'};
import HintCategories from '../input/HintCategory.json' assert {type: 'json'};

const filename = fileURLToPath(import.meta.url);
for (const { nameId, id } of HintCategories) {
   const categoryName = i18n.texts[nameId];
   let markdown = `## ${categoryName}\n${categoryName} en el mundo de Dofus:`;
   Hints
      .filter(hint => hint.categoryId === id)
      .forEach(hint => {
         const { nameId, x, y, subareaId } = hint;
         const hintName = i18n.texts[nameId];
         const subarea = Subareas.find(subarea => subarea.id === subareaId);
         const subareaNameId = subarea.nameId;
         const areaNameId = Areas.find(area => area.id === subarea.areaId).nameId;
         const areaName = i18n.texts[areaNameId];
         const subareaName = i18n.texts[subareaNameId];
         markdown += `\n- ${hintName} en ${areaName} en la posición [${x},${y}].`;
      });
   writeFileSync(join(dirname(filename), `../pages/hints/${id}.md`), markdown, { encoding: 'utf-8' });
};

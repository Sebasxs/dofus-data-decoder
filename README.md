<h1 align="center">Dofus data decoder</h1>

## About data
- 📝 The exported .MD files are useful for context injection into [Corinna's](https://github.com/Sebasxs/Corinna) AI-based responses; the information is splitted into sections and rarely exceeds 300 tokens each.
- 🔗 Data uploaded to the database (or exported as JSON files) are treated as menu components on [Discord](https://t.co/pin0Y7mWYp).
- ⚠ Input data must be located in the **`/input`** folder in JSON format.

> The language can be changed by changing the `i18n_(lang).json` file and some phrases around the scripts.
Corinna is a hispanic community management system, therefore the exported data is by default in `spanish`.

---

## Scripts

### [Decode Spells](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeSpells.js)
Decode all character/monster spells including effects, criterions and details.
```Shell
$ node DecodeSpells
# Database root updated 'dofus_spells'
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeQuests.js) & [Export]() Quests
Decode and update quest information.
```Shell
$ node DecodeQuests
# Database root updated 'dofus_quests'
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeNpcs.js) & [Export](https://github.com/Sebasxs/dofus-data-decoder/blob/main/ExportNpcs.js) NPCs
- Generate NPC descriptions based on their dialogues.
- Update NPC coords for each quest involved.
- Export all collected NPC information.

```Shell
$ node DecodeNpcs
# Fill the *NPCS_TO_UPDATE* array with the IDs you want to decode, or leave it empty to decode everything.
# Database root updated 'dofus_npcs'
$ node ExportNpcs
# Output: src/pages/npcs/*.md
```

### [Decode Jobs](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeJobs.js)
Decode the information of all jobs.
```Shell
$ node DecodeJobs
# Output: src/pages/jobs/*.md
# Database root updated 'dofus_jobs'
```

### [Decode Recipes](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeRecipes.js)
Decode all item recipes.
```Shell
$ node DecodeRecipes
# Database root updated 'dofus_recipes'
```

### [Decode Maps](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeMaps.js)
Decode the information of every map in the game.
```Shell
$ node DecodeMaps
# Database root updated 'dofus_maps'
```

### [Decode SubAreas](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeSubAreas.js)
- Decode and update all subareas data.
- Update NPCs positions based on subareas data.
- Export markdown files with named-maps info and image urls.
```Shell
$ node DecodeSubAreas
# Database root updated 'dofus_subareas'
# Database root updated 'dofus_npcs'
# Output: src/pages/subareas/*.md
```

### [Decode Breeds](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeBreeds.js)
A brief introduction to Dofus breeds and their gameplay.
```Shell
$ node DecodeBreeds
# Output: src/pages/breeds/*.md
# Database root updated 'dofus_breeds'
```

### [Export Hints](https://github.com/Sebasxs/dofus-data-decoder/blob/main/ExportHints.js)
Export coords of key places in Dofus.
```shell
$ node ExportHints
# Output: src/pages/hints/*.md
```

### [Export Documents](https://github.com/Sebasxs/dofus-data-decoder/blob/main/ExportDocuments.js)
Transcription of game books and documents with their respective images.
```Shell
$ node ExportDocuments
# Output: src/pages/documents/*.md
```

### [Export Feature Descriptions](https://github.com/Sebasxs/dofus-data-decoder/blob/main/ExportFeatures.js)
Information about the main features of Dofus.
```Shell
$ node ExportFeatures
# Output: src/pages/guides/*.md
# Output: src/data/guidebookImageNames.json
```

### [Map captions](https://github.com/Sebasxs/dofus-data-decoder/blob/main/AddMapCaptions.js)
Add captions and watermark to map images.
```Shell
$ node AddMapCaptions
# Input: src/output/maps/map-images/*.jpg
# Output: src/output/maps/map-coords/*.jpg
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/DecodeDungeons.js) & [Export]() Dungeons
Decode and update key information about every dungeon.
```Shell
$ node DecodeDungeons
# Database root updated 'dofus_dungeons'
```
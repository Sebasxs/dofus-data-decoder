<h1 align="center">Dofus data decoder</h1>
<p align="center">
<img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/sebasxs/dofus-data-decoder?label=Repo%20size">
<img alt="GitHub top language" src="https://img.shields.io/github/languages/top/sebasxs/dofus-data-decoder?color=8A2BE2">
<!<img alt="GitHub last commit (branch)" src="https://img.shields.io/github/last-commit/sebasxs/dofus-data-decoder/main?label=Last%20Commit">
<a href="https://t.co/pin0Y7mWYp"><img alt="Static Badge" src="https://img.shields.io/badge/Target%20server-7289da?logo=discord&logoColor=white"></a>
</p>

## About files
- 📝 The exported `.md` files are useful for context injection into [Corinna's](https://github.com/Sebasxs/Corinna) AI-based responses; the information is splitted into sections and rarely exceeds 300 tokens each.
- 🔗 Data uploaded to the database (or exported as JSON files) are treated as menu components on [Discord](https://t.co/pin0Y7mWYp).
- ⚠ Input data must be located in the **`/input`** folder in `JSON` format.

> The language can be changed by changing the `i18n_(lang).json` file and some phrases around the scripts.
> Corinna is a hispanic community management system, therefore the exported data is by default in `spanish`.

> This is not a game decompiler, but a bunch of scripts that interpret game data.
---

## Scripts

### [Decode Spells](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeSpells.js)
Decode all character/monster spells including effects, criterions and details.
```Shell
$ node DecodeSpells
# Database root updated 'dofus_spells'
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeQuests.js) & [Export](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportQuests.js) Quests
Decode and update quest information.
```Shell
$ node DecodeQuests
# Database root updated 'dofus_quests'
$ node ExportQuests
# Output: pages/quests/*.md
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeNpcs.js) & [Export](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportNpcs.js) NPCs
- Generate NPC descriptions based on their dialogues.
- Update NPC coords for each quest involved.
- Export all collected NPC information.

```Shell
$ node DecodeNpcs
# Fill the *NPCS_TO_UPDATE* array with the IDs you want to decode, or leave it empty to decode everything.
# Database root updated 'dofus_npcs'
$ node ExportNpcs
# Output: pages/npcs/*.md
```

### [Decode](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeDungeons.js) & [Export](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportDungeons.js) Dungeons
Decode and update key information about every dungeon.
```Shell
$ node DecodeDungeons
# Database root updated 'dofus_dungeons'
$ node ExportDungeons
# Output: pages/dungeons/*.md
```

### [Decode Jobs](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeJobs.js)
Decode the information of all jobs.
```Shell
$ node DecodeJobs
# Output: pages/jobs/*.md
# Database root updated 'dofus_jobs'
```

### [Decode Recipes](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeRecipes.js)
Decode all item recipes.
```Shell
$ node DecodeRecipes
# Database root updated 'dofus_recipes'
```

### [Decode Maps](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeMaps.js)
Decode the information of every map in the game.
```Shell
$ node DecodeMaps
# Database root updated 'dofus_maps'
```

### [Decode SubAreas](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeSubAreas.js)
- Decode and update all subareas data.
- Update NPCs positions based on subareas data.
- Export markdown files with named-maps info and image urls.
```Shell
$ node DecodeSubAreas
# Database root updated 'dofus_subareas'
# Database root updated 'dofus_npcs'
# Output: pages/subareas/*.md
```

### [Decode Breeds](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/DecodeBreeds.js)
A brief introduction to Dofus breeds and their gameplay.
```Shell
$ node DecodeBreeds
# Output: pages/breeds/*.md
# Database root updated 'dofus_breeds'
```

### [Export Hints](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportHints.js)
Export coords of key places in Dofus.
```shell
$ node ExportHints
# Output: pages/hints/*.md
```

### [Export Documents](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportDocuments.js)
Transcription of game books and documents with their respective images.
```Shell
$ node ExportDocuments
# Output: pages/documents/*.md
```

### [Export Feature Descriptions](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/ExportFeatures.js)
Information about the main features of Dofus.
```Shell
$ node ExportFeatures
# Output: pages/guides/*.md
# Output: data/guidebookImageNames.json
```

### [Map captions](https://github.com/Sebasxs/dofus-data-decoder/blob/main/scripts/AddMapCaptions.js)
Add captions and watermark to map images.
```Shell
$ node AddMapCaptions
# Input: output/maps/map-images/*.jpg
# Output: output/maps/map-coords/*.jpg
```
# Dofus data decoder & context generator for Corinna
Takes Dofus game files and makes them readable:
- Exported markdown files are used for AI context injection.
- Data uploaded to the database (or exported as JSON files) are treated as menu components.
- Input data must be located in the **`src/input`** folder in JSON format.

**[Corinna](https://github.com/Sebasxs/Corinna)** is a [hispanic community](https://t.co/pin0Y7mWYp) management system, so these scripts also export data in spanish, but can be adapted to any language by changing the `i18n_(lang).json` file and some phrases.

## Spells
Decode all character/monster spells including effects, criterions and details.
```Shell
$ node DecodeSpells
# Database root updated 'dofus_spells'
```

## Jobs
Decode the information of all jobs.
```Shell
$ node DecodeJobs
# Output: src/pages/jobs/*.md
# Database root updated 'dofus_jobs'
```

## Recipes
Decode all item recipes.
```Shell
$ node DecodeRecipes
# Database root updated 'dofus_recipes'
```

## Maps
Decode the information of every map in the game.
```Shell
$ node DecodeMaps
# Database root updated 'dofus_maps'
```

## Subareas
- Decode and update all subareas data.
- Update NPCs positions based on subareas data.
- Export markdown files with named-maps info and image urls.
```Shell
$ node DecodeSubAreas
# Database root updated 'dofus_subareas'
# Database root updated 'dofus_npcs'
# Output: src/pages/subareas/*.md
```

## [NPCs](https://github.com/Sebasxs/format-dofus-data/blob/main/ExportNpcs.js)
- Generate NPC descriptions based on their dialogues.
- Update NPC coords for each quest involved.
- Export all collected NPC information.

**Note:** fill the *NPCS_TO_UPDATE* array with the IDs you want to export, or leave it empty to update everything.
```Shell
$ node DecodeNpcs
# Database root updated 'dofus_npcs'
$ node ExportNpcs
# Output: src/pages/npcs/*.md
```

## Quests
Decode and update quest information.
```Shell
$ node DecodeQuests
# Database root updated 'dofus_quests'
```

## Breeds
A brief introduction to Dofus breeds and their gameplay.
```Shell
$ node DecodeBreeds
# Output: src/pages/breeds/*.md
# Database root updated 'dofus_breeds'
```

## Hints
Export coords of key places in Dofus.
```shell
$ node ExportHints
# Output: src/pages/hints/*.md
```

## Documents
Transcription of game books and documents with their respective images.
```Shell
$ node ExportDocuments
# Output: src/pages/documents/*.md
```

## Feature descriptions
Information about the main features of Dofus.
```Shell
$ node ExportFeatures
# Output: src/pages/guides/*.md
# Output: src/data/guidebookImageNames.json
```

## Map captions
Add captions and watermark to map images.
```Shell
$ node AddMapCaptions
# Input: src/output/maps/map-images/*.jpg
# Output: src/output/maps/map-coords/*.jpg
```

## [Dungeons](https://github.com/Sebasxs/format-dofus-data/blob/main/UpdateDungeons.js)
Decode and update key information about every dungeon.
```Shell
$ node DecodeDungeons
# Database root updated 'dofus_dungeons'
```
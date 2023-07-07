# Dofus context generator for Corinna
Takes Dofus game files and makes them readable:
- Exported markdown files are used for AI context injection.
- Data uploaded to the database (or exported as JSON files) are treated as menu components.
- Input data must be located in the **`src/input`** folder in JSON format.

**[Corinna](https://github.com/Sebasxs/Corinna)** is a [hispanic community](https://t.co/pin0Y7mWYp) management system, so these scripts also export data in spanish, but can be adapted to any language by changing the `i18n_(lang).json` file and some phrases.

## Breeds
A brief introduction to Dofus breeds and their gameplay.
```Shell
$ node ExportBreeds
# Output: src/pages/breeds/*.md
# Database root updated 'dofus_breeds'
```

## Spells
Update all character/monster spells including effects, criterions and details.
```Shell
$ node UpdateSpells
# Database root updated 'dofus_spells'
```

## Jobs
Update the information of all jobs.
```Shell
$ node UpdateJobs
# Output: src/pages/jobs/*.md
# Database root updated 'dofus_jobs'
```

## Recipes
Update all item recipes.
```Shell
$ node UpdateRecipes
# Database root updated 'dofus_recipes'
```

## Maps
Update the information of every map in the game.
```Shell
$ node UpdateMaps
# Database root updated 'dofus_maps'
```

## Subareas
- Update all subareas info.
- Update NPCs positions based on subareas data.
- Export markdown files with named-maps info and image urls.
```Shell
$ node ExportSubareas
# Database root updated 'dofus_subareas'
# Database root updated 'dofus_npcs'
# Output: src/pages/subareas/*.md
```

## NPCs
- Generate NPC descriptions based on their dialogues.
- Update NPC coords for each quest involved.
- Export all collected NPC information.

**Note:** fill the *NPCS_TO_UPDATE* array with the IDs you want to export, or leave it empty to update everything.
```Shell
$ node UpdateNpcs
# Database root updated 'dofus_npcs'
$ node ExportNpcs
# Output: src/pages/npcs/*.md
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
$ node ExportFeatureDescriptions
# Output: src/pages/guides/*.md
# Output: src/data/guidebookImageNames.json
```

## Map captions
Add captions and watermark to map images.
```Shell
$ node AddCoordsViaCanvas
# Input: src/output/maps/map-images/*.jpg
# Output: src/output/maps/map-coords/*.jpg
```

## Dungeons
Update key information about every dungeon.
```Shell
$ node UpdateDungeons
# Database root updated 'dofus_dungeons'
```
# Dofus data-formatter for Corinna
Takes Dofus game-files and exports readable .MD/.JSON files:
- Markdown files are used for AI context injection.
- JSON files are uploaded to a NoSql database and treated as menu components.
- Right now, the data includes quests, items, monsters, npcs, dungeons, maps, breeds, jobs, hints, guides, recipes and documents.

The input data required must to be included in **src/input** folder in JSON format.

# Hints
```shell
$ node ExportHints
# Output: src/pages/hints/*.md
```

# Breeds
```Shell
$ node ExportBreeds
# Output: src/pages/breeds/*.md
# Output: src/output/breeds/data.json
# Database root 'dofus_breeds'
```

# 
```Shell

```

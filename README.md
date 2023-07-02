# Dofus data-formatter for Corinna
Takes Dofus game-files and exports readable files:
- Markdown files are used for AI context injection.
- JSON files are uploaded to a NoSql database and treated as menu components.

*Required input data must be located in the **`src/input`** folder in JSON format.*

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

# Spells
```Shell
$ node UpdateSpells
# Database root 'dofus_spells'
```

# Feature descriptions
```Shell
$ node ExportFeatureDescriptions
# Output: src/pages/guides/*.md
# Output: src/data/guidebookImageNames.json
```
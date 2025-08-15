# Ordboka.xyz

Minimal Nuxt 3 + TypeScript dictionary stub.

Run locally:

```bash
pnpm i
pnpm dev
```

Notes:

- Data is currently from a local JSON file in `~/data/words.json`.
- Later you can wire Google Sheets by replacing the data loader in `~/composables/useWords.ts`.

To use a Google Sheet as the data source:

1. In Google Sheets: File → Publish to the web → choose CSV format for the sheet and copy the generated CSV link.
2. Set the link in `nuxt.config.ts` under `runtimeConfig.public.googleSheetCsvUrl`.
3. Restart the dev server; the app will fetch and parse the CSV (expected columns: id,word,definition).

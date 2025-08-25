// Default base for GitHub Pages project site (repo: fredrikgangso/ordboka.xyz)
// Can be overridden by setting the BASE_URL env var (used in the GH Actions workflow).
const base = process.env.BASE_URL || "/ordboka.xyz/";

export default {
  typescript: {
    strict: true,
  },
  css: ["~/assets/styles.css"],
  runtimeConfig: {
    public: {
      googleSheetCsvUrl: process.env.GOOGLE_SHEET_CSV_URL,
    },
  },
  app: {
    baseURL: base,
    head: {
      title: "Ordboka",
      meta: [
        { name: "description", content: "Minimal meeting-friendly dictionary" },
      ],
    },
  },
};

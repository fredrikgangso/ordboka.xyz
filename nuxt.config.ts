export default {
  typescript: {
    strict: true,
  },
  css: ["~/assets/styles.css"],
  runtimeConfig: {
    public: {
      // Set this to the published Google Sheets CSV URL to load words from sheet
      googleSheetCsvUrl:
        "https://docs.google.com/spreadsheets/d/1BlGCwl__B38EJasz-95jmpRjuMdeVz6Cf_zAzOW_DQg/edit?usp=sharing",
    },
  },
  app: {
    head: {
      title: "Ordboka",
      meta: [
        { name: "description", content: "Minimal meeting-friendly dictionary" },
      ],
    },
  },
};

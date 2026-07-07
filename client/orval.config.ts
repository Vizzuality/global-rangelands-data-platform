module.exports = {
  ccsa: {
    output: {
      mode: "tags",
      client: "react-query",
      httpClient: "axios",
      target: "./src/types/generated/strapi.ts",
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./src/services/api/index.ts",
          name: "API",
        },
        query: {
          signal: true,
        },
      },
    },
    input: {
      target: "../cms/src/extensions/documentation/documentation/1.0.0/full_documentation.json",
      override: {
        transformer: "./orval-transform.ts",
      },
      filters: {
        tags: [
          "Dataset",
          "Layer",
          "Rangeland",
          "Ecoregion",
          "Dataset-category",
          "Story",
          "Story-category",
        ],
      },
    },
  },
};

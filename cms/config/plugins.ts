module.exports = ({ env }) => ({
  "config-sync": {
    enabled: true,
  },
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        'rangeland': {
          field: 'slug',
          references: 'title',
        },
        'ecoregion': {
          field: 'slug',
          references: 'title',
        },
        'dataset': {
          field: 'slug',
          references: 'title',
        },
        'layer': {
          field: 'slug',
          references: 'title',
        },
      }
    }
  },
  documentation: {
    config: {
      "x-strapi-config": {
        mutateDocumentation: (generatedDocumentationDraft) => {
          Object.keys(generatedDocumentationDraft.paths).forEach((path) => {
            // mutate `fields` to string array
            if (generatedDocumentationDraft.paths[path].get?.parameters) {
              const fields = generatedDocumentationDraft.paths[path].get.parameters.find((param) => param.name === "fields");

              if (fields) {
                const fieldsIndex = generatedDocumentationDraft.paths[path].get.parameters.findIndex((param) => param.name === "fields");
                generatedDocumentationDraft.paths[path].get.parameters[fieldsIndex] = {
                  "name": "fields",
                  "in": "query",
                  "description": "Fields to return (ex: ['title','author','test'])",
                  "deprecated": false,
                  "required": false,
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                };
              }
            }

            // mutate `populate` to one of string | object
            if (generatedDocumentationDraft.paths[path].get?.parameters) {
              const populate = generatedDocumentationDraft.paths[path].get.parameters.find((param) => param.name === "populate");

              if (populate) {
                const populateIndex = generatedDocumentationDraft.paths[path].get.parameters.findIndex((param) => param.name === "populate");
                generatedDocumentationDraft.paths[path].get.parameters[populateIndex] = {
                  "name": "populate",
                  "in": "query",
                  "description": "Relations to return",
                  "deprecated": false,
                  "required": false,
                  "schema": {
                    "oneOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "object",

                      }
                    ]
                  }
                };
              }
            }

            // check if it has {id} in the path
            if (path.includes("{id}")) {
              // add `populate` as params
              if (generatedDocumentationDraft.paths[path].get) {
                const populate = generatedDocumentationDraft.paths[path].get.parameters.find((param) => param.name === "populate");

                if (!populate) {
                  generatedDocumentationDraft.paths[path].get.parameters.push(
                    {
                      "name": "populate",
                      "in": "query",
                      "description": "Relations to return",
                      "deprecated": false,
                      "required": false,
                      "schema": {
                        "oneOf": [
                          {
                            "type": "string"
                          },
                          {
                            "type": "object",

                          }
                        ]
                      }
                    },
                  );
                }
              }
            }
          });
        },
      },
    },
  },
});

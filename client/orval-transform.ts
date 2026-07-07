/**
 * OpenAPI spec repair applied before orval codegen (input.override.transformer).
 * Runs before orval 8's spec validation so it can fix two issues in the
 * Strapi-generated documentation that orval 8 rejects:
 *
 * 1. `populate` is declared `oneOf: [string, object]`, but the app passes
 *    `string[]` (e.g. `populate: ['translations', 'legend.items']`). An array
 *    variant is appended so generated types accept arrays. Values stay arrays on
 *    the wire — Strapi needs `populate[]=a&populate[]=b` for nested relations.
 * 2. `/upload?id={id}` declares `id` as `in: "query"` while templating it in the
 *    URL; orval 8 validation requires such params to be `in: "path"`. Any param
 *    templated in its path is forced to `in: "path"` so validation passes.
 */

type OpenApiParameter = {
  name: string;
  in?: string;
  schema?: { oneOf?: unknown[] } & Record<string, unknown>;
} & Record<string, unknown>;

type OpenApiOperation = {
  parameters?: OpenApiParameter[];
} & Record<string, unknown>;

type OpenApiPathItem = Record<string, OpenApiOperation>;

type OpenApiDocument = {
  paths?: Record<string, OpenApiPathItem>;
} & Record<string, unknown>;

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

function widenPopulateSchema(parameter: OpenApiParameter): OpenApiParameter {
  if (parameter.name !== "populate") return parameter;

  return {
    ...parameter,
    schema: {
      oneOf: [...(parameter.schema?.oneOf ?? []), { type: "array", items: { type: "string" } }],
    },
  };
}

function fixTemplatedParamLocation(path: string, parameter: OpenApiParameter): OpenApiParameter {
  const isTemplatedInPath = path.includes(`{${parameter.name}}`);
  if (!isTemplatedInPath || parameter.in === "path") return parameter;

  return { ...parameter, in: "path" };
}

function transformOperationParameters(path: string, operation: OpenApiOperation): OpenApiOperation {
  if (!Array.isArray(operation?.parameters)) return operation;

  const parameters = operation.parameters.map((parameter) =>
    widenPopulateSchema(fixTemplatedParamLocation(path, parameter)),
  );

  return { ...operation, parameters };
}

function transformSpec(spec: OpenApiDocument): OpenApiDocument {
  const paths = Object.fromEntries(
    Object.entries(spec.paths ?? {}).map(([path, pathItem]) => [
      path,
      Object.fromEntries(
        Object.entries(pathItem).map(([key, operation]) => [
          key,
          HTTP_METHODS.includes(key) ? transformOperationParameters(path, operation) : operation,
        ]),
      ),
    ]),
  );

  return { ...spec, paths };
}

module.exports = transformSpec;

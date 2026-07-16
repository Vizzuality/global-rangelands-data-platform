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
 *
 * The spec is a tree: `spec.paths["/datasets"]["get"].parameters[]`. The helpers
 * below read bottom-up — a single parameter, then an operation's parameters, then
 * a whole path, then the whole spec — and every step returns a fresh copy rather
 * than mutating, so the input orval hands us is left untouched.
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

// A path item mixes operation keys (get/post/…) with non-operations (summary,
// $ref, a shared parameters array). Only these keys hold operations to transform.
const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

// Fix #1: add a `string[]` variant to the `populate` param so array calls type-check.
function widenPopulateSchema(parameter: OpenApiParameter): OpenApiParameter {
  if (parameter.name !== "populate") return parameter;

  return {
    ...parameter,
    schema: {
      oneOf: [...(parameter.schema?.oneOf ?? []), { type: "array", items: { type: "string" } }],
    },
  };
}

// Fix #2: if the param name appears as `{name}` in the path, it must be `in: "path"`.
function fixTemplatedParamLocation(path: string, parameter: OpenApiParameter): OpenApiParameter {
  const isTemplatedInPath = path.includes(`{${parameter.name}}`);
  if (!isTemplatedInPath || parameter.in === "path") return parameter;

  return { ...parameter, in: "path" };
}

// Run both fixes over every parameter of a single operation.
function transformOperationParameters(path: string, operation: OpenApiOperation): OpenApiOperation {
  if (!Array.isArray(operation?.parameters)) return operation;

  const parameters = operation.parameters.map((parameter) =>
    widenPopulateSchema(fixTemplatedParamLocation(path, parameter)),
  );

  return { ...operation, parameters };
}

// Walk the whole spec: for each path, for each operation on it, apply the fixes.
// `Object.entries(...).map(...)` + `Object.fromEntries(...)` is just "rebuild this
// object, transforming each value" — the outer pair maps over paths, the inner
// pair over the keys of a path item (skipping the non-operation keys).
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

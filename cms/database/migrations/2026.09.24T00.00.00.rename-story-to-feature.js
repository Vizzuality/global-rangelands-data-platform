'use strict';

const TABLE_RENAMES = [
  ['stories', 'features'],
  ['story_categories', 'feature_categories'],
  ['stories_cmps', 'features_cmps'],
  ['story_categories_cmps', 'feature_categories_cmps'],
  ['story_categories_stories_lnk', 'feature_categories_features_lnk'],
  ['datasets_story_lnk', 'datasets_feature_lnk'],
  ['components_translations_story_translations', 'components_translations_feature_translations'],
  [
    'components_translations_story_category_translations',
    'components_translations_feature_category_translations',
  ],
];

const UID_RENAMES = [
  ['api::story-category.story-category', 'api::feature-category.feature-category'],
  ['api::story.story', 'api::feature.feature'],
  ['translations.story-category-translation', 'translations.feature-category-translation'],
  ['translations.story-translation', 'translations.feature-translation'],
];

const UID_COLUMNS = [
  ['up_permissions', 'action'],
  ['admin_permissions', 'action'],
  ['admin_permissions', 'subject'],
  ['strapi_api_token_permissions', 'action'],
  ['files_related_mph', 'related_type'],
  ['strapi_release_actions', 'content_type'],
  ['strapi_history_versions', 'content_type'],
];

const FIELD_RENAMES_BY_UID = {
  'api::dataset.dataset': { story: 'feature' },
  'api::feature-category.feature-category': { stories: 'features' },
};

const IDENTIFIER_RENAMES = {
  story_categories: 'feature_categories',
  story_category: 'feature_category',
  stories: 'features',
  story: 'feature',
};

const FOLDER_RENAMES = [
  ['Stories', 'Features'],
  ['Stories PDFs', 'Features PDFs'],
];

const LEGACY_IDENTIFIER = /(?<!i)(story_categories|story_category|stories|story)/g;
const LEGACY_PATTERN = '(^|[^i])stor(y|ies)';
const CONTENT_MANAGER_KEY_PREFIX = 'plugin_content_manager_configuration_content_types::';
const RENAMED_TABLES = TABLE_RENAMES.map(([, to]) => to);

const getRenamedIdentifier = (name) =>
  name.replace(LEGACY_IDENTIFIER, (match) => IDENTIFIER_RENAMES[match]);

const getRenamedUid = (value) =>
  UID_RENAMES.reduce((renamed, [from, to]) => renamed.split(from).join(to), value);

const getRenamedString = (value, fields) => {
  const renamed = getRenamedUid(value);
  return Object.hasOwn(fields, renamed) ? fields[renamed] : renamed;
};

const getRenamedJson = (value, fields) => {
  if (Array.isArray(value)) {
    return value.map((item) => getRenamedJson(item, fields));
  }
  if (typeof value === 'string') {
    return getRenamedString(value, fields);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      getRenamedString(key, fields),
      getRenamedJson(item, fields),
    ])
  );
};

const getFieldRenames = (uid) => FIELD_RENAMES_BY_UID[uid] ?? {};

const getParsedJson = (value) => (typeof value === 'string' ? JSON.parse(value) : value);

async function renameTables(knex) {
  for (const [from, to] of TABLE_RENAMES) {
    if (!(await knex.schema.hasTable(from))) {
      continue;
    }
    if (await knex.schema.hasTable(to)) {
      throw new Error(
        `[rename-story-to-feature] both ${from} and ${to} exist; refusing to orphan ${from} rows`
      );
    }
    await knex.schema.renameTable(from, to);
    console.info(`[rename-story-to-feature] table ${from} -> ${to}`);
  }
}

async function renameColumns(knex) {
  const { rows } = await knex.raw(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name::text = ANY(?::text[]) AND column_name::text ~ ?`,
    [RENAMED_TABLES, LEGACY_PATTERN]
  );
  for (const { table_name: table, column_name: column } of rows) {
    await knex.raw('ALTER TABLE ?? RENAME COLUMN ?? TO ??', [
      table,
      column,
      getRenamedIdentifier(column),
    ]);
  }
}

async function renameConstraints(knex) {
  const { rows } = await knex.raw(
    `SELECT rel.relname AS table_name, con.conname AS constraint_name
     FROM pg_constraint con
     JOIN pg_class rel ON rel.oid = con.conrelid
     JOIN pg_namespace ns ON ns.oid = rel.relnamespace
     WHERE ns.nspname = current_schema() AND rel.relname::text = ANY(?::text[]) AND con.conname::text ~ ?`,
    [RENAMED_TABLES, LEGACY_PATTERN]
  );
  for (const { table_name: table, constraint_name: name } of rows) {
    await knex.raw('ALTER TABLE ?? RENAME CONSTRAINT ?? TO ??', [
      table,
      name,
      getRenamedIdentifier(name),
    ]);
  }
}

async function renameIndexes(knex) {
  const { rows } = await knex.raw(
    `SELECT indexname FROM pg_indexes
     WHERE schemaname = current_schema() AND tablename::text = ANY(?::text[]) AND indexname::text ~ ?`,
    [RENAMED_TABLES, LEGACY_PATTERN]
  );
  for (const { indexname: name } of rows) {
    await knex.raw('ALTER INDEX ?? RENAME TO ??', [name, getRenamedIdentifier(name)]);
  }
}

async function renameSequences(knex) {
  const { rows } = await knex.raw(
    `SELECT DISTINCT seq.relname FROM pg_class seq
     JOIN pg_namespace ns ON ns.oid = seq.relnamespace
     JOIN pg_depend dep ON dep.objid = seq.oid AND dep.classid = 'pg_class'::regclass
       AND dep.refclassid = 'pg_class'::regclass AND dep.deptype IN ('a', 'i')
     JOIN pg_class rel ON rel.oid = dep.refobjid
     WHERE ns.nspname = current_schema() AND seq.relkind = 'S'
       AND rel.relname::text = ANY(?::text[]) AND seq.relname::text ~ ?`,
    [RENAMED_TABLES, LEGACY_PATTERN]
  );
  for (const { relname: name } of rows) {
    await knex.raw('ALTER SEQUENCE ?? RENAME TO ??', [name, getRenamedIdentifier(name)]);
  }
}

async function hasColumn(knex, table, column) {
  return (await knex.schema.hasTable(table)) && knex.schema.hasColumn(table, column);
}

async function replaceUids(knex, table, column) {
  if (!(await hasColumn(knex, table, column))) {
    return;
  }
  for (const [from, to] of UID_RENAMES) {
    await knex(table)
      .where(column, 'like', `%${from}%`)
      .update({ [column]: knex.raw('REPLACE(??, ?, ?)', [column, from, to]) });
  }
}

async function renameComponentTypes(knex) {
  const { rows } = await knex.raw(
    `SELECT table_name FROM information_schema.columns
     WHERE table_schema = current_schema() AND column_name = 'component_type'
       AND right(table_name::text, 5) = '_cmps'`
  );
  for (const { table_name: table } of rows) {
    await replaceUids(knex, table, 'component_type');
  }
}

async function renamePermissionFields(knex) {
  if (!(await hasColumn(knex, 'admin_permissions', 'properties'))) {
    return;
  }
  const rows = await knex('admin_permissions')
    .select('id', 'subject', 'properties')
    .whereIn('subject', Object.keys(FIELD_RENAMES_BY_UID));
  for (const { id, subject, properties } of rows) {
    const current = getParsedJson(properties);
    const renamed = getRenamedJson(current, getFieldRenames(subject));
    if (JSON.stringify(renamed) !== JSON.stringify(current)) {
      await knex('admin_permissions')
        .where({ id })
        .update({ properties: JSON.stringify(renamed) });
    }
  }
}

async function renameCoreStoreEntries(knex) {
  if (!(await knex.schema.hasTable('strapi_core_store_settings'))) {
    return;
  }
  const rows = await knex('strapi_core_store_settings')
    .select('id', 'key', 'value')
    .whereNotNull('value')
    .whereRaw('(?? ~* ? OR ?? ~* ?)', ['key', LEGACY_PATTERN, 'value', LEGACY_PATTERN]);
  for (const { id, key, value } of rows) {
    const renamedKey = getRenamedUid(key);
    const isKeyTaken =
      renamedKey !== key &&
      (await knex('strapi_core_store_settings').where({ key: renamedKey }).first());
    if (isKeyTaken) {
      continue;
    }
    const fields = getFieldRenames(renamedKey.replace(CONTENT_MANAGER_KEY_PREFIX, ''));
    const renamedValue = JSON.stringify(getRenamedJson(JSON.parse(value), fields));
    if (renamedKey !== key || renamedValue !== value) {
      await knex('strapi_core_store_settings')
        .where({ id })
        .update({ key: renamedKey, value: renamedValue });
    }
  }
}

async function renameCategorySlug(knex) {
  if (!(await hasColumn(knex, 'feature_categories', 'slug'))) {
    return;
  }
  await knex('feature_categories')
    .where({ slug: 'rangelands-stories' })
    .update({ slug: 'rangelands-features', title: 'Rangelands Features' });
}

async function renameUploadFolders(knex) {
  const hasFolderTables =
    (await knex.schema.hasTable('upload_folders')) &&
    (await knex.schema.hasTable('upload_folders_parent_lnk'));
  if (!hasFolderTables) {
    return;
  }
  for (const [from, to] of FOLDER_RENAMES) {
    const { rowCount } = await knex.raw(
      `UPDATE upload_folders AS folder SET name = ?
       WHERE folder.name = ? AND NOT EXISTS (
         SELECT 1 FROM upload_folders AS sibling
         WHERE sibling.name = ?
           AND (SELECT lnk.inv_folder_id FROM upload_folders_parent_lnk AS lnk
                WHERE lnk.folder_id = sibling.id LIMIT 1)
             IS NOT DISTINCT FROM
               (SELECT lnk.inv_folder_id FROM upload_folders_parent_lnk AS lnk
                WHERE lnk.folder_id = folder.id LIMIT 1)
       )`,
      [to, from, to]
    );
    if (rowCount > 0) {
      console.info(`[rename-story-to-feature] upload folder ${from} -> ${to} (${rowCount})`);
    }
  }
}

module.exports = {
  async up(knex) {
    await renameTables(knex);
    await renameColumns(knex);
    await renameConstraints(knex);
    await renameIndexes(knex);
    await renameSequences(knex);
    for (const [table, column] of UID_COLUMNS) {
      await replaceUids(knex, table, column);
    }
    await renameComponentTypes(knex);
    await renamePermissionFields(knex);
    await renameCoreStoreEntries(knex);
    await renameCategorySlug(knex);
    await renameUploadFolders(knex);
  },
};

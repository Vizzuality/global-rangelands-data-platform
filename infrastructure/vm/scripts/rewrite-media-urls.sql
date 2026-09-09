-- Repoints the restored files rows from the GCS bucket at the local provider.
--
-- GCS stores one folder per file (<hash><ext>/<hash><ext>); the local provider
-- reconstructs paths as uploads/<hash><ext> and ignores the stored url
-- (@strapi/provider-upload-local/dist/index.js:96,123,148), so the path
-- collapses to the basename. migrate-media-from-gcs.sh lays the files out to
-- match and asserts basenames are unique before flattening.
--
-- Every statement is guarded by a WHERE that its own effect falsifies, so the
-- whole file is idempotent and safe to re-run.

\set ON_ERROR_STOP on

BEGIN;

-- 1. The canonical url.
UPDATE files
SET url = '/uploads/' || regexp_replace(url, '^.*/', '')
WHERE url LIKE 'https://storage.googleapis.com/%';

-- 2. Every derivative url inside the formats blob. jsonb_object_agg rebuilds
--    the object because the keys present vary per row (thumbnail/small/medium/
--    large, depending on the source image's dimensions).
UPDATE files f
SET formats = (
  SELECT jsonb_object_agg(
           key,
           jsonb_set(value, '{url}',
                     to_jsonb('/uploads/' || regexp_replace(value->>'url', '^.*/', '')))
         )
  FROM jsonb_each(f.formats)
)
WHERE f.formats IS NOT NULL
  AND f.formats::text LIKE '%storage.googleapis.com%';

-- 3. The provider name, and its GCS-specific metadata.
UPDATE files
SET provider = 'local',
    provider_metadata = NULL
WHERE provider <> 'local';

-- 4. preview_url is unused by this platform but would pin a dead host if set.
UPDATE files
SET preview_url = NULL
WHERE preview_url LIKE '%storage.googleapis.com%';

COMMIT;

-- Assertion: nothing may still reference the bucket.
SELECT
  count(*) FILTER (WHERE url LIKE '%storage.googleapis.com%')        AS urls_left,
  count(*) FILTER (WHERE formats::text LIKE '%storage.googleapis.com%') AS formats_left,
  count(*) FILTER (WHERE provider <> 'local')                        AS wrong_provider,
  count(*)                                                           AS total_files
FROM files;

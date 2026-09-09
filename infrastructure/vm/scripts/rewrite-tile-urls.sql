-- Rewrites absolute Earth Engine tiler URLs in layer configs to relative paths.
-- Everything is same-origin behind one nginx, so the browser resolves these
-- correctly and no artefact is tied to a hostname.
--
-- Idempotent: the WHERE clause matches only unrewritten rows, and the pattern
-- matches ANY host, so this works unchanged for the spare name and the apex
-- domains. It must run LAST -- after any content load, by whatever route -- and
-- is safe to re-run after a later import.
--
-- The URL sits at config.source.tiles.src; the tileset query parameter is held
-- separately in config.source.tiles.searchparams and appended client-side by
-- setRasterTiles, which is why the stored value carries no query string.
BEGIN;

SELECT 'before: absolute' AS state, count(*) AS rows
FROM layers
WHERE config::text ~ 'https?://[^/"]+/functions/eet/';

UPDATE layers
SET config = regexp_replace(
      config::text,
      'https?://[^/"]+/functions/eet/',
      '/functions/eet/',
      'g'
    )::jsonb
WHERE config::text ~ 'https?://[^/"]+/functions/eet/';

SELECT 'after: absolute' AS state, count(*) AS rows
FROM layers
WHERE config::text ~ 'https?://[^/"]+/functions/eet/';

SELECT 'after: relative' AS state, count(*) AS rows
FROM layers
WHERE config::text LIKE '%"/functions/eet/%';

COMMIT;

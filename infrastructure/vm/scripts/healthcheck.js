#!/usr/bin/env node
/**
 * Container healthcheck shared by every Node service in the stack.
 *
 *   node /healthcheck.js <url> [maxStatus]
 *
 * Exits 0 when the response status is below maxStatus (default 400), 1 otherwise.
 * A service that answers with a redirect or a 4xx is still *up*, which matters
 * for the client: Next redirects `/` to a locale prefix, so requiring 2xx there
 * would report a healthy container as unhealthy.
 *
 * Bind-mounted read-only rather than baked into the images, so a healthcheck can
 * be corrected without rebuilding three images. All three services run Node, so
 * one script covers them.
 */

const [url, maxStatusArg] = process.argv.slice(2);

if (!url) {
  console.error("usage: healthcheck.js <url> [maxStatus]");
  process.exit(1);
}

const maxStatus = Number(maxStatusArg ?? 400);

// fetch() has no default timeout, so a hung upstream would keep this process
// alive past the healthcheck's own timeout and be reported as a failure with no
// explanation. Abort slightly under the tightest healthcheck timeout (5s).
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 4000);

fetch(url, { signal: controller.signal })
  .then((res) => {
    clearTimeout(timer);
    if (res.status < maxStatus) process.exit(0);
    console.error(`unhealthy: ${url} -> ${res.status} (want < ${maxStatus})`);
    process.exit(1);
  })
  .catch((err) => {
    clearTimeout(timer);
    console.error(`unhealthy: ${url} -> ${err.name}: ${err.message}`);
    process.exit(1);
  });

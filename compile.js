import { createRequire } from "module";
import esbuild from "esbuild";
import Eleventy from "@11ty/eleventy";

const require = createRequire(import.meta.url);

const pkg = require("./package.json");

const DENO_STD_VERSION = "0.144.0";

(async function () {

  // https://github.com/evanw/esbuild/pull/2067#issuecomment-1073039746
  const ESM_REQUIRE_SHIM = `
// Eleventy Edge v${pkg.version} via Eleventy v${Eleventy.getVersion()}

// START Eleventy Edge Node Shim for Deno
import os from "https://deno.land/std@${DENO_STD_VERSION}/node/os.ts";
import path from "https://deno.land/std@${DENO_STD_VERSION}/node/path.ts";
import fs from "https://deno.land/std@${DENO_STD_VERSION}/node/fs.ts";
import util from "https://deno.land/std@${DENO_STD_VERSION}/node/util.ts";
import tty from "https://deno.land/std@${DENO_STD_VERSION}/node/tty.ts";
import events from "https://deno.land/std@${DENO_STD_VERSION}/node/events.ts";
import stream from "https://deno.land/std@${DENO_STD_VERSION}/node/stream.ts";
import perf_hooks from "https://deno.land/std@${DENO_STD_VERSION}/node/perf_hooks.ts";
import punycode from "https://deno.land/std@${DENO_STD_VERSION}/node/punycode.ts";
import process from "https://deno.land/std@${DENO_STD_VERSION}/node/process.ts";
import querystring from "https://deno.land/std@${DENO_STD_VERSION}/node/querystring.ts";

;(() => {
  if (typeof globalThis.require === "undefined") {
    globalThis.require = function(name) {
      let globals = {
        fs,
        path,
        events,
        tty,
        util,
        os,
        stream,
        perf_hooks,
        punycode,
        process,
        querystring,
      };
      if(!globals[name]) {
        throw new Error("Could not find module for " + name);
      }

      return globals[name];
    }
  }
})();
// END Eleventy Edge Node Shim for Deno
`;

  await esbuild.build({
    entryPoints: ["./esbuild-entry-point.js"],
    format: "esm",
    bundle: true,
    platform: "node",
    banner: {
      js: ESM_REQUIRE_SHIM,
    },
    outfile: `./dist/edge@${pkg.version}/eleventy-edge.js`,
    external: [
      "chokidar",
      "fast-glob",
      // these use eval and won’t work in Deno
      "ejs",
      "haml",
      "pug",
    ],
  });

  // CommonJS was originally added for Node.js testing
  await esbuild.build({
    entryPoints: ["./esbuild-entry-point.js"],
    format: "cjs",
    bundle: true,
    platform: "node",
    outfile: `./dist/edge@${pkg.version}/eleventy-edge.cjs`,
    external: [
      "chokidar",
      "fast-glob",
      // these use eval and won’t work in Deno
      "ejs",
      "haml",
      "pug",
    ],
  });
})();

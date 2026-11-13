#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { assess } from "./assess.js";
import { ModelError, parsePortfolio } from "./model.js";
import { reportMarkdown } from "./report.js";

const USAGE = `sovereignty-lens

  sovereignty-lens assess <services.json> [--json] [--fail-below-required]

Indicative SEAL 0-4 per sovereignty objective, weighted score, GDPR Chapter V, extraterritorial exposure, DORA exit and sovereignty-washing flags.
Offline: nothing is sent anywhere. Exit codes: 0 ok, 1 a service is below its required level (with --fail-below-required), 2 bad input.`;

function main(argv: string[]): number {
  const [cmd, file] = argv;
  if (cmd !== "assess" || !file) { console.error(USAGE); return 2; }
  try {
    const a = assess(parsePortfolio(readFileSync(file, "utf8")));
    process.stdout.write(argv.includes("--json") ? JSON.stringify(a, null, 2) + "\n" : reportMarkdown(a));
    return argv.includes("--fail-below-required") && a.results.some((r) => !r.passes) ? 1 : 0;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (e instanceof ModelError || code === "ENOENT") { console.error(`error: ${(e as Error).message}`); return 2; }
    throw e;
  }
}

process.exitCode = main(process.argv.slice(2));

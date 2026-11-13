import { Assessment } from "./assess.js";
import { SEAL_NAME } from "./rules.js";

const S = (n: number | null) => (n === null ? "n/a" : `SEAL-${n}`);

export function reportMarkdown(a: Assessment): string {
  const L = [`# Cloud sovereignty review: ${a.organisation}`, "", "Indicative assessment from the facts you supplied, using the structure of the EU Cloud Sovereignty Framework (eight objectives, SEAL-0 to SEAL-4, overall level = lowest objective, weighted score). It is not an official SEAL rating.", ""];
  const fail = a.results.filter((r) => !r.passes).length;
  L.push(`${a.results.length} services, ${fail} below the level you require.`, "", "| Service | Overall | Score | Required | Weakest objectives |", "|---|---|---|---|---|");
  for (const r of a.results) L.push(`| ${r.service.name} | ${S(r.overall)} ${SEAL_NAME[r.overall]} | ${r.weighted}/100 | ${S(r.required)} | ${r.passes ? "-" : r.gaps.map((g) => g.id).join(", ")} |`);
  L.push("");
  if (a.concentration.length) { L.push("## Concentration", ""); for (const c of a.concentration) L.push(`- ${c.parent}: ${c.services.length} services (${c.share}% of the estate): ${c.services.join(", ")}.`); L.push(""); }
  for (const r of a.results) {
    L.push(`## ${r.service.name}`, "", `Overall ${S(r.overall)} (${SEAL_NAME[r.overall]}), score ${r.weighted}/100, required ${S(r.required)}: ${r.passes ? "meets it" : "does not meet it"}.`, "", "| Objective | SEAL | Why |", "|---|---|---|");
    for (const x of r.scores) L.push(`| ${x.id} ${x.name} (${x.weight}%) | ${S(x.seal)} | ${x.why} |`);
    L.push("");
    for (const f of r.flags) L.push(`- **${f.level}**: ${f.text}`);
    if (r.actions.length) { L.push("", "To close the gap:"); for (const x of r.actions) L.push(`- ${x.text} (${x.lifts})`); }
    L.push("");
  }
  L.push("## Method and limits", "", "- Weights: SOV-1 15, SOV-2 10, SOV-3 10, SOV-4 15, SOV-5 20, SOV-6 15, SOV-7 10, SOV-8 5. SOV-8 is optional and, when absent, the other weights are rescaled.", "- The official framework asks for evidence per criterion. These rules are a transparent approximation of that logic over a handful of facts, so treat the output as a screening aid and challenge the inputs.", "- In June 2026 the Commission proposed the Cloud and AI Development Act, which would replace SEAL with four Union Assurance Levels. It is a proposal and may change.", "- The adequacy list and the status of the EU-US Data Privacy Framework change: check current sources. Not legal advice.");
  return L.join("\n") + "\n";
}

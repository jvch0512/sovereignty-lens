import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { assess, scoreService } from "../src/assess.js";
import { ModelError, parsePortfolio } from "../src/model.js";
import { reportMarkdown } from "../src/report.js";
import { OBJECTIVES } from "../src/rules.js";

const P = () => parsePortfolio(readFileSync("examples/services.json", "utf8"));
const R = (name: string) => assess(P()).results.find((r) => r.service.name === name)!;
const seal = (name: string, id: string) => R(name).scores.find((s) => s.id === id)!.seal;

test("weights add up to 100", () => { assert.equal(OBJECTIVES.reduce((a, o) => a + o.weight, 0), 100); });
test("overall SEAL is the lowest objective, not the average", () => {
  const r = R("HyperCloud Sovereign Edition");
  assert.equal(r.overall, Math.min(...r.scores.filter((s) => s.seal !== null).map((s) => s.seal!)));
  assert.ok(r.weighted > 50 && r.overall <= 2);
});
test("EU hosting does not fix a US parent: SOV-1 and SOV-2 stay low", () => {
  assert.ok(seal("HyperCloud Frankfurt IaaS", "SOV-1")! <= 1);
  assert.ok(seal("HyperCloud Frankfurt IaaS", "SOV-2")! <= 1);
  assert.ok(R("HyperCloud Frankfurt IaaS").flags.some((f) => /CLOUD Act/.test(f.text)));
});
test("an EU-licensed operator with EU-only support and external keys raises the operational and data objectives", () => {
  assert.equal(seal("HyperCloud Sovereign Edition", "SOV-4"), 4);
  assert.equal(seal("HyperCloud Sovereign Edition", "SOV-3"), 4);
});
test("EU provider with tested exit, HYOK and EU scheme reaches the top on technology and data", () => {
  assert.equal(seal("Nordhost Managed Kubernetes", "SOV-6"), 4);
  assert.equal(seal("Nordhost Managed Kubernetes", "SOV-3"), 4);
  assert.equal(R("Nordhost Managed Kubernetes").passes, true);
});
test("non-EU hosting without a transfer mechanism is a GDPR flag", () => {
  const p = P(); const s = p.services[4]!; s.transfer = "none";
  assert.ok(assess(p).results.find((r) => r.service.id === s.id)!.flags.some((f) => /Chapter V/.test(f.text)));
});
test("sovereignty-washing is flagged for a US-owned service marketed as sovereign", () => {
  assert.ok(R("HyperCloud Frankfurt IaaS").flags.some((f) => /washing/.test(f.text)));
  assert.ok(!R("Nordhost Managed Kubernetes").flags.some((f) => /washing/.test(f.text)));
});
test("DORA exit flag appears only for financial entities with critical services lacking a tested exit", () => {
  assert.ok(R("HyperCloud Frankfurt IaaS").flags.some((f) => /DORA/.test(f.text)));
  const p = P(); p.financialEntity = false;
  assert.ok(!assess(p).results.some((r) => r.flags.some((f) => /DORA/.test(f.text))));
});
test("adequate non-EU parents are not scored as no sovereignty", () => { assert.equal(seal("Alpine Backup", "SOV-1"), 2); });
test("SOV-8 is optional and weights are rescaled", () => {
  const s = P().services[2]!; const a = scoreService(s).find((x) => x.id === "SOV-8")!; assert.equal(a.seal, 3);
  const b = P().services[0]!; assert.equal(scoreService(b).find((x) => x.id === "SOV-8")!.seal, null);
  assert.ok(R("HyperCloud Frankfurt IaaS").weighted >= 0 && R("HyperCloud Frankfurt IaaS").weighted <= 100);
});
test("concentration groups services by provider", () => { assert.equal(assess(P()).concentration[0]!.parent, "HyperCloud"); });
test("actions point at the failing objectives", () => { assert.ok(R("HyperCloud Frankfurt IaaS").actions.some((a) => /HYOK|external EU HSM/.test(a.text))); });
test("report mentions the method and CADA", () => { const md = reportMarkdown(assess(P())); assert.match(md, /Union Assurance Levels/); assert.match(md, /not an official SEAL rating/); });
test("bad input raises ModelError", () => {
  assert.throws(() => parsePortfolio("x"), ModelError);
  assert.throws(() => parsePortfolio('{"services":[]}'), ModelError);
  assert.throws(() => parsePortfolio('{"services":[{"hqCountry":"Germany","hostingCountries":["DE"]}]}'), ModelError);
  assert.throws(() => parsePortfolio('{"services":[{"hqCountry":"DE","hostingCountries":["DE"],"keys":"magic"}]}'), ModelError);
});

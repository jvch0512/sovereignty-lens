import { ADEQUATE, EEA, EU, EU_SCHEMES, EXPOSURE, OBJECTIVES } from "./rules.js";
import { Portfolio, Service } from "./model.js";

export interface Score { id: string; name: string; weight: number; seal: number | null; why: string }
export interface Flag { level: "high" | "medium" | "info"; text: string }
export interface Action { text: string; lifts: string }
export interface ServiceResult { service: Service; scores: Score[]; overall: number; weighted: number; required: number; passes: boolean; gaps: Score[]; flags: Flag[]; actions: Action[] }
export interface Assessment { organisation: string; results: ServiceResult[]; concentration: { parent: string; services: string[]; share: number }[] }

const clamp = (n: number) => Math.max(0, Math.min(4, n));
const nonEu = (cs: string[]) => cs.filter((c) => !EU.has(c));
const nonEea = (cs: string[]) => cs.filter((c) => !EEA.has(c));
const untrusted = (cs: string[]) => cs.filter((c) => !EEA.has(c) && !ADEQUATE.has(c));

export function scoreService(s: Service): Score[] {
  const O = (id: string) => OBJECTIVES.find((o) => o.id === id)!;
  const mk = (id: string, seal: number | null, why: string): Score => ({ id, name: O(id).name, weight: O(id).weight, seal, why });
  const parentEu = EU.has(s.parentCountry) || s.parentCountry === "NO" || s.parentCountry === "IS" || s.parentCountry === "LI";
  const exposed = !parentEu && s.parentCountry in EXPOSURE;

  // SOV-1 strategic: who ultimately owns and controls the provider
  let s1: number, w1: string;
  if (!parentEu && ADEQUATE.has(s.parentCountry) && !(s.parentCountry in EXPOSURE)) { s1 = 2; w1 = `Parent in ${s.parentCountry}: outside the EU but covered by an adequacy decision and not on the exposure list.`; }
  else if (!parentEu) { s1 = EU.has(s.hqCountry) ? 1 : 0; w1 = `Ultimate parent in ${s.parentCountry}${s1 ? ", EU entity only" : ", no EU entity in control"}.`; }
  else if (s.nonEuOwnershipPct > 25) { s1 = 2; w1 = `EU parent but ${s.nonEuOwnershipPct}% non-EU ownership.`; }
  else if (s.nonEuOwnershipPct > 0) { s1 = 3; w1 = `EU parent with ${s.nonEuOwnershipPct}% non-EU ownership.`; }
  else { s1 = 4; w1 = "EU parent, no declared non-EU ownership."; }
  if (!parentEu && s.euLicensedOperator) { s1 = Math.max(s1, 2); w1 += " EU-licensed operator raises it to 2 at most."; }

  // SOV-2 legal: which law governs, and which foreign laws can reach the provider
  let s2: number, w2: string;
  if (!EU.has(s.contractLaw)) { s2 = exposed ? 0 : 1; w2 = `Contract under ${s.contractLaw} law.`; }
  else if (exposed) { s2 = s.euLicensedOperator ? 2 : 1; w2 = `EU contract law, but ${EXPOSURE[s.parentCountry]}.`; }
  else if (!parentEu) { s2 = 3; w2 = `EU contract law; parent in ${s.parentCountry} (not on the exposure list).`; }
  else if (nonEu(s.subprocessors.map((p) => p.country)).some((c) => c in EXPOSURE)) { s2 = 3; w2 = "EU parent and contract, but a subprocessor sits under extraterritorial law."; }
  else { s2 = 4; w2 = "EU parent, EU contract law, no exposed subprocessor."; }

  // SOV-3 data: location, keys, transfers
  const outside = nonEea(s.hostingCountries);
  let s3: number, w3: string;
  if (outside.length) {
    const ok = s.transfer === "adequacy" || s.transfer === "dpf" || s.transfer === "sccs" || s.transfer === "bcr";
    s3 = ok ? 1 : 0; w3 = `Data hosted in ${outside.join(", ")}${ok ? ` under ${s.transfer}` : " with no transfer mechanism"}.`;
    if (ok && (s.keys === "hyok" || s.keys === "external-eu-hsm")) { s3 = 2; w3 += " Customer-held keys limit the exposure."; }
  } else if (s.keys === "external-eu-hsm" || s.keys === "hyok") { s3 = 4; w3 = "Hosted in the EEA with keys outside the provider's reach."; }
  else if (s.keys === "byok") { s3 = 3; w3 = "Hosted in the EEA, customer-managed keys inside the provider's KMS."; }
  else { s3 = 2; w3 = "Hosted in the EEA, provider-managed keys."; }
  const supportOut = nonEea(s.supportCountries).filter((c) => !ADEQUATE.has(c));
  if (supportOut.length && !s.supportApproval) { s3 = clamp(s3 - 1); w3 += ` Remote access from ${supportOut.join(", ")} without approval costs one level.`; }

  // SOV-4 operational: who runs it and who can touch it
  const supportNonEu = untrusted(s.supportCountries);
  let s4: number, w4: string;
  if (s.euLicensedOperator && !supportNonEu.length) { s4 = 4; w4 = "EU-licensed operator and EU-only support."; }
  else if (!supportNonEu.length && parentEu) { s4 = 4; w4 = "EU provider with EU-only support."; }
  else if (!supportNonEu.length) { s4 = 3; w4 = "EU-only support, but a non-EU provider controls the platform."; }
  else if (s.supportApproval) { s4 = 2; w4 = `Support from ${supportNonEu.join(", ")} behind customer approval.`; }
  else { s4 = s.euLicensedOperator ? 1 : 0; w4 = `Unapproved support access from ${supportNonEu.join(", ")}.`; }

  // SOV-5 supply chain: subprocessors
  const nonEuSubs = s.subprocessors.filter((p) => !EU.has(p.country));
  const critNonEu = nonEuSubs.filter((p) => p.critical);
  let s5: number, w5: string;
  if (!s.subprocessors.length) { s5 = parentEu ? 4 : 2; w5 = "No subprocessors declared. Ask for the list in writing."; }
  else if (critNonEu.length) { s5 = critNonEu.some((p) => p.country in EXPOSURE) ? 1 : 2; w5 = `Critical non-EU subprocessor(s): ${critNonEu.map((p) => `${p.name} (${p.country})`).join(", ")}.`; }
  else if (nonEuSubs.length) { s5 = 3; w5 = `Non-critical non-EU subprocessor(s): ${nonEuSubs.map((p) => p.name).join(", ")}.`; }
  else { s5 = 4; w5 = "All subprocessors in the EU."; }

  // SOV-6 technology: portability and exit
  let s6: number, w6: string;
  if (s.exit === "tested" && s.openStandards) { s6 = 4; w6 = "Open standards and a tested exit."; }
  else if (s.exit !== "none" && s.openStandards) { s6 = 3; w6 = "Open standards and a documented exit, not tested."; }
  else if (s.exit !== "none") { s6 = 2; w6 = "Exit plan exists but the service is built on proprietary interfaces."; }
  else if (s.openStandards) { s6 = 1; w6 = "Open standards but no exit plan."; }
  else { s6 = 0; w6 = "No exit plan and proprietary interfaces: full lock-in."; }

  // SOV-7 security and compliance
  const schemes = s.certifications.filter((c) => EU_SCHEMES.includes(c)), iso = s.certifications.includes("iso27001");
  let s7: number, w7: string;
  if (schemes.length && s.socCountry && EU.has(s.socCountry)) { s7 = 4; w7 = `EU scheme (${schemes.join(", ")}) and an EU security operations centre.`; }
  else if (schemes.length) { s7 = 3; w7 = `EU scheme (${schemes.join(", ")}), SOC location ${s.socCountry ?? "not stated"}.`; }
  else if (iso) { s7 = 2; w7 = "ISO 27001 only."; }
  else if (s.certifications.length) { s7 = 1; w7 = "Certifications present but no ISO 27001 or EU scheme."; }
  else { s7 = 0; w7 = "No certifications declared."; }

  const s8 = s.sustainability === null ? null : s.sustainability ? 3 : 1;
  return [mk("SOV-1", s1, w1), mk("SOV-2", s2, w2), mk("SOV-3", s3, w3), mk("SOV-4", s4, w4), mk("SOV-5", s5, w5), mk("SOV-6", s6, w6), mk("SOV-7", s7, w7), mk("SOV-8", s8, s8 === null ? "Not assessed (optional)." : s.sustainability ? "Energy and emissions disclosed." : "No disclosure.")];
}

export function assessService(s: Service, financial: boolean): ServiceResult {
  const scores = scoreService(s);
  const rated = scores.filter((x) => x.seal !== null);
  const overall = Math.min(...rated.map((x) => x.seal!));
  const wsum = rated.reduce((a, x) => a + x.weight, 0);
  const weighted = Math.round((rated.reduce((a, x) => a + (x.seal! / 4) * x.weight, 0) / wsum) * 100);
  const required = s.requiredSeal ?? (s.sensitivity === "high" ? 3 : s.sensitivity === "medium" ? 2 : 1);
  const gaps = rated.filter((x) => x.seal! < required);
  const flags: Flag[] = [];
  const sc = (id: string) => scores.find((x) => x.id === id)!.seal ?? 0;
  const parentEu = EU.has(s.parentCountry) || ["NO", "IS", "LI"].includes(s.parentCountry);
  if (!parentEu && s.parentCountry in EXPOSURE) flags.push({ level: "high", text: `Extraterritorial exposure: ${EXPOSURE[s.parentCountry]}. Hosting in the EU does not remove it.` });
  const outside = nonEea(s.hostingCountries);
  if (outside.length) {
    const needsDpf = outside.includes("US") && s.transfer !== "dpf" && s.transfer !== "sccs" && s.transfer !== "bcr";
    if (s.transfer === "none") flags.push({ level: "high", text: `GDPR Chapter V: data hosted in ${outside.join(", ")} with no transfer mechanism recorded.` });
    else if (needsDpf) flags.push({ level: "medium", text: "Transfers to the US rely on adequacy: this holds only if the importer is certified under the EU-US Data Privacy Framework, which remains contested in court. Keep SCCs as a fallback." });
    else if (outside.some((c) => !ADEQUATE.has(c)) && s.transfer === "adequacy") flags.push({ level: "high", text: `Adequacy is recorded but ${outside.filter((c) => !ADEQUATE.has(c)).join(", ")} is not on the adequacy list.` });
  }
  const supportOut = nonEea(s.supportCountries).filter((c) => !ADEQUATE.has(c));
  if (supportOut.length) flags.push({ level: "medium", text: `Remote access from ${supportOut.join(", ")} counts as a transfer under GDPR Chapter V.` });
  if (s.marketedAsSovereign && (sc("SOV-1") <= 1 || sc("SOV-2") <= 1)) flags.push({ level: "high", text: "Sovereignty-washing risk: marketed as sovereign but the ultimate owner or the legal exposure sits outside the EU (SOV-1 or SOV-2 at SEAL-1 or below)." });
  if (s.marketedAsSovereign && !s.certifications.some((c) => EU_SCHEMES.includes(c))) flags.push({ level: "medium", text: "Marketed as sovereign without an EU assurance scheme (SecNumCloud, C5, ENS Alto, EUCS)." });
  if (financial && s.critical && s.exit !== "tested") flags.push({ level: "high", text: "DORA Article 28: a critical or important function needs a documented and tested exit strategy." });
  else if (s.critical && s.exit === "none") flags.push({ level: "medium", text: "Critical service with no exit plan." });
  if (!s.subprocessors.length) flags.push({ level: "info", text: "No subprocessors declared: request the list. NIS2 Article 21(2)(d) expects supply chain security to be managed." });
  if (s.keys === "provider" && s.sensitivity !== "low" && (!parentEu || outside.length)) flags.push({ level: "medium", text: "Provider-managed keys on a sensitive workload: the provider can always decrypt." });

  const actions: Action[] = [];
  if (sc("SOV-3") < required && (s.keys === "provider" || s.keys === "byok")) actions.push({ text: "Move to customer-held keys (HYOK) or an external EU HSM that the provider cannot reach.", lifts: "SOV-3" });
  if (sc("SOV-4") < required && nonEu(s.supportCountries).length) actions.push({ text: "Restrict support to EU staff or require just-in-time approval for non-EU access.", lifts: "SOV-4" });
  if (sc("SOV-5") < required && s.subprocessors.some((p) => !EU.has(p.country) && p.critical)) actions.push({ text: "Negotiate replacement of critical non-EU subprocessors or contractual veto rights.", lifts: "SOV-5" });
  if (sc("SOV-6") < required) actions.push({ text: s.exit === "none" ? "Write and test an exit plan with data export in open formats." : "Test the exit plan and move interfaces to open standards.", lifts: "SOV-6" });
  if (sc("SOV-7") < required) actions.push({ text: "Ask for an EU assurance scheme certificate (SecNumCloud, C5, ENS Alto or EUCS) and an EU-based SOC.", lifts: "SOV-7" });
  if ((sc("SOV-1") < required || sc("SOV-2") < required) && !parentEu) actions.push({ text: "Ownership and jurisdiction cannot be fixed by configuration: consider an EU-owned alternative for this workload or limit it to low-sensitivity data.", lifts: "SOV-1, SOV-2" });
  return { service: s, scores, overall, weighted, required, passes: overall >= required, gaps, flags, actions };
}

export function assess(p: Portfolio): Assessment {
  const results = p.services.map((s) => assessService(s, p.financialEntity)).sort((a, b) => a.overall - b.overall || a.weighted - b.weighted);
  const parents = new Map<string, string[]>();
  for (const s of p.services) parents.set(s.provider, [...(parents.get(s.provider) ?? []), s.name]);
  const concentration = [...parents.entries()].map(([parent, services]) => ({ parent, services, share: Math.round((services.length / p.services.length) * 100) })).filter((c) => c.services.length > 1 && c.share >= 30).sort((a, b) => b.share - a.share);
  return { organisation: p.organisation, results, concentration };
}

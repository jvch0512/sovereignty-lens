export class ModelError extends Error {}
export type Keys = "provider" | "byok" | "hyok" | "external-eu-hsm";
export type Transfer = "none" | "adequacy" | "dpf" | "sccs" | "bcr";
export type Exit = "none" | "documented" | "tested";
export interface Subprocessor { name: string; country: string; critical: boolean }
export interface Service {
  id: string; name: string; provider: string; category: string; sensitivity: "low" | "medium" | "high"; critical: boolean;
  hqCountry: string; parentCountry: string; nonEuOwnershipPct: number; euLicensedOperator: boolean;
  hostingCountries: string[]; supportCountries: string[]; supportApproval: boolean; keys: Keys; transfer: Transfer;
  contractLaw: string; subprocessors: Subprocessor[]; exit: Exit; openStandards: boolean; certifications: string[]; socCountry: string | null;
  sustainability: boolean | null; marketedAsSovereign: boolean; requiredSeal: number | null;
}
export interface Portfolio { organisation: string; financialEntity: boolean; services: Service[] }

const obj = (v: unknown, w: string): Record<string, unknown> => { if (typeof v !== "object" || v === null || Array.isArray(v)) throw new ModelError(`${w} must be an object`); return v as Record<string, unknown>; };
const str = (v: unknown, d: string) => (typeof v === "string" && v ? v : d);
const cc = (v: unknown, d: string, w: string) => { const s = str(v, d).toUpperCase(); if (!/^[A-Z]{2}$/.test(s)) throw new ModelError(`${w} must be a two-letter country code, got "${String(v)}"`); return s; };
const ccs = (v: unknown, w: string): string[] => { if (v === undefined) return []; if (!Array.isArray(v)) throw new ModelError(`${w} must be an array`); return v.map((x, i) => cc(x, "", `${w}[${i}]`)); };
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T, w: string): T => { if (v === undefined) return d; if (typeof v !== "string" || !list.includes(v as T)) throw new ModelError(`${w} must be one of ${list.join(", ")}`); return v as T; };

export function parsePortfolio(text: string): Portfolio {
  let j: unknown;
  try { j = JSON.parse(text); } catch { throw new ModelError("input is not valid JSON"); }
  const r = obj(j, "input");
  if (!Array.isArray(r["services"]) || !r["services"].length) throw new ModelError("services must be a non-empty array");
  const services = r["services"].map((x, i): Service => {
    const s = obj(x, `services[${i}]`), w = `services[${i}]`;
    const hq = cc(s["hqCountry"], "", `${w}.hqCountry`);
    const pct = s["nonEuOwnershipPct"];
    if (pct !== undefined && (typeof pct !== "number" || pct < 0 || pct > 100)) throw new ModelError(`${w}.nonEuOwnershipPct must be 0 to 100`);
    const rs = s["requiredSeal"];
    if (rs !== undefined && (typeof rs !== "number" || !Number.isInteger(rs) || rs < 0 || rs > 4)) throw new ModelError(`${w}.requiredSeal must be an integer 0 to 4`);
    const sub = s["subprocessors"] === undefined ? [] : Array.isArray(s["subprocessors"]) ? s["subprocessors"] : (() => { throw new ModelError(`${w}.subprocessors must be an array`); })();
    const hosting = ccs(s["hostingCountries"], `${w}.hostingCountries`);
    if (!hosting.length) throw new ModelError(`${w}.hostingCountries needs at least one country`);
    return {
      id: str(s["id"], `S${i + 1}`), name: str(s["name"], `Service ${i + 1}`), provider: str(s["provider"], str(s["name"], `Service ${i + 1}`)), category: str(s["category"], "other"),
      sensitivity: oneOf(s["sensitivity"], ["low", "medium", "high"], "medium", `${w}.sensitivity`), critical: s["critical"] === true,
      hqCountry: hq, parentCountry: cc(s["parentCountry"], hq, `${w}.parentCountry`), nonEuOwnershipPct: typeof pct === "number" ? pct : 0, euLicensedOperator: s["euLicensedOperator"] === true,
      hostingCountries: hosting, supportCountries: ccs(s["supportCountries"], `${w}.supportCountries`), supportApproval: s["supportApproval"] === true,
      keys: oneOf(s["keys"], ["provider", "byok", "hyok", "external-eu-hsm"], "provider", `${w}.keys`), transfer: oneOf(s["transfer"], ["none", "adequacy", "dpf", "sccs", "bcr"], "none", `${w}.transfer`),
      contractLaw: cc(s["contractLaw"], hq, `${w}.contractLaw`),
      subprocessors: sub.map((p, k) => { const o = obj(p, `${w}.subprocessors[${k}]`); return { name: str(o["name"], `sub${k + 1}`), country: cc(o["country"], "", `${w}.subprocessors[${k}].country`), critical: o["critical"] === true }; }),
      exit: oneOf(s["exit"], ["none", "documented", "tested"], "none", `${w}.exit`), openStandards: s["openStandards"] === true,
      certifications: Array.isArray(s["certifications"]) ? s["certifications"].filter((c): c is string => typeof c === "string").map((c) => c.toLowerCase()) : [],
      socCountry: typeof s["socCountry"] === "string" ? cc(s["socCountry"], "", `${w}.socCountry`) : null,
      sustainability: typeof s["sustainability"] === "boolean" ? s["sustainability"] : null, marketedAsSovereign: s["marketedAsSovereign"] === true, requiredSeal: typeof rs === "number" ? rs : null,
    };
  });
  return { organisation: str(r["organisation"], "(unnamed)"), financialEntity: r["financialEntity"] === true, services };
}

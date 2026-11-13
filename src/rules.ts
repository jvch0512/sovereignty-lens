export const EU = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"]);
export const EEA = new Set([...EU, "NO", "IS", "LI"]);
/** Countries with a European Commission adequacy decision (indicative: check the current list). US applies only to DPF-certified organisations. */
export const ADEQUATE = new Set(["AD","AR","CA","FO","GG","IL","IM","JP","JE","NZ","KR","CH","GB","UY"]);
export const EXPOSURE: Record<string, string> = {
  US: "US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored",
  CN: "China's National Intelligence Law and Data Security Law oblige organisations to cooperate with state authorities",
  RU: "Russian SORM and data-retention laws give security services access to provider systems",
};
export const SEAL_NAME = ["No sovereignty", "Jurisdictional sovereignty", "Data sovereignty", "Digital resilience", "Full digital sovereignty"];
export const OBJECTIVES = [
  { id: "SOV-1", name: "Strategic", weight: 15 },
  { id: "SOV-2", name: "Legal and jurisdictional", weight: 10 },
  { id: "SOV-3", name: "Data and AI", weight: 10 },
  { id: "SOV-4", name: "Operational", weight: 15 },
  { id: "SOV-5", name: "Supply chain", weight: 20 },
  { id: "SOV-6", name: "Technology", weight: 15 },
  { id: "SOV-7", name: "Security and compliance", weight: 10 },
  { id: "SOV-8", name: "Environmental", weight: 5 },
] as const;
export const EU_SCHEMES = ["secnumcloud", "c5", "ens-alto", "eucs", "csa-star-eu"];

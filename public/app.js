import { assess } from "/lib/assess.js";
import { parsePortfolio } from "/lib/model.js";
import { reportMarkdown } from "/lib/report.js";
import { SEAL_NAME } from "/lib/rules.js";

const $ = (id) => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function table(headers, rows, classes = []) {
  const t = document.createElement("table");
  const h = document.createElement("tr");
  headers.forEach((x) => h.append(el("th", x)));
  t.append(h);
  rows.forEach((r) => { const tr = document.createElement("tr"); r.forEach((c, i) => tr.append(el("td", String(c), classes[i] ? classes[i](c) : undefined))); t.append(tr); });
  return t;
}
function cards(items) {
  const box = el("div", undefined, "cards");
  for (const [label, value, cls] of items) { const c = el("div", undefined, `card ${cls ?? ""}`); c.append(el("b", String(value)), el("span", label)); box.append(c); }
  return box;
}
function panel(title, ...kids) { const p = el("div", undefined, "panel"); p.append(el("h2", title), ...kids); return p; }
function copyButton(getMd) {
  const b = el("button", "Copy markdown");
  b.type = "button";
  b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(getMd()); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy markdown"; }, 1500); } catch { /* clipboard blocked */ } });
  return b;
}
function downloadButton(getMd, name) {
  const b = el("button", "Download .md");
  b.type = "button";
  b.addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([getMd()], { type: "text/markdown" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); });
  return b;
}
async function sample(name) { return (await fetch(`/examples/${name}`)).text(); }
function showError(box, e) { box.replaceChildren(el("p", String(e.message ?? e), "err")); }
function setupTabs() {
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach((s) => { s.hidden = s.id !== `p-${b.dataset.tab}`; });
  }));
}
const cls = (map) => (v) => map[v] ?? "";


const lvl = (n) => (n === null ? "n/a" : "SEAL-" + n);

function run() {
  const out = $("out");
  out.replaceChildren();
  if (!$("inv").value.trim()) return;
  try {
    const a = assess(parsePortfolio($("inv").value));
    const fail = a.results.filter((r) => !r.passes).length;
    const high = a.results.reduce((n, r) => n + r.flags.filter((f) => f.level === "high").length, 0);
    out.append(cards([["Services", a.results.length], ["Below required level", fail, fail ? "bad" : "ok"], ["High flags", high, high ? "warn" : "ok"]]));
    out.append(panel("Overview", table(["Service", "Overall", "Score", "Required", "Gaps"], a.results.map((r) => [r.service.name, lvl(r.overall) + " " + SEAL_NAME[r.overall], r.weighted + "/100", lvl(r.required), r.passes ? "-" : r.gaps.map((g) => g.id).join(", ")]), [null, null, null, null, null])));
    for (const c of a.concentration) out.append(el("p", c.parent + ": " + c.services.length + " services (" + c.share + "% of the estate)"));
    for (const r of a.results) {
      out.append(panel(r.service.name + ": " + lvl(r.overall) + ", " + r.weighted + "/100 (required " + lvl(r.required) + ")",
        table(["Objective", "SEAL", "Why"], r.scores.map((x) => [x.id + " " + x.name + " (" + x.weight + "%)", lvl(x.seal), x.why])),
        ...r.flags.map((f) => el("p", f.level + ": " + f.text)), ...r.actions.map((x) => el("p", "Action: " + x.text + " (" + x.lifts + ")"))));
    }
    const row = el("div", undefined, "row");
    row.append(copyButton(() => reportMarkdown(a)), downloadButton(() => reportMarkdown(a), "sovereignty-review.md"));
    out.append(row);
  } catch (e) { showError(out, e); }
}

$("sample").addEventListener("click", async () => { $("inv").value = await sample("services.json"); run(); });
$("inv").addEventListener("input", run);

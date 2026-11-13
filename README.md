# sovereignty-lens

A screening tool for the question "is this cloud service actually sovereign?". Describe each service in JSON (who owns it, where it runs, who can touch it, who holds the keys, who the subprocessors are, whether you can leave). It scores the service against the eight objectives of the EU Cloud Sovereignty Framework and tells you what to fix.

**Live demo:** https://jvch0512.github.io/sovereignty-lens/ (runs in your browser, nothing is uploaded)

Zero runtime dependencies. TypeScript, Node 20+.

## What it does

- **SEAL 0 to 4 per objective** (SOV-1 strategic, SOV-2 legal, SOV-3 data and AI, SOV-4 operational, SOV-5 supply chain, SOV-6 technology, SOV-7 security and compliance, SOV-8 environmental, optional), each with the reason in plain words.
- **Overall level = the lowest objective**, as in the framework, plus a **weighted score** (15, 10, 10, 15, 20, 15, 10, 5).
- **Required level per service**, set by sensitivity (low 1, medium 2, high 3) or by you, with the objectives that fall short and the actions that would lift them.
- **Flags:** extraterritorial exposure (US CLOUD Act and FISA 702, China, Russia), GDPR Chapter V transfers including remote support access, sovereignty-washing (marketed as sovereign while ownership or legal exposure sits outside the EU), DORA exit strategy for critical services of financial entities, provider-held keys on sensitive workloads, concentration on one provider.

The point it makes concrete: hosting in Frankfurt does not change who owns the provider or which foreign laws reach it. Those sit in SOV-1 and SOV-2, and no configuration fixes them.

## Use

```bash
npm install && npm run build
node dist/src/cli.js assess examples/services.json
node dist/src/cli.js assess services.json --json
node dist/src/cli.js assess services.json --fail-below-required   # exit 1 in CI or in a procurement gate
npm start                                                          # UI on http://localhost:8787
```

Exit codes: 0 ok, 1 a service is below its required level, 2 bad input. See [examples/services.json](examples/services.json) for every field and [docs/sample-review.md](docs/sample-review.md) for an output. CI regenerates the sample and fails on drift.

## Sources

- EU Cloud Sovereignty Framework v1.2.1 (Commission, October 2025): eight objectives, SEAL-0 to SEAL-4, weights, overall level set by the weakest objective. Summaries consulted: [ayedo](https://ayedo.de/en/cloud-sovereignty-framework/), [Securiti](https://securiti.ai/?p=106876).
- Cloud and AI Development Act proposal, 3 June 2026: four Union Assurance Levels, Level 1 self-assessed, Levels 2 to 4 independently audited, would replace SEAL. Still a proposal. See [Global Policy Watch](https://globalpolicywatch.com/2026/06/the-eu-cloud-and-ai-development-act-in-depth) and [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cmsd0ucrs0010tvy8f98vvfxl/outline-on-the-proposal-for-the-cloud-and-ai-development-act-cada-).
- GDPR Chapter V (transfers), DORA Article 28 (ICT third-party risk and exit strategies), NIS2 Article 21(2)(d) (supply chain security): read the primary texts on EUR-Lex.

## Limits

- **Not an official SEAL rating.** The framework asks for evidence per criterion. These rules approximate its logic over a few facts so you can screen and compare. Challenge the inputs, especially anything the provider self-declares.
- The rules are my reading, deliberately simple and visible in [src/assess.ts](src/assess.ts). Change them to match your tender.
- The adequacy list and the status of the EU-US Data Privacy Framework change: check current sources before relying on the transfer flags.
- The exposure table covers the US, China and Russia only and is indicative.
- Not legal advice.

## Tests

```bash
npm test   # 14 tests: weights, lowest-objective rule, US parent with EU hosting, operator and keys, washing, DORA, input validation
```

MIT.

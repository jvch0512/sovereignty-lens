# Cloud sovereignty review: Acme Bank (sample)

Indicative assessment from the facts you supplied, using the structure of the EU Cloud Sovereignty Framework (eight objectives, SEAL-0 to SEAL-4, overall level = lowest objective, weighted score). It is not an official SEAL rating.

6 services, 4 below the level you require.

| Service | Overall | Score | Required | Weakest objectives |
|---|---|---|---|---|
| CRM Cloud | SEAL-0 No sovereignty | 16/100 | SEAL-2 | SOV-1, SOV-2, SOV-3, SOV-4, SOV-6 |
| HyperCloud Frankfurt IaaS | SEAL-0 No sovereignty | 30/100 | SEAL-3 | SOV-1, SOV-2, SOV-3, SOV-4, SOV-5, SOV-6 |
| OfficeSuite SaaS | SEAL-0 No sovereignty | 47/100 | SEAL-2 | SOV-1, SOV-2 |
| Alpine Backup | SEAL-1 Jurisdictional sovereignty | 53/100 | SEAL-1 | - |
| HyperCloud Sovereign Edition | SEAL-2 Data sovereignty | 78/100 | SEAL-3 | SOV-1, SOV-2 |
| Nordhost Managed Kubernetes | SEAL-3 Digital resilience | 95/100 | SEAL-3 | - |

## Concentration

- HyperCloud: 2 services (33% of the estate): HyperCloud Frankfurt IaaS, HyperCloud Sovereign Edition.

## CRM Cloud

Overall SEAL-0 (No sovereignty), score 16/100, required SEAL-2: does not meet it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-0 | Ultimate parent in US, no EU entity in control. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-0 | Contract under US law. |
| SOV-3 Data and AI (10%) | SEAL-0 | Data hosted in US under sccs. Remote access from US without approval costs one level. |
| SOV-4 Operational (15%) | SEAL-0 | Unapproved support access from US. |
| SOV-5 Supply chain (20%) | SEAL-2 | No subprocessors declared. Ask for the list in writing. |
| SOV-6 Technology (15%) | SEAL-0 | No exit plan and proprietary interfaces: full lock-in. |
| SOV-7 Security and compliance (10%) | SEAL-2 | ISO 27001 only. |
| SOV-8 Environmental (5%) | n/a | Not assessed (optional). |

- **high**: Extraterritorial exposure: US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. Hosting in the EU does not remove it.
- **medium**: Remote access from US counts as a transfer under GDPR Chapter V.
- **info**: No subprocessors declared: request the list. NIS2 Article 21(2)(d) expects supply chain security to be managed.
- **medium**: Provider-managed keys on a sensitive workload: the provider can always decrypt.

To close the gap:
- Move to customer-held keys (HYOK) or an external EU HSM that the provider cannot reach. (SOV-3)
- Restrict support to EU staff or require just-in-time approval for non-EU access. (SOV-4)
- Write and test an exit plan with data export in open formats. (SOV-6)
- Ownership and jurisdiction cannot be fixed by configuration: consider an EU-owned alternative for this workload or limit it to low-sensitivity data. (SOV-1, SOV-2)

## HyperCloud Frankfurt IaaS

Overall SEAL-0 (No sovereignty), score 30/100, required SEAL-3: does not meet it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-1 | Ultimate parent in US, EU entity only. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-1 | EU contract law, but US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. |
| SOV-3 Data and AI (10%) | SEAL-1 | Hosted in the EEA, provider-managed keys. Remote access from US, IN without approval costs one level. |
| SOV-4 Operational (15%) | SEAL-0 | Unapproved support access from US, IN. |
| SOV-5 Supply chain (20%) | SEAL-1 | Critical non-EU subprocessor(s): ChipOps (US). |
| SOV-6 Technology (15%) | SEAL-2 | Exit plan exists but the service is built on proprietary interfaces. |
| SOV-7 Security and compliance (10%) | SEAL-3 | EU scheme (c5), SOC location US. |
| SOV-8 Environmental (5%) | n/a | Not assessed (optional). |

- **high**: Extraterritorial exposure: US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. Hosting in the EU does not remove it.
- **medium**: Remote access from US, IN counts as a transfer under GDPR Chapter V.
- **high**: Sovereignty-washing risk: marketed as sovereign but the ultimate owner or the legal exposure sits outside the EU (SOV-1 or SOV-2 at SEAL-1 or below).
- **high**: DORA Article 28: a critical or important function needs a documented and tested exit strategy.
- **medium**: Provider-managed keys on a sensitive workload: the provider can always decrypt.

To close the gap:
- Move to customer-held keys (HYOK) or an external EU HSM that the provider cannot reach. (SOV-3)
- Restrict support to EU staff or require just-in-time approval for non-EU access. (SOV-4)
- Negotiate replacement of critical non-EU subprocessors or contractual veto rights. (SOV-5)
- Test the exit plan and move interfaces to open standards. (SOV-6)
- Ownership and jurisdiction cannot be fixed by configuration: consider an EU-owned alternative for this workload or limit it to low-sensitivity data. (SOV-1, SOV-2)

## OfficeSuite SaaS

Overall SEAL-0 (No sovereignty), score 47/100, required SEAL-2: does not meet it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-0 | Ultimate parent in US, no EU entity in control. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-1 | EU contract law, but US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. |
| SOV-3 Data and AI (10%) | SEAL-3 | Hosted in the EEA, customer-managed keys inside the provider's KMS. |
| SOV-4 Operational (15%) | SEAL-2 | Support from US behind customer approval. |
| SOV-5 Supply chain (20%) | SEAL-3 | Non-critical non-EU subprocessor(s): AnalyticsCo. |
| SOV-6 Technology (15%) | SEAL-2 | Exit plan exists but the service is built on proprietary interfaces. |
| SOV-7 Security and compliance (10%) | SEAL-2 | ISO 27001 only. |
| SOV-8 Environmental (5%) | n/a | Not assessed (optional). |

- **high**: Extraterritorial exposure: US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. Hosting in the EU does not remove it.
- **medium**: Remote access from US counts as a transfer under GDPR Chapter V.

To close the gap:
- Ownership and jurisdiction cannot be fixed by configuration: consider an EU-owned alternative for this workload or limit it to low-sensitivity data. (SOV-1, SOV-2)

## Alpine Backup

Overall SEAL-1 (Jurisdictional sovereignty), score 53/100, required SEAL-1: meets it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-2 | Parent in CH: outside the EU but covered by an adequacy decision and not on the exposure list. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-1 | Contract under CH law. |
| SOV-3 Data and AI (10%) | SEAL-1 | Data hosted in CH under adequacy. |
| SOV-4 Operational (15%) | SEAL-3 | EU-only support, but a non-EU provider controls the platform. |
| SOV-5 Supply chain (20%) | SEAL-2 | No subprocessors declared. Ask for the list in writing. |
| SOV-6 Technology (15%) | SEAL-3 | Open standards and a documented exit, not tested. |
| SOV-7 Security and compliance (10%) | SEAL-2 | ISO 27001 only. |
| SOV-8 Environmental (5%) | n/a | Not assessed (optional). |

- **info**: No subprocessors declared: request the list. NIS2 Article 21(2)(d) expects supply chain security to be managed.

## HyperCloud Sovereign Edition

Overall SEAL-2 (Data sovereignty), score 78/100, required SEAL-3: does not meet it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-2 | Ultimate parent in US, EU entity only. EU-licensed operator raises it to 2 at most. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-2 | EU contract law, but US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. |
| SOV-3 Data and AI (10%) | SEAL-4 | Hosted in the EEA with keys outside the provider's reach. |
| SOV-4 Operational (15%) | SEAL-4 | EU-licensed operator and EU-only support. |
| SOV-5 Supply chain (20%) | SEAL-3 | Non-critical non-EU subprocessor(s): ChipOps. |
| SOV-6 Technology (15%) | SEAL-3 | Open standards and a documented exit, not tested. |
| SOV-7 Security and compliance (10%) | SEAL-4 | EU scheme (c5) and an EU security operations centre. |
| SOV-8 Environmental (5%) | n/a | Not assessed (optional). |

- **high**: Extraterritorial exposure: US CLOUD Act, FISA section 702 and EO 12333 can reach data held by US-controlled providers wherever it is stored. Hosting in the EU does not remove it.
- **high**: DORA Article 28: a critical or important function needs a documented and tested exit strategy.

To close the gap:
- Ownership and jurisdiction cannot be fixed by configuration: consider an EU-owned alternative for this workload or limit it to low-sensitivity data. (SOV-1, SOV-2)

## Nordhost Managed Kubernetes

Overall SEAL-3 (Digital resilience), score 95/100, required SEAL-3: meets it.

| Objective | SEAL | Why |
|---|---|---|
| SOV-1 Strategic (15%) | SEAL-3 | EU parent with 8% non-EU ownership. |
| SOV-2 Legal and jurisdictional (10%) | SEAL-4 | EU parent, EU contract law, no exposed subprocessor. |
| SOV-3 Data and AI (10%) | SEAL-4 | Hosted in the EEA with keys outside the provider's reach. |
| SOV-4 Operational (15%) | SEAL-4 | EU provider with EU-only support. |
| SOV-5 Supply chain (20%) | SEAL-4 | All subprocessors in the EU. |
| SOV-6 Technology (15%) | SEAL-4 | Open standards and a tested exit. |
| SOV-7 Security and compliance (10%) | SEAL-4 | EU scheme (secnumcloud) and an EU security operations centre. |
| SOV-8 Environmental (5%) | SEAL-3 | Energy and emissions disclosed. |


## Method and limits

- Weights: SOV-1 15, SOV-2 10, SOV-3 10, SOV-4 15, SOV-5 20, SOV-6 15, SOV-7 10, SOV-8 5. SOV-8 is optional and, when absent, the other weights are rescaled.
- The official framework asks for evidence per criterion. These rules are a transparent approximation of that logic over a handful of facts, so treat the output as a screening aid and challenge the inputs.
- In June 2026 the Commission proposed the Cloud and AI Development Act, which would replace SEAL with four Union Assurance Levels. It is a proposal and may change.
- The adequacy list and the status of the EU-US Data Privacy Framework change: check current sources. Not legal advice.

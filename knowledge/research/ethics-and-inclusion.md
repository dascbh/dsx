# Ethics and inclusion in research

## When to consult

- When planning any study with people: recruitment, consent, recording, storage and sharing.
- When deciding compensation/incentives.
- When including people with disabilities, assistive technology users or vulnerable groups.
- When deploying heatmaps, session replay or any behavioral data collection.
- When sending transcripts or recordings to AI, transcription or cloud tools.
- When designing experiments (fake door, A/B) that affect real people.

This file is not a legal opinion. Questions of legal basis, sensitive data and international transfer go to legal/privacy.

## 1. Three layers that must not be confused

1. **Ethical standard**: respect, absence of harm, honesty, the person's autonomy.
2. **Informed consent**: the person understands and accepts what is going to happen.
3. **LGPD compliance** (Brazil's General Data Protection Law): processing personal data with a legal basis, purpose, necessity, transparency and security.

Signing a form does not settle all three. Consent is one of the legal bases provided for in the LGPD, not the only one; choosing the basis is a legal decision.

## 2. Operating principles

- **Minimization**: collect only what the question requires. If exact age changes neither recruitment nor analysis, ask for a range or nothing.
- **Informed participation as a process**: explain beforehand, remind at the start of the session, allow withdrawal afterwards.
- **Layered authorization**: allow accepting the interview without a camera, audio-only recording, internal use without use in external presentations.
- **Mapping the data ecosystem**: every transcription, AI or cloud tool is a new processor. Check retention, use for model training and deletion **before** uploading identifiable material.
- **Power balance**: an employee invited by their boss, a customer who depends on the service, a high incentive for someone in a vulnerable situation. Adjust the design so that refusing is truly possible.
- **Authority to stop**: the researcher can pause, skip questions or end the session if dignity or well-being is at risk.

## 3. Consent: what the person needs to know

In plain language, before the session:

- Who is running it and why (purpose tied to the decision).
- What will be done and for how long.
- What will be recorded (audio, video, screen, notes) and whether it is optional.
- Who will have access, including observers. Silent observers must be announced.
- Where it is stored, for how long, and how it will be disposed of.
- Whether excerpts (quotes, clips) may be shown and to whom.
- Compensation, and that it depends neither on performance nor on a favorable opinion.
- That they can stop at any moment, with no consequence, and how to request deletion afterwards.
- A contact for questions.

The session opening template is in `templates/interview-guide.md` and `templates/usability-test-script.md`.

## 4. Data handling (guided by the LGPD)

Planning checklist:

- [ ] Written purpose: which decision does this study support?
- [ ] List of data collected, each item with a justification.
- [ ] Expected sensitivity (health, finances, beliefs, data on minors).
- [ ] Recording scope defined.
- [ ] Who accesses what (raw vs. synthesis).
- [ ] Third-party tools checked.
- [ ] Retention period per type of material (recording, transcript, notes, synthesis).
- [ ] Withdrawal and deletion mechanism.
- [ ] Rules for sharing quotes and clips.

Rules:

- **Pseudonymization** (P01, P02…) is not **anonymization**. In small samples, combining job title, company and city can re-identify someone. Remove or generalize combined attributes.
- Keep the key linking pseudonym and identity separate from the research material, with restricted access.
- Public data remains protected; reuse requires considering the original purpose and the person's expectations.
- Set a short retention for raw recordings; keep the pseudonymized synthesis longer, if needed.
- Clips and screenshots in presentations: blur faces, names and on-screen data, unless specifically authorized.

**IF** there is an uncertain legal basis, sensitive data, minors, international transfer, an unclear vendor contract, reuse of an old dataset or a high-risk domain (health, finance, security) **THEN** escalate to legal/privacy before collecting.

### Heatmaps and session replay

- Mask sensitive fields (ID documents, financial data, passwords, free text) **before** collection, not after.
- Legal basis, transparency in the privacy policy and revocable consent when applicable.
- Restricted access and defined retention.
- Compliance declared by the vendor does not guarantee compliance of your implementation; test the masking.

### Experiments with real people

- Fake door: honest, immediate exit; never charge for something that does not exist; no false urgency or scarcity; do not use in payment, health or security flows.
- A/B: define guardrails and a stop criterion for harm; do not test manipulation, discriminatory pricing or dark patterns.

## 5. Compensation

- Compensate for **time**, not for results. Never make it conditional on completing tasks, on favorable opinions or on "good participation".
- Also pay people who dropped out midway or whose session failed due to a technical problem on the study's side.
- An amount proportional to the time and the profile (experts and professionals usually require more), without being so high that it pressures someone in a vulnerable situation to accept.
- Include the extra time for accommodations (breaks, assistive technology setup) in the calculation.
- State the amount and payment method in the invitation. Offer accessible ways to receive it.
- In B2B, check whether the participant's company allows them to receive incentives; offer alternatives (a donation, for example).

## 6. Inclusive research

Distinguish two things:

- **Study accessibility**: the person can take part (invitation, screener, scheduling, consent, platform, session).
- **Product accessibility testing**: the interface works with assistive technologies and meets standards (WCAG 2.2).

Rules:

1. Write a specific question: "how do screen reader users perceive, correct and confirm errors in mobile checkout?", not "test accessibility".
2. Recruit by **functional need and technology used** (screen reader, magnification, voice control, keyboard navigation, captions), device, operating system and experience with the task. A diagnosis alone does not define behavior.
3. Include people with disabilities from the first rounds. Inclusion at the end reduces their influence on decisions.
4. Avoid tokenism: one person does not represent an entire group. Write "in this study, one participant using a screen reader did not notice the error message", never "blind people cannot use it".
5. Make the invitation, screener form, consent form, scheduling and call tool accessible.
6. Do a technical check before the session: prototype with accessible names and keyboard focus, compatibility with the person's technology, audio, captions.
7. Negotiate accommodations individually (extra time, breaks, material format, sign language interpreter such as Libras, use of their own device and usual configuration). Document them.
8. In the session: the same methodological discipline as always; do not finish sentences; talk to the participant, not to their companion.
9. In the analysis, separate the source of the barrier: product, study (inaccessible prototype, confusing instruction) or context (connection, environment).
10. Variation between participants is data, not noise.
11. Do not treat participants as universal accessibility consultants.

Planning matrix:

| Access need | Method | Accommodation | Observable evidence | Limitation |
|---|---|---|---|---|
| <e.g.: screen reader on mobile> | <remote moderated test> | <uses own device; +15 min> | <notices and fixes a field error> | <only one reader/OS tested> |

Inclusive research does not guarantee statistical representativeness, full compliance or absence of barriers. Say so.

Inclusion goes beyond disability: consider literacy, language, connectivity, modest devices, age range, region and income in recruitment when they are relevant to the product's audience.

## Pitfalls

- Piling up recordings without a retention policy.
- Confusing convenience with compliance (uploading a transcript to an AI tool without checking).
- Invisible observers.
- Always recruiting the same "easy" profiles.
- Generalizing the experience of one person with a disability to an entire group.
- Compensation conditional on performance.

## What an agent can / cannot do

> **Can:** review the plan against the checklists in this file; propose a minimum data list; draft consent forms and invitations in plain language; suggest accommodations and check the accessibility of materials; pseudonymize transcripts; flag when the case should go to legal/privacy.
>
> **Cannot:** decide the legal basis or approve the processing of sensitive data; receive or process identifiable data without confirmation that the tool is authorized; define eligibility of vulnerable populations alone; approve experiments with real people; claim legal or WCAG compliance from a partial inspection.

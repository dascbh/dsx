# Dark patterns

> **When to consult**
> - When designing or reviewing sign-up, checkout, subscription, cancellation, data consent, offers and notifications.
> - When a request involves "increasing conversion", "reducing cancellation" or "getting the person to accept".
> - When deciding the visual weight between accept and decline, or the text of a decline.
> - Before implementing urgency, scarcity, social proof or a preselected option.

A dark pattern is an interface pattern that leads a person to a decision they would not make if fully informed and free of pressure, for the benefit of whoever offers the product. The test question:

> **Can the person decide in an informed way, without disproportionate pressure, and leave as easily as they came in?** If not, it is a dark pattern or close to one.

---

## 1. Ethical persuasion vs. manipulation

| Ethical persuasion | Manipulation |
|---|---|
| Shows real value with true data | Relies on omission, error or fatigue |
| Highlights the recommended action, but the alternative stays visible and clear | Hides, demotes or ridicules the alternative |
| Conditions appear before the decision | Conditions appear after the click or in fine print |
| Urgency based on a verifiable fact | Invented urgency or a countdown that restarts |
| Decision reversible with comparable effort | Leaving costs much more than joining |

Highlighting the main button is not a dark pattern. It becomes one when the highlight serves to keep the person from noticing or reaching the other option.

---

## 2. Catalog

| Name | How to recognize it | Harm | Ethical alternative |
|---|---|---|---|
| **Hidden costs** (drip pricing) | Fee, shipping, renewal or condition only appears at the last step | Paying more than expected; decision made with wrong information | Total price, billing period and fees visible from the first time the price is shown |
| **Obstruction** (roach motel) | Subscribe in 1 click; cancelling requires a call, chat, several screens or a mandatory reason | Keep paying against one's will | Cancel in the same channel and with effort comparable to subscribing; optional reason survey |
| **Confirmshaming** | Decline worded to shame ("No, I'd rather lose money") | Emotional pressure; disrespect | Neutral decline ("Not now", "No, thanks") with comparable visual weight |
| **Forced continuity** | Free trial turns into a charge without notice; card required with no need | Unexpected charge | Warn before charging, show the date, allow cancelling in one step during the trial |
| **Bait and switch** | The control does something other than announced ("X" that opens an offer, "Continue" that subscribes) | Unintended action | Label and icon always match the effect |
| **Sneaking / added item** | Insurance, donation, warranty or subscription included in the cart without a choice | Unauthorized purchase | Explicit opt-in; nothing added without the person's action |
| **Improper preselection** | Consent, newsletter, data sharing or extras already checked | Consent not freely given; data exposed | Unchecked boxes; the most privacy-protective default |
| **False urgency** | Countdown that restarts, "offer ends today" every day | Rushed, poorly informed decision | Only real deadlines, with a source and what happens at the end |
| **False scarcity** | "Last 2 units", "15 people viewing now" with no basis | Pressure from fear of missing out | Only real, up-to-date data, or nothing |
| **False social proof** | Invented testimonials, filtered reviews, numbers with no origin | Trust built on a lie | Real reviews, with the display criterion declared |
| **Unbalanced consent** | "Accept all" highlighted; declining requires several screens | Data collection without real consent | Accept, decline and adjust at the same level, in one step |
| **Trick question** | Double negative, checkbox you tick to *not* receive, confusing text | Choice opposite to the intended one | Affirmative sentence, one action per control |
| **Visual interference** | Decline in light gray, tiny link, main button where "cancel" is expected | Induced error | Equivalent options with legible contrast and conventional position |
| **Nagging** | Request repeated on every visit after a decline; modal that always comes back | Wearing the person down until they give in | Respect the decline for a reasonable period; "don't ask again" option |
| **Disguised ad** | Advertising that looks like content, a result or a system button | Deceived click | Clearly label as ad or sponsored |
| **Forced registration** | Account required for a task that does not need one | Unnecessary data collection; abandonment | Guest option when possible ([guest-checkout](../../patterns/ecommerce/guest-checkout.md)) |
| **Misleading anchoring** | "From R$ 999 down to R$ 199" with a "from" price never actually charged | False perception of value | Comparison only with a real, recent price |

---

## 3. Red lines: the agent must refuse to implement

Refuse to implement, even on request, and propose the ethical alternative from the table:

1. Pre-checking consent for data, marketing, sharing with third parties or purchasing an extra service.
2. Adding an item, insurance, donation or subscription to the cart/order without the person's explicit action.
3. Hiding or postponing the total price, fees, billing period or automatic renewal until after the decision.
4. Making cancellation harder than signing up (another mandatory channel, extra steps, retention that blocks the exit).
5. Invented or restarting countdowns, stock levels, visitor counts or deadlines.
6. Fake testimonials, reviews, numbers or seals.
7. A control whose effect differs from its label (close that opens, cancel that confirms).
8. Decline text that shames, blames or threatens.
9. Converting a free trial into a charge without prior notice and a simple cancellation path.
10. Hiding or obstructing "decline" in a consent banner.
11. Using a double negative or ambiguous language in consent or billing options.
12. Disguising an ad as content or as a system control.

IF the request falls on a red line THEN: say which pattern it is, what the harm is, that it may violate consumer protection and data protection rules (in Brazil, CDC and LGPD; in other jurisdictions, equivalent rules), and deliver the ethical version.

**Gray zone (implement only with safeguards):**
- Retention offer on cancellation: allowed if it is **one** screen, skippable, and the cancellation continues in the same flow.
- Highlighting the recommended plan: allowed if all plans show total price and differences with the same clarity.
- Urgency: allowed if the deadline is real and its origin is shown.
- Reminders: allowed with limited frequency and an option to stop.

---

## 4. Why it matters beyond ethics

- Conversion by confusion shows up as success on the dashboard and comes back as cancellation, chargeback, complaint and loss of trust.
- The harm is unequal: people with low digital familiarity, cognitive limitations, little time or less access to support find it harder to notice and reverse.
- Consumer protection agencies and international bodies (such as the OECD) treat practices like obstruction and hidden costs as limiting autonomy; several are illegal in many jurisdictions.
- Manipulation increases cognitive load and breaks the mental model the person formed when starting the task ([psychology-and-laws.md](psychology-and-laws.md)).

---

## 5. How to review a flow

1. **Intent:** what behavior does the flow want to provoke, and why?
2. **Transparency:** do price, data, renewal and conditions appear before the decisive click?
3. **Balance:** do accept, decline, adjust and exit have neutral language and comparable prominence?
4. **Autonomy:** can the person pause, go back and review without losing what was done?
5. **Reversibility:** is there a simple path to undo or cancel ([undo](../../patterns/actions/undo.md))?
6. **Inclusion:** do people with little digital familiarity understand the consequence?
7. **Evidence:** are urgency, scarcity, testimonials and numbers true and current?
8. **Metric:** does the team track regret, complaints, cancellation and chargebacks, not just conversion?

**Comprehension test:** after the decision, ask the person what they signed up for, how much they will pay, when, and how they would undo it. Recurring confusion is a sign of manipulation, even without intent.

**In the process:** include transparency criteria from the briefing; record the alternatives considered; ask someone who did not design the flow to review it; review again when price, policy or law changes.

**Severity:** 3 to 4 by default, because it affects money, data or autonomy.

---

## Audit checklist

- [ ] Total price, fees, billing period and renewal visible before the decision.
- [ ] No consent, extra or subscription preselected or added without action.
- [ ] Cancelling is as simple as signing up, in the same channel.
- [ ] Decline with neutral language and visual weight comparable to accept.
- [ ] Every control does exactly what its label says.
- [ ] Urgency, scarcity, social proof and "from" prices are real and verifiable.
- [ ] Consent banner with accept, decline and adjust at the same level.
- [ ] No double negatives or ambiguity in data or billing options.
- [ ] Ads labeled; registration only when necessary.
- [ ] Declined requests do not reappear on every visit.
- [ ] Regret and complaint metrics tracked alongside conversion metrics.
- [ ] No red line implemented; if requested, refused with an alternative.

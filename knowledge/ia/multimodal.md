---
id: multimodal
area: ai
title: Multimodal UX (screen, touch, text, voice, camera)
evidence: contextual
related: [ux-for-agents, generative-ui, evals]
---

# Multimodal UX

> **When to consult**
> - When adding voice, camera, audio, gesture or screen sharing to a flow that already has screen and touch.
> - When deciding which modality takes over each step of a task.
> - When specifying the state shared between modalities, capture permissions and fallbacks.
> - When planning tests for an experience that switches modalities.
>
> **Do not consult for:** continuity across channels (website → customer service), which is omnichannel; nor for choosing generated components, which is `generative-ui.md`.

## 1. Definition and boundaries

Multimodal UX is coordinating different forms of input and output **within the same task**, with **a single** shared **state**. Having a microphone button and a camera button does not make a product multimodal; coordination does.

| Concept | What changes | Example |
|---|---|---|
| Multimodal | Modalities combined or alternated within a task | Points the camera, asks by voice, confirms on screen |
| Omnichannel | Continuity across channels/touchpoints | Starts in the app, finishes in the store |
| Conversational | Dialogue as the main form | Chat or voice assistant |
| Generative UI | The screen composition is generated | AI chooses table or form |

The concepts can coexist, but they are not synonyms. Multimodality is an old field of human-computer interaction; what changed is that current models interpret speech, image and text in a common layer, making coordination viable in mass-market products. `[evidence: contextual]`

## 2. Central principle: one task, one state

History belongs to the **task**, not to the modality. If the person pointed the camera at an object and said "is this part right?", the reference to "this part" needs to survive when the conversation continues by voice or when they tap an option on the screen.

Specify the interaction state, not just the screens:

```yaml
task_state:
  current_goal: "diagnose a blinking light on the equipment"
  referenced_objects: [{ id: front-panel, source: camera, confidence: low }]
  active_modality: [camera, voice]
  active_captures: { microphone: true, camera: true }
  choices_made: ["model X confirmed by touch"]
  permissions: { camera: granted_this_session }
  next_action_risk: low
  fallbacks: { camera: "describe by text", voice: "type" }
```

Typical conditional rules:
- **IF** the camera is unavailable **THEN** offer text description while keeping the rest of the state.
- **IF** confidence in the identification is low **THEN** highlight on screen what was recognized and ask for confirmation before proceeding.
- **IF** the next action has a financial, legal or irreversible impact **THEN** require persistent on-screen review.

## 3. Strengths and limits of each modality

| Modality | Good for | Watch out for |
|---|---|---|
| Screen and touch | Comparing, reviewing, selecting precisely, keeping information persistent | Information overload, small targets, requiring free hands |
| Voice | Expressing complex intent quickly, busy hands | Noise, privacy, ambiguity, reviewing long content |
| Camera | Referencing objects, documents, surroundings | Permission, third parties in frame, light, framing, misinterpretation |
| AI (layer) | Relating signals, keeping context, adapting the answer | Probabilistic error, excessive autonomy, opacity |

## 4. Choosing the modality by context

The right question is: **which modality reduces effort without increasing risk at this moment?**

| Context | Primary | Support / fallback |
|---|---|---|
| Busy hands | Voice | Screen to review steps and confirm |
| Comparing alternatives | Screen | Voice to refine criteria |
| Identifying something physical | Camera + voice | Screen showing what was recognized |
| Public or sensitive environment | Text + screen | Audio optional, never mandatory |
| Financial, legal or irreversible action | Screen with explicit review | Voice only as support, never hiding the confirmation |
| Accessibility need or preference | The person's choice | Concurrent mechanisms whenever possible |

Voice is not "more natural" by default: it is great while cooking, terrible on a bus or for reviewing twenty options.

## 5. Seven rules

1. **Task before technology.** Map what the person needs, where they are and what stops them. **IF** a simple form solves it **THEN** do not add voice or camera.
2. **Preserve context on switching.** Referenced objects, filters, choices, permissions and state carry across the modality change. Switching should feel like changing instruments, not apps.
3. **Use complementary modalities.** One compensates for the other's limit: voice expresses, screen lets you review, camera shows, audio frees visual attention.
4. **Make perception visible.** Indicate when microphone and camera start and stop, what is being analyzed, what was sent and how to interrupt. Allow checking the interpreted reference before important decisions.
5. **Confirm what matters in a persistent format.** Speech disappears. Values, recipients and consequences of relevant actions are reviewed on screen (see [`confirm-ai-action`](../../patterns/ai/confirm-ai-action.md)).
6. **Design correction and fallback before the ideal path.** Unrecognized speech, blocked camera, low light, dropping network, wrongly identified object. A fallback is an alternative route that preserves state, not a final error message (see [`ai-error-recovery`](../../patterns/ai/ai-error-recovery.md)).
7. **Never force a modality.** Available input mechanisms must be usable concurrently (WCAG 2.5.6). A new modality widens paths; it does not become a requirement.

## 6. Accessibility is not "having voice"

- Voice helps those who prefer not to use their hands and creates a barrier for those who do not speak or cannot speak at the moment.
- Camera helps recognize objects and is unworkable without light, for people with low vision in certain tasks, or when capturing images is inappropriate.
- Keep **information equivalence**: a critical answer only in audio excludes those who cannot hear or need to reread; a confirmation only visual excludes the opposite case. Decide what needs to be redundant, persistent or adaptable.

## 7. Privacy and trust

Camera and microphone capture the surroundings: people in the background, documents, addresses, conversations unrelated to the task. Permission is not just the operating system pop-up. The experience communicates:
- why the capture is necessary;
- when it is active;
- what was sent and where;
- how to interrupt;
- what alternative exists.

When the AI interprets the capture, show the conclusion before executing anything relevant. Interpreting intent and executing a consequence are different problems.

## 8. Anti-patterns

- **Modality theater:** voice or camera added because they exist, not because they solve something.
- **State loss on switching:** the person repeats filters, references or data.
- **Monolithic answer:** everything through the same modality (comparing 20 options in audio).
- **Hidden capture:** an active sensor without clear indication.
- **No fallback:** the flow depends on perfect recognition.
- **Confusing multimodal with accessible.**
- **Premature automation:** executing an action before resolving confidence in the interpretation.

## 9. Tests and metrics

A test script should include:
- a modality switch mid-task (start by voice and continue on screen; camera and then text);
- real conditions: noise, low light, one hand busy, unstable network, blocked camera, wrong recognition;
- observation of repetition (does the person provide again something already said or shown?);
- understanding of state (do they know what the system hears, sees, processes and will do?);
- correction without starting over;
- a working alternative when a modality is not desirable.

| Aspect | Indicator | Reveals |
|---|---|---|
| Completion | Task success | Whether the combination reaches the result |
| Continuity | Success after a modality switch | Whether context survives |
| Correction | Correction cycles per task | Whether recognition errors are repairable |
| Effort | Time, repetitions, superfluous steps | Whether multimodality reduced work |
| Control | Cancellations, undo, improper actions | Balance between autonomy and confirmation |
| Preference | Modality chosen by context | Whether the product respects real conditions |

More modality switches can mean flexibility or confusion; interpret with qualitative data.

## 10. Checklist

- [ ] Every added modality has an effort-reduction justification.
- [ ] There is a shared state specification (goal, references, choices, permissions, active captures).
- [ ] Switching modality does not require repeating information.
- [ ] Visible indicators of active capture and a control to interrupt.
- [ ] Relevant actions have persistent on-screen confirmation.
- [ ] A fallback defined for each modality, preserving state.
- [ ] All critical information has an equivalent in another modality.
- [ ] No modality is mandatory when there is a viable alternative.
- [ ] Tests include switches, adverse conditions and recognition errors.

---
id: file-upload
title: How do you design a good file upload experience?
category: forms
components: [file-input, drop-zone, file-list, progress-bar]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["3.3.2", "3.3.1", "2.1.1", "4.1.3", "1.4.1"]
related: [form-errors, retry, long-loading, progress-percentage, preserve-data-after-error]
---

# How do you design a good file upload experience?

> **Rule:** Show formats and limits before selection, use an accessible native button (drag and drop is only an alternative), show the state of each file and explain how to fix each failure.

## Context

Uploading a file means choosing an item outside the interface, checking restrictions, waiting for processing and noticing when it is done. Without information about formats, limits, progress and errors, the person picks the wrong file, repeats the action or loses work.

A good experience makes requirements visible before the choice, offers an accessible button, allows drag and drop as a convenience, shows the state per file and gives a recovery path.

The patterns documented in design systems are implementation solutions, not a universal rule. The choice considers file type and size, connection, device, the importance of the task and the sensitivity of the data.

## Decision

- **IF** the document is needed for the task **THEN** offer a clear selection button based on the native file input.
- **IF** there are restrictions **THEN** state them before the choice: accepted formats, maximum size, quantity, whether it is required and its purpose (when in doubt).
- **IF** drag and drop adds convenience **THEN** offer it as an alternative, never as the only path.
- **IF** a file is selected **THEN** show name, size and, when useful, a thumbnail; allow removing or replacing it without restarting the form.
- **IF** the upload is asynchronous **THEN** show distinct states: uploading, done, rejected, interrupted and failed.
- **IF** several files are accepted **THEN** show the result of each one separately; one invalid file does not hide the others.
- **IF** a file fails **THEN** explain why and offer to try again or choose another, without removing the valid ones.
- **IF** you use the `accept` attribute **THEN** treat it only as guidance and validate the real type, size, authorization and content on the server.
- **ELSE** do not require an upload the task does not need.

## When to use

- Documents needed to complete the task.
- Uploading one or several files.
- Long processing.
- Limited formats or sizes.
- Files that can fail individually.

## When to avoid

- A document that is not needed → **use instead:** remove the field.
- Unexplained restrictions → **use instead:** visible help text before selection.
- No progress or result → **use instead:** per-file states.
- Many files in a narrow modal → **use instead:** a page or a wide panel.
- Drag and drop as the only path → **use instead:** a button plus drag and drop.

## Do

- Explain formats and limits.
- Show the selected files and the progress.
- Allow removing and replacing.
- Explain each error with its fix.
- Validate on the server too.

## Avoid

- Hiding limits.
- Generic feedback such as "Upload error".
- Blocking the screen unnecessarily.
- Removing valid files because of an invalid one.
- Accepting a type based only on the file name extension.
- Relying only on browser validation.

## Accessibility

- `<label>` associated with `input type="file"`; selection possible by keyboard (2.1.1).
- Requirements in text, associated with the field (3.3.2); success and error do not rely only on color or icon (1.4.1).
- Announce file selected, upload done and failure as status messages (4.1.3); avoid announcing every small progress step.
- Predictable focus when the picker closes; remove and replace with an accessible name and keyboard support.
- Errors identified in text with the fix (3.3.1).

## Microcopy

| Situation | Example |
|---|---|
| Requirements | "PDF, JPG or PNG, up to 10 MB. Maximum 3 files." |
| Button | "Choose file" |
| Alternative | "or drag and drop here" |
| Progress | "Uploading contract.pdf…" |
| Size error | "contract.pdf is 14 MB. The limit is 10 MB. Choose a smaller file." |
| Try again | "Try again" |

## Verification checklist

- [ ] Accepted formats are described before selection.
- [ ] Maximum size and quantity are stated.
- [ ] There is an accessible button to select files.
- [ ] Drag and drop is only an alternative.
- [ ] Each selected file is identified and has its own state.
- [ ] A file can be removed or replaced.
- [ ] Each error explains how to fix it and there is a retry.
- [ ] Selection works with the keyboard.
- [ ] State changes reach assistive technologies.
- [ ] Validation also happens on the server.

## Rationale

- W3C WAI (forms tutorial) and WCAG 2.2, criterion 3.3.2: labels, instructions, validation and feedback with native controls.
- MDN (accept attribute): guides the picker, does not replace server validation.
- OWASP (File Upload Cheat Sheet): type, size, authorization, secure storage and content scanning.
- IBM Carbon, Shopify Polaris, U.S. Web Design System: button, drop zone, states, removal and error; implementation references.
- Brazilian Government Digital Standard (GOV.BR), Upload and Loading: click, drag, multiple files and processing.
- Baymard Institute (forms): reducing friction in critical tasks; limited generalization to uploads.

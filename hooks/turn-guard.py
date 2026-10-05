#!/usr/bin/env python3
"""
Turn guard (turn-guard) — turns the Figma↔code cycle doctrine into a rule that enforces itself.

The `figma-cycle` skill ASKS that nobody re-mirror while it is design's turn. Asking prevents nothing:
one distracted "go ahead and re-mirror" is enough for the script to overwrite hours of refinement. This hook prevents it.

PreToolUse on `use_figma`:
  · reads `turn:` (or the legacy `vez:`) from the project's sync registry;
  · if the turn is `design` AND the script will WRITE to the file -> denies, with a reason;
  · reading (snapshot, inventory, diff) always passes — it is what freezes the "before"
    and, without it, the cycle does not close;
  · project without a registry -> does not interfere.

SessionStart: announces whose turn it is, so the model does not find out too late; if the registry
still uses the old name `vez:` or Portuguese values, warns to rename them.

Values: `design | code | applying`. Accepted legacy values: `codigo`, `código`, `aplicando`.
"""
import json
import os
import re
import sys

REGISTRY_PATHS = (
    "design/figma-sync.md",
    "docs/design/figma-sync.md",
    ".figma-sync.md",
)

# Legacy (Portuguese) values -> current values.
NORMALIZE = {"codigo": "code", "código": "code", "aplicando": "applying", "code": "code", "applying": "applying", "design": "design"}

# Calls that create, change or remove a node — plus direct assignment to a node/paint property
# (`chip.strokes = [...]`, `label.fills = [...]`, `t.characters = ...`). A script that only touches
# properties of an EXISTING node never calls create/append/remove, so the assignment half of the
# pattern is not optional: without it, an "adjust this node's fill" script would pass as a read
# even with `turn: design`. Pure reads match neither half: reading (`n.opacity`)
# has no `=` after it.
WRITE_CALL = re.compile(
    r"\b(create(Frame|Text|Component|Page|Ellipse|Rectangle|Vector|Polygon|Line|Instance|AutoLayout|TextStyle|Variable\w*)"
    r"|appendChild|insertChild|\.remove\(\)|setValueForMode|createVariableCollection"
    r"|setBoundVariableForPaint|setBoundVariable|detachInstance|resize\(|rescale\(|setExplicitVariableModeForCollection)\b"
    r"|\.(fills|strokes|strokeWeight|strokeTopWeight|strokeRightWeight|strokeBottomWeight|strokeLeftWeight"
    r"|strokeCap|opacity|characters|visible|cornerRadius|rotation|name|description"
    r"|layoutMode|layoutSizingHorizontal|layoutSizingVertical|layoutPositioning|layoutWrap"
    r"|primaryAxisAlignItems|counterAxisAlignItems|counterAxisSpacing|itemSpacing"
    r"|paddingTop|paddingRight|paddingBottom|paddingLeft|clipsContent"
    r"|fontSize|fontName|lineHeight|letterSpacing|textCase|textAlignHorizontal"
    r"|maxLines|textTruncation|textAutoResize|textStyleId|arcData|scopes"
    r"|x|y|width|height)\s*=(?!=)"
)


def find_registry(cwd):
    for rel in REGISTRY_PATHS:
        p = os.path.join(cwd, rel)
        if os.path.isfile(p):
            return p
    return None


def read_turn(path):
    """Returns (normalized value, list of old names found) or (None, [])."""
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                m = re.match(r"\s*(turn|vez)\s*:\s*([a-zA-Zçó]+)", line)
                if m:
                    key, raw = m.group(1), m.group(2).strip().lower()
                    legacy = []
                    if key == "vez":
                        legacy.append("`vez:` (old name, rename to `turn:`)")
                    value = NORMALIZE.get(raw, raw)
                    if raw != value:
                        legacy.append(f"`{raw}` (old value, rename to `{value}`)")
                    return value, legacy
    except OSError:
        pass
    return None, []


def respond(payload):
    print(json.dumps(payload, ensure_ascii=False))
    sys.exit(0)


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # unexpected input: stay out of the way

    event = payload.get("hook_event_name") or payload.get("hookEventName") or ""
    cwd = payload.get("cwd") or os.getcwd()
    registry = find_registry(cwd)
    if not registry:
        sys.exit(0)
    turn, legacy = read_turn(registry)
    if not turn:
        sys.exit(0)

    if event == "SessionStart":
        msg = {
            "design": "DESIGN's turn — refinement in progress in Figma. Do not re-mirror; reading and diffing are allowed.",
            "code": "CODE's turn — Figma is a mirror. Refinement done there now will be overwritten.",
            "applying": "APPLYING turn — proposals are becoming code. Avoid touching the same files from outside.",
        }.get(turn, f"turn: {turn}")
        if legacy:
            msg += f" Warning: {registry} uses " + "; ".join(legacy) + "."
        respond({
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": f"DSX Figma↔code cycle ({registry}): {msg}",
            }
        })

    # PreToolUse
    if "use_figma" not in payload.get("tool_name", ""):
        sys.exit(0)
    if turn != "design":
        sys.exit(0)

    script = (payload.get("tool_input") or {}).get("code", "") or ""
    if not WRITE_CALL.search(script):
        sys.exit(0)  # read: allowed even on design's turn

    reason = (
        f"Blocked by the DSX Figma↔code cycle: `{registry}` says `turn: design` — refinement is in "
        "progress in the file and writing now would overwrite the design work.\n\n"
        "If the intent was to read (snapshot, inventory, diff), rewrite the script so it does not create/change nodes. "
        "If the design round really is over, close it (/dsx:figma-turn code) and only then re-mirror."
    )
    respond({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        },
        "systemMessage": reason,
    })


if __name__ == "__main__":
    main()

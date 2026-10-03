#!/usr/bin/env python3
"""
Guarda da vez (turn-guard) — transforma a doutrina do ciclo Figma↔código em regra que se cumpre sozinha.

A skill `figma-ciclo` PEDE que ninguém reespelhe enquanto a vez é do design. Pedir não impede nada:
basta um "pode reespelhar" distraído para o script sobrescrever horas de refino. Este hook impede.

PreToolUse em `use_figma`:
  · lê `turn:` (ou o legado `vez:`) do registro de sincronia do projeto;
  · se a vez é `design` E o script vai ESCREVER no arquivo -> nega, com motivo;
  · leitura (snapshot, inventário, diff) passa sempre — é ela que congela o "antes"
    e, sem ela, o ciclo não fecha;
  · projeto sem registro -> não interfere.

SessionStart: anuncia de quem é a vez, para o modelo não descobrir tarde demais; se o registro
ainda usa o nome antigo `vez:` ou valores em português, avisa para renomear.

Valores: `design | code | applying`. Legados aceitos: `codigo`, `código`, `aplicando`.
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

# Valores legados (em português) -> valores atuais.
NORMALIZE = {"codigo": "code", "código": "code", "aplicando": "applying", "code": "code", "applying": "applying", "design": "design"}

# Chamadas que criam, alteram ou removem nó — mais atribuição direta a propriedade de nó/paint
# (`chip.strokes = [...]`, `label.fills = [...]`, `t.characters = ...`). Um script que só mexe em
# propriedades de um nó EXISTENTE nunca chama create/append/remove, então a metade de atribuição
# do padrão não é opcional: sem ela, um script de "ajustar o fill deste nó" passaria como leitura
# mesmo com `turn: design`. Leitura pura não aparece em nenhuma das metades: ler (`n.opacity`)
# não tem `=` depois.
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
    """Devolve (valor normalizado, lista de nomes antigos encontrados) ou (None, [])."""
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                m = re.match(r"\s*(turn|vez)\s*:\s*([a-zA-Zçó]+)", line)
                if m:
                    key, raw = m.group(1), m.group(2).strip().lower()
                    legacy = []
                    if key == "vez":
                        legacy.append("`vez:` (nome antigo, renomeie para `turn:`)")
                    value = NORMALIZE.get(raw, raw)
                    if raw != value:
                        legacy.append(f"`{raw}` (valor antigo, renomeie para `{value}`)")
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
        sys.exit(0)  # entrada inesperada: não atrapalhe

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
            "design": "vez do DESIGN — refino em andamento no Figma. Não reespelhe; ler e fazer diff é permitido.",
            "code": "vez do CÓDIGO — o Figma é espelho. Refino feito lá agora será sobrescrito.",
            "applying": "vez APLICANDO — propostas estão virando código. Evite mexer nos mesmos arquivos por fora.",
        }.get(turn, f"turn: {turn}")
        if legacy:
            msg += f" Aviso: {registry} usa " + "; ".join(legacy) + "."
        respond({
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": f"Ciclo Figma↔código do DSX ({registry}): {msg}",
            }
        })

    # PreToolUse
    if "use_figma" not in payload.get("tool_name", ""):
        sys.exit(0)
    if turn != "design":
        sys.exit(0)

    script = (payload.get("tool_input") or {}).get("code", "") or ""
    if not WRITE_CALL.search(script):
        sys.exit(0)  # leitura: permitida mesmo na vez do design

    reason = (
        f"Bloqueado pelo ciclo Figma↔código do DSX: `{registry}` diz `turn: design` — há refino em "
        "andamento no arquivo e escrever agora sobrescreveria o trabalho do design.\n\n"
        "Se a intenção era ler (snapshot, inventário, diff), reescreva o script para não criar/alterar nós. "
        "Se a rodada de design acabou mesmo, feche-a (/dsx:figma-vez code) e só então reespelhe."
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

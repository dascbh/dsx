#!/usr/bin/env python3
"""
Guarda da vez — transforma a doutrina do ciclo Figma↔código em regra que se cumpre sozinha.

A skill `figma-ciclo` PEDE que ninguém reespelhe enquanto a vez é do design. Pedir não impede nada:
basta um "pode reespelhar" distraído para o script sobrescrever horas de refino. Este hook impede.

PreToolUse em `use_figma`:
  · lê `vez:` (ou o legado `turn:`) do registro de sincronia do projeto;
  · se a vez é `design` E o script vai ESCREVER no arquivo -> nega, com motivo;
  · leitura (snapshot, inventário, diff) passa sempre — é ela que congela o "antes"
    e, sem ela, o ciclo não fecha;
  · projeto sem registro -> não interfere.

SessionStart: anuncia de quem é a vez, para o modelo não descobrir tarde demais.
"""
import json
import os
import re
import sys

REGISTROS = (
    "design/figma-sync.md",
    "docs/design/figma-sync.md",
    ".figma-sync.md",
)

# Valores legados (fluxo anterior, em inglês) -> valores atuais.
NORMALIZA = {"code": "codigo", "código": "codigo", "applying": "aplicando", "design": "design"}

# Chamadas que criam, alteram ou removem nó — mais atribuição direta a propriedade de nó/paint
# (`chip.strokes = [...]`, `label.fills = [...]`, `t.characters = ...`). Um script que só mexe em
# propriedades de um nó EXISTENTE nunca chama create/append/remove, então a metade de atribuição
# do padrão não é opcional: sem ela, um script de "ajustar o fill deste nó" passaria como leitura
# mesmo com `vez: design`. Leitura pura não aparece em nenhuma das metades: ler (`n.opacity`)
# não tem `=` depois.
ESCRITA = re.compile(
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


def achar_registro(cwd):
    for rel in REGISTROS:
        p = os.path.join(cwd, rel)
        if os.path.isfile(p):
            return p
    return None


def ler_vez(caminho):
    try:
        with open(caminho, encoding="utf-8") as fh:
            for linha in fh:
                m = re.match(r"\s*(vez|turn)\s*:\s*([a-zA-Zçó]+)", linha)
                if m:
                    v = m.group(2).strip().lower()
                    return NORMALIZA.get(v, v)
    except OSError:
        pass
    return None


def responder(payload):
    print(json.dumps(payload, ensure_ascii=False))
    sys.exit(0)


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # entrada inesperada: não atrapalhe

    evento = payload.get("hook_event_name") or payload.get("hookEventName") or ""
    cwd = payload.get("cwd") or os.getcwd()
    registro = achar_registro(cwd)
    if not registro:
        sys.exit(0)
    vez = ler_vez(registro)
    if not vez:
        sys.exit(0)

    if evento == "SessionStart":
        msg = {
            "design": "vez do DESIGN — refino em andamento no Figma. Não reespelhe; ler e fazer diff é permitido.",
            "codigo": "vez do CÓDIGO — o Figma é espelho. Refino feito lá agora será sobrescrito.",
            "aplicando": "vez APLICANDO — propostas estão virando código. Evite mexer nos mesmos arquivos por fora.",
        }.get(vez, f"vez: {vez}")
        responder({
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": f"Ciclo Figma↔código do DSX ({registro}): {msg}",
            }
        })

    # PreToolUse
    if "use_figma" not in payload.get("tool_name", ""):
        sys.exit(0)
    if vez != "design":
        sys.exit(0)

    codigo = (payload.get("tool_input") or {}).get("code", "") or ""
    if not ESCRITA.search(codigo):
        sys.exit(0)  # leitura: permitida mesmo na vez do design

    motivo = (
        f"Bloqueado pelo ciclo Figma↔código do DSX: `{registro}` diz `vez: design` — há refino em "
        "andamento no arquivo e escrever agora sobrescreveria o trabalho do design.\n\n"
        "Se a intenção era ler (snapshot, inventário, diff), reescreva o script para não criar/alterar nós. "
        "Se a rodada de design acabou mesmo, feche-a (/dsx:figma-vez codigo) e só então reespelhe."
    )
    responder({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": motivo,
        },
        "systemMessage": motivo,
    })


if __name__ == "__main__":
    main()

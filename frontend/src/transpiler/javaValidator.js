export function validateJava(code) {
    const errors = [];

    if (!code || !code.trim()) {
        return {
            valid: false,
            errors: ['El código Java está vacío.']
        };
    }

    if (!/\bclass\s+[A-Za-z_$][\w$]*/.test(code)) {
        errors.push('No se encontró una declaración válida de clase.');
    }

    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };

    let quote = null;
    let lineComment = false;
    let blockComment = false;
    let escaped = false;
    let line = 1;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const next = code[i + 1];

        if (char === '\n') {
            line++;
            lineComment = false;
            continue;
        }

        if (lineComment) continue;

        if (blockComment) {
            if (char === '*' && next === '/') {
                blockComment = false;
                i++;
            }
            continue;
        }

        if (quote) {
            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === '/' && next === '/') {
            lineComment = true;
            i++;
            continue;
        }

        if (char === '/' && next === '*') {
            blockComment = true;
            i++;
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }

        if (['(', '{', '['].includes(char)) {
            stack.push({ char, line });
            continue;
        }

        if ([')', '}', ']'].includes(char)) {
            const last = stack.pop();

            if (!last || last.char !== pairs[char]) {
                errors.push(
                    `Cierre inesperado "${char}" en la línea ${line}.`
                );
            }
        }
    }

    if (quote) {
        errors.push('Hay una cadena de texto sin cerrar.');
    }

    if (blockComment) {
        errors.push('Hay un comentario de bloque sin cerrar.');
    }

    for (const item of stack) {
        errors.push(
            `Falta cerrar "${item.char}" que se abrió en la línea ${item.line}.`
        );
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

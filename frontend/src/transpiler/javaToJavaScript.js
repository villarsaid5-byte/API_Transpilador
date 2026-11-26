
export function transpileJava(code) {
    if (!code || !code.trim()) {
        throw new Error('No hay código Java para transpilar.');
    }

    let result = code;

    const types =
        'int|double|float|long|short|byte|boolean|String|char|Object|var';

    // Obtener nombres de las clases
    const classNames = [
        ...result.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)
    ].map(match => match[1]);

    // Eliminar package e import
    result = result.replace(
        /^\s*package\s+[\w.]+\s*;\s*$/gm, ''
    );

    result = result.replace(
        /^\s*import\s+[\w.*]+\s*;\s*$/gm, ''
    );

    // Eliminar anotaciones comunes
    result = result.replace(/@Override\s*/g, '');

    // Convertir impresiones
    result = result.replace(
        /System\.out\.println\s*\(/g, 'console.log('
    );

    result = result.replace(
        /System\.out\.print\s*\(/g, 'console.log('
    );

    // Convertir constantes
    result = result.replace(
        /\bfinal\s+(?:int|double|float|long|short|byte|boolean|String|char|Object)\s+([A-Za-z_$][\w$]*)/g,
        'const $1'
    );

    // Convertir arreglos inicializados
    // Se procesan antes de String[] args para evitar conflictos.
    result = result.replace(
        /\b(?:int|double|float|long|short|byte|boolean|String|char)\s*\[\s*\]\s+([A-Za-z_$][\w$]*)\s*=\s*\{([^{}]*)\}/g,
        'let $1 = [$2]'
    );

    // Convertir arreglos declarados sin inicializar
    result = result.replace(
        /\b(?:int|double|float|long|short|byte|boolean|String|char)\s*\[\s*\]\s+([A-Za-z_$][\w$]*)\s*;/g,
        'let $1 = [];'
    );

    // Convertir String[] args de los parámetros de métodos
    result = result.replace(
        /\bString\s*\[\s*\]\s+([A-Za-z_$][\w$]*)\s*(?=[,)])/g,
        '$1'
    );

    // Convertir clases públicas
    result = result.replace(
        /\bpublic\s+class\s+/g, 'class '
    );

    // Convertir interfaces sencillas
    result = result.replace(
        /\b(?:public\s+)?interface\s+/g, 'class '
    );

    // Convertir constructores
    for (const className of classNames) {
        const constructorRegex = new RegExp(
            `^([\\t ]*)(?:(?:public|private|protected)\\s+)?${className}\\s*\\(`,
            'gm'
        );

        result = result.replace(
            constructorRegex, '$1constructor('
        );
    }

    // Convertir métodos estáticos
    result = result.replace(
        /\b(public|private|protected)\s+static\s+(?:void|int|double|float|long|short|byte|boolean|String|char|Object)\s+([A-Za-z_$][\w$]*)\s*\(/g,
        'static $2('
    );

    // Convertir métodos de instancia
    result = result.replace(
        /\b(public|private|protected)\s+(?:void|int|double|float|long|short|byte|boolean|String|char|Object)\s+([A-Za-z_$][\w$]*)\s*\(/g,
        '$2('
    );

    // Eliminar modificadores de acceso restantes
    result = result.replace(
        /\b(public|private|protected)\s+/g, ''
    );

    // Convertir declaraciones de variables primitivas
    const variableDeclaration = new RegExp(
        `\\b(?:${types})\\s+([A-Za-z_$][\\w$]*)(?=\\s*(?:=|;))`,
        'g'
    );

    result = result.replace(
        variableDeclaration, 'let $1'
    );

    // Convertir declaraciones de objetos de clases propias
    for (const className of classNames) {
        const objectDeclaration = new RegExp(
            `\\b${className}\\s+([A-Za-z_$][\\w$]*)(?=\\s*(?:=|;))`,
            'g'
        );

        result = result.replace(
            objectDeclaration, 'let $1'
        );
    }

    // Eliminar tipos de parámetros de métodos
    result = result.replace(
        new RegExp(
            `\\b(?:${types})\\s+([A-Za-z_$][\\w$]*)\\s*(?=[,)])`,
            'g'
        ),
        '$1'
    );

    // Convertir excepciones en catch
    result = result.replace(
        /\bcatch\s*\(\s*(?:Exception|RuntimeException|IOException|ArithmeticException|NullPointerException|IllegalArgumentException)\s+([A-Za-z_$][\w$]*)\s*\)/g,
        'catch ($1)'
    );

    // Convertir new Object()
    result = result.replace(
        /\bnew\s+Object\s*\(\s*\)/g, '{}'
    );

    return result.trim();
}




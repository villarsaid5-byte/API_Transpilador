
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

import { validateJava } from '../transpiler/javaValidator';
import { transpileJava } from '../transpiler/javaToJavaScript';

function Transpiler() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [javaCode, setJavaCode] = useState('');
    const [javascriptCode, setJavascriptCode] = useState('');
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [copied, setCopied] = useState(false);

    const handleTranspile = () => {
        setErrors([]);
        setMessage('');
        setJavascriptCode('');
        setCopied(false);

        // Validar que exista código
        if (!javaCode.trim()) {
            setMessage('Escribe código Java antes de transpilar.');
            setMessageType('warning');
            return;
        }

        // Validar estructura del código Java
        const validation = validateJava(javaCode);

        if (!validation.valid) {
            setErrors(validation.errors);
            setMessage('No se puede transpilar. Revisa los errores encontrados.');
            setMessageType('danger');
            return;
        }

        // Realizar la transpilación
        try {
            const result = transpileJava(javaCode);

            setJavascriptCode(result);
            setMessage('El código se transpilo correctamente.');
            setMessageType('success');
        } catch (error) {
            setMessage(error.message || 'Ocurrió un error durante la transpilación.');
            setMessageType('danger');
        }
    };

    const handleClear = () => {
        setJavaCode('');
        setJavascriptCode('');
        setErrors([]);
        setMessage('');
        setMessageType('');
        setCopied(false);
    };

    const handleCopy = async () => {
        if (!javascriptCode) {
            return;
        }

        try {
            await navigator.clipboard.writeText(javascriptCode);
            setCopied(true);
            setMessage('Código JavaScript copiado al portapapeles.');
            setMessageType('success');
        } catch {
            setMessage('No se pudo copiar el código. Intenta seleccionarlo manualmente.');
            setMessageType('danger');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="container-fluid px-4 py-4">

            {/* Encabezado */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-code-slash me-2 text-primary"></i>
                        Transpilador Java a JavaScript
                    </h2>

                    <p className="text-muted mb-0">
                        Convierte código Java a su equivalente en JavaScript.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/perfil')}
                    >
                        <i className="bi bi-person-circle me-2"></i>
                        Mi perfil
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {/* Información del transpilador */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded p-3">
                            <i className="bi bi-arrow-left-right fs-3 text-primary"></i>
                        </div>

                        <div>
                            <h5 className="fw-bold mb-1">
                                Área de transpilación
                            </h5>

                            <p className="text-muted mb-0">
                                Escribe tu código Java, valida su estructura
                                y genera automáticamente el código JavaScript.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensajes del sistema */}
            {message && (
                <div
                    className={`alert alert-${messageType} alert-dismissible fade show`}
                    role="alert"
                >
                    {message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage('')}
                        aria-label="Cerrar"
                    ></button>
                </div>
            )}

            {/* Errores de validación */}
            {errors.length > 0 && (
                <div className="alert alert-danger">
                    <h6 className="fw-bold">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Errores encontrados:
                    </h6>

                    <ul className="mb-0">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Áreas de código */}
            <div className="row g-4">

                {/* Entrada Java */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">
                                <i className="bi bi-filetype-java me-2"></i>
                                Código de entrada
                            </span>

                            <span className="badge bg-warning text-dark">
                                JAVA
                            </span>
                        </div>

                        <div className="card-body">
                            <label
                                htmlFor="javaCode"
                                className="form-label fw-semibold"
                            >
                                Ingresa tu código Java:
                            </label>

                            <textarea
                                id="javaCode"
                                className="form-control font-monospace"
                                rows="20"
                                value={javaCode}
                                onChange={(event) => setJavaCode(event.target.value)}
                                placeholder={`class HolaMundo {
    public static void main(String[] args) {
        System.out.println("Hola mundo");
    }
}`}
                                spellCheck="false"
                            ></textarea>

                            <div className="d-flex justify-content-between mt-2">
                                <small className="text-muted">
                                    {javaCode.length} caracteres
                                </small>

                                <small className="text-muted">
                                    Lenguaje de entrada: Java
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salida JavaScript */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">
                                <i className="bi bi-filetype-js me-2"></i>
                                Código de salida
                            </span>

                            <span className="badge bg-warning text-dark">
                                JAVASCRIPT
                            </span>
                        </div>

                        <div className="card-body">
                            <label
                                htmlFor="javascriptCode"
                                className="form-label fw-semibold"
                            >
                                Código JavaScript generado:
                            </label>

                            <textarea
                                id="javascriptCode"
                                className="form-control font-monospace"
                                rows="20"
                                value={javascriptCode}
                                readOnly
                                placeholder="El código JavaScript aparecerá aquí..."
                                spellCheck="false"
                            ></textarea>

                            <div className="d-flex justify-content-between mt-2">
                                <small className="text-muted">
                                    {javascriptCode.length} caracteres
                                </small>

                                <small className="text-muted">
                                    Lenguaje de salida: JavaScript
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acciones */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleTranspile}
                >
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Transpilar
                </button>

                <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={handleClear}
                >
                    <i className="bi bi-trash3 me-2"></i>
                    Limpiar
                </button>

                <button
                    className="btn btn-success btn-lg"
                    onClick={handleCopy}
                    disabled={!javascriptCode}
                >
                    <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-2`}></i>
                    {copied ? 'Copiado' : 'Copiar resultado'}
                </button>
            </div>

            {/* Información adicional */}
            <div className="alert alert-info mt-4">
                <i className="bi bi-info-circle me-2"></i>
                El transpilador admite un subconjunto de instrucciones Java.
                La validación comprueba la estructura básica del código, pero
                no sustituye a un compilador completo de Java.
            </div>

        </div>
    );
}

export default Transpiler;

/* ============================================================
   docente.js  —  Panel Docente · GRAMMOÙ
   ============================================================ */


/* ─────────────────────────────────────────
   SESIÓN — datos del login

   sessionStorage guarda los datos mientras el navegador
   está abierto. Los guardó login.js al hacer login.
   Si no hay sesión activa, redirige al login.
───────────────────────────────────────── */
const nombreGuardado = sessionStorage.getItem('usuario_nombre');
const perfilGuardado = sessionStorage.getItem('usuario_perfil');

/* Si no hay sesión o el perfil no es PROFESOR, volver al login */
if (!nombreGuardado || perfilGuardado !== 'PROFESOR') {
    window.location.href = './index.html';
}

/* Mostrar el nombre del docente en el nav */
if (nombreGuardado) {
    document.getElementById('docente-nombre').textContent = nombreGuardado;
}


/* ─────────────────────────────────────────
   CONFIGURACIÓN

   API_BASE   → URL del servidor Spring Boot
   DOCENTE_ID → ID del docente logueado, viene del sessionStorage
                que guardó login.js al iniciar sesión

   ⚠️ Único cambio necesario cuando el servidor cambie de IP:
      Sustituir 'http://localhost:8080/api' por la IP real
───────────────────────────────────────── */
const API_BASE   = 'http://localhost:8080/api';

/* Coger el ID del usuario desde la sesión
   en lugar de tenerlo hardcodeado como antes (const DOCENTE_ID = 1) */
const DOCENTE_ID = sessionStorage.getItem('usuario_id');


/* ─────────────────────────────────────────
   REFERENCIAS AL DOM

   Guardamos los elementos HTML en variables para no
   buscarlos en el DOM cada vez que los necesitamos
───────────────────────────────────────── */

/* — Formulario — */
const dropzone    = document.getElementById('dropzone');
const fileInput   = document.getElementById('h5p-file');
const fileDisplay = document.getElementById('file-name-display');
const nombreInput = document.getElementById('nombre');
const descInput   = document.getElementById('descripcion');
const charCount   = document.getElementById('char-count');
const nivelHidden = document.getElementById('nivel-hidden');
const btnSubir    = document.getElementById('btn-subir');

/* — Barra de progreso — */
const progressWrap = document.getElementById('upload-progress-wrap');
const progressBar  = document.getElementById('progress-bar');
const progressPct  = document.getElementById('progress-pct');

/* — Lista de ejercicios — */
const listaDiv   = document.getElementById('ejercicios-list');
const emptyState = document.getElementById('empty-state');
const loadingDiv = document.getElementById('loading-list');
const navCount   = document.getElementById('nav-count');
const btnRefresh = document.getElementById('btn-refresh');

/* — Alertas — */
const alertBox = document.getElementById('alert-box');


/* ─────────────────────────────────────────
   ESTADO GLOBAL

   allEjercicios → array con los ejercicios cargados del servidor
   activeFilter  → filtro activo en la lista ('all', 'A1', 'A2'...)
───────────────────────────────────────── */
let allEjercicios = [];
let activeFilter  = 'all';


/* ─────────────────────────────────────────
   SECCIÓN 1 — DRAG & DROP

   Permite arrastrar un .h5p sobre la zona punteada
   o elegirlo con el selector del sistema operativo.

   Eventos:
     dragover  → archivo encima  → cambiar estilo
     dragleave → archivo sale    → quitar estilo
     drop      → archivo soltado → procesarlo
     change    → elegido con clic del SO → procesarlo
───────────────────────────────────────── */
dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.h5p')) {
        mostrarNombreArchivo(file.name);
    } else {
        showAlert('Solo se aceptan archivos con extensión .h5p', 'warning');
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        mostrarNombreArchivo(fileInput.files[0].name);
    }
});

/* Muestra el nombre del archivo seleccionado en la interfaz */
function mostrarNombreArchivo(nombre) {
    fileDisplay.textContent    = '📄 ' + nombre;
    dropzone.style.borderColor = 'var(--french-blue)';
}


/* ─────────────────────────────────────────
   SECCIÓN 2 — CONTADOR DE CARACTERES

   El evento 'input' se dispara con cada tecla.
   Actualiza el número visible en tiempo real.
───────────────────────────────────────── */
descInput.addEventListener('input', () => {
    charCount.textContent = descInput.value.length;
});


/* ─────────────────────────────────────────
   SECCIÓN 3 — SELECTOR DE NIVEL

   Delegación de eventos: un listener en el contenedor
   padre en lugar de uno por cada botón.
───────────────────────────────────────── */
document.getElementById('nivel-group').addEventListener('click', e => {
    const btn = e.target.closest('.nivel-btn');
    if (!btn) return;

    /* Desmarcar todos y marcar el pulsado */
    document.querySelectorAll('#nivel-group .nivel-btn')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    /* Guardar valor en input hidden para enviarlo con FormData */
    nivelHidden.value = btn.dataset.nivel;
});


/* ─────────────────────────────────────────
   SECCIÓN 4 — SUBIDA DEL EJERCICIO con fetch()

   El cliente exige fetch() en lugar de XHR.
   La barra de progreso es simulada (30 → 60 → 100)
   porque fetch() no expone el progreso real de subida.

   FormData empaqueta el archivo .h5p y los campos de texto
   para enviarlos al servidor en una sola petición POST.

   Campos que envía al servidor Spring Boot:
     archivo     → MultipartFile archivo
     nombre      → String nombre
     nivel       → String nivel
     enlace      → String enlace  (nombre del archivo → columna ENLACE en BD)
     descripcion → String descripcion (opcional)
───────────────────────────────────────── */
btnSubir.addEventListener('click', async () => {

    /* — Validaciones — */
    if (!fileInput.files.length) {
        return showAlert('Selecciona un archivo .h5p', 'warning');
    }
    if (!nombreInput.value.trim()) {
        return showAlert('El nombre del ejercicio es obligatorio', 'warning');
    }
    if (!nivelHidden.value) {
        return showAlert('Selecciona el nivel del ejercicio', 'warning');
    }

    /* — Construir FormData —
       append(nombreCampo, valor) añade cada campo al paquete.
       'enlace' guarda el nombre del archivo en la columna ENLACE de MySQL */
    const formData = new FormData();
    formData.append('archivo',      fileInput.files[0]);
    formData.append('nombre',       nombreInput.value.trim());
    formData.append('nivel',        nivelHidden.value);
    formData.append('enlace',       fileInput.files[0].name); /* ← columna ENLACE en BD */
    formData.append('descripcion',  descInput.value.trim());

    /* — Preparar interfaz — */
    progressWrap.style.display = 'block';
    btnSubir.disabled = true;
    btnSubir.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Subiendo…';
    setProgress(30); /* Progreso simulado: fetch() no da % real */

    try {
        setProgress(60);

        /* fetch() con POST envía el FormData al servidor
           NO ponemos Content-Type: el navegador lo gestiona solo
           con el boundary correcto para archivos multipart */
        const res = await fetch(`${API_BASE}/ejercicios/upload`, {
            method: 'POST',
            body:   formData
        });

        /* respuesta.ok → true si código HTTP 200-299 */
        const datos = await res.json();

        if (res.ok) {
            setProgress(100);
            showAlert('Ejercicio subido correctamente', 'success');
            resetFormulario();
            cargarEjercicios(); /* Recargar lista para ver el nuevo */
        } else {
            showAlert('Error: ' + (datos.mensaje || 'Error al subir'), 'danger');
            setProgress(0);
        }

    } catch (err) {
        /* Error de red: servidor no disponible */
        showAlert('Error de conexión con el servidor', 'danger');
        setProgress(0);
        console.error(err);

    } finally {
        /* finally se ejecuta SIEMPRE, haya error o no.
           Garantiza que el botón siempre se restaura. */
        progressWrap.style.display = 'none';
        btnSubir.disabled  = false;
        btnSubir.innerHTML = '<i class="bi bi-cloud-upload me-2"></i>Subir ejercicio';
    }
});

/* Actualiza la barra de progreso visual */
function setProgress(pct) {
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', pct);
    progressPct.textContent = pct + '%';
}

/* Limpia todos los campos del formulario tras una subida exitosa */
function resetFormulario() {
    fileInput.value            = '';
    fileDisplay.textContent    = 'Ningún archivo seleccionado';
    dropzone.style.borderColor = '';
    nombreInput.value          = '';
    descInput.value            = '';
    charCount.textContent      = '0';
    nivelHidden.value          = '';
    document.querySelectorAll('#nivel-group .nivel-btn')
        .forEach(b => b.classList.remove('selected'));
}


/* ─────────────────────────────────────────
   SECCIÓN 5 — CARGA DE EJERCICIOS

   Petición GET al servidor para obtener la lista.
   Si el servidor no responde, usa datos de demo.
───────────────────────────────────────── */
async function cargarEjercicios() {

    /* Mostrar spinner mientras carga */
    loadingDiv.style.display  = 'block';
    listaDiv.style.display    = 'none';
    emptyState.style.display  = 'none';

    try {
        /* GET /api/ejercicios → devuelve todos los ejercicios
           El servidor devuelve un array JSON con los datos de la BD */
        const res = await fetch(`${API_BASE}/ejercicios`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allEjercicios = await res.json();

    } catch {
        /* ⚠️ MODO DEMO — eliminar cuando el servidor esté estable */
        console.warn('Servidor no disponible, usando datos de demo');
        allEjercicios = getDatosDemo();

    } finally {
        loadingDiv.style.display = 'none';
        renderLista(activeFilter);
    }
}

/* Construye y muestra las tarjetas de ejercicios en la lista */
function renderLista(filtro) {
    activeFilter = filtro;

    /* Filtrar por nivel o mostrar todos */
    const lista = filtro === 'all'
        ? allEjercicios
        : allEjercicios.filter(e => e.nivel === filtro);

    /* Actualizar contador del nav */
    navCount.textContent = allEjercicios.length;

    if (lista.length === 0) {
        listaDiv.style.display   = 'none';
        emptyState.style.display = 'block';
        return;
    }

    /* Template literal: construye el HTML de cada tarjeta
       ejercicio.enlace → nombre del archivo guardado en la columna ENLACE de MySQL */
    listaDiv.innerHTML = lista.map(ej => `
        <div class="ejercicio-item" data-id="${ej.id}">
            <div class="ejercicio-icon">
                <i class="bi bi-file-earmark-richtext"></i>
            </div>
            <div class="ejercicio-info">
                <div class="name" title="${ej.nombre}">${ej.nombre}</div>
                <div class="meta">
                    <i class="bi bi-link-45deg me-1"></i>${ej.enlace || ''}
                    &nbsp;·&nbsp;
                    <i class="bi bi-calendar3 me-1"></i>${formatFecha(ej.horaSubida)}
                    ${ej.descripcion ? ' · ' + truncar(ej.descripcion, 45) : ''}
                </div>
            </div>
            <span class="nivel-badge nivel-${ej.nivel}">${ej.nivel}</span>
            <button class="btn-delete" title="Eliminar ejercicio"
                onclick="eliminarEjercicio(${ej.id})">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `).join('');

    listaDiv.style.display   = 'flex';
    emptyState.style.display = 'none';
}


/* ─────────────────────────────────────────
   SECCIÓN 6 — ELIMINAR EJERCICIO

   fetch() con método DELETE al servidor.
   Si responde OK, elimina la tarjeta del DOM.
───────────────────────────────────────── */
async function eliminarEjercicio(id) {

    if (!confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;

    try {
        /* DELETE /api/ejercicios/{id}
           El servidor borra el registro de MySQL y el archivo .h5p */
        const res = await fetch(`${API_BASE}/ejercicios/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showAlert('Ejercicio eliminado correctamente', 'success');

    } catch {
        showAlert('Error al eliminar el ejercicio', 'danger');

    } finally {
        /* Quitar de la lista local y re-renderizar sin recargar */
        allEjercicios = allEjercicios.filter(e => e.id !== id);
        renderLista(activeFilter);
    }
}


/* ─────────────────────────────────────────
   SECCIÓN 7 — FILTROS DE NIVEL

   Muestran u ocultan ejercicios de la lista
   sin nueva petición al servidor.
───────────────────────────────────────── */
document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]')
            .forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        renderLista(btn.dataset.filter);
    });
});

btnRefresh.addEventListener('click', cargarEjercicios);


/* ─────────────────────────────────────────
   SECCIÓN 8 — ALERTAS FLOTANTES

   Mensajes en la esquina superior derecha.
   Se cierran solos a los 4.5 segundos.
───────────────────────────────────────── */
function showAlert(msg, type = 'info') {
    const iconos = {
        success: 'check-circle-fill',
        danger:  'x-circle-fill',
        warning: 'exclamation-triangle-fill',
        info:    'info-circle-fill'
    };

    const id   = 'alert-' + Date.now();
    const html = `
        <div id="${id}" class="alert alert-${type} alert-custom alert-dismissible fade show mb-2" role="alert">
            <i class="bi bi-${iconos[type] || 'info-circle-fill'} flex-shrink-0"></i>
            <span>${msg}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>`;

    alertBox.insertAdjacentHTML('beforeend', html);

    /* Auto-cierre a los 4.5 segundos */
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 4500);
}


/* ─────────────────────────────────────────
   SECCIÓN 9 — UTILIDADES
───────────────────────────────────────── */

/* Formatea fecha ISO a formato legible en español
   "2026-05-07T10:00:00" → "07 may 2026" */
function formatFecha(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch {
        return iso;
    }
}

/* Recorta texto largo para no romper el diseño de las tarjetas */
function truncar(str, n) {
    return str.length > n ? str.slice(0, n) + '…' : str;
}


/* ─────────────────────────────────────────
   SECCIÓN 10 — DATOS DE DEMO

   ⚠️ Solo para desarrollo — eliminar cuando el servidor esté estable.
   Se usan cuando cargarEjercicios() no puede conectar con Spring Boot.
───────────────────────────────────────── */
function getDatosDemo() {
    return [
        {
            id: 1,
            nombre: 'Les articles définis',
            descripcion: 'Ejercicio sobre artículos definidos en francés',
            nivel: 'A1',
            enlace: 'articles_definis.h5p',
            horaSubida: '2026-04-10T10:00:00'
        },
        {
            id: 2,
            nombre: "Le présent de l'indicatif",
            descripcion: 'Conjugación de verbos en presente',
            nivel: 'A2',
            enlace: 'present_indicatif.h5p',
            horaSubida: '2026-04-15T11:30:00'
        },
        {
            id: 3,
            nombre: 'Imparfait vs passé composé',
            descripcion: 'Diferencias entre los dos principales tiempos pasados',
            nivel: 'B1',
            enlace: 'imparfait_passe.h5p',
            horaSubida: '2026-04-22T09:00:00'
        }
    ];
}


/* ─────────────────────────────────────────
   INICIO

   Se ejecuta al terminar de cargar el HTML.
   Carga la lista de ejercicios al abrir la página.
───────────────────────────────────────── */
cargarEjercicios();
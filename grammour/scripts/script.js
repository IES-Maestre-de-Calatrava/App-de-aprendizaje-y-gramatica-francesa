/* ============================================================
   docente.js  —  Panel Docente · GRAMMOÙ
   ============================================================ */

/* ─────────────────────────────────────────
   CONFIGURACIÓN
───────────────────────────────────────── */
const API_BASE   = 'http://localhost:8080/api';
const DOCENTE_ID = 1;  // TODO: reemplazar con ID real cuando haya sesión


/* ─────────────────────────────────────────
   REFERENCIAS AL DOM
───────────────────────────────────────── */

// Formulario
const dropzone    = document.getElementById('dropzone');
const fileInput   = document.getElementById('h5p-file');
const fileDisplay = document.getElementById('file-name-display');
const nombreInput = document.getElementById('nombre');
const descInput   = document.getElementById('descripcion');
const charCount   = document.getElementById('char-count');
const nivelHidden = document.getElementById('nivel-hidden');
const btnSubir    = document.getElementById('btn-subir');

// Progreso
const progressWrap = document.getElementById('upload-progress-wrap');
const progressBar  = document.getElementById('progress-bar');
const progressPct  = document.getElementById('progress-pct');

// Lista
const listaDiv   = document.getElementById('ejercicios-list');
const emptyState = document.getElementById('empty-state');
const loadingDiv = document.getElementById('loading-list');
const navCount   = document.getElementById('nav-count');
const btnRefresh = document.getElementById('btn-refresh');

// Alertas
const alertBox = document.getElementById('alert-box');


/* ─────────────────────────────────────────
   ESTADO
───────────────────────────────────────── */
let allEjercicios = [];
let activeFilter  = 'all';


/* ─────────────────────────────────────────
   DRAG & DROP + SELECCIÓN DE ARCHIVO
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
    if (file && file.name.endsWith('.h5p')) {
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

function mostrarNombreArchivo(nombre) {
    fileDisplay.textContent = '📄 ' + nombre;
    dropzone.style.borderColor = 'var(--french-blue)';
}


/* ─────────────────────────────────────────
   CONTADOR DE CARACTERES (descripción)
───────────────────────────────────────── */
descInput.addEventListener('input', () => {
    charCount.textContent = descInput.value.length;
});


/* ─────────────────────────────────────────
   SELECCIÓN DE NIVEL
───────────────────────────────────────── */
document.getElementById('nivel-group').addEventListener('click', e => {
    const btn = e.target.closest('.nivel-btn');
    if (!btn) return;

    // Desmarcar todos y marcar el pulsado
    document.querySelectorAll('#nivel-group .nivel-btn')
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    nivelHidden.value = btn.dataset.nivel;
});


/* ─────────────────────────────────────────
   SUBIDA DE EJERCICIO
───────────────────────────────────────── */
btnSubir.addEventListener('click', async () => {

    // Validaciones básicas
    if (!fileInput.files.length)  return showAlert('Selecciona un archivo .h5p', 'warning');
    if (!nombreInput.value.trim()) return showAlert('El nombre del ejercicio es obligatorio', 'warning');
    if (!nivelHidden.value)        return showAlert('Selecciona el nivel del ejercicio', 'warning');

    // Construir FormData
    const formData = new FormData();
    formData.append('archivo',     fileInput.files[0]);
    formData.append('docenteId',   DOCENTE_ID);
    formData.append('nombre',      nombreInput.value.trim());
    formData.append('descripcion', descInput.value.trim());
    formData.append('nivel',       nivelHidden.value);

    // Preparar UI
    progressWrap.style.display = 'block';
    btnSubir.disabled = true;
    setProgress(0);

    try {
        await subirConProgreso(`${API_BASE}/ejercicios/upload`, formData);
        showAlert('✅ Ejercicio subido correctamente', 'success');
        resetFormulario();
        cargarEjercicios();
    } catch (err) {
        showAlert('❌ Error al subir: ' + (err.message || 'Inténtalo de nuevo'), 'danger');
    } finally {
        progressWrap.style.display = 'none';
        btnSubir.disabled = false;
        setProgress(0);
    }
});

/**
 * Sube el FormData mediante XHR para poder mostrar el progreso real.
 */
function subirConProgreso(url, formData) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        xhr.upload.addEventListener('progress', e => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`HTTP ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Error de red')));
        xhr.send(formData);
    });
}

function setProgress(pct) {
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', pct);
    progressPct.textContent = pct + '%';
}

function resetFormulario() {
    fileInput.value    = '';
    fileDisplay.textContent = 'Ningún archivo seleccionado';
    dropzone.style.borderColor = '';
    nombreInput.value  = '';
    descInput.value    = '';
    charCount.textContent = '0';
    nivelHidden.value  = '';
    document.querySelectorAll('#nivel-group .nivel-btn')
        .forEach(b => b.classList.remove('selected'));
}


/* ─────────────────────────────────────────
   CARGA DE EJERCICIOS
───────────────────────────────────────── */
async function cargarEjercicios() {
    // Mostrar estado "cargando"
    loadingDiv.style.display  = 'block';
    listaDiv.style.display    = 'none';
    emptyState.style.display  = 'none';

    try {
        const res = await fetch(`${API_BASE}/ejercicios/docente/${DOCENTE_ID}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allEjercicios = await res.json();
    } catch {
        // Backend no disponible: usar datos de ejemplo
        allEjercicios = getDatosDemo();
    } finally {
        loadingDiv.style.display = 'none';
        renderLista(activeFilter);
    }
}

function renderLista(filtro) {
    activeFilter = filtro;

    const lista = filtro === 'all'
        ? allEjercicios
        : allEjercicios.filter(e => e.nivel === filtro);

    // Actualizar contador del nav
    navCount.textContent = allEjercicios.length;

    if (lista.length === 0) {
        listaDiv.style.display   = 'none';
        emptyState.style.display = 'block';
        return;
    }

    listaDiv.innerHTML = lista.map(ej => `
        <div class="ejercicio-item" data-id="${ej.id}">
            <div class="ejercicio-icon">
                <i class="bi bi-file-earmark-richtext"></i>
            </div>
            <div class="ejercicio-info">
                <div class="name" title="${ej.nombre}">${ej.nombre}</div>
                <div class="meta">
                    <i class="bi bi-calendar3 me-1"></i>${formatFecha(ej.fechaCreacion)}
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
   ELIMINAR EJERCICIO
───────────────────────────────────────── */
async function eliminarEjercicio(id) {
    if (!confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch(`${API_BASE}/ejercicios/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showAlert('Ejercicio eliminado', 'success');
    } catch {
        // En modo demo eliminamos localmente
        showAlert('Ejercicio eliminado (modo demo)', 'info');
    } finally {
        allEjercicios = allEjercicios.filter(e => e.id !== id);
        renderLista(activeFilter);
    }
}


/* ─────────────────────────────────────────
   FILTROS DE NIVEL (panel derecho)
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
   ALERTAS FLOTANTES
───────────────────────────────────────── */
function showAlert(msg, type = 'info') {
    const iconos = {
        success: 'check-circle-fill',
        danger:  'x-circle-fill',
        warning: 'exclamation-triangle-fill',
        info:    'info-circle-fill'
    };

    const id  = 'alert-' + Date.now();
    const html = `
        <div id="${id}" class="alert alert-${type} alert-custom alert-dismissible fade show mb-2" role="alert">
            <i class="bi bi-${iconos[type] || 'info-circle-fill'} flex-shrink-0"></i>
            <span>${msg}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>`;

    alertBox.insertAdjacentHTML('beforeend', html);

    // Auto-cierre a los 4,5 s
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 4500);
}


/* ─────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────── */
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

function truncar(str, n) {
    return str.length > n ? str.slice(0, n) + '…' : str;
}


/* ─────────────────────────────────────────
   DATOS DE DEMO  (mientras el backend no esté activo)
───────────────────────────────────────── */
function getDatosDemo() {
    return [
        {
            id: 1,
            nombre: 'Les articles définis',
            descripcion: 'Ejercicio sobre artículos definidos en francés',
            nivel: 'A1',
            fechaCreacion: '2026-04-10T10:00:00'
        },
        {
            id: 2,
            nombre: "Le présent de l'indicatif",
            descripcion: 'Conjugación de verbos en presente',
            nivel: 'A2',
            fechaCreacion: '2026-04-15T11:30:00'
        },
        {
            id: 3,
            nombre: 'Imparfait vs passé composé',
            descripcion: 'Diferencias entre los dos principales tiempos pasados',
            nivel: 'B1',
            fechaCreacion: '2026-04-22T09:00:00'
        }
    ];
}


/* ─────────────────────────────────────────
   INICIO
───────────────────────────────────────── */
cargarEjercicios();
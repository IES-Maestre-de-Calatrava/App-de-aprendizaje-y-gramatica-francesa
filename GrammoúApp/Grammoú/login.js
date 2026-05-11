/* ============================================================
   login.js — Grammoù
   
   Gestiona el formulario de login:
   1. Recoge email y contraseña del formulario
   2. Envía los datos al servidor con fetch()
   3. Según el perfil recibido, redirige a la página correcta
   ============================================================ */

/* ── REFERENCIA AL FORMULARIO ─────────────────────────────────
   Escuchamos el evento 'submit' del formulario para interceptar
   el envío antes de que el navegador recargue la página
──────────────────────────────────────────────────────────── */
document.getElementById('form-login')
    .addEventListener('submit', async function(e) {

    /* preventDefault() evita que el formulario recargue la página
       de forma tradicional. Nosotros controlamos qué pasa */
    e.preventDefault();

    /* ── RECOGER DATOS DEL FORMULARIO ──────────────────────── */
    const email     = document.getElementById('prof-usuario').value.trim();
    const contrasena = document.getElementById('prof-pass').value.trim();

    /* Ocultar error previo si existía */
    const errorDiv = document.getElementById('login-error');
    errorDiv.classList.add('d-none');

    /* ── VALIDACIÓN BÁSICA ──────────────────────────────────── */
    if (email === '' || contrasena === '') {
        errorDiv.textContent = 'Por favor rellena todos los campos.';
        errorDiv.classList.remove('d-none');
        return;
    }

    /* ── ENVIAR AL SERVIDOR CON fetch() ────────────────────────
    
       A diferencia de la subida de archivos (que usaba FormData),
       aquí enviamos JSON porque son solo dos campos de texto.
       
       JSON.stringify() convierte el objeto JavaScript a texto JSON:
       { email: "a@b.com", contrasena: "1234" }
       → '{"email":"a@b.com","contrasena":"1234"}'
       
       El servidor recibe ese JSON y lo convierte a LoginRequest.java
    ──────────────────────────────────────────────────────────── */
    try {

        const respuesta = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                /* Le decimos al servidor que enviamos JSON */
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, contrasena })
        });

        /* ── LEER LA RESPUESTA DEL SERVIDOR ─────────────────── */
        const datos = await respuesta.json();

        if (datos.success) {

            /* ── LOGIN CORRECTO ──────────────────────────────────
            
               Guardamos el nombre y el id en sessionStorage para
               poder usarlos en docente.html y estudiante.html.
               
               sessionStorage → se borra al cerrar el navegador
               localStorage   → persiste aunque se cierre (menos seguro)
            ──────────────────────────────────────────────────── */
            sessionStorage.setItem('usuario_nombre', datos.nombre);
            sessionStorage.setItem('usuario_id',     datos.id);
            sessionStorage.setItem('usuario_perfil', datos.perfil);

            /* Redirigir según el perfil devuelto por el servidor */
            if (datos.perfil === 'PROFESOR') {
                window.location.href = './docente.html';
            } else if (datos.perfil === 'ALUMNO') {
                window.location.href = './estudiante.html';
            } else {
                /* Perfil desconocido — mostrar error */
                errorDiv.textContent = 'Perfil de usuario no reconocido.';
                errorDiv.classList.remove('d-none');
            }

        } else {

            /* ── LOGIN INCORRECTO ────────────────────────────────
               El servidor devolvió success: false
               Mostramos el mensaje de error debajo del botón
            ──────────────────────────────────────────────────── */
            errorDiv.textContent = datos.mensaje || 'Email o contraseña incorrectos.';
            errorDiv.classList.remove('d-none');
        }

    } catch (error) {

        /* ── ERROR DE RED ────────────────────────────────────────
           El servidor no está disponible o hay problema de conexión
        ──────────────────────────────────────────────────── */
        console.error('Error de conexión:', error);
        errorDiv.textContent = 'Error de conexión con el servidor.';
        errorDiv.classList.remove('d-none');
    }
});
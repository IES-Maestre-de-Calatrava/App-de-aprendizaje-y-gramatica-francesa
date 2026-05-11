/* ============================================================
   login.js — Grammoù

   Gestiona el formulario de login:
   1. Recoge email y contraseña
   2. Envía al servidor con fetch()
   3. Guarda los datos en sessionStorage
   4. Redirige según el perfil (PROFESOR o ALUMNO)
   ============================================================ */

document.getElementById('form-login')
    .addEventListener('submit', async function(e) {

    /* Evita que el formulario recargue la página */
    e.preventDefault();

    /* ── RECOGER DATOS ──────────────────────────────────────── */
    const email      = document.getElementById('prof-usuario').value.trim();
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

    /* ── ENVIAR AL SERVIDOR ─────────────────────────────────────
       Enviamos JSON con email y contraseña.
       El servidor lo recibe en LoginRequest.java y busca
       en la tabla USUARIO de MySQL.
    ──────────────────────────────────────────────────────────── */
    try {

        const respuesta = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                /* Indicamos que enviamos JSON */
                'Content-Type': 'application/json'
            },
            /* JSON.stringify convierte el objeto JS a texto JSON:
               { email: "a@b.com", contrasena: "1234" }
               → '{"email":"a@b.com","contrasena":"1234"}' */
            body: JSON.stringify({ email, contrasena })
        });

        const datos = await respuesta.json();

        if (datos.success) {

            /* ── LOGIN CORRECTO ──────────────────────────────────
               Guardamos los datos en sessionStorage.
               sessionStorage → se borra al cerrar el navegador.

               Guardamos:
                 usuario_nombre → para mostrar en el nav
                 usuario_perfil → para proteger las páginas
                 usuario_id     → ID_USUARIO de la tabla USUARIO
                 profesor_id    → ID_PROFESOR de la tabla PROFESOR
                                  (solo si el perfil es PROFESOR)
            ──────────────────────────────────────────────────── */
            sessionStorage.setItem('usuario_nombre', datos.nombre);
            sessionStorage.setItem('usuario_perfil', datos.perfil);
            sessionStorage.setItem('usuario_id',     datos.idUsuario);

            /* Solo guardamos profesor_id si el servidor lo devuelve
               Es decir, solo cuando el perfil es PROFESOR */
            if (datos.idProfesor) {
                sessionStorage.setItem('profesor_id', datos.idProfesor);
            }

            /* ── REDIRIGIR SEGÚN PERFIL ──────────────────────── */
            if (datos.perfil === 'PROFESOR') {
                window.location.href = './docente.html';

            } else if (datos.perfil === 'ALUMNO') {
                window.location.href = './estudiante.html';

            } else {
                /* Perfil desconocido */
                errorDiv.textContent = 'Perfil de usuario no reconocido.';
                errorDiv.classList.remove('d-none');
            }

        } else {

            /* ── LOGIN INCORRECTO ────────────────────────────────
               El servidor devolvió success: false.
               Mostramos el mensaje de error bajo el botón.
            ──────────────────────────────────────────────────── */
            errorDiv.textContent = datos.mensaje || 'Email o contraseña incorrectos.';
            errorDiv.classList.remove('d-none');
        }

    } catch (error) {

        /* ── ERROR DE RED ────────────────────────────────────────
           El servidor no está disponible.
        ──────────────────────────────────────────────────────── */
        console.error('Error de conexión:', error);
        errorDiv.textContent = 'Error de conexión con el servidor.';
        errorDiv.classList.remove('d-none');
    }
});
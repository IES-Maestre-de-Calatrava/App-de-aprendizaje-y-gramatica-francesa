/* Mostrar nombre del usuario logueado en el nav
   sessionStorage guarda los datos del login mientras
   el navegador está abierto */
const nombreGuardado = sessionStorage.getItem('usuario_nombre');
if (nombreGuardado) {
    document.getElementById('docente-nombre').textContent = nombreGuardado;
}
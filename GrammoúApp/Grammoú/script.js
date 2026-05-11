const nombreGuardado = sessionStorage.getItem('usuario_nombre');
const perfilGuardado = sessionStorage.getItem('usuario_perfil');

/* Si no hay sesión o el perfil no es PROFESOR, volver al login */
if (!nombreGuardado || perfilGuardado !== 'ALUMNO') {
    window.location.href = './index.html';
}
const destinos = [
    {
        nombre: "Francia", x: 42, y: 50,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "francia1.html", descarga: "francia1.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 2", url: "francia2.html", descarga: "francia2.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 3", url: "francia3.html", descarga: "francia3.pdf", icono: "./Imagenes/descargar.webp" }
        ]
    },
    {
        nombre: "Bélgica", x: 48, y: 12,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "belgica1.html", descarga: "belgica1.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 2", url: "belgica2.html", descarga: "belgica2.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 3", url: "belgica3.html", descarga: "belgica3.pdf", icono: "./Imagenes/descargar.webp" }
        ]
    },
    {
        nombre: "Suiza", x: 59, y: 50,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "suiza1.html", descarga: "suiza1.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 2", url: "suiza2.html", descarga: "suiza2.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 3", url: "suiza3.html", descarga: "suiza3.pdf", icono: "./Imagenes/descargar.webp" }
        ]
    },
    {
        nombre: "Luxemburgo", x: 52, y: 25,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "lux1.html", descarga: "lux1.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 2", url: "lux2.html", descarga: "lux2.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 3", url: "lux3.html", descarga: "lux3.pdf", icono: "./Imagenes/descargar.webp" }
        ]
    },
    {
        nombre: "Mónaco", x: 54, y: 80,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "monaco1.html", descarga: "monaco1.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 2", url: "monaco2.html", descarga: "monaco2.pdf", icono: "./Imagenes/descargar.webp" },
            { nombre: "Ejercicio 3", url: "monaco3.html", descarga: "monaco3.pdf", icono: "./Imagenes/descargar.webp" }
        ]
    }
];

function colocarBotones() {
    const container = document.getElementById('map-container');
    if (!container) return;

    document.querySelectorAll('.map-point').forEach(b => b.remove());

    destinos.forEach(dest => {
        const punto = document.createElement('div');
        punto.className = 'map-point';
        punto.style.left = dest.x + "%";
        punto.style.top = dest.y + "%";
        punto.title = dest.nombre;

        punto.onclick = () => {
            const lista = document.getElementById('listaEjercicios');
            lista.innerHTML = "";

            document.getElementById('modalLabel').innerText = "Ejercicios: " + dest.nombre;

            dest.ejercicios.forEach(ex => {
                const fila = document.createElement('div');
                fila.className = "d-flex align-items-center gap-2 mb-2";

                const btn = document.createElement('button');
                btn.className = "btn btn-outline-primary text-start flex-grow-1";
                btn.innerText = ex.nombre;
                btn.onclick = () => {
                    globalThis.location.href = ex.url;
                };

                const linkDescarga = document.createElement('a');
                linkDescarga.href = ex.descarga;
                linkDescarga.download = ex.nombre;
                linkDescarga.className = "btn-download-custom";
                linkDescarga.innerHTML = `<img src="${ex.icono}" alt="Descargar">`;

                fila.appendChild(btn);
                fila.appendChild(linkDescarga);
                lista.appendChild(fila);
            });

            const modal = new bootstrap.Modal(document.getElementById('modalEjercicios'));
            modal.show();
        };

        container.appendChild(punto);
    });
}

window.addEventListener('load', colocarBotones);
window.addEventListener('resize', colocarBotones);
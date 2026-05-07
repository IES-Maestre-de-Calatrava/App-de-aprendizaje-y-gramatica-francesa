const destinos = [
    {
        nombre: "Francia", x: 42, y: 50,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "francia1.html" },
            { nombre: "Ejercicio 2", url: "francia2.html" },
            { nombre: "Ejercicio 3", url: "francia3.html" }
        ]
    },
    {
        nombre: "Bélgica", x: 48, y: 12,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "belgica1.html" },
            { nombre: "Ejercicio 2", url: "belgica2.html" },
            { nombre: "Ejercicio 3", url: "belgica3.html" }
        ]
    },
    {
        nombre: "Suiza", x: 64, y: 46,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "suiza1.html" },
            { nombre: "Ejercicio 2", url: "suiza2.html" },
            { nombre: "Ejercicio 3", url: "suiza3.html" }
        ]
    },
    {
        nombre: "Luxemburgo", x: 52, y: 25,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "lux1.html" },
            { nombre: "Ejercicio 2", url: "lux2.html" },
            { nombre: "Ejercicio 3", url: "lux3.html" }
        ]
    },
    {
        nombre: "Mónaco", x: 61, y: 70,
        ejercicios: [
            { nombre: "Ejercicio 1", url: "monaco1.html" },
            { nombre: "Ejercicio 2", url: "monaco2.html" },
            { nombre: "Ejercicio 3", url: "monaco3.html" }
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
            lista.innerHTML = ""; // Limpiar lista previa

            document.getElementById('modalLabel').innerText = "Ejercicios: " + dest.nombre;

            dest.ejercicios.forEach(ex => {
                const btn = document.createElement('button');
                btn.className = "btn btn-outline-primary text-start";
                btn.innerText = ex.nombre;
                btn.onclick = () => {
                    globalThis.location.href = ex.url;
                };
                lista.appendChild(btn);
            });

            const modal = new bootstrap.Modal(document.getElementById('modalEjercicios'));
            modal.show();
        };

        container.appendChild(punto);
    });
}

window.addEventListener('load', colocarBotones);
window.addEventListener('resize', colocarBotones);
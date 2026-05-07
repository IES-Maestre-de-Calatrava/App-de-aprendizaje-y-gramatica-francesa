const destinos = [
    { nombre: "Francia", x: 42, y: 50, url: "francia.html" },
    { nombre: "Bélgica", x: 48, y: 12, url: "belgica.html" },
    { nombre: "Suiza", x: 60, y: 52, url: "suiza.html" },
    { nombre: "Luxemburgo", x: 52, y: 25, url: "luxemburgo.html" },
    { nombre: "Mónaco", x: 56, y: 81, url: "monaco.html" }
];

function colocarBotones() {
    const container = document.getElementById('map-container');

    if (!container) {
        console.error("No se encontró el contenedor del mapa");
        return;
    }

    document.querySelectorAll('.map-point').forEach(b => b.remove());

    destinos.forEach(dest => {
        const punto = document.createElement('div');
        punto.className = 'map-point';
        punto.style.left = dest.x + "%";
        punto.style.top = dest.y + "%";
        punto.title = dest.nombre;

        punto.onclick = (e) => {
            e.preventDefault();
            globalThis.location.href = dest.url;
        };

        container.appendChild(punto);
    });
}

window.addEventListener('load', colocarBotones);
window.addEventListener('resize', colocarBotones);
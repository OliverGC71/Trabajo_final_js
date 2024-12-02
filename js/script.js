document.addEventListener("DOMContentLoaded", function() {
    const contenedorNoticias = document.getElementById("contenedor-noticias");
    const contactForm = document.getElementById('contact-form');

    if (contenedorNoticias) {
        fetch("js/noticias.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el archivo JSON");
                }
                return response.json();
            })
            .then(noticias => {
                noticias.forEach(noticia => {
                    const noticiaElemento = document.createElement("div");
                    noticiaElemento.classList.add("noticia");
                    noticiaElemento.innerHTML = `
                        <h3>${noticia.titulo}</h3>
                        <p><strong>Fecha:</strong> ${noticia.fecha}</p>
                        <p>${noticia.contenido}</p>
                        ${noticia.imagen ? `<img src="${noticia.imagen}" alt="${noticia.titulo}" width="300" height="200">` : ""}
                    `;
                    contenedorNoticias.appendChild(noticiaElemento);
                });
            })
            .catch(error => {
                console.error("Error al cargar las noticias:", error);
                contenedorNoticias.innerHTML = "<p>Error al cargar las noticias. Por favor, intenta de nuevo más tarde.</p>";
            });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            clearErrors();
            let isValid = true;

            const nombre = document.getElementById('nombre');
            if (!/^[A-Za-záéíóúÁÉÍÓÚ]+$/.test(nombre.value) || nombre.value.length > 15) {
                document.getElementById('error-nombre').style.display = 'block';
                isValid = false;
            }

            const apellidos = document.getElementById('apellidos');
            if (!/^[A-Za-záéíóúÁÉÍÓÚ ]+$/.test(apellidos.value) || apellidos.value.length > 40) {
                document.getElementById('error-apellidos').style.display = 'block';
                isValid = false;
            }

            const telefono = document.getElementById('telefono');
            if (!/^\d{9}$/.test(telefono.value)) {
                document.getElementById('error-telefono').style.display = 'block';
                isValid = false;
            }

            const email = document.getElementById('email');
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!emailPattern.test(email.value)) {
                document.getElementById('error-email').style.display = 'block';
                isValid = false;
            }

            if (!document.getElementById('producto').value) {
                alert('Debe seleccionar un producto.');
                isValid = false;
            }

            if (!document.getElementById('condiciones').checked) {
                alert('Debe aceptar las condiciones de privacidad.');
                isValid = false;
            }

            if (isValid) {
                alert('Formulario enviado correctamente');
            }
        });
    }

    const productoSelect = document.getElementById("producto");
    const plazoInput = document.getElementById("plazo");
    const extrasCheckboxes = document.querySelectorAll("input[name='extras']");

    if (productoSelect && plazoInput && extrasCheckboxes.length > 0) {
        productoSelect.addEventListener("change", actualizarPresupuesto);
        plazoInput.addEventListener("input", actualizarPresupuesto);
        extrasCheckboxes.forEach(el => {
            el.addEventListener("change", actualizarPresupuesto);
        });

        function actualizarPresupuesto() {
            let precio = 0;
            const producto = productoSelect.value;
            const plazo = plazoInput.value;
            const extras = document.querySelectorAll("input[name='extras']:checked");

            if (producto === "web") precio = 500;
            else if (producto === "app") precio = 800;
            else if (producto === "ecommerce") precio = 1200;

            if (plazo >= 6) precio *= 0.9;

            extras.forEach(extra => {
                if (extra.value === "seo") precio += 50;
                if (extra.value === "seguridad") precio += 30;
                if (extra.value === "mantenimiento") precio += 100;
            });

            document.getElementById("presupuesto").value = precio + "€";
        }
    }

    function clearErrors() {
        const errorMsgs = document.querySelectorAll('.error-msg');
        errorMsgs.forEach(function(errorMsg) {
            errorMsg.style.display = 'none';
        });
    }

    document.querySelectorAll('nav ul li a').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Coordenadas de la empresa en Calle de Alcalá, 42, Madrid, España
    const empresaLat = 40.4183;
    const empresaLon = -3.6995;
    const mapContainer = document.getElementById('map');

    if (mapContainer) {
        const map = L.map('map').setView([empresaLat, empresaLon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const empresaMarker = L.marker([empresaLat, empresaLon]).addTo(map);
        empresaMarker.bindPopup("<b>InfoSpain</b><br>Calle de Alcalá, 42, Madrid").openPopup();

        // Obtener ubicación del usuario y calcular la ruta
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const clienteLat = position.coords.latitude;
                    const clienteLon = position.coords.longitude;

                    const clienteMarker = L.marker([clienteLat, clienteLon]).addTo(map);
                    clienteMarker.bindPopup("<b>Tu ubicación</b>").openPopup();

                    const apiKey = "5b3ce3597851110001cf6248c9e3ca4520a74399bae659e5e8303293";
                    const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${clienteLon},${clienteLat}&end=${empresaLon},${empresaLat}`;

                    fetch(directionsUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.features && data.features.length > 0) {
                                const routeCoords = data.features[0].geometry.coordinates;
                                const routeLatLngs = routeCoords.map(coord => [coord[1], coord[0]]);
                                const routeLine = L.polyline(routeLatLngs, { color: 'blue', weight: 4 }).addTo(map);

                                map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
                            } else {
                                console.error("No se encontró una ruta válida.");
                                alert("No se pudo encontrar una ruta.");
                            }
                        })
                        .catch(error => {
                            console.error("Error al obtener la ruta:", error);
                            alert("Hubo un problema al obtener la ruta. Por favor, intenta nuevamente.");
                        });
                },
                error => {
                    console.error("Error obteniendo la ubicación del usuario:", error.message);
                    alert("No se pudo obtener tu ubicación. Asegúrate de que la geolocalización esté activada en tu navegador.");
                }
            );
        } else {
            alert("Tu navegador no soporta la geolocalización.");
        }
    }
});

$(document).ready(function () {
    $('[data-toggle="lightbox"]').ekkoLightbox();
});
window.addEventListener('DOMContentLoaded', navegar);
window.addEventListener('hashchange', navegar);

function navegar() {
  const ruta = location.hash.slice(1) || 'contactos';
  const contenedor = document.getElementById('contenido');

  fetch(`componentes/${ruta}.html`)
    .then(res => res.ok ? res.text() : Promise.reject("No encontrado"))
    .then(html => {
      contenedor.innerHTML = html;

      // Actualiza visualmente la pestaña activa
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${ruta}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Carga script específico si existe
      const scriptPath = `js/${ruta}.js`;
      fetch(scriptPath).then(res => {
        if (res.ok) {
          const script = document.createElement("script");
          script.src = scriptPath;
          script.type = "module";
          document.body.appendChild(script);
        }
      });
    })
    .catch(err => contenedor.innerHTML = `<p>Error cargando vista: ${err}</p>`);
}

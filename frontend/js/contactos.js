const token = localStorage.getItem('token');

if (!token) {
  alert('Acceso denegado. Debes iniciar sesión.');
  window.location.href = 'index.html';
}

async function cargarContactos() {
  try {
    const res = await fetch('http://localhost:3000/api/dashboard/contactos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    if (!res.ok) throw new Error('Error al cargar contactos');

    const contactos = await res.json();
    const tbody = document.querySelector('#tablaContactos tbody');
    tbody.innerHTML = '';

    contactos.forEach(c => {
      const fila = `
        <tr>
          <td>${c.primer_nombre} ${c.primer_apellido}</td>
          <td>${c.telefono}</td>
          <td>${c.correo_electronico}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  } catch (error) {
    alert(error.message);
  }
}

// Ejecutar solo si el componente actual es contactos
window.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#contactos' || location.hash === '') {
    cargarContactos();
  }
});

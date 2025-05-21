const token = localStorage.getItem('token');
const id = localStorage.getItem('id');
console.log(id);

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

    if (contactos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Sin contactos registrados</td></tr>`;
      return;
    }

    contactos.forEach(c => {
      const fila = `
        <tr>
          <td>${c.nombre_completo || '-'}</td>
          <td>${c.telefono || '-'}</td>
          <td>${c.correo_electronico || '-'}</td>
          <td>${c.categorias || '-'}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editarContacto(${c.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarContacto(${c.id})">Eliminar</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  } catch (error) {
    alert(error.message);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (location.hash === '#contactos' || location.hash === '') {
    cargarContactos();
  }
});

function editarContacto(id) {
  // Abre modal o navega a formulario de edición
  alert('Editar contacto con ID: ' + id);
}

document.getElementById('btnAgregar').addEventListener('click', () => {
  // Abre modal o navega a formulario de nuevo contacto
  alert('Agregar nuevo contacto');
});
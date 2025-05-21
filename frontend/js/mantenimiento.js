document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const usuarioTab = document.getElementById('formUsuario');
  const categoriasTab = document.getElementById('tablaCategorias');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.tab === 'usuario') {
        usuarioTab.classList.remove('d-none');
        categoriasTab.classList.add('d-none');
      } else {
        usuarioTab.classList.add('d-none');
        categoriasTab.classList.remove('d-none');
        cargarCategorias(); // trae categorías desde el backend
      }
    });
  });

  document.getElementById('btnActualizar').addEventListener('click', () => {
    const datos = {
      usuario: document.getElementById('usuario').value,
      contrasena: document.getElementById('contrasena').value,
      telefono: document.getElementById('telefono').value,
      correo: document.getElementById('correo').value,
    };

    fetch('/api/usuario/actualizar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => alert("Actualizado con éxito"))
    .catch(err => alert("Error actualizando datos"));
  });

  document.getElementById('btnNuevaCategoria').addEventListener('click', () => {
    const nombre = prompt("Nueva categoría:");
    if (nombre) {
      fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      })
      .then(() => cargarCategorias());
    }
  });
});

function cargarCategorias() {
  fetch('/api/categorias')
    .then(res => res.json())
    .then(categorias => {
      const tbody = document.querySelector('#tabla tbody');
      tbody.innerHTML = '';
      categorias.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input value="${cat.nombre}" data-id="${cat.id}" /></td>
          <td>
            <button onclick="actualizarCategoria(${cat.id}, this)">Guardar</button>
            <button onclick="eliminarCategoria(${cat.id})">Eliminar</button>
          </td>`;
        tbody.appendChild(tr);
      });
    });
}

function actualizarCategoria(id, btn) {
  const nombre = btn.parentElement.parentElement.querySelector('input').value;
  fetch(`/api/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  }).then(() => cargarCategorias());
}

function eliminarCategoria(id) {
  fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    .then(() => cargarCategorias());
}
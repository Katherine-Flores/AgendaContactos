  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = {
    categorias: document.getElementById('tablaCategorias'),
    usuario: document.getElementById('formUsuario')
  };

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remover clase activa de todos los botones
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // Añadir clase activa al botón seleccionado
      button.classList.add('active');

      // Mostrar contenido correspondiente
      const tab = button.dataset.tab;
      for (const key in tabContents) {
        tabContents[key].classList.remove('active');
      }
      tabContents[tab].classList.add('active');
    });
  });

  // Activar "categorias" por defecto
  document.querySelector('[data-tab="categorias"]').click();

async function cargarCategorias() {
  const res = await fetch('http://localhost:3000/api/categorias');
  const categorias = await res.json();

  const tbody = document.querySelector('#tabla tbody');
  tbody.innerHTML = ''; // limpiar

  categorias.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.nombre}</td>
      <td>
        <i class="fa-solid fa-pen-to-square editar" style="cursor:pointer;"></i>
        <i class="fa-solid fa-trash eliminar" style="cursor:pointer;"></i>
      </td>
    `;

    // Asignar eventos
    tr.querySelector('.editar').addEventListener('click', () => {
      editarCategoria(cat.id, cat.nombre);
    });

    tr.querySelector('.eliminar').addEventListener('click', () => {
      eliminarCategoria(cat.id);
    });

    tbody.appendChild(tr);
  });
}

async function eliminarCategoria(id) {
  Swal.fire({
    title: '¿Eliminar categoría?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/categorias/${id}`, {
        method: 'DELETE'
      }).then(() => {
        Swal.fire('Eliminada', 'La categoría fue eliminada', 'success');
        cargarCategorias();
      });
    }
  });
}

function editarCategoria(id, nombreActual) {
  Swal.fire({
  title: 'Editar categoría',
  input: 'text',
  inputValue: nombreActual,
  showCancelButton: true,
  confirmButtonText: 'Actualizar',
  cancelButtonText: 'Cancelar'
}).then(result => {
  if (result.isConfirmed && result.value.trim() !== '') {
    fetch(`http://localhost:3000/api/categorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: result.value.trim() })
    }).then(() => {
      Swal.fire('Actualizado', 'La categoría fue modificada', 'success');
      cargarCategorias();
    });
  }
});
}

document.getElementById('btnNuevaCategoria').addEventListener('click', () => {
  Swal.fire({
    title: 'Nueva categoría',
    input: 'text',
    inputLabel: 'Nombre de la categoría',
    inputPlaceholder: 'Ej. Tecnología',
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value.trim()) {
        return 'Debes ingresar un nombre válido';
      }
    }
  }).then(result => {
    if (result.isConfirmed) {
      fetch('http://localhost:3000/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value.trim() })
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar categoría');
        return res.json();
      })
      .then(() => {
        Swal.fire('¡Agregado!', 'La categoría fue creada exitosamente', 'success');
        cargarCategorias();
      })
      .catch(err => {
        Swal.fire('Error', 'No se pudo agregar la categoría', 'error');
      });
    }
  });
});

setTimeout(() => cargarCategorias(), 300); // 300ms de espera
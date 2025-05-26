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
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/categorias', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const categorias = await res.json();

    if (!res.ok) {
      console.error(categorias);
      Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
      return;
    }

    const tbody = document.querySelector('#tabla tbody');
    tbody.innerHTML = ''; // limpiar

    categorias.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat.nombre}</td>
        <td>
          <i class="fa-solid fa-pen-to-square editar btn btn-warning" style="cursor:pointer;"></i>
          <i class="fa-solid fa-trash eliminar btn btn-danger" style="cursor:pointer;"></i>
        </td>
      `;

      tr.querySelector('.editar').addEventListener('click', () => {
        editarCategoria(cat.id, cat.nombre);
      });

      tr.querySelector('.eliminar').addEventListener('click', () => {
        eliminarCategoria(cat.id);
      });

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error de red o JSON:', err);
    Swal.fire('Error', 'Ocurrió un error al cargar las categorías', 'error');
  }
}

async function eliminarCategoria(id) {
  const token = localStorage.getItem('token');

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
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).then(res => {
        if (!res.ok) throw new Error('Error al eliminar');
        Swal.fire('Eliminada', 'La categoría fue eliminada', 'success');
        cargarCategorias();
      })
      .catch(() => Swal.fire('Error', 'No se pudo eliminar la categoría', 'error'));
    }
  });
}

function editarCategoria(id, nombreActual) {
  const token = localStorage.getItem('token');

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
      headers: { 
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ nombre: result.value.trim() })
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al editar');
      Swal.fire('Actualizado', 'La categoría fue modificada', 'success');
      cargarCategorias();
    })
    .catch(() => Swal.fire('Error', 'No se pudo editar la categoría', 'error'));
  }
});
}

document.getElementById('btnNuevaCategoria').addEventListener('click', () => {
  const token = localStorage.getItem('token');

  Swal.fire({
    title: 'Nueva categoría',
    input: 'text',
    inputLabel: 'Nombre de la categoría',
    inputPlaceholder: 'Ej. Universidad',
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
        headers: { 
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token 
        },
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

// ------------------------------------------------------------------------------------------//

async function cargarUsuarioActual() {
  const token = localStorage.getItem('token');

  const res = await fetch('http://localhost:3000/api/usuario-actual', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    Swal.fire('Error', 'No se pudo cargar el usuario actual', 'error');
    return;
  }

  const usuario = await res.json();
  document.getElementById('usuario').value = usuario.nombre_usuario;
  document.getElementById('contrasena').value = '';
}

function validarContrasenaFuerte(pass) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  return regex.test(pass);
}

document.getElementById('formDatosUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value.trim();
  const contrasena = document.getElementById('contrasena').value.trim();

  if (!usuario) {
    Swal.fire('Error', 'El nombre de usuario no puede estar vacío', 'error');
    return;
  }

  if (contrasena && !validarContrasenaFuerte(contrasena)) {
    Swal.fire('Error', 'La contraseña debe tener mayúsculas, minúsculas, número y símbolo', 'error');
    return;
  }

  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/usuario-actual', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ usuario, contrasena })
  });

  const json = await res.json();

  if (res.ok) {
    Swal.fire('Actualizado', json.message, 'success');
    cargarUsuarioActual();
  } else {
    Swal.fire('Error', json.message || 'No se pudo actualizar', 'error');
  }
});

cargarUsuarioActual();
cargarCategorias();
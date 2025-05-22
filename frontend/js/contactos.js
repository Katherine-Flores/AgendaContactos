function mostrarContactos(lista) {
  const tbody = document.querySelector('#tablaContactos tbody');
  tbody.innerHTML = '';

  lista.forEach(contacto => {
    const nombreCompleto = [contacto.primer_nombre, contacto.segundo_nombre, contacto.primer_apellido, contacto.segundo_apellido]
      .filter(n => n)
      .join(' ') || '-';

    const telefono = contacto.telefono || '-';
    const correo = contacto.correo_electronico || '-';
    const categorias = contacto.categorias.length > 0
      ? contacto.categorias.map(cat => `<span class="badge bg-info text-dark me-1">${cat}</span>`).join('')
      : '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${nombreCompleto}</td>
      <td>${telefono}</td>
      <td>${correo}</td>
      <td>${categorias}</td>
      <td>
        <i class="fa-solid fa-pen-to-square editar btn btn-warning" style="cursor:pointer;"></i>
        <i class="fa-solid fa-trash eliminar btn btn-danger" style="cursor:pointer;"></i>
      </td>
    `;

    tr.querySelector('.editar').addEventListener('click', () => {
      editarContacto(contacto);
    });

    tr.querySelector('.eliminar').addEventListener('click', () => {
      eliminarContacto(contacto.id);
    });

    tbody.appendChild(tr);
  });
}

/*async function cargarContactos() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/dashboard/contactos', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      Swal.fire('Error', 'No se pudieron cargar los contactos', 'error');
      return;
    }

    console.log(json);
    const contactos = json;

    const tbody = document.querySelector('#tablaContactos tbody');
    tbody.innerHTML = '';

    contactos.forEach(contacto => {
      const nombreCompleto = [contacto.primer_nombre, contacto.segundo_nombre, contacto.primer_apellido, contacto.segundo_apellido]
        .filter(n => n)
        .join(' ') || '-';

      const telefono = contacto.telefono || '-';
      const correo = contacto.correo_electronico || '-';
      const categorias = contacto.categorias.length > 0
        ? contacto.categorias.map(cat => `<span class="badge bg-info text-dark me-1">${cat}</span>`).join('')
        : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nombreCompleto}</td>
        <td>${telefono}</td>
        <td>${correo}</td>
        <td>${categorias}</td>
        <td>
          <i class="fa-solid fa-pen-to-square editar btn btn-warning" style="cursor:pointer;"></i>
          <i class="fa-solid fa-trash eliminar btn btn-danger" style="cursor:pointer;"></i>
        </td>
      `;

      tr.querySelector('.editar').addEventListener('click', () => {
        editarContacto(contacto);
      });

      tr.querySelector('.eliminar').addEventListener('click', () => {
        eliminarContacto(contacto.id);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error de red o JSON:', err);
    Swal.fire('Error', 'Ocurrió un error al cargar los contactos', 'error');
  }
}*/

let contactos = []; // Para guardar la lista original (útil para filtros)

async function cargarContactos() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/dashboard/contactos', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      Swal.fire('Error', 'No se pudieron cargar los contactos', 'error');
      return;
    }

    contactos = json; // Guardar todos para filtros/búsqueda
    mostrarContactos(contactos);

  } catch (err) {
    console.error('Error de red o JSON:', err);
    Swal.fire('Error', 'Ocurrió un error al cargar los contactos', 'error');
  }
}

document.getElementById('btnNuevoContacto').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  // 1. Obtener categorías del backend
  const categorias = await fetch('http://localhost:3000/api/categorias', {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => res.json());

  // 2. Crear HTML con checkboxes
  const checkboxesHTML = categorias.map(cat =>
    `<div>
      <label>
        <input type="checkbox" value="${cat.id}" class="categoria-checkbox"> ${cat.nombre}
      </label>
    </div>`
  ).join('');

  // 3. HTML completo del formulario
  const formularioHTML = `
    <input id="primer_nombre" class="swal2-input" placeholder="Primer nombre">
    <input id="segundo_nombre" class="swal2-input" placeholder="Segundo nombre">
    <input id="primer_apellido" class="swal2-input" placeholder="Primer apellido">
    <input id="segundo_apellido" class="swal2-input" placeholder="Segundo apellido">
    <input id="telefono" class="swal2-input" placeholder="Teléfono">
    <input id="correo" class="swal2-input" placeholder="Correo electrónico">
    <div style="text-align: left; margin-top: 1em;">
      <strong>Categorías:</strong>
      ${checkboxesHTML}
    </div>
  `;

  // 4. Mostrar el SweetAlert
  const result = await Swal.fire({
    title: 'Nuevo contacto',
    html: formularioHTML,
    focusConfirm: false,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    preConfirm: () => {
      const getValue = id => document.getElementById(id).value.trim();
      const categoriasSeleccionadas = Array.from(document.querySelectorAll('.categoria-checkbox:checked'))
        .map(cb => parseInt(cb.value));

      return {
        primer_nombre: getValue('primer_nombre'),
        segundo_nombre: getValue('segundo_nombre'),
        primer_apellido: getValue('primer_apellido'),
        segundo_apellido: getValue('segundo_apellido'),
        telefono: getValue('telefono'),
        correo_electronico: getValue('correo'),
        categorias: categoriasSeleccionadas
      };
    }
  });

  // 5. Si se confirma, enviar los datos al backend
  if (result.isConfirmed) {
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/contactos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(result.value)
      });

      if (!res.ok) throw new Error('Error al agregar contacto');

      Swal.fire('¡Agregado!', 'El contacto fue creado exitosamente', 'success');
      cargarContactos();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    }
  }
});

async function eliminarContacto(id) {
  Swal.fire({
    title: '¿Eliminar contacto?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:3000/api/dashboard/contactos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then(() => {
        Swal.fire('Eliminado', 'El contacto fue eliminado', 'success');
        cargarContactos();
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo eliminar el contacto', 'error');
      });
    }
  });
}

async function editarContacto(contacto) {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Obtener categorías
  const categorias = await fetch('http://localhost:3000/api/categorias', {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => res.json());

  // Crear checkboxes marcados según el contacto
  const checkboxesHTML = categorias.map(cat => {
    const checked = contacto.categorias.includes(cat.nombre) ? 'checked' : '';
    return `<div>
              <label>
                <input type="checkbox" value="${cat.id}" class="categoria-checkbox" ${checked}> ${cat.nombre}
              </label>
            </div>`;
  }).join('');

  const formularioHTML = `
    <input id="primer_nombre" class="swal2-input" value="${contacto.primer_nombre}" placeholder="Primer nombre">
    <input id="segundo_nombre" class="swal2-input" value="${contacto.segundo_nombre}" placeholder="Segundo nombre">
    <input id="primer_apellido" class="swal2-input" value="${contacto.primer_apellido}" placeholder="Primer apellido">
    <input id="segundo_apellido" class="swal2-input" value="${contacto.segundo_apellido}" placeholder="Segundo apellido">
    <input id="telefono" class="swal2-input" value="${contacto.telefono}" placeholder="Teléfono">
    <input id="correo" class="swal2-input" value="${contacto.correo_electronico}" placeholder="Correo electrónico">
    <div style="text-align: left; margin-top: 1em;">
      <strong>Categorías:</strong>
      ${checkboxesHTML}
    </div>
  `;

  const result = await Swal.fire({
    title: 'Editar contacto',
    html: formularioHTML,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const getValue = id => document.getElementById(id).value.trim();
      const categoriasSeleccionadas = Array.from(document.querySelectorAll('.categoria-checkbox:checked'))
        .map(cb => parseInt(cb.value));

      return {
        primer_nombre: getValue('primer_nombre'),
        segundo_nombre: getValue('segundo_nombre'),
        primer_apellido: getValue('primer_apellido'),
        segundo_apellido: getValue('segundo_apellido'),
        telefono: getValue('telefono'),
        correo_electronico: getValue('correo'),
        categorias: categoriasSeleccionadas
      };
    }
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`http://localhost:3000/api/dashboard/contactos/${contacto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(result.value)
      });

      if (!res.ok) throw new Error('Error al actualizar contacto');

      Swal.fire('Actualizado', 'El contacto fue modificado', 'success');
      cargarContactos();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
    }
  }
}

/* --------------------------------------------------------------------------------------- */

document.getElementById('buscadorContactos').addEventListener('input', e => {
  const valor = e.target.value.toLowerCase().trim();
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/api/dashboard/contactos', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(contactos => {
      if (!Array.isArray(contactos)) return console.error('No es una lista:', contactos);

      const filtrados = contactos.filter(c =>
        `${c.primer_nombre} ${c.primer_apellido}`.toLowerCase().includes(valor) ||
        c.telefono.includes(valor)
      );
      mostrarContactos(filtrados);
    })
    .catch(err => {
      console.error('Error al buscar contactos:', err);
    });
});

function cargarSugerencias() {
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/api/dashboard/contactos', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(contactos => {
      const datalist = document.getElementById('sugerenciasContactos');
      datalist.innerHTML = '';

      contactos.forEach(c => {
        const opcion = document.createElement('option');
        opcion.value = `${c.primer_nombre} ${c.primer_apellido}`;
        datalist.appendChild(opcion);

        const tel = document.createElement('option');
        tel.value = c.telefono;
        datalist.appendChild(tel);
      });
    })
    .catch(err => {
      console.error('Error al cargar sugerencias:', err);
    });
}

document.getElementById('btnFiltrarCategorias').addEventListener('click', () => {
  const cont = document.getElementById('filtroCategorias');
  
  // Cargar las categorías solo si aún no se han cargado (opcional)
  if (cont.innerHTML.trim() === '') {
    cargarFiltroCategorias();
  }

  // Alternar visibilidad
  cont.style.display = cont.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('filtroCategorias').addEventListener('change', () => {
  const seleccionados = Array.from(document.querySelectorAll('.filtro-categoria:checked')).map(cb => cb.value);
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/api/dashboard/contactos/filtro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ categorias: seleccionados })
  })
    .then(res => res.json())
    .then(contactos => {
      mostrarContactos(contactos);
    })
    .catch(err => {
      console.error('Error al filtrar por categorías:', err);
    });
});

function cargarFiltroCategorias() {
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/api/categorias', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(categorias => {
      const contenedor = document.getElementById('filtroCategorias');
      contenedor.innerHTML = '';

      categorias.forEach(cat => {
        const checkbox = document.createElement('label');
        checkbox.innerHTML = `
          <input type="checkbox" class="filtro-categoria" value="${cat.id}"> ${cat.nombre}
        `;
        contenedor.appendChild(checkbox);
      });
    })
    .catch(err => {
      console.error('Error al cargar categorías:', err);
    });
}

cargarContactos();

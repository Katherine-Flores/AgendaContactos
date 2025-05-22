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

    console.log(json); // 👀 Aquí ya está bien
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
          <button class="btn btn-sm btn-warning">Editar</button>
          <button class="btn btn-sm btn-danger">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error de red o JSON:', err);
    Swal.fire('Error', 'Ocurrió un error al cargar los contactos', 'error');
  }
}

cargarContactos();

function inicializarReuniones() {
  const token = localStorage.getItem('token');

  // 1. Cargar contactos con correo
  fetch('http://localhost:3000/api/dashboard/contactos/con-correo', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(res => res.json())
    .then(contactos => {
      const lista = document.getElementById('listaContactos');
      lista.innerHTML = ''; // Limpiar antes de volver a cargar
      contactos.forEach(contacto => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="checkbox" class="correo-check" value="${contacto.correo_electronico}"> 
          ${contacto.primer_nombre} (${contacto.correo_electronico})
        `;
        lista.appendChild(label);
        lista.appendChild(document.createElement('br'));
      });
    });

  // 2. Enviar correos al hacer submit
  const form = document.getElementById('formReunion');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const asunto = form.asunto.value;
      const mensaje = form.mensaje.value;
      const correos = Array.from(document.querySelectorAll('.correo-check:checked')).map(c => c.value);
      if (correos.length === 0) {
        alert('Selecciona al menos un contacto');
        return;
      }

      fetch('http://localhost:3000/api/reuniones/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ asunto, mensaje, contactos: correos })
      })
        .then(res => res.json())
        .then(res => {
          alert(res.message);
        })
        .catch(err => {
          console.error('Error al enviar correos:', err);
          alert('Hubo un error al enviar los correos');
        });
    });
  }
}

inicializarReuniones();
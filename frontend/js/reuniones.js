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
      lista.innerHTML = '';
      contactos.forEach(contacto => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="checkbox" class="correo-check form-check-input" value="${contacto.correo_electronico}"> 
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
      const asunto = form.asunto.value.trim();
      const mensaje = form.mensaje.value.trim();
      const correos = Array.from(document.querySelectorAll('.correo-check:checked')).map(c => c.value);

      if (correos.length === 0) {
        Swal.fire('Error', 'Selecciona al menos un contacto', 'warning');
        return;
      }

      const token = localStorage.getItem('token');

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
          if (res.message) {
            Swal.fire('Enviado', res.message, 'success');
            form.reset();
            document.querySelectorAll('.correo-check:checked').forEach(chk => chk.checked = false);
          } else {
            Swal.fire('Error', 'No se recibió respuesta del servidor', 'error');
          }
        })
        .catch(err => {
          console.error('Error al enviar correos:', err);
          Swal.fire('Error', 'Hubo un error al enviar los correos', 'error');
        });
    });
  }

  const btnPlantilla = document.getElementById('btnPlantilla');
  if (btnPlantilla) {
    btnPlantilla.addEventListener('click', () => {
      const asuntoInput = document.querySelector('input[name="asunto"]');
      const mensajeTextarea = document.querySelector('textarea[name="mensaje"]');

      if (asuntoInput && mensajeTextarea) {
        asuntoInput.value = 'FESTEC';

        const mensajeHTML = `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f3f6fa; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <div style="background-color: #004080; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 26px;">🎉 FESTEC 2025 🎉</h1>
          <p style="margin: 5px 0;">Universidad Mariano Gálvez de Guatemala</p>
        </div>
        
        <div style="padding: 20px; text-align: center;">
          <h2 style="color: #004080; margin-top: 0;">¡Vive la tecnología con nosotros!</h2>
          
          <p style="margin: 10px 0;">
            <strong>La carrera de Ingeniería en Sistemas</strong> de la sede <strong>Puerto Barrios</strong> te invita a participar en el gran evento anual <strong>FESTEC 2025</strong>.
          </p>
                    
          <p style="margin: 10px 0;">
            Prepárate para un día lleno de proyectos, innovación, tecnología, concursos, torneos y mucho más.
          </p>
          
          <p style="margin: 10px 0;">
            <strong>📅 Fecha:</strong> 31-05-2025<br>
            <strong>📍 Lugar:</strong> Comando Naval del Caribe
          </p>

        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          © 2025 Universidad Mariano Gálvez de Guatemala - Ingeniería en Sistemas
        </div>
        
      </div>
    </body>
  </html>
        `;

        mensajeTextarea.value = mensajeHTML.trim();
      }
    });
  }
}

inicializarReuniones();
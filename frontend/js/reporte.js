function inicializarReporte() {
  const token = localStorage.getItem('token');
  const form = document.getElementById('formReporte');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const correo = form.correo.value;

      fetch('http://localhost:3000/api/reportes/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ correo })
      })
        .then(res => res.json())
        .then(res => {
          const estadoDiv = document.getElementById('estadoReporte');
          estadoDiv.className = ''; 

          estadoDiv.classList.add('alert', 'alert-success');
          estadoDiv.textContent = res.message;
        })
        .catch(err => {
          console.error('Error al enviar reporte:', err);
          const estadoDiv = document.getElementById('estadoReporte');
          estadoDiv.className = ''; 

          estadoDiv.classList.add('alert', 'alert-danger');
          estadoDiv.textContent = 'Error al enviar reporte';
        });
    });
  }
}

inicializarReporte();
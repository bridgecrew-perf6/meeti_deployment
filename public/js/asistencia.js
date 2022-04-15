import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const asistencia = document.querySelector('#confirmar-asistencia');
    if (asistencia) {
        asistencia.addEventListener('submit', confirmarAsitencia)
    }
});

function confirmarAsitencia(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirmar-asistencia input[type="submit"]');
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');
    

    //limpia la respuesta previa
    while(mensaje.firstChild) {
        mensaje.removeChild(mensaje.firstChild);
    }

    //obtiene el valor cancelar o confirmar en el hidden
    const datos = {
        accion : accion
    }
    // console.log(this.children[2].onclick =location.reload());

    axios.post(this.action, datos)
        .then(respuesta => {
            // console.log(respuesta);
            if (accion === 'confirmar') {
                //modifica los elementos del boton
                document.querySelector('#accion').value = 'cancelar';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');
                btn.onclick = location.reload();
               
            } else {
                document.querySelector('#accion').value = 'confirmar';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
                btn.onclick = location.reload();
            }

            //mostrar un mensaje
            mensaje.appendChild(document.createTextNode(respuesta.data));
            

        });

}
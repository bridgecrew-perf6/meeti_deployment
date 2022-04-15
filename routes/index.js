const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeControllers');
const usuariosController = require('../controllers/usuariosControllers');
const authController = require('../controllers/authController');	
const adminController = require('../controllers/adminController');	
const gruposController = require('../controllers/gruposController');	

const meetiController = require('../controllers/meetiController');	
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function() {

    // AREA PUBLICA

    router.get('/', homeController.home);

    //Muestra un meeti
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti);

    //Confirma la asistencia a meeti
    router.post('/confirmar-asistencia/:slug', 
        meetiControllerFE.confirmarAsistencia
    );

    // Muestra asistentes al mmeti
    router.get('/asistentes/:slug',
        meetiControllerFE.mostrarAsistentes
    );

    //Agrega Comentarios en el Meeti
    router.post('/meeti/:id',
        comentariosControllerFE.agregarComentario
    );

    //Eliminar comentarios en el meeti
    router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
    );

    //muestra perfiles en el front end
    router.get('/usuarios/:id',
        usuariosControllerFE.mostrarUsuario
    );

    //muestra los grupos en el front end
    router.get('/grupos/:id',
        gruposControllerFE.mostrarGrupo
    );

    //Muestra meeti's por categoria
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    
    );

    //Añade la busqueda
    router.get('/busqueda',
        busquedaControllerFE.resultadosBusqueda
    );


    //Crear y confirmar cuentas
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo',usuariosController.confirmarCuenta);

    //Iniciar sesion
    router.get('/iniciar-sesion',usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',authController.autenticarUsuario);

    //Cerrar sesion
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );

    //AREA PRIVADA

    //Panel de Administracion
    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    
    );
    //Nuevos Grupos
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    //Editar Grupos
    router.get('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    
    );
    router.post('/editar-grupo/:grupoId', 
    authController.usuarioAutenticado,
    gruposController.editarGrupo);

    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );

    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );

    //Eliminar grupos
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    
    );
    router.post('/eliminar-grupo/:grupoId',
    authController.usuarioAutenticado,
    gruposController.eliminarGrupo

    );
    //Nuevos Meeti
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    
    );
    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeti,
    );

    //Editar Meeti
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti

    );
    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti

    );

    //Eliminar grupos
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    );    

    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti

    );

    //Editar informacion de perfil
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    //modifica el password
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    //Imagen de perfil
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil    
    );
    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil,

    );


    return router;
}

// {
// "id":"51736eb4-34e8-434b-bb20-48af6e57c293",
// "titulo":"Clases React",
// "slug":"introduccion-a-react-E99RcwJLO",
// "invitado":"Raymond Davila",
// "cupo":20,
// "descripcion":"<div>Clases React</div>",
// "fecha":"2022-07-09",
// "hora":"20:28:00",
// "direccion":"Calle Aurelio Souza 380",
// "ciudad":"Barranco",
// "estado":"Lima",
// "pais":"PER",
// "ubicacion":{"crs":{"type":"name","properties":{"name":"EPSG:4326"}},"type":"Point","coordinates":[-12.1397099840174,-77.014890004422]},"interesados":[],
// "createdAt":"2022-04-10T01:29:34.331Z",
// "updatedAt":"2022-04-11T22:37:53.104Z",
// "usuarioId":1,
// "grupoId":"e0bb280e-7ac0-47fe-8ee8-26b0d192e57d",

// "grupo":{
//     "id":"e0bb280e-7ac0-47fe-8ee8-26b0d192e57d",
//     "nombre":"Nodejs Peru",
//     "descripcion":"<div>Grupo de Nodejs</div>",
//     "url":"http://www.nodejs.com.pe",
//     "imagen":"LUIqQO9Wh.jpeg",
//     "createdAt":"2022-04-11T18:20:18.155Z",
//     "updatedAt":"2022-04-11T22:48:41.663Z",
//     "categoriaId":1,
//     "usuarioId":1
// },

// "usuario":{
//     "id":1,
//     "nombre":"Raymond Davila",
//     "imagen":"GsOVJCPj8.png"
  // }
// }

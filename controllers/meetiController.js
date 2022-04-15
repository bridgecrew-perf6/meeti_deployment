const Grupos = require("../models/Grupos");
const Meeti = require("../models/Meeti");

const uuid = require('uuid').v4;

//Muestra el formulario para nuevos Meeti
exports.formNuevoMeeti = async (req, res) => { 
    const grupos = await Grupos.findAll({ where : { usuarioId : req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos : grupos   
    });
}
//iNSERTA NUEVOS MEETI en la bd
exports.crearMeti = async (req, res) => {
    //obtener los datos del formulario
    const meeti = req.body;

    // console.log(meeti);
    //asignar el usuario
    meeti.usuarioId = req.user.id;

    //almcena la ubicacion con un point
    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng) ] };
    meeti.ubicacion = point;

    //cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();
        
    //almacenar en la bd
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Meeti creado con éxito');
        res.redirect('/administracion');
    } catch (error) {
        // console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}
//sanitizar los meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
};

//Muestra el formulario para editar Meeti

exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({ where : { usuarioId : req.user.id } }));
    consultas.push(Meeti.findByPk(req.params.id));

    //return un promise
    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }
        
    //mostramos la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    })
};

//almacena los cambios en el mettu (BD)
exports.editarMeeti = async (req, res, next) => { 
    const meeti = await Meeti.findOne({where : { id : req.params.id, usuarioId: req.user.id }});

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //asignar los valores del formulario
    // console.log(req.body);
    const { titulo, invitado, cupo, fecha, hora, direccion, ciudad, estado, pais, lat, lng, grupoId, descripcion } = req.body;

    //actualizar el meeti
    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.cupo = cupo;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;
    meeti.descripcion = descripcion;
    
    //asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [ parseFloat(lat), parseFloat(lng) ] };
    meeti.ubicacion = point;

    //alamcenar en la BD
    await meeti.save();
    req.flash('exito', 'Meeti editado con éxito');
    res.redirect('/administracion');

};

//Muestra el formulario para eliminar un grupo
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where : { id: req.params.id, usuarioId : req.user.id }});

    if (!meeti) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Grupo : ${meeti.titulo}`,
                
    });    
};

exports.eliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where : { id : req.params.id, usuarioId: req.user.id }});

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

     //Eliminar el meeti
     await Meeti.destroy({
        where : { 
            id: req.params.id
        }
    });    

    //Redireccionar al usuario
    req.flash('exito', 'Meeti Eliminado Correctamente');
    res.redirect('/administracion');


}
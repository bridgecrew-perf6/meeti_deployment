const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid').v4;



const configuracionMulter = {
    limits: { fileSize: 100000 }, 
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '../../public/uploads/grupos');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            //el archivo no es valido
            next(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

//sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) { 
        if(error) {
            console.log(error);
            // return;
            //TODO: Manejar errores
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande');
                } else {
                    req.flash('error', error.message);
                }              
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
                
            
            res.redirect('back');
            return;

        } else {
            next();
        }
    });

}

exports.formNuevoGrupo = async (req, res) => { 
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo Grupo',
        categorias
        
    });    
};
//Almacena los grupos en la BD
exports.crearGrupo = async (req, res) => { 
    //sanitizar
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;

    //alamacena el usuario autenticado como creador del grupo
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;
    // console.log(grupo);

    //leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename;
    }
        
    grupo.id = uuid();
   
    try {
        //alamcena en la bd
        await Grupos.create(grupo);
        req.flash('exito', 'Grupo creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        //extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }  

};

exports.formEditarGrupo = async (req, res) => { 
   
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);
   
    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo : ${grupo.nombre}`,
        grupo,   
        categorias       
    });    
};
//guarda los cambios en la BD
exports.editarGrupo = async (req, res, next ) => { 
    const grupo = await Grupos.findOne({where : { id: req.params.grupoId, usuarioId : req.user.id }});

    // console.log(grupo);
    // return;

    // si no existe ese grupo o no es el dueño del grupo
    if (!grupo) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien, leer los valores
    // console.log(req.body);
    // return;
    const { nombre, descripcion, categoria, url } = req.body;

    //Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoria;
    grupo.url = url;

    //Guardamos en la base de datos
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados correctamente');
    res.redirect('/administracion');   

};

//Muestra el formulario para editar una imagen de grupo
exports.formEditarImagen = async (req, res) => { 
    const grupo = await Grupos.findByPk(req.params.grupoId);

    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
        
    });    
};

//Modifica la imagen en la BD y elimina la anteror
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({where : { id: req.params.grupoId, usuarioId : req.user.id }});

    if (!grupo) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
        return next();
    }        
 
    //Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
    
        //borrar la imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);                
            }
            return;
        });
    }

    //Si hay una imagen nueva, la guardamos
    if (req.file) { 
        grupo.imagen = req.file.filename;
    }

    //Guardamos en la base de datos
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}    
//Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({where : { id: req.params.grupoId, usuarioId : req.user.id }});

    if (!grupo) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo : ${grupo.nombre}`,
                
    });    
};

// Eliminar el grupo e imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id: req.params.grupoId, usuarioId : req.user.id }});

    // console.log(grupo)
    // return;

    if (!grupo) {
        req.flash('error', 'Operación no permitida');
        res.redirect('/administracion');
        return next();
    }

    //Si hay una imagen, eliminarla
    if (grupo.imagen) {
        const imagenPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
    
        //borrar la imagen anterior
        fs.unlink(imagenPath, (error) => {
            if (error) {
                console.log(error);                
            }
            return;
        });
    }

    // console.log(grupo.imagen);
    // return;
    //Eliminar el grupo
    await Grupos.destroy({
        where : { 
            id: req.params.grupoId
        }
    });    

    //Redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado Correctamente');
    res.redirect('/administracion');

}
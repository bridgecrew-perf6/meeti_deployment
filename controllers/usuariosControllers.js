const { enviarEmail } = require("../handlers/email");
const Usuarios = require("../models/Usuarios");

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 100000 }, 
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '../../public/uploads/perfiles');
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

exports.formCrearCuenta = (req, res) => { 
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
};

exports.crearNuevaCuenta = async (req, res) => { 
   const usuario = req.body;

   req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
   req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

   //Leer los errores de express
   const erroresExpress = req.validationErrors();

//    console.log(erroresExpress);

   try {
        await Usuarios.create(usuario);

        //Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmacion
        await enviarEmail({
            usuario,
            url,
            subject : 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });
    
       //TODO : Flash Message y redireccionar a login
    //    console.log('Usuario Creado',usuarioCreado);
        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
       
   } catch (error) {
       //extraer el message de los errores
       const erroresSequelize = error.errors.map(err => err.message);
    //    console.log(erroresSequelize);
    
        //extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(err => err.msg);
        // console.log(errExp);

        //unirlos
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
   }
};

//Confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

    // console.log(req.params.correo);
    // console.log(usuario);

    //sino existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //si existe, confirmar suscripcion y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado correctamente, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');

}

//Formulario de iniciar sesion
exports.formIniciarSesion = (req, res) => { 
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    });
};

//Muestra el formulario para editar el perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    });
};

//Almacena en la bd los cambios al perfil
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    //leer datos del form
    const { nombre, descripcion, email } = req.body;

    //asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //guardar en la bd
    await usuario.save();
    req.flash('exito', 'Perfil actualizado correctamente');
    res.redirect('/administracion');

};

//Miestr el formulario para cambiar el password

exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
};

//Revisa si el password anterior es correcto y lo modifica por uno nuevo

exports.cambiarPassword = async (req, res, next) => { 
    const usuario = await Usuarios.findByPk(req.user.id);

    //verificar que el password anterior sea correcto
   if (!usuario.validarPassword(req.body.anterior)) {
       req.flash('error', 'El password actual no es correcto');
       res.redirect('/administracion');
       return next();
   }   

    //si el password es correcto, hashear el nuevo password
   const hash = usuario.hashPassword(req.body.nuevo);
//    console.log(hash);

    //asignar el password al usuario
   usuario.password = hash;

    //guardar en la bd el nuevo password
    await usuario.save();

    //redireccionar
    req.logout();
    req.flash('exito', 'Password actualizado correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
};

//Muestra el formulario para subir una imagen de perfil
exports.formSubirImagenPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen Perfil',
        usuario
    });

};

//Guarda la imagen nueva, elimina la anteriro (si aplica) y guarda el registro en la bd
exports.guardarImagenPerfil = async (req, res) => { 
    const usuario = await Usuarios.findByPk(req.user.id);

    //si hay imagen anteriro, eliminarla
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
    
        //borrar la imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);                
            }
            return;
        });
    }

    //almacenar la nueva imagen
    if (req.file) {
        usuario.imagen = req.file.filename;
    }    

    //guardar en la bd y redireccionar
    await usuario.save();
    req.flash('exito', 'Imagen de perfil actualizada correctamente');
    res.redirect('/administracion');

}
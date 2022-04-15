const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', { 
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash : true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

//revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => { 
    //si el usuario esta autenticado, pasa al siguiente middleware
    if(req.isAuthenticated()) {
        return next();
    }
    //si no esta autenticado, redirecciona al formulario de inicio de sesion
    return res.redirect('/iniciar-sesion');
};

//Cerrar sesión
exports.cerrarSesion = (req, res, next) => { 
    req.logout();
    req.flash('correcto', 'Sesión cerrada correctamente');
    res.redirect('/iniciar-sesion');
    next();

};
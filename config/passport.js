const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, next) => {
        //codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({ where: { email : email, activo : 1 } });

        //revisar si existe o no el usuario
        if (!usuario) return next(null, false, { 
            message: 'El usuario no existe' 
        });
        //El usuario existe, comparar su password
        const verificarPass = await usuario.validarPassword(password);
        //Si el password es incorrecto
        if(!verificarPass) return next(null, false, { 
            message: 'El password es incorrecto' 
        });
        //Si el password es correcto
        return next(null, usuario);
    }
        
)); 

passport.serializeUser((usuario, cb) => {
    cb(null, usuario);
});
passport.deserializeUser((usuario, cb) => {
    cb(null, usuario);
});

module.exports = passport;
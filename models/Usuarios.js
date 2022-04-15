const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    nombre: Sequelize.STRING(60),
    imagen : Sequelize.STRING(60),
    descripcion: Sequelize.TEXT,       
    email : {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate : { 
            isEmail: { msg: 'Agrega un correo valido' }
        },
        unique: {
            args: true,
            msg: 'El correo ya esta registrado'
        }
    },     
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La contraseña no puede estar vacia' }
        }
    },
    activo : {
        type: Sequelize.INTEGER(),
        defaultValue: 0
    },
    tokenPassword : Sequelize.STRING,
    expiraToken : Sequelize.DATE    

},{
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

//metodo para comparar contraseñas
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = Usuarios;

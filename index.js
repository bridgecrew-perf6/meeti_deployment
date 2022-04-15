const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');	
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const router = require('./routes');


//Configuracion y Modelos BD
const db = require('./config/db');
    require('./models/Usuarios');
    require('./models/Categorias');
    require('./models/Comentarios');
    require('./models/Grupos');
    require('./models/Meeti');
    db.sync().then(() => console.log('DB is connected')).catch(error => console.log(error));

//Variables de Desarrollo    
require('dotenv').config({path: 'variables.env'});

//Aplicacion Principal
const app = express();

//Body Parser,, leer formularios
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true})); 

//Express validator (validación con bastantes funciones)
app.use(expressValidator());

//Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Ubicacion de las vistas
app.set('views', path.join(__dirname, './views'));

//archivos estaticos
app.use(express.static('public'));

//habilitar cookie parser
app.use(cookieParser());

//crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: true,
    saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash messages
app.use(flash());

//Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//Routing
app.use('/', router());

//Leer el host y el puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

//Agrega Puerto
app.listen(port, host, () => { 
    console.log(`Server is running on port ${port}`)
});    
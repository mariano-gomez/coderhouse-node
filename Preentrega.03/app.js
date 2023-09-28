const { Command } = require('commander');
const dotenv = require('dotenv');
const path = require('path');

const program = new Command();

const _dotenv = loadDotEnvVariables();

const express = require('express');
const http = require('http');
const handlebars = require('express-handlebars');
const { Server, Socket } = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const dependencyContainer = require('./dependency.injection');
const bindPassportStrategies = require('./config/passport.init.config');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
dependencyContainer.set('app', app);

//  setting the `handlebars` template engine
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

//  eventually, i'll need to emit events from different places, so i need a unique place where i can fetch socket.io
dependencyContainer.set('io', io);
dependencyContainer.set('mongoConnectionString', _dotenv.MONGO_URL);

//  Some global configs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname + '/public')));
app.use(cookieParser());

//  This variable is meant to be useful if/when I implement jwt as an option. At that point, it will be included in the .env file, for now, it is hardcoded
const SESSIONLESS = false;

//  This will eventually be used with socket.io
let sessionMiddleware;

if (!SESSIONLESS) {
    sessionMiddleware = session({
        secret: 'app.secret',
        resave: true,
        saveUninitialized: true,

        store: MongoStore.create({
            mongoUrl: _dotenv.MONGO_URL,
            ttl: 60 * 60 //  in secs. After this time, the session gets removed from the DB (if the user interacts in any way, the date gets updated)
        })
    });
    app.use(sessionMiddleware);
    io.engine.use(sessionMiddleware);
}

//  assemble passport strategies to the app
bindPassportStrategies();

//  boilerplate passport initialization
app.use(passport.initialize());

if (!SESSIONLESS) {
    app.use(passport.session());
}

const socketManagerFunction = require('./websockets');

async function startServer() {
    await mongoose.connect(_dotenv.MONGO_URL);
    console.log('DB CONNECTED');

//  setting the routes
    const { apiRoutes, standardRoutes, authRoutes } = require('./routes');
    app.use('/api', apiRoutes);

//  To send an error response for any URL not supported
    app.use('/', authRoutes);
    app.use('/', standardRoutes);

    //  enabling websockets activity
    io.on(
        'connection', socketManagerFunction
    );

    server.listen(port = _dotenv.PORT, () => {
        console.log(`Express Server listening at http://localhost:${port}`);
    });
}

//  This function is meant to load all the variables from a `.env.<environment>`, using `dotenv` and `commander` packages
//  later, we'll import these variables from `/config/config.js`, even though we could do it directly through env.process.<variableName>
function loadDotEnvVariables() {

    program.option('-e, --env <env>', 'Entorno de ejecucion', 'development');
    program.requiredOption('--persist <persistence>', 'Tipo de persistencia (`mongo` o `file`)');
    program.parse();

//  I'm taking the `env` attribute from the object retuned by `program.opts()`
    const { env, persist } = program.opts();

//  This tells express to load the variables we defined on the `.env` file
    dotenv.config({
        path: path.join(__dirname, env === 'development' ? '.env.development' : '.env.production')
    });

//  I could use `process.env.<variableName> directly, but the requirements says I need to create a `config.js` file, so i did it according to what we did in the course
    const _dotenv = require('./config/config');

    //  Not the most orthodox way to do it, but I couldn't find a way to set a new attribute on `process.env` using a console option
    _dotenv.PERSISTENCE = persist;

    console.log(`Running on ${env} environment`);

    return _dotenv;
}

startServer();

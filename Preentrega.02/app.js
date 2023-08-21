const express = require('express');
const http = require('http');
const path = require('path');
const handlebars = require('express-handlebars');
const { Server, Socket } = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const attachUserToRequestMiddleware = require('./middlewares/attach.user.to.request.middleware');
const attachCartToRequestMiddleware = require('./middlewares/attach.cart.to.request.middleware');

//  TODO: temporal, until we add user management
const userModel = require('./dao/models/user.model');
const dependencyContainer = require('./dependency.injection');
const mongoConnectionString = 'mongodb+srv://coderhose_app:OUQoVf5WZ54IoRKL@cluster0.u8oklk1.mongodb.net/desarrollo_ecommerce?retryWrites=true&w=majority';

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
dependencyContainer.set('mongoConnectionString', mongoConnectionString);

//  Some global configs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname + '/public')));
app.use(cookieParser());
app.use(session({
    secret: 'app.secret',
    resave: true,
    saveUninitialized: true,

    store: MongoStore.create({
        mongoUrl: mongoConnectionString,
        ttl: 60 * 60 //  in secs. After this time, the session gets removed from the DB (if the user interacts in any way, the date gets updated)
    })
}));

const socketManagerFunction = require('./websockets');
const {apiRoutes, standardRoutes} = require("./routes");
const productModel = require("./dao/models/product.model");

async function startServer() {
    await mongoose.connect(mongoConnectionString);
    console.log('DB CONNECTED');

    //  once i connect to the DB, i fetch a user
    //  Until we start working with users, we temporarily hardcode a mockup user
    app.use(attachUserToRequestMiddleware);

    //  This middleware is made to have the logged user's cart in the request (just the id, not the whole cart)
    app.use(attachCartToRequestMiddleware);

//  setting the routes
    const { apiRoutes, standardRoutes } = require('./routes');
    app.use('/api', apiRoutes);

//  To send an error response for any URL not supported
    app.use('/', standardRoutes);

    //  enabling websockets activity
    io.on(
        'connection', socketManagerFunction
    );

    const port = 8080;

    server.listen(port, () => {
        console.log(`Express Server listening at http://localhost:${port}`);
    });
}

startServer();

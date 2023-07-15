const express = require('express');
const http = require('http');
const path = require('path');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//  setting the `handlebars` template engine
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

//  Some global configs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname + '/public')))

//  setting the routes
const { apiRoutes, standardRoutes } = require('./routes');
app.use('/api', apiRoutes);

//  To send an error response for any URL not supported
app.use('*', standardRoutes);

const port = 8080;

server.listen(port, () => {
    console.log(`Express Server listening at http://localhost:${port}`);
});

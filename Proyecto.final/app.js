const express = require('express');

const app = express();
const { apiRoutes, otherRoutes } = require('./routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', apiRoutes);

//  To send an error response for any URL not supported
app.use('*', otherRoutes);

const port = 8080;

app.listen(port, () => {
    console.log(`Express Server listening at http://localhost:${port}`);
});

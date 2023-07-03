const express = require('express');
const ProductManager = require('./ProductManager');

const app = express();
const productManager = new ProductManager();

app.use(express.urlencoded({ extended: true }));

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const producto = await productManager.getProductById(parseInt(id));
    if (producto) {
        res.send(producto);
    } else {
        res.send({"Error": "El producto solicitado no existe"});
    }
});

app.get('/products', async (req, res) => {
    const { limit } = req.query;
    const productos = await productManager.getProducts();

    //  si se ingresa un limite menor a cero puede romper el server
    if (limit > 0 && limit < productos.length) {
        const sublistadoProductos = productos.slice(0, limit);
        res.send(sublistadoProductos);
    } else {
        res.send(productos);
    }
});

//  Para cualquier otra ruta no existente
app.get('*', (req, res) => {
    res.statusCode = 404;
    console.log('Se ha intentado acceder a una ruta inexistente');
    res.send({"Error": "Esa URL no existe"});
});

const port = 8080;

app.listen(port, () => {
    console.log(`Express Server listening at http://localhost:${port}`);
});
const ProductManager = require('..//managers/ProductManager.js')
const productManager = new ProductManager('productos.json')

function socketManagerFunction(socket) {
    socket.on('handshake', (arg1, callback) => {
        console.log('cliente conectado.', 'socket id: ', socket.id);
        callback({
            status: "ok"
        });
    });

    socket.on('products.list.request', async () => {
        const products = await productManager.getAll();

        socket.emit('products.list.updated', products);
    });

    socket.on('product.create', async (product) => {
        await productManager.create(product);
        const products = await productManager.getAll();

        socket.emit('products.list.updated', products);
    });

    socket.on('product.delete', async (productId) => {
        await productManager.delete(productId);
        const products = await productManager.getAll();

        socket.emit('products.list.updated', products);
    });
}

module.exports = socketManagerFunction;
const ProductManager = require('../managers/ProductManager.js')
const productManager = new ProductManager('products.json')

function socketManagerFunction(socket) {
    socket.on('handshake', (arg1, callback) => {
        console.log('cliente conectado.', 'socket id: ', socket.id);
        callback({
            status: "ok"
        });
    });

    socket.on('product.create', async (product) => {
        await productManager.create(product);
    });

    socket.on('products.list.request', async () => {
        const products = await productManager.getAll();

        //  the list wasn't strictly updated, but I can use the same
        //  event for when the products list is updated, in the future
        socket.emit('products.list.updated', products);
        // socket.emit('products.list.updated', products);
    });

    socket.on('product.delete.request', async (productId) => {
        let errorMessage = '';
        if (!await productManager.getById(productId)) {
            socket.emit('products.delete.error', errorMessage);
        }

        await productManager.delete(productId);

        //  I don't emit anything here, because the emit part is already done within the delete() method
    });
}

module.exports = socketManagerFunction;
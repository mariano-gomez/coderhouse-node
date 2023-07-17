const ProductManager = require('..//managers/ProductManager.js')
const productManager = new ProductManager('products.json')

function socketManagerFunction(socket) {
    socket.on('products.list.request', async () => {
        const products = await productManager.getAll();

        //  the list wasn't strictly updated, but I can use the same
        //  event for when the products list is updated, in the future
        socket.emit('products.list.updated', products);
        // socket.emit('products.list.updated', products);
    });
}

module.exports = socketManagerFunction;
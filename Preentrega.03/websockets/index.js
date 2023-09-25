const factory = require("../dao/factory.dao");
const productManager = factory.getInstance('product');
const chatMessageManager = require('../dao/db/chat.message.manager');

const socketProductValidator = require('../middlewares/socket.middleware/socket.product.validator.middleware');

async function socketManagerFunction(socket) {
    socket.on('handshake', (arg1, callback) => {
        console.log('cliente conectado.', 'socket id: ', socket.id);
        callback({
            status: "ok"
        });
    });

    //  chat related events
    console.log(`user has connected: ${socket.id}`);

    //  Product related events
    socket.on('product.create', async (product) => {
        const error = socketProductValidator(product);
        if (!error) {
            await productManager.create(product);
        } else {
            socket.emit('product.create.error', error);
        }
    });

    socket.on('products.list.request', async () => {
        const products = await productManager.getAll();

        //  the list wasn't strictly updated, but I can use the same
        //  event for when the products list is updated, in the future
        socket.emit('products.list.updated', products);
    });

    socket.on('product.delete.request', async (productId) => {
        let errorMessage = '';
        if (!await productManager.getById(productId)) {
            socket.emit('products.delete.error', errorMessage);
        }

        await productManager.delete(productId);

        //  I don't emit anything here, because the emit part is already done within the delete() method
    });

    socket.on('chat-message', async (msg) => {
        await chatMessageManager.create(msg);
        socket.broadcast.emit('chat-message', msg);
    });

    // socket.on('user', ({ user, action }) => {
    //     userOnline[socket.id] = user;
    //     socket.broadcast.emit('user', { user, action });
    //  interactuar con el modelo de usuario
    // });
    //
    // socket.on('disconnect', () => {
    //     socket.broadcast.emit('user', {
    //         user: userOnline[socket.id],
    //         action: false
    //     });
    //
    //     delete userOnline[socket.id];
    // });


    //  TODO: should i add this?
    // socket.on('addToCart', async ({ userId, productId }) => {
    //   await cartManager.addProduct(userId, productId)
    //   const products = await cartManager.getProductsByUserId(userId)
    //  interactuar con el modelo de carrito

    //   socket.emit('productsInCart', products)
    // })
    // socket.join('room1')
    // socket.to('room1').emit('msg')

    const messages = await chatMessageManager.getAll();
    socket.emit('chat-messages', messages);
}

module.exports = socketManagerFunction;
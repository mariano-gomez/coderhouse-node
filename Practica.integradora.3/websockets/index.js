const factory = require("../dao/factory.dao");
const productManager = factory.getInstance('product');
const userManager = factory.getInstance('user');
const chatMessageManager = factory.getInstance('chat.message');

const dependencyContainer = require("../dependency.injection");
const logger = dependencyContainer.get('logger');

const socketProductValidator = require('../middlewares/socket.middleware/socket.product.validator.middleware');

async function getUser(socket) {
    const session = socket.request.session;
    if (session?.passport?.user) {
        const user = await userManager.getById(session.passport.user);
        return user;
    }
    return null;
}

function isRoleAllowed(action, role) {
    switch (action) {
        case 'product.create':
        case 'product.delete':
            return ['admin', 'premium'].includes(role);
        case 'chat-message':
            return ['user', 'premium'].includes(role);
        default:
            return false
    }
}

async function socketManagerFunction(socket) {
    socket.on('handshake', (arg1, callback) => {
        logger.info('cliente conectado.', 'socket id: ', socket.id);
        callback({
            status: "ok"
        });
    });

    //  chat related events
    logger.info(`user has connected: ${socket.id}`);

    //  Product related events
    socket.on('product.create', async (product) => {
        const user = await getUser(socket);
        if (isRoleAllowed('product.create', user?.role)) {
            socket.emit('products.create.error', `Solo los administradores pueden crear productos`);
            return;
        }

        product.owner = user?.email || 'admin';
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
        const user = await getUser(socket);
        const product = await productManager.getById(productId);

        if (!product) {
            socket.emit('products.delete.error', `El producto no existe`);
            return;
        }

        if (isRoleAllowed('product.delete', user?.role)) {
            if (user.role == 'premium' && product.owner != user.email) {
                socket.emit('products.delete.error', `Sólo puede borrar sus propios productos`);
                return;
            }
            socket.emit('products.delete.error', `Solo los administradores pueden borrar productos`);
            return;
        }

        await productManager.delete(productId);
        //  I don't emit anything here, because the emit part is already done within the delete() method
    });

    socket.on('chat-message', async (msg) => {
        const user = await getUser(socket);

        if (isRoleAllowed('chat-message', user?.role)) {
            await chatMessageManager.create(msg);
            socket.emit('chat-message', msg);
            socket.broadcast.emit('chat-message', msg);
        } else {
            socket.emit('chat-message.error', {
                user:`ERROR`,
                text: `Debe tener rol de 'user' para poder enviar mensajes`,
                datetime: msg.datetime
            });
        }
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
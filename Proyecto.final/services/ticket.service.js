const factoryDAO = require('../dao/factory.dao');
const cartManager = factoryDAO.getInstance('cart');
const productManager = factoryDAO.getInstance('product');
const userManager = factoryDAO.getInstance('user');
const ticketManager = factoryDAO.getInstance('ticket');

const dependencyContainer = require("../dependency.injection");
const logger = dependencyContainer.get('logger');

const finishPurchase = async (cart) => {
    const user = await userManager.getById(cart.user._id);

    const ticketData = {
        user: user._id,
        code: await generateTicketCode(),
        amount: 0,
        products: [],
        purchaser: user.email,
        status: 'pending'
    };

    const unavailableProducts = [];

    try {
        for (let cartProduct of cart.products) {
            //  I get the product from the catalog
            const catalogProduct = await productManager.getById(cartProduct.product._id);
            if (cartProduct.quantity <= catalogProduct.stock) {

                //  I update the stock for such product
                await productManager.update(cartProduct.product._id, { stock: catalogProduct.stock - cartProduct.quantity });

                //  Then, I remove the product from the car
                await cartManager.deleteProduct(cart._id, cartProduct.product._id);
                ticketData.products.push({
                    id: cartProduct.product._id,
                    title: cartProduct.product.title,
                    quantity: cartProduct.quantity,
                    unit_price: catalogProduct.price,
                    subtotal: (catalogProduct.price * cartProduct.quantity).toFixed(2) * 1  //  because `toFixed()` transforms it into string
                });
                ticketData.amount = (ticketData.amount + catalogProduct.price * cartProduct.quantity).toFixed(2) * 1;  //  because `toFixed()` transforms it into string
            } else {
                unavailableProducts.push({
                    id: cartProduct.product._id,
                    title: cartProduct.product.title,
                    in_cart: cartProduct.quantity,
                    in_stock: cartProduct.product.stock
                })
            }
        }

        const response = { ticket:null, unavailable: unavailableProducts };
        if (ticketData.products.length) {
            response.ticket = await ticketManager.create(ticketData);
        }
        return response;
    } catch (e) {
        logger.error(e.message);
        logger.error('partial creation of ticket, for cart ', cart._id.toString());
        return null;
    }
}

const generateTicketCode = async () => {
    const lastTicket = await ticketManager.getLastTicket();
    if (!lastTicket) {
        return 1;
    }
    return lastTicket.code + 1;
}

module.exports = {
    finishPurchase
};
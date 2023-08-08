const cartModel = require('./../models/cart.model')

class CartManager {

    async getById(cartId) {
        const result = await cartModel.find({ _id: cartId }).lean();
        return result[0];
    }

    async create(userId) {
        const existingCart = await cartModel.findOne({ user: userId });
        if (existingCart) {
            return existingCart;
        }

        return await cartModel.create({
            user: userId,
            products: []    //  this array will contain objects with the form { productId, quantity }
        });
    }

    async addProduct(cartId, productId) {
        const cart = await cartModel.findOne({ _id: cartId });

        if (cart === null) {
            return null;
        }
        const existingProduct = cart.products.find(p => {
            return p.product == productId
        });

        if (existingProduct === undefined) {
            cart.products.push({
              product: productId,
                quantity: 1
            });
        } else {
            existingProduct.quantity++;
        }

        await cart.save();
        return cart;
    }
}

module.exports = new CartManager();
const cartModel = require('./../models/cart.model')

class CartManager {

    //  TODO: test it
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

    //  TODO: implement with mongoose
    async addProduct(cartId, productId) {
        const cart = await cartModel.findOne({ _id: cartId });

        if (cart === null) {
            return null;
        }
        const existingProduct = cart.products.find(p => {
            return p.product == productId
        });

        if (existingProduct === undefined) {

            await cartModel.updateOne(
                { _id: cartId }, // Filter to find the document
                {
                    $push: { 'products': { product: productId, quantity: 1 } }
                }
            );

        } else {

            await cartModel.updateOne(
                { _id: cartId, 'products.product': productId }, // Filter to find the document
                {
                    $inc: { 'products.$.quantity': 1 }
                }
            );
        }

        const updatedCart = await cartModel.findOne({ _id: cartId });
        return updatedCart;
    }
}

module.exports = new CartManager();
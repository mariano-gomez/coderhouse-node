const cartModel = require('./../models/cart.model')
const { Types } = require("mongoose");

class CartManager {

    getById(cartId) {
        return cartModel.findOne({_id: new Types.ObjectId(cartId)}).lean();
    }

    async create(userId) {
        const existingCart = await cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (existingCart) {
            return existingCart;
        }

        return await cartModel.create({
            user: new Types.ObjectId(userId),
            products: []    //  this array will contain objects with the form { productId, quantity }
        });
    }

    async addProduct(cartId, productId) {
        const cart = await cartModel.findOne({ _id: cartId });

        if (cart === null) {
            return null;
        }
        const existingProduct = cart.products.find(p => {
            return p.product.id == new Types.ObjectId(productId)
        });

        if (existingProduct === undefined) {
            cart.products.push({
              product: new Types.ObjectId(productId),
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
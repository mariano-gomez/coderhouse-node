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

        //  if i return the cart as it is, the new product will not be populated
        return cartModel.findOne({ _id: cartId });
    }

    async deleteProduct(cartId, productId) {
        const result = await cartModel.updateOne(
            { _id: cartId },
            { $pull: { products: { product: new Types.ObjectId(productId) } } },
        );
        return result;
    }

    async clearCart(cartId) {
        const cart = await cartModel.findOne({ _id: cartId });
        if (cart) {
            cart.products = [];
            await cart.save();
        }

        return cart;
    }

    async setProductQuantity(cartId, productId, quantity) {
        const cart = await cartModel.findOne({ _id: cartId });

        const product = cart.products.find((mongoProduct) => {
            return mongoProduct.product.id == productId;
        });

        if (!product) {
            throw new Error('the product is not present in the cart');
        }
        product.quantity = quantity;

        await cart.save();
        return cart;
    }

    async updateCartWithProducts(cartId, products) {
        const cart = await cartModel.findOne({ _id: cartId });
        if (!cart) {
            throw new Error(`the specified cart does not exist`)
        }

        cart.products = [];

        for (const product of products) {
            const { product: productId, quantity } = product;
            cart.products.push({
                product: new Types.ObjectId(productId),
                quantity
            });
        }

        await cart.save();
        //  i fetch the product again, so the products array is populated with the schema specification
        return cartModel.findOne({ _id: cartId });
    }

    async getByUser(userId) {
        return cartModel.findOne({user: new Types.ObjectId(userId)}).lean();
    }
}

module.exports = new CartManager();
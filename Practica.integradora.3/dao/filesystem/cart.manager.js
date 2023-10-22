const fs = require('fs/promises');
const path = require('path');
const factoryDAO = require('../../dao/factory.dao');
const productManager = factoryDAO.getInstance('product');
const CustomError = require('../../utils/custom.error.utils');

class CartManager {

    #carts;
    #itemsFile;

    constructor(filename) {
        this.#itemsFile = path.join(
            __dirname,
            '../../data',
            filename
        );
        this.#carts = [];
    }

    /**
     * It returns an array with all the carts stored in the file linked to the class
     */
    async #readFile() {
        const rawData = await fs.readFile(this.#itemsFile, 'utf-8');
        this.#carts = JSON.parse(rawData);
    }

    /**
     *
     * @param carts | must be an array
     * @returns {Promise<void>}
     */
    async #saveFile() {
        await fs.writeFile(this.#itemsFile, JSON.stringify(this.#carts, null, 2));
    }

    async getById(cartId) {
        await this.#readFile();
        const cart = this.#carts.find((obj) => {
            return obj.id == cartId;
        });
        if (!cart) {
            return null;
        }
        return cart;
    }

    async create(userId) {
        await this.#readFile();

        const id = (this.#carts[this.#carts.length - 1]?.id || 0) + 1;

        const newCart = {
            id,
            _id: id,
            user: userId,
            products: []    //  this array will contain objects with the form { productId, quantity }
        };

        this.#carts.push(newCart);

        await this.#saveFile();

        return newCart;
    }

    async addProduct(cartId, productId) {
        const cart = await this.getById(cartId);

        //  if the cart doesn't exists, it returns null
        if (cart === null) {
            return null;
        }

        const existingProduct = cart.products.find(p => p.product._id == productId);

        if (existingProduct === undefined) {
            const product = await productManager.getById(productId);
            product._id = product.id;
            cart.products.push({
                product,
                quantity: 1
            });
        } else {
            existingProduct.quantity += 1;
        }

        await this.#saveFile();
        return cart;
    }

    async clearCart(cartId) {
        const cart = await this.getById(cartId);
        if (cart) {
            cart.products = [];
        }
        await this.#saveFile();

        return cart;
    }

    async deleteProduct(cartId, productId) {
        //  I set this object to respect the format already implemented by the controller while we were using mongoDB manager
        const result = {
            modifiedCount: 0,
        }
        const cart = await this.getById(cartId);

        if (cart == null) {
            return result;
        }

        const productsInCart = cart.products.length;

        cart.products = cart.products.filter(prod => prod.product._id != productId);

        //  if the product was present, the lengths will be different by 1. Otherwise, it will return 0
        result.modifiedCount = productsInCart - cart.products.length;

        this.#saveFile();
        return result;
    }

    async getByUser(userId) {
        await this.#readFile();
        const cart = this.#carts.find((cart) => {
            return cart.user == userId;
        });
        if (!cart) {
            return null;
        }
        return cart;
    }

    async delete(id) {
        await this.#readFile();

        this.#carts = this.#carts.filter(cart => cart.id != id);

        await this.#saveFile();
    }

    async setProductQuantity(cartId, productId, quantity) {
        const cart = await this.getById(cartId);

        const product = cart.products.find((product) => {
            return product.product.id == productId;
        });

        if (!product) {
            throw new CustomError('the product is not present in the cart', CustomError.ERROR_TYPES.DATABASE_ERROR, 500);
        }
        product.quantity = quantity;

        await this.#saveFile();
        return cart;
    }

    async updateCartWithProducts(cartId, products) {

        const cart = await this.getById(cartId);
        if (!cart) {
            throw new CustomError('the specified cart does not exist', CustomError.ERROR_TYPES.DATABASE_ERROR, 500);
        }

        cart.products = [];

        for (const product of products) {
            const { product: { _id: productId }, quantity } = product;
            cart.products.push({
                product: productId,
                quantity
            });
        }

        await this.#saveFile();

        return cart;
    }
}

module.exports = new CartManager('carts.json');
const fs = require('fs/promises');
const path = require('path');

class CartManager {

    #carts;
    #itemsFile;

    constructor(filename) {
        this.#itemsFile = path.join(
            __dirname,
            '../data',
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

    async create() {
        await this.#readFile();

        const id = (this.#carts[this.#carts.length - 1]?.id || 0) + 1;

        const newCart = {
            id,
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

        const existingProduct = cart.products.find(p => p.productId == productId);

        if (existingProduct === undefined) {
            cart.products.push({
                productId,
                quantity: 1
            });
        } else {
            existingProduct.quantity += 1;
        }

        await this.#saveFile();
        return cart;
    }

    async update(id, newProductData) {
        const oldProduct = await this.getById(id);

        //  If the old product doesn't exists, I let the caller to know it doesn't exists, by returning a null value
        if (!oldProduct) {
            return null;
        }

        const productProperties = Object.getOwnPropertyNames(oldProduct);
        for (const field of productProperties) {
            if (newProductData[field] !== undefined) {
                oldProduct[field] = newProductData[field];
            }
        }

        await this.#saveFile();
        return oldProduct;
    }
}

module.exports = CartManager;
const fs = require('fs/promises');
const path = require('path');
const SocketManager = require('./SocketManager');

class ProductManager {

    #products;
    #itemsFile;

    constructor(filename) {
        this.#itemsFile = path.join(
            __dirname,
            '../data',
            filename
        );
        this.#products = [];
    }

    /**
     * Retorna un array con los productos almacenados en el archivo vinculado a la clase
     */
    async #readFile() {
        const rawData = await fs.readFile(this.#itemsFile, 'utf-8');
        this.#products = JSON.parse(rawData);
    }

    async #saveFile() {
        await fs.writeFile(this.#itemsFile, JSON.stringify(this.#products, null, 2));
    }

    async create(product) {
        await this.#readFile();

        const id = (this.#products[this.#products.length - 1]?.id || 0) + 1;

        const newProduct = {
            ...product,
            id
        };

        this.#products.push(newProduct);

        await this.#saveFile();

        const socket = SocketManager.getInstance();
        if (socket) {
            socket.emit('products.list.updated', this.#products);
        }

        return newProduct;
    }

    async getAll() {
        await this.#readFile();
        return this.#products;
    }

    async getById(productId) {
        await this.#readFile();
        const product = this.#products.find((obj) => {
            return obj.id == productId;
        });
        return product;
    }

    async #getByCode(code) {
        await this.#readFile();

        const product = this.#products.find((obj) => {
            return obj.code == code;
        });
        return product;

        await this.#saveFile();
    }

    async delete(id) {
        await this.#readFile();

        this.#products = this.#products.filter(p => p.id != id);

        await this.#saveFile();

        const socket = SocketManager.getInstance();
        if (socket) {
            socket.emit('products.list.updated', this.#products);
        }
    }

    async update(id, newProductData) {
        if (newProductData.code) {
            const existingProduct = await this.#getByCode(newProductData.code);
            //  If a product already exists with that code, and the product id that holds it is different than the id
            //  the user sent, (meaning, is not the same product), then it should throw an error
            if (existingProduct && existingProduct.id != id) {
                throw new Error('The product code already exists');
            }
        }

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

    validarInputs(title, description, price, thumbnail, code, stock) {
        const errors = [];
        if (title.length < 1) {
            throw new Error('Title debe contener al menos un caracter');
        }
        if (description.length < 1) {
            throw new Error('Description debe contener al menos un caracter');
        }
        if (price <= 0) {
            throw new Error('Price debe contener un valor mayor a cero');
        }
        if (thumbnail.length < 1) {
            throw new Error('Thumbnail debe contener al menos un caracter');
        }
        if (code.length < 1) {
            throw new Error('Code debe contener al menos un caracter');
        }
        if (stock <= 0) {
            throw new Error('Stock debe contener un valor mayor a cero');
        }
    }
}

module.exports = ProductManager;
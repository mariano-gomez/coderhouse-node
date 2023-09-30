const fs = require('fs/promises');
const path = require('path');
const dependencyContainer = require('../../dependency.injection');

class ProductManager {

    #products;
    #itemsFile;

    constructor(filename) {
        this.#itemsFile = path.join(
            __dirname,
            '../../data',
            filename
        );
        this.#products = [];
    }

    /**
     * It returns an array with all the products stored in the file linked to the class
     */
    async #readFile() {
        const rawData = await fs.readFile(this.#itemsFile, 'utf-8');
        this.#products = JSON.parse(rawData);
    }

    /**
     *
     * @param products | must be an array
     * @returns {Promise<void>}
     */
    async #saveFile() {
        await fs.writeFile(this.#itemsFile, JSON.stringify(this.#products, null, 2));
    }

    async create(product) {
        await this.#readFile();

        const existingProduct = await this.#getByCode(product.code);

        if (existingProduct) {
            throw new Error('The product code already exists');
        }

        const id = (this.#products[this.#products.length - 1]?.id || 0) + 1;

        const newProduct = {
            ...product,
            id
        };

        this.#products.push(newProduct);

        await this.#saveFile();

        await this.#updateWebsocket();

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

        await this.#updateWebsocket();
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

        await this.#updateWebsocket();

        return {
            product: oldProduct,
            modifiedCount: 1
        };
    }

    async #updateWebsocket() {
        const io = dependencyContainer.get('io');
        io.sockets.emit('products.list.updated', await this.getAll());
    }

    async getPaginated(queryObject, pageSize, page, sort) {
        await this.#readFile();

        let filteredItems = this.#products;
        let totalItems;
        if (queryObject) {
            //  TODO: filter products according to queryObject elements
        }
        totalItems = filteredItems.length;

        if (['-1', 'desc', 'DESC'].indexOf(sort) >= 0) {
            filteredItems.sort(function compare(itemA, itemB) {
                return itemB.id - itemA.id;
            });
        }

        const docs = filteredItems.slice((page - 1) * pageSize, page * pageSize - 1);
        const totalPages = Math.ceil(totalItems / pageSize);
        const prevPage = page > 1 ? (page - 1) : null;
        const nextPage = page < totalPages ? (page + 1) : null;

        const response = {
            docs,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
        };
        return response;
    }
}

module.exports = new ProductManager('products.json');
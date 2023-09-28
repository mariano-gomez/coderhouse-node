const productModel = require('./../models/product.model')
const dependencyContainer = require('../../dependency.injection');
const { Types } = require("mongoose");

class ProductManager {

    async create(product) {
        if (product.code) {
            const existingProduct = await this.#getByCode(product.code);
            if (existingProduct) {
                throw new Error('The product code already exists');
            }
        }

        const newProduct = await productModel.create(product);

        await this.#updateWebsocket();

        return newProduct;
    }

    async getAll() {
        return await productModel.find().lean();
    }

    async getPaginated(queryObject, pageSize, page, sort) {
        queryObject = queryObject || '{}';
        try {
            //  just to check if `queryObject` is a valid JSON
            queryObject = JSON.parse(queryObject);
        } catch (e) {
            throw new Error('query is malformed. Please send a syntactically correct JSON');
            return;
        }

        let options = {
            limit: pageSize,
            page: page,
            lean: true,
        };

        if (sort) {
            options.sort = { price: sort };
        }
        return await productModel.paginate(queryObject, options);
    }

    async getById(productId) {
        return await productModel.findOne({_id: new Types.ObjectId(productId)}).lean();
    }

    async #getByCode(code) {
        const result = await productModel.find({ code: code });
        return result[0];
    }

    async delete(id) {
        const result = await productModel.deleteOne({ _id: id });

        await this.#updateWebsocket();

        return result;
    }

    /**
     * result is an object with the following structure:
     * {
     *      acknowledged: true,
     *      modifiedCount: 1,
     *      upsertedId: null,
     *      upsertedCount: 0,
     *      matchedCount: 1
     * }
     * @param id
     * @param newProductData
     */
    async update(id, newProductData) {

        if (newProductData.code) {
            const existingProduct = await this.#getByCode(newProductData.code);
            //  If a product already exists with that code, and the product id that holds it is different than the id
            //  the user sent, (meaning, is not the same product), then it should throw an error
            if (existingProduct && existingProduct.id != id) {
                throw new Error('The product code is already taken');
            }
        }

        const result = await productModel.updateOne(
            { _id: id },
            newProductData
        );

        //  If the product was successfully updated, then i need to update the websocket data
        if (result.matchedCount >= 1) {
            await this.#updateWebsocket();
        }

        return result;
    }

    async #updateWebsocket() {
        const io = dependencyContainer.get('io');
        io.sockets.emit('products.list.updated', await this.getAll());
    }
}

module.exports = new ProductManager();
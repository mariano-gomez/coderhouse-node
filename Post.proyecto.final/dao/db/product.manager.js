const productModel = require('./../models/product.model')
const CustomError = require('../../utils/custom.error.utils');
const dependencyContainer = require('../../dependency.injection');
const { Types } = require("mongoose");
const MailRenderService = require("../../services/mail.render.service");
const logger = require("../../services/logger.service");
const mailSenderService = require("../../services/mail.sender.service");

class ProductManager {

    async create(product) {
        if (product.code) {
            const existingProduct = await this.#getByCode(product.code);
            if (existingProduct) {
                throw new CustomError('The product code already exists', CustomError.ERROR_TYPES.DATABASE_ERROR, 400);
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
            throw new CustomError('query is malformed. Please send a syntactically correct JSON', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
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
        const product = await this.getById(id);
        let result;
        if (product?.owner && product.owner !== 'admin') {
            try {
                const html = MailRenderService.renderProductDeletedNotification(product);
                logger.info(`Notificando eliminacion de producto ${product.code} a owner ${product.owner}`)
                await mailSenderService.send(product.owner, html, 'Producto eliminado de sitio de ecommerce');

                result = await productModel.deleteOne({ _id: id });

                await this.#updateWebsocket();
            } catch (e) {
                throw new CustomError('no se pudo borrar el producto', CustomError.ERROR_TYPES.UNKNOWN_ERROR, 500);
            }
        }

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
                throw new CustomError('The product code is already taken', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
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
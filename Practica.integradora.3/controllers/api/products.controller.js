const factory = require('../../dao/factory.dao');
const CustomError = require('../../utils/custom.error.utils');

const productManager = factory.getInstance('product');

class ProductsApiController {

    static getProduct = async (req, res) => {
        const { pid } = req.params;
        const product = await productManager.getById(pid);
        if (product) {
            res.send(product);
        } else {
            res.sendStatus(404);
        }
    };

    //  it returns a paginated list of products, depending on requests query values
    static getProducts = async (req, res) => {
        const { sort } = req.query;
        let { query, page, limit } = req.query;

        try {
            //  sanitizing page and limit variables
            page = parseInt(page);
            limit = parseInt(limit);
            page = (typeof page == 'number' && !isNaN(page)) ? page : 1;
            limit = (typeof limit == 'number' && !isNaN(limit)) ? limit : 10;

            //  avoid negative/zero numbers
            page = page > 0 ? page : 1
            limit = limit > 0 ? limit : 10;

            const paginatedProductsResponse = await productManager.getPaginated(query, limit, page, sort);
            const hostname = `${req.protocol}://${req.get('host')}/api/products/`;

            res.send({
                'status': 'success',
                'payload': paginatedProductsResponse.docs,
                'totalPages': paginatedProductsResponse.totalPages,
                'prevPage': paginatedProductsResponse.prevPage,
                'nextPage': paginatedProductsResponse.nextPage,
                'page': paginatedProductsResponse.page,
                'hasPrevPage': paginatedProductsResponse.hasPrevPage,
                'hasNextPage': paginatedProductsResponse.hasNextPage,
                'prevLink': ProductsApiController.generateLink('prev', hostname, paginatedProductsResponse, { query, page, limit, sort }),
                'nextLink': ProductsApiController.generateLink('next', hostname, paginatedProductsResponse, { query, page, limit, sort }),
            });

        } catch (e) {
            res.send({
                'status': 'error',
                'message': e.message
            });
        }
    };

    static createProduct = async (req, res, next) => {
        const { body } = req;
        try {
            if (req.user?.email) {
                body.owner = req.user.email;
            }
            const newProduct = await productManager.create(body);
            res.status(201).send(newProduct);
        } catch (e) {
            return next(e);
        }
    };

    static updateProduct = async (req, res) => {
        const { pid } = req.params;
        const { body } = req;

        try {
            const updateResult = await productManager.update(pid, body);
            if (updateResult.modifiedCount >= 1) {
                res.sendStatus(202);
                return;
            }

            res.sendStatus(404);

        } catch (e) {
            return next(e);
        }
    };

    static deleteProduct = async (req, res) => {
        const { pid } = req.params;

        if (!await productManager.getById(pid)) {
            res.sendStatus(404);
            return;
        }

        await productManager.delete(pid);

        res.sendStatus(204);
    };

    /**
     * helper function, to generate the links to next/prev page, based on the url parameters sent in the request
     * @param type | 'next' or 'prev' string
     * @param hostname
     * @param paginatedProductsResponse
     * @param query
     * @param page
     * @param limit
     * @param sort
     * @returns {string|null}
     */
    static generateLink = (type, hostname, paginatedProductsResponse, { query, page, limit, sort }) => {
        if (type != 'next' && type != 'prev') {
            return null;
        }

        if (type == 'next' && !paginatedProductsResponse.hasNextPage) {
            return null;
        }

        if (type == 'prev' && !paginatedProductsResponse.hasPrevPage) {
            return null;
        }

        let queryString = '?';
        if (query) {
            queryString += `query=${query}&`;
        }
        if (limit) {
            queryString += `limit=${limit}&`;
        }
        if (sort) {
            queryString += `sort=${sort}&`;
        }

        if (type == 'next') {
            queryString += `page=${(page + 1)}&`;
        } else {
            queryString += `page=${(page - 1)}&`;
        }

        return hostname + queryString;
    };

}

module.exports = ProductsApiController;
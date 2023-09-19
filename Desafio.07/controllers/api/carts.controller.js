const cartManager = require("../../dao/db/cart.manager");

class CartsApiController {

    //  /api/carts [create a new cart]
    static createNewCart = async (req, res) => {
        try {
            //  req.user is set in a global middleware, until we start managing users/sessions/authentication/etc
            const newCart = await cartManager.create(req.user.id);
            res.status(201).send(newCart);
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  /api/carts/:cid [get a specific cart content]
    static showCart = async (req, res) => {
        const { cid } = req.params;

        const cart = await cartManager.getById(cid);
        if (cart) {
            res.send(cart.products);
        } else {
            res.sendStatus(404);
        }
    };

    //  /api/carts/:cid/product/:pid    [increments a product quantity/add one unit to the cart if it does not exist]
    static incrementProductQuantity = async (req, res) => {
        const { cid, pid } = req.params;
        try {
            const cartUpdated = await cartManager.addProduct(cid, pid);
            if (cartUpdated === null) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send(cartUpdated.products);
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  api/carts/:cid/products/:pid [removes a specific product from a specific cart]
    static removeProductFromCart = async (req, res) => {
        const { cid, pid } = req.params;
        try {
            const result = await cartManager.deleteProduct(cid, pid);
            if (result.modifiedCount > 0) {
                res.sendStatus(204);
            } else {
                res.status(400).send({ "error": "The cart couldn't be modified. Check if the cart id and the product id are both correct" });
            }
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  api/carts/:cid  [it removes all products from the cart]
    static emptyCart = async (req, res) => {
        const { cid } = req.params;
        try {
            const cartUpdated = await cartManager.clearCart(cid);
            if (cartUpdated) {
                res.sendStatus(204);
            } else {
                res.status(400).send({ "error": "The cart couldn't be modified. Check if the cart id is correct" });
            }
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  api/carts/:cid/products/:pid [set the quantity for a specific cart and product]
    static changeProductQuantityOnCart = async (req, res) => {
        const { cid, pid } = req.params;
        const quantity = parseInt(req.body.toString());

        try {
            if (isNaN(quantity)) {
                throw new Error('the data sent in the request must be an integer');
            }
            if (quantity < 1) {
                throw new Error('the value sent must be a positive integer');
            }
            const cartUpdated = await cartManager.setProductQuantity(cid, pid, quantity);
            if (cartUpdated === null) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send(cartUpdated.products);
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  It replaces all the products in the given cart, for the ones specified on the request
    static changeCartContent = async (req, res) => {
        const { cid } = req.params;
        const { products } = req.body;

        try {
            const cartUpdated = await cartManager.updateCartWithProducts(cid, products);
            res.send(cartUpdated.products);
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };
}

module.exports = CartsApiController;
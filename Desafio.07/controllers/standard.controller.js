const productManager = require("../dao/db/product.manager");
const cartManager = require("../dao/db/cart.manager");

class StandardController {

    static showMainPage = async (req, res) => {
        const products = await productManager.getAll();
        res.render('home', {
            products,
            user: req.user,
            cid: req.user?.cart?._id
        });
    };

    static showCartPageById = async (req, res) => {
        const { cid } = req.params;
        const cart = await cartManager.getById(cid);

        //  in case the cart is empty
        const products = cart?.products || [];

        res.render('cart', {
            products,
            user: req.user,
            cid: cid
        });
    };

    //  it adds a specific product in a specific cart
    static addProductOnCart = async (req, res) => {
        const { cid, pid } = req.params;

        await cartManager.addProduct(cid, pid);

        res.redirect('back');
    };

    //  it removes a specific product from a specific cart
    static deleteProductOnCart = async (req, res) => {
        const { cid, pid } = req.params;
        try {
            const result = await cartManager.deleteProduct(cid, pid);
        } catch (e) {
            console.log(e.message);
        }

        res.redirect(`/cart/${cid}`);
    };

    static showChatPage = async (req, res) => {
        res.render('chat', {
            user: req.user,
            cid: req.user?.cart?._id
        });
    };

    //  It creates a new product with data sent from a HTML form
    static createProduct = async (req, res) => {
        const { body } = req;

        try {
            await productManager.create(body);
            res.redirect('/');
        } catch (e) {
            res.status(400).send({ "error": e.message });
        }
    };

    //  It loads the `/realtimeproducts`
    static showRealtimeProductsPage = async (req, res) => {
        const products = await productManager.getAll();
        res.render('realTimeProducts', {
            products,
            user: req.user,
            cid: req.user?.cart?._id
        });
    };

    //  It removes a product from a url meant to be requested through a browser
    static deleteProductFromPage = async (req, res) => {
        const { pid } = req.params;

        if (!await productManager.getById(pid)) {
            res.sendStatus(404);
        }

        await productManager.delete(pid);
        res.redirect('/');
    };

    //  for requests that matches with no route
    static defaultResponse = (req, res) => {
        res.statusCode = 404;
        console.log(`An invalid url has been required`);
        res.send({ "Error": "The required URL doesn't exists" });
    }

}

module.exports = StandardController;
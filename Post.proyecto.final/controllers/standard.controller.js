const factory = require("../dao/factory.dao");
const productManager = factory.getInstance('product');
const cartManager = factory.getInstance('cart');
const ticketManager = factory.getInstance('ticket');
const UserDTO = require("../dao/dto/user.dto");
const mailSenderService = require("../services/mail.sender.service");
const MailRenderService = require("../services/mail.render.service");
const CustomError = require("../utils/custom.error.utils");

class StandardController {

    static showMainPage = async (req, res) => {
        const products = await productManager.getAll();
        res.render('home', {
            products,
            user: UserDTO.parse(req.user),
            cid: req.user?.cart?._id
        });
    };

    static showCartPageById = async (req, res) => {
        const { cid } = req.params;
        res.render('cart', {
            user: UserDTO.parse(req.user),
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
            console.log('saracatunga')
            req.logger.warning(e.message);
        }

        res.redirect(`/cart/${cid}`);
    };

    static showChatPage = async (req, res) => {
        res.render('chat', {
            user: UserDTO.parse(req.user),
            cid: req.user?.cart?._id
        });
    };

    //  It creates a new product with data sent from a HTML form
    static createProduct = async (req, res) => {
        const { body } = req;

        try {
            if (req.user?.email) {
                body.owner = req.user.email;
            }
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
            user: UserDTO.parse(req.user),
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

    static confirmPurchase = async (req, res, next) => {
        const { session_id } = req.query;
        const ticket = await ticketManager.getById(session_id);

        if (!ticket) {
            next(CustomError(`El pago se realizó con éxito, pero hubo un problema con la orden. Póngase en contacto con nosotros, y guarde esta información: ${session_id}`, CustomError.ERROR_TYPES.UNKNOWN_ERROR, 500));
        }

        ticketManager.update(ticket._id, { status: 'completed' });

        const html = MailRenderService.renderTicket(ticket);

        try {
            await mailSenderService.send(ticket.purchaser, html, 'Nueva compra!');
        } catch (e) {
            throw new CustomError('there was a problem trying to send the ticket by email', CustomError.ERROR_TYPES.UNKNOWN_ERROR, 500);
        }

        res.render('purchase-finished', {
            products: ticket.products,
            user: UserDTO.parse(req.user),
            cid: req.user?.cart?._id
        });
    }

    //  for requests that matches with no route
    static defaultResponse = (req, res) => {
        res.statusCode = 404;
        req.logger.error(`An invalid url has been required`);
        res.send({ "Error": "The required URL doesn't exists" });
    }

    static loggerTest = (req, res) => {
        for (let _level in req.logger.levels) {
            req.logger[_level]({
                message: 'MENSAJE DEL TIPO ' + _level,
                timestamp: Date.now()
            });
        }
        res.send('Check your logs');
    }
}

module.exports = StandardController;
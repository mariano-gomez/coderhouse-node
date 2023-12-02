const Stripe = require('stripe');

const dependencyContainer = require("../dependency.injection");
const _dotenv = dependencyContainer.get('dotenv');
const stripe = require('stripe')(_dotenv.STRIPE_SECRET_KEY);

class StripeService {

    async createCheckoutSession(ticket, cartId) {
        const lineItems = ticket.products.map(cartProduct => {
            return {
                price_data: {
                    currency: 'usd',                             //  can't use ARS because the amount might be below the minimum ($0.50 USD)
                    product: cartProduct._id,
                    product_data: {
                        name: cartProduct.title
                    },
                    unit_amount: cartProduct.unit_price * 100,   //  to have an integer value
                },
                quantity: cartProduct.quantity
            }
        });

        return await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
            success_url: `${_dotenv.SITE_URL}/purchaseSuccess?session_id=${ticket._id}`,
            cancel_url: `${_dotenv.SITE_URL}/cart/${cartId}`,
        });
    }
}

module.exports = new StripeService();
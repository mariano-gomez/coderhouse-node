const { Schema, model } = require('mongoose');

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users'},
    code: Number,
    amount: Number,
    products: {
        type: [{
            product: { type: Schema.Types.ObjectId, ref: 'products' },
            title: String,
            quantity: Number,
            unit_price: Number,
            subtotal: Number
        }],
        default: []
    },
    purchaser: String,
    purchase_datetime: { type: Number, default: Date.now() },
});

const ticketModel = model('tickets', schema);

module.exports = ticketModel;
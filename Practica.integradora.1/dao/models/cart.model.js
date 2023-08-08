const { Schema, model } = require('mongoose');

const schema = new Schema({
    user: String,   //  puede llegar a ser un ObjectId
    products: {
        type: [{
            product: String,
            quantity: Number
        }],
        default: []
    }
});

const cartModel = model('carts', schema);

module.exports = cartModel;
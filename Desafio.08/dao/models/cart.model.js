const { Schema, model } = require('mongoose');

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    products: {
        type: [{
            product: { type: Schema.Types.ObjectId, ref: 'products' },
            quantity: Number
        }],
        default: []
    }
});

schema.pre("findOne", function () {
    this.populate({
        path: 'products.product',
    });
});

const cartModel = model('carts', schema);

module.exports = cartModel;
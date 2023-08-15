const { Schema, model } = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const schema = new Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    category: String,
    thumbnails: { type: [String], default: [] },
    createdDate: { type: Number, default: Date.now() }
});

schema.plugin(paginate);

const productModel = model('products', schema);

module.exports = productModel;
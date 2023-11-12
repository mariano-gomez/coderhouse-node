const { Schema, model } = require('mongoose');

const schema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    age: Number,
    role: { type: String, default: 'user' },    //  not yet
    cart: { type: Schema.Types.ObjectId, ref: 'carts' },
    createdDate: { type: Number, default: Date.now() },
    forgotPasswordRequestDate: { type: String, default: null },
    documents: {
        type: [{
            name: String,           //  `id`, `address`, `accountState`, `product`, `others`
            reference: String,      //  document's uri/path
        }]
    },
    hasUploadedIdDocument: { type: Boolean, default: false },
    hasUploadedAddressDocument: { type: Boolean, default: false },
    hasUploadedAccountStateDocument: { type: Boolean, default: false },
    last_connection: { type: Number, default: Date.now() }
});

const userModel = model('users', schema);

module.exports = userModel;
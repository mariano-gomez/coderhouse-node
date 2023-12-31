const { Schema, model } = require('mongoose');

const schema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    role: String,
    createdDate: { type: Number, default: Date.now() }
});

const userModel = model('users', schema);

module.exports = userModel;
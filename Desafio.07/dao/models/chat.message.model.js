const { Schema, model } = require('mongoose');

const schema = new Schema({
    user: String,
    text: String,
    datetime: { type: String, default: (new Date).toLocaleTimeString('en-US') }
});

const chatMessageModel = model('messages', schema);

module.exports = chatMessageModel;
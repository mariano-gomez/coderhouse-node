
const SESSIONLESS = false;
const DATABASE = 'entregas_ecommerce';

const mongoConnectionString = `mongodb+srv://coderhose_app:OUQoVf5WZ54IoRKL@cluster0.u8oklk1.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;

module.exports = {
    SESSIONLESS, mongoConnectionString
};
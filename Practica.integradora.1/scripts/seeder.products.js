const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const productModel = require('../dao/models/product.model');

async function seed() {
    await mongoose.connect("mongodb+srv://coderhose_app:OUQoVf5WZ54IoRKL@cluster0.u8oklk1.mongodb.net/entregas_ecommerce?retryWrites=true&w=majority");

    const filepath = path.join(__dirname, '..', 'data', 'products.json');
    const data = await fs.readFile(filepath, 'utf-8');

    //  with the destructuring made within the map() function, we discard the `id` field setted on the `products.json` file
    const products = JSON.parse(data).map(({ id, ...product }) => product);

    const result = await productModel.insertMany(products);

    console.log(result);

    await mongoose.disconnect();
}

seed();
const fs = require('fs/promises');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

//  This function is meant to load all the variables from a `.env.<environment>`, using `dotenv` and `commander` packages
//  later, we'll import these variables from `/config/config.js`, even though we could do it directly through env.process.<variableName>
function loadDotEnvVariables(dotenv) {

    const env = 'development',
        persist = 'mongo';

//  This tells express to load the variables we defined on the `.env` file
    dotenv.config({
        path: path.join(__dirname, '..', '.env.development')
    });

    dotenv.populate(process.env, { ENVIRONMENT: env });
    dotenv.populate(process.env, { PERSISTENCE: persist });

    return require('../config/config');
}

async function seed() {
    await mongoose.connect(_dotenv.MONGO_URL.replace('/desarrollo_ecommerce?', '/ecommerce?'));

    const filepath = path.join(__dirname, '..', 'data', 'products.json');
    const data = await fs.readFile(filepath, 'utf-8');

    //  with the destructuring made within the map() function, we discard the `id` field setted on the `products.json` file
    const products = JSON.parse(data).map(({ id, ...product }) => product);

    const result = await productModel.insertMany(products);

    console.log(result);

    await mongoose.disconnect();
}

const _dotenv = loadDotEnvVariables(dotenv);
const productModel = require('../dao/models/product.model');
seed();
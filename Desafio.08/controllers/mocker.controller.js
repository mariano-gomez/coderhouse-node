//  include faker
const { faker } = require('@faker-js/faker');

class MockerController {

    static mockProducts(req, res) {
        const quantity = req.query.quantity || 100;
        const fakeProducts = [];

        for (let i = 0; i < quantity; i++) {
            fakeProducts.push({
                _id: faker.database.mongodbObjectId(),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                code: faker.commerce.isbn(),
                price: faker.number.float({ min: 20, max: 60, precision: 2 }),
                status: faker.datatype.boolean({ probability: 0.8 }),
                stock: faker.number.int({ min: 0, max: 200 }),
                category: faker.commerce.productAdjective(),
                thumbnails: faker.helpers.arrayElements(
                    //  I create the array each time, for further randomization
                    [
                        faker.image.url(),
                        faker.image.url(),
                        faker.image.url(),
                        faker.image.url(),
                    ],
                    faker.number.int({ min: 1, max: 4 })
                ),
                createdDate: Date.parse(faker.date.recent()),
            });
        }
        return res.send(fakeProducts);
    }
}

module.exports = MockerController;
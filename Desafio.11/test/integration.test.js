// import chai from 'chai';
// import supertest from 'supertest';

const chai = require('chai');
const supertest = require('supertest');
const {Schema} = require("mongoose");
const { faker } = require('@faker-js/faker');

const expect = chai.expect;
const requestor = supertest('http://localhost:8080');   //  TODO: ver de agregar dotenv (tengo q cargar todo lo de consola aca tambien, medio bardo)

const generateProductData = () => {
    return {
        title: `${faker.commerce.productName()} [${Date.now()}]`,
        description: faker.commerce.productDescription(),
        code: faker.commerce.isbn(),
        price: faker.number.float({ min: 20, max: 60, precision: 2 }),
        stock: faker.number.int({ min: 0, max: 200 }),
        category: faker.commerce.productAdjective(),
        owner: adminUserForProductCRUD.email,  //  it should contain the creator's email. It should never change
    };
}

const generateUserData = () => {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        age: faker.number.int({ min: 18, max: 90 })
    };
}

const adminUserForProductCRUD = {
    email: `marianogomez2@gmail.com`,
    password: '1234',
};
const regularUserForCartTESTS = {
    email: `marianogomez@gmail.com`,
    password: '12345',
};

//  so i can keep track of which user am i using
const user = generateUserData();
// console.log('EMAIL ', user.email, 'PASSWORD ', user.password);

describe('Pruebas de integracion para router de sessions (users)', function() {
    this.timeout(6000);
    let userCookies;

    it('[Test 1/4] falla al intentar registrar un usuario sin algun dato obligatorio', async () => {
        const { headers } = await requestor.post('/signup').send({
            ...user,
            password: ''    //  empty password
        });

        //  if the signup fails, it must redirect to the `/signup` page again
        expect(headers.location).to.be.equal('/signup');
    });

    it('[Test 2/4] al registrar un usuario, redirecciona a la pagina de perfil del mismo', async () => {
        const { headers } = await requestor.post('/signup').send(user);
        userCookies = headers['set-cookie'];

        expect(headers.location).to.be.equal('/profile');
    });

    it('[Test 3/4] el endpoint para ver la informacion del usuario devuelve la informacion correcta', async () => {
        const { _body } = await requestor.get('/api/users/current').set('Cookie', userCookies);

        expect(_body.first_name).to.be.equal(user.first_name);
        expect(_body.last_name).to.be.equal(user.last_name);
        expect(_body.email).to.be.equal(user.email);
        expect(_body.age).to.be.equal(user.age);
        expect(_body.role).to.be.equal('user');
    });

    it('[Test 4/4] switchea correctamente entre los roles `user` y `premium`', async function() {
        const { _body } = await requestor.get('/api/users/current').set('Cookie', userCookies);

        const currentRole = _body.role;
        const newRole = (_body.role == 'user') ? 'premium' : 'user';
        const userId = _body.id;

        const { _body: _newBody } = await requestor.put(`/api/users/premium/${userId}`).set('Cookie', userCookies);

        expect(_newBody.role).to.be.equal(newRole);

        const { _body: _thirdBody } = await requestor.put(`/api/users/premium/${userId}`).set('Cookie', userCookies);

        expect(_thirdBody.role).to.be.equal(currentRole);
    });
});

describe('Pruebas de integracion para router de products', function() {

    let adminLoginCookies;
    let lastCreatedProductId = null;

    before(async function loginUser() {
        //  Antes de poder trabajar con los productos, necesito tener logueado un usuario (preferentemente admin)
        const { headers, _body } = await requestor.post('/login').send({
            email: adminUserForProductCRUD.email,
            password: adminUserForProductCRUD.password
        });
        adminLoginCookies = headers['set-cookie'];

    });

    after(function logoutUser() {
        delete adminLoginCookies;
    });

    it('[Test 1/4] comprueba la correcta creacion de productos en [POST] /product', async function() {
        const product = generateProductData();

        const { statusCode, _body: responseBody } =
            await requestor.post('/api/products')
                .set('Cookie', adminLoginCookies)
                .send(product);

        lastCreatedProductId = responseBody._id
        expect(statusCode).to.be.equal(201);
        expect(responseBody._id).to.not.be.undefined;
        expect(responseBody.status).to.be.true;
        expect(responseBody.owner).to.be.equal(adminUserForProductCRUD.email);
    });

    it('[Test 2/4]comprueba que un producto especifico se obtiene de [GET] /product/{id}', async function() {
        const { statusCode, _body: responseBody } =
            await requestor.get(`/api/products/${lastCreatedProductId}`)
                .set('Cookie', adminLoginCookies);

        expect(statusCode).to.be.equal(200);
        expect(responseBody._id).to.be.equal(lastCreatedProductId);
    });

    it('[Test 3/4] falla cuando intenta crear un nuevo producto sin un usuario logueado', async function() {
        const product = generateProductData();

        const { statusCode, _body: responseBody } =
            await requestor.post('/api/products')
                .send(product);

        expect(statusCode).to.be.equal(403);
        expect(responseBody.error).to.be.equal('User not logged');
    });

    it('[Test 4/4] debe borrar exitosamente el producto de la DB', async function() {

        const { statusCode, _body: responseBody } =
            await requestor.del(`/api/products/${lastCreatedProductId}`)
                .set('Cookie', adminLoginCookies);

        expect(statusCode).to.be.equal(204);

        // expect(statusCode).to.be.equal(403);
        // expect(responseBody.error).to.be.equal('User not logged');
    });
});

describe('Pruebas de integracion para router de carts', function() {
    this.timeout(10000);
    let userCookies;
    let cartId;

    before(async function loginUser() {
        //  Primero, necesito un usuario logueado
        const { headers } = await requestor.post('/login').send({
            email: regularUserForCartTESTS.email,
            password: regularUserForCartTESTS.password
        });
        userCookies = headers['set-cookie'];

        //  Luego, obtener el id del carrito
        const { _body } = await requestor.get('/api/users/current').set('Cookie', userCookies);

        cartId = _body.cart._id;

        await requestor.del(`/api/carts/${cartId}`).set('Cookie', userCookies);
    });

    after(async function cleanCart() {
        await requestor.del(`/api/carts/${cartId}`).set('Cookie', userCookies);
    });

    it('[Test 1/4] Viendo que la ruta del carrito devuelve su contenido', async function () {
        const { statusCode, _body } = await requestor.get(`/api/carts/${cartId}`).set('Cookie', userCookies);

        expect(statusCode).to.be.equal(200);
        expect(_body instanceof Array).to.be.true;
        expect(_body).to.be.empty;
    });

    it('[Test 2/4] Arroja error cuando se intenta agregar un producto que no existe', async function () {
        const { statusCode, _body } = await requestor.post(`/api/carts/${cartId}/product/${cartId}`).set('Cookie', userCookies);

        expect(statusCode).to.be.equal(404);
        expect(_body.status).to.be.equal('error');
        expect(_body.error).to.be.equal('Product not found');
    });

    it('[Test 3/4] Agrega con exito un producto que si existe', async function () {
        const { _body: productListBody } = await requestor.get(`/api/products?limit=5`);
        const product = productListBody.payload[0];

        const { statusCode, _body } = await requestor.post(`/api/carts/${cartId}/product/${product._id}`).set('Cookie', userCookies);

        expect(statusCode).to.be.equal(200);
        expect(_body[0].product._id).to.be.equal(product._id);
        expect(_body[0].quantity).to.be.equal(1);
    });

    it('[Test 4/4] Elimina con exito el contenido del carrito', async function () {
        const { _body: productListBody } = await requestor.get(`/api/products?limit=5`);
        const product = productListBody.payload[0];

        const {
            _body: addProductBody
        } = await requestor.post(`/api/carts/${cartId}/product/${product._id}`).set('Cookie', userCookies);

        expect(addProductBody[0].product._id).to.be.equal(product._id);
        expect(addProductBody[0].quantity).to.be.greaterThan(0);

        const { statusCode: deleteStatusCode } = await requestor.del(`/api/carts/${cartId}`).set('Cookie', userCookies);

        expect(deleteStatusCode).to.be.equal(204);

        const { statusCode, _body } = await requestor.get(`/api/carts/${cartId}`).set('Cookie', userCookies);

        expect(statusCode).to.be.equal(200);
        expect(_body instanceof Array).to.be.true;
        expect(_body).to.be.empty;
    });

});
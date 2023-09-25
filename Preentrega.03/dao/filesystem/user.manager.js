const fs = require('fs/promises');
const path = require('path');

class UserManager {

    #users;
    #usersFile;

    constructor(filename) {
        this.#usersFile = path.join(
            __dirname,
            '../../data',
            filename
        );
        this.#users = [];
    }

    async #readFile() {
        const rawData = await fs.readFile(this.#usersFile, 'utf-8');
        this.#users = JSON.parse(rawData);
    }

    async #saveFile() {
        await fs.writeFile(this.#usersFile, JSON.stringify(this.#users, null, 2));
    }

    async getAll() {
        await this.#readFile();
        return this.#users;
    }

    //  TODO: testear con busqueda de email que no existe (devuelve null? undefined?)
    async getById(userId) {
        await this.#readFile();
        const user = this.#users.find((obj) => {
            return obj._id == userId;
        });
        return user;
    }

    //  TODO: testear con busqueda de email que no existe (devuelve null? undefined?)
    async getByEmail(email) {
        await this.#readFile();
        const user = this.#users.find((obj) => {
            return obj.email == email;
        });
        return user;
    }

    async delete(id) {
        await this.#readFile();

        this.#users = this.#users.filter(p => p._id != id);

        await this.#saveFile();
    }

    async create(user) {

        await this.#readFile();

        const existingUser = await this.getByEmail(user.email);

        if (existingUser) {
            throw new Error('The user code already exists');
        }

        const _id = (this.#users[this.#users.length - 1]?._id || 0) + 1;

        const newUser = {
            ...user,
            _id,
            cart: [],
            role: (user.email === 'adminCoder@coder.com' && user.password === 'adminCod3r123') ? 'admin' : 'user',
            id: _id
        };

        this.#users.push(newUser);

        await this.#saveFile();

        return newUser;
    }


    async save(id, newUser) {
        //  these fields cannot be overwritten
        delete newUser._id;
        delete newUser.id;

        //  if we get a new email, we need to check that is not already taken by other user
        if (newUser.email) {
            const existingEmail = await this.getByEmail(newUser.email);
            if (existingEmail && existingEmail._id != id) {
                console.log('email already taken');
                return;
            }
        }

        const oldUser = await this.getById(id);

        if (!oldUser) {
            console.log('User not found:', id);
            return;
        }

        oldUser._doc = {
            id: oldUser.id,
            _id: oldUser._id,
        };

        const userProperties = Object.getOwnPropertyNames(oldUser);

        for (const field of userProperties) {
            if (newUser[field] !== undefined) {
                oldUser[field] = newUser[field];

                //  because I made almost all the code considering mongo responses, i need to adjust the responses in this manager according to what was expected from mongo responses
                oldUser._doc[field] = oldUser[field];
            }
        }

        await this.#saveFile();
        return oldUser;
    }
}

module.exports = new UserManager('users.json');
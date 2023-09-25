const path = require("path");
const fs = require("fs/promises");
const dependencyContainer = require("../../dependency.injection");

class ChatMessageManager {

    #messages;
    #chatFile;

    constructor(filename) {
        this.#chatFile = path.join(
            __dirname,
            '../../data',
            filename
        );
        this.#messages = [];
    }

    /**
     * It returns an array with all the chat messages stored in the file linked to the class
     */
    async #readFile() {
        const rawData = await fs.readFile(this.#chatFile, 'utf-8');
        this.#messages = JSON.parse(rawData);
    }

    /**
     *
     * @param carts | must be an array
     * @returns {Promise<void>}
     */
    async #saveFile() {
        await fs.writeFile(this.#chatFile, JSON.stringify(this.#messages, null, 2));
    }

    async getAll() {
        await this.#readFile();
        return this.#messages;
    }

    async create({ user, datetime, text }) {
        await this.#readFile();

        const id = (this.#messages[this.#messages.length - 1]?.id || 0) + 1;

        const newMessage = {
            id,
            user,
            datetime,
            text
        };

        this.#messages.push(newMessage);

        await this.#saveFile();

        await this.#updateWebsocket();
    }

    async #updateWebsocket() {
        const io = dependencyContainer.get('io');
        io.sockets.emit('products.list.updated', await this.getAll());
    }
}

module.exports = new ChatMessageManager('chat.messages.json');
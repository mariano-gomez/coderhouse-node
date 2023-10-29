const fs = require('fs/promises');
const path = require('path');

class TicketManager {

    #tickets;
    #ticketsFile;

    constructor(filename) {
        this.#ticketsFile = path.join(
            __dirname,
            '../../data',
            filename
        );
        this.#tickets = [];
    }

    async #readFile() {
        const rawData = await fs.readFile(this.#ticketsFile, 'utf-8');
        this.#tickets = JSON.parse(rawData);
    }

    async #saveFile() {
        await fs.writeFile(this.#ticketsFile, JSON.stringify(this.#tickets, null, 2));
    }

    async getLastTicket() {
        await this.#readFile();
        const ticketsQuantity = this.#tickets.length;
        if (ticketsQuantity == 0) {
            return null;
        }
        return this.#tickets[ticketsQuantity - 1];
    }

    async getByCode(ticketCode) {
        await this.#readFile();
        const ticket = this.#tickets.find((obj) => {
            return obj.code == ticketCode;
        });
        if (!ticket) {
            return null;
        }
        return ticket;
    }

    async create(ticketData) {
        await this.#readFile();

        const id = (this.#tickets[this.#tickets.length - 1]?.id || 0) + 1;

        const newTicket = {
            id,
            ...ticketData
        };

        this.#tickets.push(newTicket);

        await this.#saveFile();

        return newTicket;
    }
}

module.exports = new TicketManager('tickets.json');
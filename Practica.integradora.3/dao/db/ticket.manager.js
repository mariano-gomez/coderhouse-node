const ticketModel = require('../models/ticket.model')
const {Schema} = require("mongoose");

class TicketManager {

    async getLastTicket() {
        const result = await ticketModel.aggregate([
            { $sort: { code: -1 } },
            { $limit: 1 }
        ]);

        return result ? result[0] : null;
    }

    async getByCode(code) {
        return ticketModel.findOne({code}).lean();
    }

    async create(ticketData)
    {
        return ticketModel.create(ticketData);
    }
}

module.exports = new TicketManager();

const ticketModel = require('../models/ticket.model')
const { Types } = require("mongoose");
const CustomError = require("../../utils/custom.error.utils");

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

    async getById(id) {
        return ticketModel.findOne({_id: new Types.ObjectId(id)}).lean();
    }

    async create(ticketData)
    {
        return ticketModel.create(ticketData);
    }

    async update(id, newTicketData) {
        try {
            if (newTicketData.code) {
                const existingTicket = await this.getByCode(newTicketData.code);
                //  If a ticket already exists with that code, and the ticket id that holds it is different than the id
                //  the user sent, (meaning, is not the same ticket), then it should throw an error
                if (existingTicket && existingTicket.id != id) {
                    throw new CustomError('The ticket code is already taken', CustomError.ERROR_TYPES.INPUT_ERROR, 400);
                }
            }

            return ticketModel.updateOne(
                { _id: id },
                newTicketData
            );
        } catch (e) {
            console.log(e.message);
        }
    }
}

module.exports = new TicketManager();

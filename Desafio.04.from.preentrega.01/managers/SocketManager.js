//  this is meant to be a singleton to wrap the single io/socket we have
class SocketManager {

    static #socket;

    constructor() {

    }

    static getInstance(socket = null) {
        if (socket && !SocketManager.#socket) {
            SocketManager.#socket = socket;
        }

        return SocketManager.#socket;
    }
}

module.exports = SocketManager;
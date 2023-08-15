//  as an alternative, check https://dev.to/successgilli/circular-dependency-in-nodejs-and-nestjs-3e1d as a workaround for sockets
class DependencyInjection {

    #container;

    constructor() {
        this.#container = [];
    }

    get(key) {
        return this.#container[key];
    }

    set(key, value) {
        this.#container[key] = value;
    }
}

module.exports = new DependencyInjection();
const {Schema} = require("mongoose");

class UserDto {

    static parse(userData) {
        return {
            name: userData.first_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            age: userData.age,
            role: userData.role,
            cart: userData.cart,
            id: userData._id
        };
    }

    static parseBasicData(userData) {
        return {
            name: userData.first_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            role: userData.role,
            id: userData._id
        };
    }
}

module.exports = UserDto;
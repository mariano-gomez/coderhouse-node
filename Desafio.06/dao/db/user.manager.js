const userModel = require('../models/user.model')

class UserManager {

  async getAll() {
    return userModel.find({}).lean();
  }

  getById(id) {
    return userModel.findOne({ _id: id }).lean();
  }

  getByEmail(email) {
    return userModel.findOne({ email }).lean();
  }

  create(user) {
    return userModel.create(user);
  }

  async save(id, user) {
    const existing = await this.getById(id);

    if (!existing) {
      return;
    }

    const {
      firstname,
      lastname,
      email,
      age,
      password,
      // role   //  not yet
    } = user;

    await userModel.updateOne({ _id: id }, { $set: {
      firstname,
      lastname,
      email,
      age,
      password,
      // role   //  not yet
    } });
  }

  async delete(id) {
    const existing = await this.getById(id);

    if (!existing) {
      return;
    }

    await userModel.deleteOne({ _id: id });
  }
}

module.exports = new UserManager();

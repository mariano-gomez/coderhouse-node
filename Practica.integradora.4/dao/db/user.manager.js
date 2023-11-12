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

  /**
   * It returns true iif the user has uploaded all the required documents
   * @param user
   * @returns boolean
   */
  userHasUploadedRequiredDocuments(user) {
    return user.hasUploadedIdDocument &&
        user.hasUploadedAddressDocument &&
        user.hasUploadedAccountStateDocument;
  }

  /**
   * If the document is one of the following: `id`, `address` or `accountState`, then it stores/overwrites the
   * document in the user's documents array (since it can be only one), and updates the corresponding flag
   * Otherwise, it simply adds the document in the user's documents array
   * @param userId
   * @param profilePrefix | one of the following: `id`, `address` or `accountState`
   * @param documentPath
   * @returns {Promise<void>}
   */
  async saveDocument(userId, newDocument) {
    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      return;
    }

    switch (newDocument.name) {
      //  for the next 3 cases, there can only be one document of each
      case `id`:
      case `address`:
      case `accountState`:
        const uniqueDocument = user.documents.find(loopDocument => {
          return loopDocument.name === newDocument.name;
        });

        //  If the document name (type) already exists, it is overloaded. Otherwise, it is added to the array
        if (uniqueDocument) {
          uniqueDocument.reference = newDocument.reference;
        } else {
          user.documents.push(newDocument);
        }
        break;

      //  For the rest of the document types, we simply add them
      default:
        user.documents.push(newDocument);
    }

    switch (newDocument.name) {
      case 'id':
        user.hasUploadedIdDocument = true;
        break;
      case 'address':
        user.hasUploadedAddressDocument = true;
        break;
      case 'accountState':
        user.hasUploadedAccountStateDocument = true;
        break;
    }

    await user.save();
  }

  async save(id, user) {
    const existing = await this.getById(id);

    if (!existing) {
      return;
    }

    const {
      first_name,
      last_name,
      email,
      age,
      password,
      role,
      forgotPasswordRequestDate,
      cart,
      documents,
      hasUploadedIdDocument,
      hasUploadedAddressDocument,
      hasUploadedAccountStateDocument,
      last_connection,
    } = user;

    await userModel.updateOne({ _id: id }, { $set: {
      first_name,
      last_name,
      email,
      age,
      password,
      role,
      forgotPasswordRequestDate,
      cart,
      documents,
      hasUploadedIdDocument,
      hasUploadedAddressDocument,
      hasUploadedAccountStateDocument,
      last_connection,
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

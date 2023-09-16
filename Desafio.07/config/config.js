module.exports = {
    MONGO_URL: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_SERVER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    PORT: parseInt(process.env.PORT),
};
module.exports = {
    MONGO_URL: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_SERVER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    SITE_URL: process.env.SITE_URL,
    PORT: parseInt(process.env.PORT),
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    mail: {
        GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
        GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    },
    ENV: process.env.ENVIRONMENT,
    PERSISTENCE: process.env.PERSISTENCE,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};
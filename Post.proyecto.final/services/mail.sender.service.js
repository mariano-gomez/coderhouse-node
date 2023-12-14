const nodemailer = require('nodemailer');
const _dotenv = require('../config/config');

class MailSenderService {

    constructor() {
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: _dotenv.mail.GMAIL_ADDRESS,
                pass: _dotenv.mail.GMAIL_PASSWORD,
            }
        });
    }

    async send(emailTo, body, subject = 'No Subject') {
        const response = await this.emailTransporter.sendMail({
            from: `${_dotenv.mail.GMAIL_ADDRESS}`,
            subject,
            to: emailTo,
            html: body
        });

        return response;
    }

}

module.exports = new MailSenderService();
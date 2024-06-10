import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
    },
});

let sendEmail = async (from, to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from, 
            to,
            subject,
            text,
            html,
        });
        console.log('Message sent: ', info.messageId);
        return Promise.resolve();
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

module.exports = {
    sendEmail
}

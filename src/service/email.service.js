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
        return Promise.resolve();
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

let sendFeedBack = async (data) => {
    let mailOptions = {
        from: data.from,
        to: 'nguyenchihieu1707@gmail.com',
        subject: data.subject,
        text: data.text,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #007bff;">Phản hồi từ khách hàng</h2>
                <p><strong>Email người gửi:</strong> ${data.from}</p>
                <p><strong>Tiêu đề:</strong> ${data.subject}</p>
                <p><strong>Nội dung:</strong></p>
                <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.text}</p>
            </div>
        `
    };

    try {
        let emailSent = await transporter.sendMail(mailOptions);
        return {
            errCode: 0,
            message: 'Gửi phản hồi thành công',
            data: emailSent.messageId
        };
    } catch (error) {
        return {
            errCode: 1,
            message: 'Gửi phản hồi thất bại',
        };
    }
};

module.exports = {
    sendEmail,
    sendFeedBack
}

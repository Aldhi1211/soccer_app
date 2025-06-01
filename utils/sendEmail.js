import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    return transporter.sendMail({
        from: process.env.EMAIL_SENDER,
        to,
        subject,
        html
    });
};

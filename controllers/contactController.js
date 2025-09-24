const { createMailer } = require('../config/mailer');

exports.sendContact = async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email and message are required' });
    }
    try {
        const transporter = createMailer();
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: 'sugiradigne@gmail.com',
            subject: `Contact form from ${name}`,
            replyTo: email,
            text: message,
            html: `<p>${message.replace(/\n/g, '<br/>')}</p>`
        });
        res.json({ message: 'Message sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}





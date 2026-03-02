const nodemailer = require('nodemailer');

const sendEmail = async (options) => { // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to your email provider
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
            pass: process.env.EMAIL_PASS || 'your-app-password' // Replace with your app password
        }
    });

    // Define email options
    const mailOptions = {
        from: `Attendance App <${
            process.env.EMAIL_USER || 'your-email@gmail.com'
        }>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML template
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

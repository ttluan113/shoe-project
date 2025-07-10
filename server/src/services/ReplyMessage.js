const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT;
const CLIENT_SECRET = process.env.GOOGLE_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const ReplyMessage = async (email) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        await transport.sendMail({
            from: `"LUANSHOES" <${process.env.USER_EMAIL}>`,
            to: email,
            subject: 'Cảm ơn bạn đã liên hệ với LUANSHOES',
            text: `Xin chào ${email},

                Cảm ơn bạn đã liên hệ với LUANSHOES. Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi sớm nhất có thể.

                Nếu bạn có bất kỳ thắc mắc nào liên quan đến sản phẩm hoặc dịch vụ, vui lòng liên hệ với chúng tôi qua:

                - Email: hotro@LUANSHOEs.com
                - Hotline: 0123 456 789
                - Website: https://LUANSHOEs.com

                Chúc bạn một ngày tốt lành!

                Trân trọng,
                Đội ngũ LUANSHOES`,
            html: `
                <p>Xin chào <strong>${email}</strong>,</p>
                <p>Cảm ơn bạn đã liên hệ với <strong>LUANSHOES</strong>. Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi sớm nhất có thể.</p>
                <p>Nếu bạn có bất kỳ thắc mắc nào liên quan đến sản phẩm hoặc dịch vụ, đừng ngần ngại liên hệ với chúng tôi qua:</p>
                <ul>
                    <li>Email: <a href="mailto:hotro@LUANSHOEs.com">hotro@LUANSHOEs.com</a></li>
                    <li>Hotline: 0123 456 789</li>
                    <li>Website: <a href="https://LUANSHOEs.com">LUANSHOEs.com</a></li>
                </ul>
                <p>Chúc bạn một ngày tốt lành!</p>
                <p>Trân trọng,</p>
                <p><strong>Đội ngũ LUANSHOES</strong></p>
            `,
        });

        console.log(`Email đã gửi thành công đến ${email}`);
    } catch (error) {
        console.log('Error sending email:', error);
    }
};

module.exports = ReplyMessage;

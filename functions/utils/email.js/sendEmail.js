const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { EmailEnums, ErrorEnums } = require("../../Enums");
const { logger } = require("../logger");
const { CustomError } = require("../custom-errors");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function sendEmail(toEmail, body) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    let mailOptions = {
      from: "" + process.env.GOOGLE_APP_NAME + " <" + process.env.EMAIL + ">",
      to: toEmail,
      subject: EmailEnums.subject,
      text: body,
      replyTo: process.env.EMAIL,
    };

    return await transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error("Something went wrong while sending email. [sendEmail] ");
    throw new CustomError(ErrorEnums.FAILED_TO_SEND_EMAIL);
  }
}

module.exports = sendEmail;

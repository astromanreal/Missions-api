import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let htmlBody;
  let textBody;

  // Check the type of email to send and generate the appropriate body
  if (options.type === 'welcome') {
    const { username, websiteLink } = options.context;
    htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <tr>
                <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                    <h1 style="color: #333333; margin: 0; font-size: 24px;">Welcome to the Crew, ${username}!</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px 40px; color: #555555; font-size: 16px; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>Your account has been successfully verified. You are now an official member of the <strong>Space Exploration</strong> team!</p>
                    <p>Your journey into the cosmos begins now. You can log in and start exploring right away:</p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${websiteLink}" style="background-color: #6f42c1; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 20px; font-size: 12px; color: #aaaaaa; background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="margin:0;">&copy; ${new Date().getFullYear()} Space Exploration. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
    textBody = `Welcome, ${username}! Your account is verified. Start exploring at ${websiteLink}`;

  } else { // Default to the OTP email template
    const otp = options.message; // Keep supporting the old `message` property for OTPs
    htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <tr>
                <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                    <h1 style="color: #333333; margin: 0; font-size: 24px;">${options.subject}</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px 40px; color: #555555; font-size: 16px; line-height: 1.6;">
                    <p>Hello,</p>
                    <p>Please use the following code to complete your action. This code is valid for a limited time.</p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 10px 0 30px 0;">
                    <div style="background-color: #f0f0f0; border-radius: 5px; padding: 15px 25px; display: inline-block;">
                        <h2 style="color: #333; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 4px;">
                            ${otp}
                        </h2>
                    </div>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 40px 30px 40px; color: #888888; font-size: 14px; line-height: 1.6;">
                   <p>If you did not request this, you can safely ignore this email.</p>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 20px; font-size: 12px; color: #aaaaaa; background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="margin:0;">&copy; ${new Date().getFullYear()} Space Exploration. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
    textBody = `Your one-time code is: ${otp}`;
  }

  const mailOptions = {
    from: `"Space Exploration" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: htmlBody,
    text: textBody,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;

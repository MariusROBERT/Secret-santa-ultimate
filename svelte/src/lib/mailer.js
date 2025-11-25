import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

/**
 * @param secretSantaName {string}
 * @param gifter {{name: string, email: string}}
 * @param giftee {{name: string}}
 */
export async function sendMail(secretSantaName, gifter, giftee) {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP,
    port: Number(env.EMAIL_PORT),
    secure: Number(env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_ADDRESS,
      pass: env.EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: `"SecretSantaUltimate" <${env.EMAIL_ADDRESS}>`,
    to: gifter.email,
    subject: `Secret Santa: ${secretSantaName}`,
    html: `
      <html lang="en">
        <body>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background: linear-gradient(0deg, #9a0000, #f00); padding: 150px 0;" align="center" width="100%">
                <table>
                  <tr>
                    <td style="background-color: white; border-radius: 10px; padding: 50px;text-align: center;">
                      <h1 style="color: blue;">Hello ${gifter.name} 👋</h1>
                      <p>This year, for ${secretSantaName}'s secret santa, you will gift ${giftee.name}<br/>
                      Good luck and have fun!</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`, // HTML body
  });
}

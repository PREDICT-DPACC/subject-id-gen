import { createTransport } from 'nodemailer';

const {
  LOCAL_SMTP_SERVER,
  EMAIL_SERVER_USER,
  EMAIL_SERVER_PASSWORD,
  EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT,
  EMAIL_FROM,
  BASE_URL,
} = process.env;

const transporter =
  LOCAL_SMTP_SERVER === 'true'
    ? createTransport({
        host: 'localhost',
        port: EMAIL_SERVER_PORT,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      })
    : createTransport({
        host: EMAIL_SERVER_HOST,
        port: EMAIL_SERVER_PORT,
        secure: EMAIL_SERVER_PORT === 465,
        auth: {
          user: EMAIL_SERVER_USER, // generated ethereal user
          pass: EMAIL_SERVER_PASSWORD, // generated ethereal password
        },
      });

const sendVerificationEmail = async ({ email, token }) => {
  await transporter.sendMail({
    from: EMAIL_FROM, // sender address
    to: email, // list of receivers
    subject: 'Subject ID Generator: Email verification', // Subject line
    text: `Subject ID Generator
    
    Go to the following link to verify your email:
    ${BASE_URL}/verify-email/${token}`, // plain text body
    html: `<h1>Subject ID Generator</h1>
    <p><a href="${BASE_URL}/verify-email/${token}">Click here to verify your email</a></p>`, // html body
  });
};

export { sendVerificationEmail };

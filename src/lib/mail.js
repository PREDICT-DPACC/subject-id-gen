import { createTransport } from 'nodemailer';

const localSmtp = process.env.LOCAL_SMTP_SERVER;
const emailUser = process.env.EMAIL_SERVER_USER;
const emailPass = process.env.EMAIL_SERVER_PASSWORD;
const emailHost = process.env.EMAIL_SERVER_HOST;
const emailPort = process.env.EMAIL_SERVER_PORT;
const emailFrom = process.env.EMAIL_FROM;
const baseUrl = process.env.BASE_URL;

const transporter =
  localSmtp === 'true'
    ? createTransport({
        host: 'localhost',
        port: emailPort,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      })
    : createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser, // generated ethereal user
          pass: emailPass, // generated ethereal password
        },
      });

const sendVerificationEmail = async ({ email, token }) => {
  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Subject ID Generator: Email verification',
    text: `Subject ID Generator
    
    Go to the following link to verify your email:
    ${baseUrl}/verify-email/${token}`,
    html: `
      <div style="text-align: center; width: 350px;">
        <h1>Subject ID Generator</h1>
        <div style="border-radius: 5px; border: 1px solid #CCC; padding: 10px;">
        <p>
          Thank you for registering for the Subject ID Generator.
        </p>
        <p>
          <a href="${baseUrl}/verify-email/${token}">
            Click here to verify your email.
          </a>
        </p>
        <p>
          If you did not register or request a verification resend, please ignore this email.
        </p>
      </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async ({ email, token }) => {
  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Subject ID Generator: Reset password',
    text: `Subject ID Generator
    
    Go to the following link to reset your password:
    ${baseUrl}/reset-password/${token}`,
    html: `
      <div style="text-align: center; width: 350px;">
        <h1>Subject ID Generator</h1>
        <div style="border-radius: 5px; border: 1px solid #CCC; padding: 10px;">
        <p>
          Password reset:
        </p>
        <p>
          <a href="${baseUrl}/reset-password/${token}">
            Click here to reset your password.
          </a>
        </p>
        <p>
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
      </div>
    `,
  });
};

const sendSiteRequest = async ({ requestingUser, sites, toEmail }) => {
  let siteListHtml = '';
  let siteListText = '';
  sites.forEach(site => {
    siteListHtml += `<a href="${baseUrl}/sites/${site.siteId}">${site.name}</a><br />`;
    siteListText += `${site.name}: ${baseUrl}/sites/${site.siteId}`;
  });
  await transporter.sendMail({
    from: emailFrom,
    to: toEmail,
    subject: 'Subject ID Generator: Access requested',
    text: `Subject ID Generator
    
      A user with email ${requestingUser} has requested access to the following site(s): 
      ${siteListText}
      
      You may use those URLs to grant access.`,
    html: `
    <div style="text-align: center; min-width: 400px;">
      <h1>Subject ID Generator</h1>
      <div style="border-radius: 5px; border: 1px solid #CCC; padding: 10px;">
        <p>A user with email ${requestingUser} has requested access to the following site(s):</p>
        <p>
          ${siteListHtml}
        </p>
        <p>You may use those links to grant access.</p>
      </div>
    </div>`,
  });
};

export { sendVerificationEmail, sendPasswordResetEmail, sendSiteRequest };

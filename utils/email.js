const nodemailer = require('nodemailer');

const envConfig = require('../config/config.environment').apiUrl;

const smtpTransport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sandeep@moreyeahs.in',
    pass: 'jarvis@125'
  }
});

const mail = {
  verificationEmail: function verificationEmail(verifyOpts) {
    const emailHash = verifyOpts.emailHash;
    const email = verifyOpts.email;
console.log('eamial')
    const link = 'http://' + envConfig.url + '/user/verify?id=' + emailHash;
    const mailOptions = {
      from: 'Sandeep Khore <sandeep@moreyeahs.in>',
      // TODO: Change the TO address to email
      to: email,
      subject: 'Please confirm your Email account',
      html: 'Hello,<br> Please Click on the link to verify your email.<br><a href=' + link + '>Click here to verify</a>'
    };

    smtpTransport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email successfully sent');
      }
    });
  }
};

module.exports = mail;

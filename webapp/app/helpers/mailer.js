require('dotenv').config();
import NodeMailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const hostname = process.env.WEB_HOST;

export default class Mailer {
  constructor(recipient) {
    console.log('recipient', recipient);
    this.recipient = recipient;
  }
  static getTransport() {
    const smtpOptions = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };
    return NodeMailer.createTransport(smtpTransport(smtpOptions));
  }

  defaultOptions() {
    return {
      from: `"MatchPoints" <${process.env.EMAIL_USER}>`,
      to: this.recipient.email,
    };
  }

  confirmationOptions() {
    let emailHTML = `<p>Dear ${this.recipient.username},</p><br />`;
    emailHTML += "<p>Thank you for joining MatchPoints. To verify your email address, please click on the link below.</p>";
    emailHTML += `<a href="${hostname}/accounts/activate?token=${this.recipient.confirmToken}">https://matchpoints.org/accounts/activate?token=${this.recipient.confirmToken}</a>`;
    emailHTML += "<p>Looking forward to serving your needs.</p><br />";
    emailHTML += `<p>Best,<br /><a href='${hostname}'>MatchPoints</a></p>`;
    let emailText = `Dear ${this.recipient.username},\n\n`;
    emailText += "Thank you for joining Match Points.\n\n";
    emailText += "To verify your email address, please click on the link below:\n\n";
    emailText += `${hostname}/accounts/activate?token=${this.recipient.confirmToken}\n\n`;
    emailText += "Looking forward to serving your needs.\n\n";
    emailText += `Best,\nMatchPoints\n(${hostname})`;
    return {
      ...this.defaultOptions(),
      subject: "Please verify your account",
      text: emailText,
      html: emailHTML
    };
  }

  resetOptions(token) {
    let emailHTML = `<p>Dear ${this.recipient.username},</p>`;
    emailHTML += "<p>Please follow the link below to reset your password:</p>";
    emailHTML += `<a href="${process.env.HOST}/reset?token=${this.recipient.token}">https://matchpoints.org/reset?token=${this.recipient.token}</a>`;
    emailHTML += "<p>Please contact help.matchpoints@gmail.com if you have any questions.</p>";
    emailHTML += `<p>Best,<br /><a href='${process.env.HOST}'>MatchPoints</a></p>`;
    let emailText = `Dear ${this.recipient.username},\n\n`;
    emailText += "Please follow the link below to reset your password:<\n\n";
    emailText += `${process.env.HOST}/reset?token=${this.recipient.token}\n\n`;
    emailText += "Please contact help.matchpoints@gmail.com if you have any questions.\n\n";
    emailText +=`"Best,\nMatchPoints\n(${process.env.HOST})`;
    return {
      ...this.defaultOptions(),
      subject: "Reset your password",
      text: emailText,
      html: emailHTML
    };
  }

  finishedResetOptions() {
    let emailHTML = `<p>Dear ${this.recipient.username},</p>`;
    emailHTML += "<p>Your password has been reset successfully.</p>";
    emailHTML += "<p>Please contact help.matchpoints@gmail.com if you have any questions.</p>";
    emailHTML += `<p>Best,<br /><a href='${process.env.HOST}'>MatchPoints</a></p>`;
    let emailText = `Dear ${this.recipient.username},\n\n`;
    emailText += "Your password has been reset successfully.<\n\n";
    emailText += "Please contact help.matchpoints@gmail.com if you have any questions.\n\n";
    emailText +=`"Best,\nMatchPoints\n(${process.env.HOST})`;
    return {
      ...this.defaultOptions(),
      subject: "Password has been Reset successfully",
      text: emailText,
      html: emailHTML
    };
  }

  sendConfirmationEmail() {
    return new Promise((resolve, reject) => {
      Mailer.getTransport().sendMail(this.confirmationOptions(), (err, info) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(info);
      })
    });
  }

  sendResetEmail() {
    return new Promise((resolve, reject) => {
      Mailer.getTransport().sendMail(this.resetOptions(), (err, info) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(info);
      })
    });
  }

  sendFinishedResetEmail() {
    return new Promise((resolve, reject) => {
      Mailer.getTransport().sendMail(this.finishedResetOptions(), (err, info) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(info);
      })
    });
  }
}

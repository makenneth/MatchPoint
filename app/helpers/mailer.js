require('dotenv').config();
import NodeMailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

export default class Mailer {
  constructor(recipient) {
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

  confirmationOptions() {
    let emailHTML = `<p>Dear ${this.recipient.username},</p><br />`;
    emailHTML += "<p>Thank you for joining MatchPoints. To verify your email address, please click on the link below.</p>";
    emailHTML += `<a href="${hostname}/accounts/activate?token=${this.recipient.confirm_token}">https://matchpoints.org/accounts/activate?token=${this.recipient.confirm_token}</a>`;
    emailHTML += "<p>Looking forward to serving your needs.</p><br />";
    emailHTML += `<p>Best,<br /><a href='${hostname}'>MatchPoints</a></p>`;
    let emailText = `Dear ${this.recipient.username},\n\n`;
    emailText += "Thank you for joining Match Points.\n\n";
    emailText += "To verify your email address, please click on the link below:\n\n";
    emailText += `${hostname}/accounts/activate?token=${this.recipient.confirm_token}\n\n`;
    emailText += "Looking forward to serving your needs.\n\n";
    emailText += `Best,\nMatchPoints\n(${hostname})`;
    return {
      from: '"MatchPoints" <noreplymatchpoints@gmail.com>',
      to: this.recipient.email,
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
      from: '"Match points" <noreplymatchpoints@gmail.com>',
      to: this.recipient.email,
      subject: "Reset your password",
      text: emailText,
      html: emailHTML
    };
  }

  sendConfirmationEmail() {
    console.log("sending confirmation email", this.recipient);
    return new Promise((resolve, reject) => {
      Mailer.getTransport().sendMail(this.confirmationOptions(), (err, info) => {
        if (err) {
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
          return reject(err);
        }

        return resolve(info);
      })
    });
  }
}

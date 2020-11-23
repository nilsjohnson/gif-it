const { spawn } = require('child_process');
const fs = require('fs');
const log = require('./logger');

class MailSender {
    constructor() {


    }

    sendVerificationEmail(recAddr, username, userId, verificationCode, onSuccess, onFail) {
  
        let str = 
        
        `To: ${recAddr}
        From: noreply@gif-it.io
        Subject: Please Confirm Your Account
        Mime-Version: 1.0\nContent-Type: text/html
        
        <html>
            <p>Hi ${username}!</p>
            <p>Please verify your account here: <a href='https://gif-it.io/verify?code=${verificationCode}&userId=${userId}'>https://gif-it.io/verify?code=${verificationCode}&userId=${userId}'</a> </p>
            <p>Thank you!</p>
        </html>`;    

        str = str.replace(/\n\s+/g, '\n');
        
        const sendMail = spawn('sendmail', ['-t']);
        sendMail.stdin.write(str);
        sendMail.stdin.end();

        sendMail.stdout.on('data', (data) => {});
        sendMail.stderr.on('data', (data) => { log(data.toString()); });

        sendMail.on('close', (code) => {
            if(code === 0) {
                onSuccess();
            }
            else {
                log("Confirmation Email Not Sent. Code: " + code);
                onFail();
            }
        });
    }

    sendResetPwEmail(recAddr, username, code, onSuccess, onFail) {
        let link = `https://gif-it.io/resetpw/new?code=${code}`;
        
        let str = 
        
        `To: ${recAddr}
        From: noreply@gif-it.io
        Subject: Reset Password
        Mime-Version: 1.0\nContent-Type: text/html
        
        <html>
            <p>Hi ${username}!</p>
            <p>Reset your password here: <a href='${link}'>${link}</a> </p>
        </html>`;    

        str = str.replace(/\n\s+/g, '\n');

        const sendMail = spawn('sendmail', ['-t']);
        sendMail.stdin.write(str);
        sendMail.stdin.end();

        sendMail.stdout.on('data', (data) => {});
        sendMail.stderr.on('data', (data) => { log(data.toString()); });

        sendMail.on('close', (code) => {
            if(code === 0) {
                onSuccess();
            }
            else {
                log("Confirmation Email Not Sent. Code: " + code);
                onFail();
            }
        });
    }
}

module.exports = MailSender;
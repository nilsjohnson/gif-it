const { spawn } = require('child_process');
const fs = require('fs');
const log = require('./logger');

class MailSender {
    constructor() {


    }

    sendVerificationEmail(recAddr, username, userId, verificationCode, onSuccess, onFail) {
        if(DEBUG) {
            console.log(`Sending email.`);
            console.log((`recAddr: ${recAddr}`));
            console.log((`username: ${username}`));
            console.log((`userId: ${userId}`));
            console.log((`verificationCode: ${verificationCode}`));
        }

        // let str = `To: ${recAddr}\nFrom: noreply@gif-it.io\nSubject: Please Confirm Your Account\nMime-Version: 1.0\nContent-Type: text/html\n\n<html><p>Hi ${username}!</p>Click <a href='https://gif-it.io/verify?code=${verificationCode}&userId=${userId}'>here </a> to verify account, or copy and paste https://gif-it.io/verify?code=${verificationCode}&userId=${userId} into your browser\n\nThank You!\ngif-it.io</html>`;
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
            if(DEBUG) {
                console.log(`sendMail processes ended with code ${code}`);
            }
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
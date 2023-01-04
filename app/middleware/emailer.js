var nodemailer = require("nodemailer");
const db = require("../models");
const AppSettings = db.appsettings;




exports.send_email_message = (send_to, subject, message) => {
    var smtpport = '', smtpkey = '', smtphost = '', smtpuser = '';
    AppSettings.findAll({ attributes: ['appkey', 'appvalue'], }).then(res => {
        res.find((value, index) => {
            if (value.appkey === "smtpport") {
                smtpport = value.appvalue;
            }
            if (value.appkey === "smtpkey") {
                smtpkey = value.appvalue;
            }
            if (value.appkey === "smtphost") {
                smtphost = value.appvalue;
            }
            if (value.appkey === "smtpuser") {
                smtpuser = value.appvalue;
            }
        });
        var transporter = nodemailer.createTransport({
            host: smtphost,
            port: smtpport,
            secure: false,
            auth: {
                user: smtpuser,
                pass: smtpkey
            }, logger: false,
            transactionLog: true,
            tls: {
                rejectUnauthorized: false,
            },
        });

        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                return false;
            } else {
                console.log("Server is ready to take our messages");
                return true;
            }
        });

        transporter.sendMail({
            from: smtpuser,
            bcc: 'jayeshtharani@gmail.com',
            to: send_to,
            subject: subject,
            html: message
        }, (err, info) => {
            if (err) {
                console.log(err);
                return false;
            }
            else {
                console.log('email send');
                return true;
            }
        });
    });

}




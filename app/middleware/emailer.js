var nodemailer = require("nodemailer");

//smtp.elasticemail.com
//2525
//95797F32FF5BA87ABBF98E2CE0FE9B47E38D
//jayeshtharani@gmail.com

//old
//smtp-relay.sendinblue.com
//587
//xsmtpsib-cbcdf6a268f7e6b42cf065472938540b426426943412173eaa6b0aabd601a92f-spVMw6nPjIB5Wh94
//jayeshtharani@gmail.com

var transporter = nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 25,
    secure: false,
    auth: {
        user: "jayeshtharani@gmail.com",
        //pass: "xsmtpsib-cbcdf6a268f7e6b42cf065472938540b426426943412173eaa6b0aabd601a92f-spVMw6nPjIB5Wh94",
        pass:"95797F32FF5BA87ABBF98E2CE0FE9B47E38D"
    }, logger: false,
    transactionLog: true,
    tls: {
        rejectUnauthorized: false,
    },
});


exports.send_email_message = (send_to, subject, message) => {

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
        from: 'jayeshtharani@gmail.com',
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
            return 'email send';
        }
    });

}




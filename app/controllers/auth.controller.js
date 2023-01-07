const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const sanitizeHtml = require('sanitize-html');
const send_email_message = require('../middleware/emailer');

exports.signin = (req, res) => {
    User.findOne({
        where: {
            email: sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "User Not found." });
        }
        if (!user.isactive) {
            return res.status(404).send({ data: null, message: "User Not active." });
        }
        var passwordIsValid = bcrypt.compareSync(
            sanitizeHtml(req.body.password),
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                data: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user }, config.secret, {
            expiresIn: '30m', algorithm: 'HS512'
        });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push(roles[i].name.toUpperCase());
            }
            var data = [];
            data.push({
                id: user.userid,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token
            });
            res.status(200).send({
                data: data, message: "Success"
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.appsignupbyadminhidethisapi = (req, res) => {
    var length = 12,
        charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
        password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    User.create({
        username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }),
        email: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
        password: bcrypt.hashSync(password, 8)
    }).then(userResult => {
        userResult.setRoles([1]).then(roleResult => {
            var regmessage = "<p>";
            regmessage += "Hi ";
            regmessage += sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} });
            regmessage += ",";
            regmessage += "</p>";

            regmessage += "<p>A new admin account with Indo Aerospace Solution Pvt. Ltd.has been created for you.</p>";
            regmessage += "<p>Email: " + sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }) + "</p>";
            regmessage += "<p>Credentials: " + password;
            regmessage += "</p>";
            regmessage += "<p>We recommend you to change your account password by using Change Password option in your profile section.</p>";
            regmessage += "<p></p>";
            regmessage += "Thank You, <br/>";
            regmessage += "Team ISAPL";
            send_email_message.send_email_message(sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} })
                , "Welcome to IASPL!", regmessage);
            res.status(200).send({
                data: userResult.userid,
                message: "Success"
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.forgotpassword = (req, res) => {
    User.findOne({
        where: {
            email: sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "User Not found." });
        }
        User.update(
            {
                password: bcrypt.hashSync(req.body.newpassword, 8),
            },
            {
                where: { userid: sanitizeHtml(user.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        ).then(passResult => {
            res.status(200).send({
                data: user.userid, message: "Success"
            });
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

exports.changepassword = (req, res) => {
    User.findOne({
        where: {
            userid: sanitizeHtml(req.userid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "User Not found." });
        }
        
        var passwordIsValid = bcrypt.compareSync(
            sanitizeHtml(req.body.currentpassword),
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                data: null,
                message: "Invalid Password!"
            });
        }
        User.update(
            {
                password: bcrypt.hashSync(req.body.newpassword, 8),
            },
            {
                where: { userid: sanitizeHtml(req.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        ).then(passResult => {

            console.log(passResult);
            res.status(200).send({
                data: req.userid, message: "Success"
            });
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};



const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const sanitizeHtml = require('sanitize-html');
const send_email_message = require('../middleware/emailer');


//exports.test = (req, res) => {

//    let replaceAllSWH = sanitizeHtml('abcde', { allowedTags: [], allowedAttributes: {} }).replace(/\.+/g, "").replace(/\,+/g, "").replace(/'+/g, "").replace(/"+/g, "").replace(/&+/g, "")
//        .replace(/pvt/ig, "")
//        .replace(/ltd/ig, "")
//        .replace(/llc/ig, "")
//        .replace(/llp/ig, "")
//        .replace(/inc/ig, "")
//        .replace(/private/ig, "")
//        .replace(/limited/ig, "")
//        .replace(/corporation/ig, "")
//        .replace(/corp/ig, "").trim()
//        .replace(/\s+/g, "_").toLowerCase();


//    return res.status(200).send({ data: replaceAllSWH, message: "User Not found." });
//};



//DONE
exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }),
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
                message: "Invalid User or Password!"
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

//DONE
exports.appsignupbyadminhidethisapi = (req, res) => {
    var length = 12,
        charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
        password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    User.create({
        username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }).toLowerCase(),
        plaintextpassword: password,
        password: bcrypt.hashSync(password, 8)
    }).then(userResult => {
        userResult.setRoles([1]).then(roleResult => {
            //var isSendMail = parseInt(req.body.sendmail) || 0;
            //if (isSendMail === 1) {
            //    var regmessage = "<p>";
            //    regmessage += "Hi ";
            //    regmessage += sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} });
            //    regmessage += ",";
            //    regmessage += "</p>";

            //    regmessage += "<p>A new admin account with Indo Aerospace Solution Pvt. Ltd. has been created for you.</p>";
            //    regmessage += "<p>Username: " + sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }) + "</p>";
            //    regmessage += "<p>Password: " + password;
            //    regmessage += "</p>";
            //    regmessage += "<p>We recommend you to change your account password by using Change Password option in your profile section.</p>";
            //    regmessage += "<p></p>";
            //    regmessage += "Thank You, <br/>";
            //    regmessage += "Team Indo Aerospace Solutions";
            //    send_email_message.send_email_message(sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} })
            //        , "Welcome to Indo Aerospace Solutions", regmessage);
            //}
            res.status(200).send({
                data: userResult.userid,
                message: "Success"
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//DONE
exports.forgotpassword = (req, res) => {
    User.findOne({
        where: {
            username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "User Not found." });
        }
        User.update(
            {
                password: bcrypt.hashSync(sanitizeHtml(req.body.newpassword, { allowedTags: [], allowedAttributes: {} }), 8),
                plaintextpassword: sanitizeHtml(req.body.newpassword, { allowedTags: [], allowedAttributes: {} })
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

//DONE
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
                password: bcrypt.hashSync(sanitizeHtml(req.body.newpassword, { allowedTags: [], allowedAttributes: {} }), 8),
                plaintextpassword: sanitizeHtml(req.body.newpassword, { allowedTags: [], allowedAttributes: {} })
            },
            {
                where: { userid: sanitizeHtml(req.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        ).then(passResult => {
            res.status(200).send({
                data: req.userid, message: "Success"
            });
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};



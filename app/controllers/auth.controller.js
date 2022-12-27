const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const sanitizeHtml = require('sanitize-html');

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
   
        
    console.log('the current created password is =' + password);
    User.create({
        username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }),
        email: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
        password: bcrypt.hashSync(password, 8)
    }).then(userResult => {
        userResult.setRoles([1]).then(roleResult => {
            res.status(200).send({
                data: userResult.userid,
                message: "Success"
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

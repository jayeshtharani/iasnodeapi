const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const Customer = db.customers;
const SubCustomer = db.subcustomers;
const sanitizeHtml = require('sanitize-html');

checkUserDuplicateEmail = (req, res, next) => {
    User.findOne({
        where: {
            username: sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (user) {
            return res.status(400).send({
                data: null,
                message: "Failed! User is already in use!"
            });

        }
        else {
            return next();
        }
    });
};

checkSubCustomerDuplicateEmail = (req, res, next) => {
    SubCustomer.findOne({
        where: {
            email: sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false,
            customerid: req.body.customerid
        }
    }).then(user => {
        if (user) {
            return res.status(400).send({
                data: null,
                message: "Failed! Email is already in use!"
            });
        }
        else {
            return next();
        }
    });
};

checkCustomerDuplicateCompanyName = (req, res, next) => {
    Customer.findOne({
        where: {
            companyname: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (user) {
            return res.status(400).send({
                data: null,
                message: "Failed! Company Name is already in use!"
            });
        }
        else {
            return next();
        }
    });
};

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    data: null,
                    message: "Failed! Role does not exist = " + req.body.roles[i]
                });
                return;
            }
        }
    }
    next();
};

const verifySignUp = {
    checkUserDuplicateEmail: checkUserDuplicateEmail,
    checkSubCustomerDuplicateEmail: checkSubCustomerDuplicateEmail,
    checkCustomerDuplicateCompanyName: checkCustomerDuplicateCompanyName,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;

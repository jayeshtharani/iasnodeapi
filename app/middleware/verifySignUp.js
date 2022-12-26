const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const Customer = db.customers;

checkUserDuplicateEmail = (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.companyemail,
            isdeleted: false
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                data:null,
                message: "Failed! User Email is already in use!"
            });
            return;
        }
        next();
    });
};

checkCustomerDuplicateEmail = (req, res, next) => {
    Customer.findOne({
        where: {
            companyemail: req.body.companyemail,
            isdeleted: false
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                data: null,
                message: "Failed! Customer Email is already in use!"
            });
            return;
        }
        next();
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
    checkCustomerDuplicateEmail: checkCustomerDuplicateEmail,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const sanitizeHtml = require('sanitize-html');

exports.create = (req, res) => {
    var length = 12,
        charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
        password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    console.log('the current created password is =' + password);
    User.create({
        username: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }) + " " + sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }),
        email: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
        password: bcrypt.hashSync(password, 8)
    }).then(userResult => {
        userResult.setRoles([2]).then(roleResult => {
            Customer.create({
                companyname: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
                companyphone: sanitizeHtml(req.body.companyphone, { allowedTags: [], allowedAttributes: {} }),
                companyemail: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
                companyaddress: sanitizeHtml(req.body.companyaddress, { allowedTags: [], allowedAttributes: {} }),
                cpfirstname: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }),
                cplastname: sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }),
                cpgenderid: req.body.cpgenderid,
                cpemail: sanitizeHtml(req.body.cpemail, { allowedTags: [], allowedAttributes: {} }),
                cpdob: req.body.cpdob,
                cpnotes: sanitizeHtml(req.body.cpnotes, { allowedTags: [], allowedAttributes: {} }),
                userid: userResult.userid
            }).then(custResult => {
                res.status(200).send({
                    data: custResult.customerid,
                    message: "Success"
                });
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.edit = (req, res) => {
    const { customerid } = req.params;
    Customer.findOne({
        where: {
            customerid: customerid,
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }
        User.update(
            {
                username: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }) + " " + sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }),
            },
            {
                where: { userid: sanitizeHtml(user.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        )
    }).then(ur => {
        Customer.update(
            {
                companyname: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
                companyphone: sanitizeHtml(req.body.companyphone, { allowedTags: [], allowedAttributes: {} }),
                companyaddress: sanitizeHtml(req.body.companyaddress, { allowedTags: [], allowedAttributes: {} }),
                cpfirstname: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }),
                cplastname: sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }),
                cpgenderid: req.body.cpgenderid,
                cpemail: sanitizeHtml(req.body.cpemail, { allowedTags: [], allowedAttributes: {} }),
                cpdob: req.body.cpdob,
                cpnotes: sanitizeHtml(req.body.cpnotes, { allowedTags: [], allowedAttributes: {} }),
            },
            {
                where: { customerid: customerid },
            }
        ).then(cr => {
            res.status(200).send({ data: "Customer Updated", message: "Success" });

        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

exports.getcustomer = (req, res) => {
    const { customerid } = req.params;
    Customer.findOne({
        where: {
            customerid: customerid,
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }

        var data = [];
        data.push({
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": 5,
            "TotalFolders": 5
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

exports.getcustomerprofile = (req, res) => {
    const { customerid } = req.params;

    Customer.findOne({
        where: {
            customerid: customerid,
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }

        var data = [];
        data.push({
            "CompanyName": user.companyname,
            "CompanyAddress": user.companyaddress,
            "CompanyPhone": user.companyphone,
            "CompanyEmail": user.companyemail,
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "GenderId": user.cpgenderid,
            "Email": user.cpemail,
            "DOB": user.cpdob,
            "Notes": user.cpnotes,
            "CustomerId": user.customerid,
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.dashboard = (req, res) => {
    Customer.findOne({
        where: {
            userid: req.userid,
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }
        if (!user.isactive) {
            return res.status(404).send({ data: null, message: "Customer Not active." });
        }

        var data = [];
        data.push({
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": 5,
            "TotalFolders": 5
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

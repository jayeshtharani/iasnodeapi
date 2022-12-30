const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const CustomerFiles = db.customerfiles;
const CustomerFolders = db.customerfolders;
const sanitizeHtml = require('sanitize-html');
const sequelize = require("sequelize");
exports.dashboard = (req, res) => {
    var appfiles = 0;
    var appfolders = 0;
    CustomerFiles.count({ distinct: 'customerfileid', where: { isdeleted: false } }).then(count => { appfiles = count; return appfiles; });
    CustomerFolders.count({ distinct: 'customerfolderid', where: { isdeleted: false } }).then(count => {  appfolders = count; return appfolders; });
    Customer.findAll({
        attributes: ['customerid', 'cpfirstname', 'cplastname', 'isactive', 'userid'],
        where: {
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "0 Customers found" });
        }
        var data2 = [];

        user.forEach(element => {
            data2.push({
                "FirstName": element.cpfirstname,
                "LastName": element.cplastname,
                "UserId": element.userid,
                "CustomerId": element.customerid,
                "TotalDocuments": 5,
                "TotalFolders": 5,
                "IsActive": element.isactive
            });
        });
        res.status(200).send({
            message: "Success",
            data: data2,
            "TotalDocuments": appfiles,
            "TotalFolders": appfolders,
            "TotalCustomers": user.length,
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.removecustomerfile = (req, res) => {
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(custRes => {
        if (!custRes) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }
        CustomerFiles.findOne({
            where: {
                customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                customerfileid: sanitizeHtml(req.body.customerfileid, { allowedTags: [], allowedAttributes: {} }),
                isdeleted: false
            }
        }).then(csfileRes => {
            if (!csfileRes) {
                return res.status(404).send({ data: null, message: "Customer File not found." });
            }
            CustomerFiles.update(
                {
                    isdeleted: true
                },
                {
                    where: {
                        customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                        customerfileid: sanitizeHtml(req.body.customerfileid, { allowedTags: [], allowedAttributes: {} }),
                    },
                }
            ).then(csUpateRes => {
                return res.status(404).send({ data: custRes.customerid, message: "Success." });
            });
        });
    });
};

exports.removecustomerfolder = (req, res) => {
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(custRes => {
        if (!custRes) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }
        CustomerFolders.findOne({
            where: {
                customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
                isdeleted: false
            }
        }).then(csfileRes => {
            if (!csfileRes) {
                return res.status(404).send({ data: null, message: "Customer Folder not found." });
            }
            CustomerFolders.update(
                {
                    isdeleted: true
                },
                {
                    where: {
                        customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                        customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
                    },
                }
            ).then(csUpateRes => {
                CustomerFiles.update(
                    {
                        isdeleted: true
                    },
                    {
                        where: {
                            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                            customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
                        },
                    }
                ).then(fsResult => {

                    return res.status(404).send({ data: custRes.customerid, message: "Success." });
                });
            });
        });
    });
};

exports.actdeactuser = (req, res) => {
    User.findOne({
        where: {
            userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }
        User.update(
            {
                isactive: req.body.statusflag
            },
            {
                where: { userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        ).then(ur => {
            Customer.update(
                {
                    isactive: req.body.statusflag
                },
                {
                    where: { userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }) },
                }
            ).then(cr => {
                res.status(200).send({ data: "Status Updated", message: "Success" });

            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

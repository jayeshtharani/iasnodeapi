const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const CustomerFolders = db.customerfolders;
const CustomerFiles = db.customerfiles;
const sanitizeHtml = require('sanitize-html');


exports.dashboard = (req, res) => {
    Customer.findAll({
        attributes: ['customerid', 'cpfirstname', 'cplastname', 'isactive','userid'],
        where: {
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "0 Customers found" });
        }

        var data2 = [];
        data2.push({
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "UserId": user.userid,
            "CustomerId": user.customerid,
            "TotalDocuments": 5,
            "TotalFolders": 5
        });
        res.status(200).send({
            message: "Success",
            data: user,
            "TotalDocuments": 5,
            "TotalFolders": 5,
            "TotalCustomers": user.length,
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
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


        CustomerFolders.create({
            foldername: sanitizeHtml(req.body.foldername, { allowedTags: [], allowedAttributes: {} }),
            customerid: user.customerid,
        }).then(userResult => {
            res.status(200).send({ data: userResult.customerfolderid, message: "Success" });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


exports.createfolder = (req, res) => {
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }

        CustomerFolders.create({
            foldername: sanitizeHtml(req.body.foldername, { allowedTags: [], allowedAttributes: {} }),
            customerid: user.customerid,
        }).then(userResult => {
            res.status(200).send({ data: userResult.customerfolderid, message: "Success" });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

exports.createfile = (req, res) => {
    Customer.findOne({
        where: {
            customerid: req.body.customerid,
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }
        CustomerFiles.create({
            customerfilepath: 'aa',
            customerfilename: 'aa',
            filetags: req.body.filetags,
            customerfolderid: req.body.customerfolderid,
            customerid: user.customerid,
        }).then(userResult => {
            res.status(200).send({ data: userResult.customerfileid, message: "Success" });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};


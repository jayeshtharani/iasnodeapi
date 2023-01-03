const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const CustomerFiles = db.customerfiles;
const CustomerFolders = db.customerfolders;
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const path = require('path');
const os = require('os');
var url = require('url');
const URL_PROFILEPIC = 'http://localhost:8080/uploads/profilepic/';
const URL_FILES = 'http://localhost:8080/uploads/files/';
const uploadFilesFolder = path.join(__dirname, "../uploads", "files");
const uploadProfilePicFolder = path.join(__dirname, "../uploads", "profilepic");


exports.dashboard = (req, res) => {

    var custfiles = [];
    var custfolders = [];
    db.sequelize.query('SELECT customerfiles.customerfileid,customerfiles.customerfilepath,customerfiles.customerid FROM customerfiles inner join customers on customers.customerid=customerfiles.customerid inner join users  on users.userid=customers.userid where customerfiles.isdeleted=false and users.isdeleted=false and customers.isdeleted=false',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
        }
    ).then(function (response) {
        response.forEach(element => {
            var custfilepath = "";
            if (element.customerfilepath) {
                if (fs.existsSync(uploadFilesFolder + "/" + element.customerfilepath)) {
                    custfilepath = URL_FILES + element.customerfilepath;
                }
                else {
                    custfilepath = "";
                }
            }
            if (custfilepath) {
                custfiles.push({
                    "customerfilenameonly": element.customerfilepath,
                    "customerfilepath": custfilepath,
                    "customerfileid": element.customerfileid,
                    "customerid": element.customerid,
                });
            }
        });
    });


    db.sequelize.query('SELECT customerfolders.customerfolderid,customerfolders.foldername FROM docmanager.customerfolders inner join docmanager.customers on customers.customerid = customerfolders.customerid inner join docmanager.users  on users.userid = customers.userid where customerfolders.isdeleted = false and users.isdeleted = false and customers.isdeleted = false',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
           
        }
    ).then(function (response) {
        response.forEach(element => {
            custfolders.push({
                "customerfolderid": element.customerfolderid,
                "foldername": element.foldername,
            });
        });
    });

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
            var intcustfilecount = 0;
            custfiles.find((value, index) => {
                if (value.customerid === element.customerid) {

                    if (value.customerfilepath) {
                        intcustfilecount++;
                    }
                }
            });
            data2.push({
                "FirstName": element.cpfirstname,
                "LastName": element.cplastname,
                "UserId": element.userid,
                "CustomerId": element.customerid,
                "TotalDocuments": intcustfilecount,
                "IsActive": element.isactive
            });
        });
       
        res.status(200).send({
            message: "Success",
            data: data2,
            "TotalDocuments": custfiles.length,
            "TotalFolders": custfolders.length,
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
                return res.status(200).send({ data: custRes.customerid, message: "Success." });
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

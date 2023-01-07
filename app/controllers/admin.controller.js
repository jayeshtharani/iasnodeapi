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
const uploadFilesFolder = path.join(__dirname, "../uploads", "files");
const Op = db.Sequelize.Op;

exports.dashboard = (req, res) => {
    var q_offset = 0;
    var q_limit = 5;
    var searchname = '';
    if (req.query) {
        if (req.query.offset) {
            q_offset = parseInt(req.query.offset) || 0;
        }
        if (req.query.limit) {
            q_limit = parseInt(req.query.limit) || 5;
        }
        if (req.query.searchname && req.query.searchname.length > 0) {
            searchname = req.query.searchname;
        }
    }
    var custfiles = [];
    var custfolders = [];
    var t_cust = [];
    var t_users=[];

    db.sequelize.query('SELECT customers.customerid FROM customers where customers.isdeleted=false',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
        }
    ).then(function (response) {
        t_cust = response;

    });

    db.sequelize.query('SELECT users.userid,users.plaintextpassword FROM users where users.isdeleted=false',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
        }
    ).then(function (response) {
        t_users = response;

    });

    db.sequelize.query('SELECT customerfiles.filetags, customerfiles.customerfileid,customerfiles.customerfilepath,customerfiles.customerid FROM customerfiles inner join customers on customers.customerid=customerfiles.customerid inner join users  on users.userid=customers.userid where customerfiles.isdeleted=false and users.isdeleted=false and customers.isdeleted=false order by customerfiles.updatedAt desc',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
        }
    ).then(function (response) {
        response.forEach(element => {
            var custfilepath = "";
            if (element.customerfilepath) {
                if (fs.existsSync(uploadFilesFolder + "/" + element.customerfilepath)) {
                    custfilepath = element.customerfilepath;
                }
                else {
                    custfilepath = "";
                }
            }
            if (custfilepath) {
                custfiles.push({
                    "customerfilename": element.customerfilename,
                    "customerfilepath": custfilepath,
                    "customerfileid": element.customerfileid,
                    "customerid": element.customerid,
                    "filetags": element.filetags,
                });
            }
        });
    });
    db.sequelize.query('SELECT customerfolders.customerfolderid,customerfolders.foldername FROM docmanager.customerfolders inner join docmanager.customers on customers.customerid = customerfolders.customerid inner join docmanager.users  on users.userid = customers.userid where customerfolders.isdeleted = false and users.isdeleted = false and customers.isdeleted = false order by customerfolders.updatedAt desc',
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

    //if
    if (searchname.length > 0) {
        console.log('in if');
        console.log(searchname);
        Customer.findAndCountAll({
            attributes: ['customerid', 'cpfirstname', 'cplastname', 'isactive', 'userid'],
            offset: q_offset,//page number starts from 0
            limit: q_limit,
            where: {
                isdeleted: false,
                [Op.or]: [
                    {
                        cpfirstname: { [Op.substring]: searchname },
                    },
                    {
                        cplastname: { [Op.substring]: searchname },
                    },
                ]
            },
            order: [
                ['updatedAt', 'DESC']
            ],
        }).then(user => {
            if (!user) {
                return res.status(404).send({ data: null, message: "0 Customers found" });
            }
            var data2 = [];
            user.rows.forEach(element => {
                var intcustfilecount = 0;
                custfiles.find((value, index) => {
                    if (value.customerid === element.customerid) {
                        if (value.customerfilepath) {
                            intcustfilecount++;
                        }
                    }
                });
                var cid_uid = t_users.find(c => c.userid  === element.userid);
                data2.push({
                    "FirstName": element.cpfirstname,
                    "LastName": element.cplastname,
                    "UserId": element.userid,
                    "CustomerId": element.customerid,
                    "TotalDocuments": intcustfilecount,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword
                });
            });
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": t_cust.length,
                "TotalDocuments": custfiles.length,
                "TotalFolders": custfolders.length,
                "CurrentPage": q_offset,
                "TotalPages": Math.ceil(user.count / q_limit)
            });
        }).catch(err => {
            res.status(500).send({ data: null, message: err.message });
        });
    }


    else {
        Customer.findAndCountAll({
            attributes: ['customerid', 'cpfirstname', 'cplastname', 'isactive', 'userid'],
            offset: q_offset,//page number starts from 0
            limit: q_limit,
            where: {
                isdeleted: false,
            },
            order: [
                ['updatedAt', 'DESC']
            ],
        }).then(user => {
            if (!user) {
                return res.status(404).send({ data: null, message: "0 Customers found" });
            }
            var data2 = [];
            user.rows.forEach(element => {
                var intcustfilecount = 0;
                custfiles.find((value, index) => {
                    if (value.customerid === element.customerid) {
                        if (value.customerfilepath) {
                            intcustfilecount++;
                        }
                    }
                });
                var cid_uid = t_users.find(c => c.userid === element.userid);
                data2.push({
                    "FirstName": element.cpfirstname,
                    "LastName": element.cplastname,
                    "UserId": element.userid,
                    "CustomerId": element.customerid,
                    "TotalDocuments": intcustfilecount,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword
                });
            });
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": user.count,
                "TotalDocuments": custfiles.length,
                "TotalFolders": custfolders.length,
                "CurrentPage": q_offset,
                "TotalPages": Math.ceil(user.count / q_limit)
            });
        }).catch(err => {
            res.status(500).send({ data: null, message: err.message });
        });
    }
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

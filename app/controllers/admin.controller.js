const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const CustomerFiles = db.customerfiles;
//const CustomerFolders = db.customerfolders;
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const path = require('path');
const os = require('os');
var url = require('url');
const uploadFilesFolder = path.join(__dirname, "../uploads", "files");
const Op = db.Sequelize.Op;
var bcrypt = require("bcryptjs");
const uploadProfilePicFolder = path.join(__dirname, "../uploads", "profilepic");

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
    //var custfolders = [];
    var t_cust = [];
    var t_users = [];

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
    //Folder logic needs to be commented 8 Jan 2023
    //db.sequelize.query('SELECT customerfolders.customerfolderid,customerfolders.foldername FROM docmanager.customerfolders inner join docmanager.customers on customers.customerid = customerfolders.customerid inner join docmanager.users  on users.userid = customers.userid where customerfolders.isdeleted = false and users.isdeleted = false and customers.isdeleted = false order by customerfolders.updatedAt desc',
    //    {
    //        raw: false,
    //        type: db.sequelize.QueryTypes.SELECT,

    //    }
    //).then(function (response) {
    //    response.forEach(element => {
    //        custfolders.push({
    //            "customerfolderid": element.customerfolderid,
    //            "foldername": element.foldername,
    //        });
    //    });
    //});


    if (searchname.length > 0) {
        Customer.findAndCountAll({
            attributes: ['customerid', 'companyname', 'companyemail', 'isactive', 'userid', 'profilepic'],
            offset: q_offset,//page number starts from 0
            limit: q_limit,
            where: {
                isdeleted: false,
                [Op.or]: [
                    {
                        companyname: { [Op.substring]: searchname },
                    },
                    {
                        companyemail: { [Op.substring]: searchname },
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

                var profilepic = "";
                if (element.profilepic) {
                    if (fs.existsSync(uploadProfilePicFolder + "/" + element.profilepic)) {

                        const ext = (uploadProfilePicFolder + "/" + element.profilepic).split('.').filter(Boolean).slice(1).join('.');
                        var bitmap = "data:image/" + ext;
                        bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + "/" + element.profilepic, 'base64', 'utf-8');
                        profilepic = bitmap;
                    }
                    else {
                        profilepic = "";
                    }
                }

                var cid_uid = t_users.find(c => c.userid === element.userid);
                data2.push({
                    "CompanyName": element.companyname,
                    "CompanyEmail": element.companyemail,
                    "UserId": element.userid,
                    "CustomerId": element.customerid,
                    "TotalDocuments": intcustfilecount,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword,
                    "ProfilePic": profilepic
                });
            });
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": t_cust.length,
                "TotalDocuments": custfiles.length,
                //"TotalFolders": custfolders.length,
                "CurrentPage": q_offset,
                "TotalPages": Math.ceil(user.count / q_limit)
            });
        }).catch(err => {
            res.status(500).send({ data: null, message: err.message });
        });
    }


    else {
        Customer.findAndCountAll({
            attributes: ['customerid', 'companyname', 'companyemail', 'isactive', 'userid', 'profilepic'],
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
                var profilepic = "";
                if (element.profilepic) {
                    if (fs.existsSync(uploadProfilePicFolder + "/" + element.profilepic)) {

                        const ext = (uploadProfilePicFolder + "/" + element.profilepic).split('.').filter(Boolean).slice(1).join('.');
                        var bitmap = "data:image/" + ext;
                        bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + "/" + element.profilepic, 'base64', 'utf-8');
                        profilepic = bitmap;
                    }
                    else {
                        profilepic = "";
                    }
                }

                data2.push({
                    "CompanyName": element.companyname,
                    "CompanyEmail": element.companyemail,
                    "UserId": element.userid,
                    "CustomerId": element.customerid,
                    "TotalDocuments": intcustfilecount,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword,
                    "ProfilePic": profilepic
                });
            });
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": user.count,
                "TotalDocuments": custfiles.length,
                //"TotalFolders": custfolders.length,
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


exports.setcustomerpassword = (req, res) => {
    db.sequelize.query('select customers.customerid, users.userid from customers inner join users on users.userid = customers.userid where customers.isdeleted = false and users.isdeleted = false and customers.customerid = :customerid and users.userid = :userid',
        {
            raw: true,
            type: db.sequelize.QueryTypes.SELECT,
            replacements: {
                customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
                userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} })
            }

        }
    ).then(function (response) {
        if (!response) {
            return res.status(404).send({ data: null, message: "Inavlid Customer and UserId" });
        }

        if (response.length === 0) {
            return res.status(404).send({ data: null, message: "Inavlid Customer and UserId" });
        }
        User.findOne({
            where: {
                userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }),
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
                    where: { userid: user.userid },
                }
            ).then(passResult => {
                res.status(200).send({
                    data: user.userid, message: "Success"
                });
            });

        });
    });
};


//Folder logic needs to be commented 8 Jan 2023
//exports.removecustomerfolder = (req, res) => {
//    Customer.findOne({
//        where: {
//            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
//            isdeleted: false
//        }
//    }).then(custRes => {
//        if (!custRes) {
//            return res.status(404).send({ data: null, message: "Customer Not found." });
//        }
//        CustomerFolders.findOne({
//            where: {
//                customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
//                customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
//                isdeleted: false
//            }
//        }).then(csfileRes => {
//            if (!csfileRes) {
//                return res.status(404).send({ data: null, message: "Customer Folder not found." });
//            }
//            CustomerFolders.update(
//                {
//                    isdeleted: true
//                },
//                {
//                    where: {
//                        customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
//                        customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
//                    },
//                }
//            ).then(csUpateRes => {
//                CustomerFiles.update(
//                    {
//                        isdeleted: true
//                    },
//                    {
//                        where: {
//                            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
//                            customerfolderid: sanitizeHtml(req.body.customerfolderid, { allowedTags: [], allowedAttributes: {} }),
//                        },
//                    }
//                ).then(fsResult => {

//                    return res.status(404).send({ data: custRes.customerid, message: "Success." });
//                });
//            });
//        });
//    });
//};

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
                return res.status(200).send({ data: "Status Updated", message: "Success" });

            });
        });
    }).catch(err => {
        return res.status(500).send({ data: null, message: err.message });
    });
};

exports.removeuser = (req, res) => {
    Customer.findOne({
        where: {
            userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }),
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} })
            ,isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }
        User.update(
            {
                isdeleted: true
            },
            {
                where: { userid: user.userid },
            }
        ).then((uupdres) => {
            Customer.update(
                {
                    isdeleted: true
                },
                {
                    where: {
                        userid: sanitizeHtml(user.userid, { allowedTags: [], allowedAttributes: {} }),
                        customerid: sanitizeHtml(user.customerid, { allowedTags: [], allowedAttributes: {} }),
                    },
                }
            ).then((cusupdres) => {
                CustomerFiles.update(
                    {
                        isdeleted: true
                    },
                    {
                        where: {
                            customerid: sanitizeHtml(user.customerid, { allowedTags: [], allowedAttributes: {} }),
                        },
                    }).then(fres => {
                        return res.status(200).send({ data: user.companyemail + " User Removed", message: "Success" });
                    });
            });
        });
    }).catch(err => {
        return res.status(500).send({ data: null, message: err.message });
    });
};

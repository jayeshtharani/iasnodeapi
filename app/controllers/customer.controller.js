const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const CustomerFiles = db.customerfiles;
const CustomerFolders = db.customerfolders;
var bcrypt = require("bcryptjs");
const sanitizeHtml = require('sanitize-html');
const formidable = require('formidable');
const path = require('path');
const uploadFilesFolder = path.join(__dirname, "../uploads", "files");
const uploadProfilePicFolder = path.join(__dirname, "../uploads", "profilepic");
const fs = require('fs');
const os = require('os');
var url = require('url');
const send_email_message = require('../middleware/emailer');

const isFileValidProfilePic = (file) => {
    const type = path.extname(file.originalFilename);
    const validTypes = [".jpg", ".jpeg", ".png"];
    if (validTypes.indexOf(type) === -1) {
        return false;
    }
    return true;
};

const isFileValid = (file) => {
    const type = path.extname(file.originalFilename);
    const validTypes = [".pdf", ".pdfx", ".doc", ".docx"];
    if (validTypes.indexOf(type) === -1) {
        return false;
    }
    return true;
};


exports.uploadprofilepic = (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.multiples = false;
        form.maxFileSize = 5 * 1024 * 1024;
        form.maxFiles = 1;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).send({ data: null, message: err });
            }
            var yourDate = new Date();
            var epochTicks = 621355968000000000;
            var ticksPerMillisecond = 10000;
            var yourTicks = epochTicks + (yourDate.getTime() * ticksPerMillisecond);

            try {
                if (!files.myfile.length) {
                    Customer.findOne({
                        where: {
                            customerid: fields.customerid,
                            isdeleted: false
                        }
                    }).then(custResult => {

                        if (!custResult) {
                            return res.status(404).send({ data: null, message: "Customer not found" });
                        }

                        const file = files.myfile;
                        const isValid = isFileValidProfilePic(file);
                        if (!isValid) {
                            return res.status(400).send({ data: null, message: "The file type is not a valid type", });
                        }

                        var oldPath = file.filepath;
                        var rawData = fs.readFileSync(oldPath);
                        var newPathTemp = path.join(uploadProfilePicFolder, file.originalFilename);
                        var originalfileNamewithoutextension = path.parse(newPathTemp).name;
                        var originalfileNameextension = path.extname(newPathTemp);
                        var newFilename = originalfileNamewithoutextension + "_" + yourTicks + originalfileNameextension;
                        var newPath = path.join(uploadProfilePicFolder, newFilename);

                        fs.writeFile(newPath, rawData, function (err) {
                            if (err) {
                                return res.status(400).send({ data: null, message: err });
                            }
                            Customer.update(
                                {
                                    profilepic: newFilename,
                                },
                                {
                                    where: { customerid: custResult.customerid },
                                }
                            )

                            const ext = (newPath).split('.').filter(Boolean).slice(1).join('.');
                            var bitmap = "data:image/" + ext;
                            bitmap += ";base64," + fs.readFileSync(newPath, 'base64', 'utf-8');
                            return res.status(200).send({ data: bitmap, message: "Success" });
                        });
                    });
                }
            }
            catch (e) {
                return res.status(500).send({ data: null, message: e.message + " Missing Parameters myfile and customerid" });
            }
        });
    }
    catch (e) {
        return res.status(500).send({ data: null, message: e.message });
    }

};

exports.createfile = (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.multiples = false;
        form.maxFileSize = 30 * 1024 * 1024;
        form.maxFiles = 1;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).send({ data: null, message: err });
            }
            var yourDate = new Date();
            var epochTicks = 621355968000000000;
            var ticksPerMillisecond = 10000;
            var yourTicks = epochTicks + (yourDate.getTime() * ticksPerMillisecond);

            try {
                if (!files.myfile.length) {
                    Customer.findOne({
                        where: {
                            customerid: fields.customerid,
                            isdeleted: false
                        }
                    }).then(custResult => {

                        if (!custResult) {
                            return res.status(404).send({ data: null, message: "Customer not found" });
                        }

                        const file = files.myfile;
                        const isValid = isFileValid(file);
                        if (!isValid) {
                            return res.status(400).send({ data: null, message: "The file type is not a valid type", });
                        }

                        var oldPath = file.filepath;
                        var rawData = fs.readFileSync(oldPath);
                        var newPathTemp = path.join(uploadFilesFolder, file.originalFilename);
                        var originalfileNamewithoutextension = path.parse(newPathTemp).name;
                        var originalfileNameextension = path.extname(newPathTemp);
                        var newFilename = originalfileNamewithoutextension + "_" + yourTicks + originalfileNameextension;
                        var newPath = path.join(uploadFilesFolder, newFilename);

                        fs.writeFile(newPath, rawData, function (err) {
                            if (err) {
                                return res.status(400).send({ data: null, message: err });
                            }

                            if (fields.customerfolderid) {
                                CustomerFolders.findOne({
                                    where: {
                                        customerid: fields.customerid,
                                        customerfolderid: fields.customerfolderid,
                                        isdeleted: false
                                    }
                                }).then(custFoldRes => {
                                    if (!custFoldRes) {
                                        return res.status(400).send({ data: null, message: "Customer Folder doesn't exists", });
                                    }

                                    CustomerFiles.create({
                                        customerfolderid: custFoldRes.customerfolderid,
                                        customerfilepath: newFilename,
                                        customerid: custResult.customerid,
                                        customerfilename: sanitizeHtml(fields.customerfilename, { allowedTags: [], allowedAttributes: {} }),
                                        filetags: sanitizeHtml(fields.filetags, { allowedTags: [], allowedAttributes: {} }),
                                    }).then(fileResult => {
                                        return res.status(200).send({ data: newFilename, message: "Success" });
                                    });
                                });
                            }
                            else {
                                CustomerFiles.create({
                                    customerfolderid: '',
                                    customerfilepath: newFilename,
                                    customerid: custResult.customerid,
                                    customerfilename: sanitizeHtml(fields.customerfilename, { allowedTags: [], allowedAttributes: {} }),
                                    filetags: sanitizeHtml(fields.filetags, { allowedTags: [], allowedAttributes: {} }),
                                }).then(fileResult => {
                                    return res.status(200).send({ data: newFilename, message: "Success" });
                                });
                            }
                        });
                    });
                }
            }
            catch (e) {
                return res.status(500).send({ data: null, message: e.message + " Missing Parameters myfile and customerid" });
            }
        });
    }
    catch (e) {
        return res.status(500).send({ data: null, message: e.message });
    }


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

exports.create = (req, res) => {
    var length = 12,
        charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
        password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

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
                userid: userResult.userid,
                profilepic: ''
            }).then(custResult => {

                var regmessage = "<p>";
                regmessage += "Hi ";
                regmessage += sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} });
                regmessage += ",";
                regmessage += "</p>";

                regmessage += "<p>A new customer account with Indo Aerospace Solution Pvt. Ltd.has been created for you.</p>";
                regmessage += "<p>Email: " + sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }) + "</p>";
                regmessage += "<p>Credentials: " + password;
                regmessage += "</p>";

                regmessage += "<p></p>";
                regmessage += "Thank You, <br/>";
                regmessage += "ISAPL";
                send_email_message.send_email_message(sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} })
                    , "Welcome to IASPL!", regmessage);
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

exports.getfolders = (req, res) => {
    const { customerid } = req.params;
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }
        CustomerFolders.findAll({
            attributes: ['customerfolderid', 'foldername'],
            where: {
                isdeleted: false
            }, order: [
                ['updatedAt', 'DESC']
            ]
        }).then(folderRes => {
            if (!folderRes) {
                return res.status(404).send({ data: null, message: "0 folders found" });
            }
            var data2 = [];
            folderRes.forEach(element => {
                data2.push({
                    "customerfolderid": element.customerfolderid,
                    "foldername": element.foldername,

                });
            });
            res.status(200).send({
                message: "Success",
                data: data2,
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

exports.downloadfile = (req, res) => {
    const { customerfileid } = req.params;
    CustomerFiles.findOne({
        where: {
            customerfileid: sanitizeHtml(customerfileid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "File not found" });
        }
        if (fs.existsSync(uploadFilesFolder + "/" + user.customerfilepath)) {
            const fileaa = uploadFilesFolder + "/" + user.customerfilepath;
            return res.download(fileaa);
        } else {
            return res.status(404).send({ data: null, message: "File not found" });
        }
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });;
};
exports.getcustomer = (req, res) => {
    const { customerid } = req.params;
    var custfolders = [];
    var custfiles = [];

    CustomerFolders.findAll({
        attributes: ['customerfolderid', 'foldername'],
        where: {
            isdeleted: false,
            customerid: customerid
        }, order: [
            ['updatedAt', 'DESC']
        ]
    }).then(cfolder => {

        cfolder.forEach(element => {
            custfolders.push({
                "customerfolderid": element.customerfolderid,
                "foldername": element.foldername,
            });
        });
        return custfolders;

    });

    CustomerFiles.findAll({
        attributes: ['customerfileid', 'customerfilepath', 'filetags', 'customerfolderid', 'customerfilename', 'createdAt'],
        where: {
            isdeleted: false,
            customerid: customerid
        }, order: [
            ['updatedAt', 'DESC']
        ]
    }).then(cf => {
        cf.forEach(element => {
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
                    "customerfilepath": custfilepath,
                    "customerfilename": element.customerfilename,
                    "customerfileid": element.customerfileid,
                    "filetags": element.filetags,
                    "customerfolderid": element.customerfolderid,
                    "createdat": element.createdAt
                });
            }


        });
        return custfiles;
    });

    Customer.findOne({
        where: {
            customerid: sanitizeHtml(customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }
        var profilepic = "";
        if (user.profilepic) {
            if (fs.existsSync(uploadProfilePicFolder + "/" + user.profilepic)) {

                const ext = (uploadProfilePicFolder + "/" + user.profilepic).split('.').filter(Boolean).slice(1).join('.');
                var bitmap = "data:image/" + ext;
                bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + "/" + user.profilepic, 'base64', 'utf-8');
                profilepic = bitmap;
            }
            else {
                profilepic = "";
            }
        }
        var data = [];
        data.push({
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": custfiles.length,
            "TotalFolders": custfolders.length,
            "ProfilePic": profilepic,
            "Folders": custfolders,
            "Files": custfiles,
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
            customerid: sanitizeHtml(customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }
        var profilepic = "";
        if (user.profilepic) {
            if (fs.existsSync(uploadProfilePicFolder + "/" + user.profilepic)) {
                const ext = (uploadProfilePicFolder + "/" + user.profilepic).split('.').filter(Boolean).slice(1).join('.');
                var bitmap = "data:image/" + ext;
                bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + "/" + user.profilepic, 'base64', 'utf-8');
                profilepic = bitmap;
            }
            else {
                profilepic = "";
            }
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
            "ProfilePic": profilepic
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
    var custfolders = [];
    var custfiles = [];
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
    });


    db.sequelize.query('SELECT customerfolders.customerfolderid, customerfolders.foldername FROM customerfolders inner join customers on customers.customerid = customerfolders.customerid inner join users  on users.userid = customers.userid where customerfolders.isdeleted = false and users.isdeleted = false and users.isactive = true and customers.isdeleted = false and customers.isactive = true and users.userid = :userid order by customerfolders.updatedAt desc',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
            replacements: { userid: req.userid },
        }
    ).then(function (response) {
        response.forEach(element => {
            custfolders.push({
                "customerfolderid": element.customerfolderid,
                "foldername": element.foldername,
            });
        });
    });


    db.sequelize.query('SELECT customerfiles.createdAt,customerfiles.customerfileid,customerfiles.filetags,customerfiles.customerfilepath,customerfiles.customerfilename,customerfiles.customerfolderid FROM docmanager.customerfiles inner join docmanager.customers on customers.customerid=customerfiles.customerid inner join docmanager.users  on users.userid=customers.userid where customerfiles.isdeleted=false and users.isdeleted=false and users.isactive=true and customers.isdeleted=false and customers.isactive=true and users.userid= :userid order by customerfiles.updatedAt desc',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
            replacements: { userid: req.userid },
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
                    "customerfilepath": custfilepath,
                    "customerfileid": element.customerfileid,
                    "filetags": element.filetags,
                    "customerfolderid": element.customerfolderid,
                    "customerfilename": element.customerfilename,
                    "createdat":element.createdAt
                });
            }

        });
    });

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
        var profilepic = "";
        if (user.profilepic) {
            if (fs.existsSync(uploadProfilePicFolder + "/" + user.profilepic)) {
                const ext = (uploadProfilePicFolder + "/" + user.profilepic).split('.').filter(Boolean).slice(1).join('.');
                var bitmap = "data:image/" + ext;
                bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + "/" + user.profilepic, 'base64', 'utf-8');
                profilepic = bitmap;
            }
            else {
                profilepic = "";
            }
        }
        var data = [];
        data.push({
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": custfiles.length,
            "TotalFolders": custfolders.length,
            "ProfilePic": profilepic,
            "Folders": custfolders,
            "Files": custfiles,
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

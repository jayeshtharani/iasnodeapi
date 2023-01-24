const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const path = require('path');
const os = require('os');
var url = require('url');
const uploadFilesFolder = path.join(__dirname, "../uploads", "files");
const Op = db.Sequelize.Op;
var bcrypt = require("bcryptjs");
const uploadProfilePicFolder = path.join(__dirname, "../uploads", "profilepic");
const dirTree = require("directory-tree");


const getAllDirFiles = function (dirPath, arrayOfFiles) {
    var pjoiner;
    if (process.platform === "win32") {
        pjoiner = "\\";
    }
    else {
        pjoiner = "/";
    }
    files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + pjoiner + file).isDirectory()) {
            arrayOfFiles = getAllDirFiles(dirPath + pjoiner + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(file)
        }
    });
    return arrayOfFiles;
};

const getAllDir = function (dirpath) {
    var alldirs = [];
    var ctree = dirTree(dirpath, null, null, (item, path, stats) => {
        alldirs.push(item.path);
    });
    return alldirs;
};

const getFileNameMatching = function (dirpath, withfilename) {
    var allfilesindirs = getAllDirFiles(dirpath);
    var files_last_cahr = [];
    var files_last_cahr_ints = [];
    for (const name of allfilesindirs) {
        var onlynamewithoutext = path.parse(name).name;
        var withfilenamewithoutext = path.parse(withfilename).name;
        if (onlynamewithoutext.startsWith(withfilenamewithoutext)) {
            var lastfilechar = onlynamewithoutext.slice(-1);
            files_last_cahr.push(lastfilechar);
        }
    }
    var isInteger = /^[0-9]\d*$/;
    for (const arvalue of files_last_cahr) {
        if (isInteger.test(arvalue)) {
            files_last_cahr_ints.push(arvalue);
        }
    }
    if (files_last_cahr_ints.length === 0) {
        return 0;
    }
    else {
        return Math.max(...files_last_cahr_ints);
    }

};

exports.dashboard = (req, res) => {
    var pjoiner;
    if (process.platform === "win32") {
        pjoiner = "\\";
    }
    else {
        pjoiner = "/";
    }
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
    //var custfiles = [];
    //var custfolders = [];
    //var t_cust = [];
    var t_users = [];

    //db.sequelize.query('SELECT customers.customerid FROM customers where customers.isdeleted=false',
    //    {
    //        raw: false,
    //        type: db.sequelize.QueryTypes.SELECT,
    //    }
    //).then(function (response) {
    //    t_cust = response;

    //});

    db.sequelize.query('SELECT users.userid,users.plaintextpassword FROM users where users.isdeleted=false',
        {
            raw: false,
            type: db.sequelize.QueryTypes.SELECT,
        }
    ).then(function (response) {
        t_users = response;

    });

    if (searchname.length > 0) {
        Customer.findAndCountAll({
            attributes: ['customerid', 'companyname', 'companyemail', 'isactive', 'userid', 'profilepic', 'rootfoldername'],
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
                var custFolderPath = path.join(uploadFilesFolder, element.rootfoldername);
                var allfiles_r = getAllDirFiles(custFolderPath);
                var profilepic = "";
                if (element.profilepic) {
                    if (fs.existsSync(uploadProfilePicFolder + pjoiner + element.profilepic)) {

                        const ext = (uploadProfilePicFolder + pjoiner + element.profilepic).split('.').filter(Boolean).slice(1).join('.');
                        var bitmap = "data:image/" + ext;
                        bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + pjoiner + element.profilepic, 'base64', 'utf-8');
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
                    "TotalDocuments": allfiles_r.length,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword,
                    "ProfilePic": profilepic
                });
            });

            var app_custFolderPath = uploadFilesFolder;
            var app_allfiles_r = getAllDirFiles(app_custFolderPath);
            var app_alldir_r = getAllDir(app_custFolderPath);
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": user.count,
                "TotalDocuments": app_allfiles_r.length,
                "TotalFolders": app_alldir_r.length == 0 ? 0 : app_alldir_r.length - 1,
                "CurrentPage": q_offset,
                "TotalPages": Math.ceil(user.count / q_limit)
            });


        }).catch(err => {
            res.status(500).send({ data: null, message: err.message });
        });
    }


    else {
        Customer.findAndCountAll({
            attributes: ['customerid', 'companyname', 'companyemail', 'isactive', 'userid', 'profilepic', 'rootfoldername'],
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
                var custFolderPath = path.join(uploadFilesFolder, element.rootfoldername);
                var allfiles_r = getAllDirFiles(custFolderPath);
                var cid_uid = t_users.find(c => c.userid === element.userid);
                var profilepic = "";
                if (element.profilepic) {
                    if (fs.existsSync(uploadProfilePicFolder + pjoiner + element.profilepic)) {

                        const ext = (uploadProfilePicFolder + pjoiner + element.profilepic).split('.').filter(Boolean).slice(1).join('.');
                        var bitmap = "data:image/" + ext;
                        bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + pjoiner + element.profilepic, 'base64', 'utf-8');
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
                    "TotalDocuments": allfiles_r.length,
                    "IsActive": element.isactive,
                    "PlainTextPassword": cid_uid.plaintextpassword,
                    "ProfilePic": profilepic
                });
            });

            var app_custFolderPath = uploadFilesFolder;
            var app_allfiles_r = getAllDirFiles(app_custFolderPath);
            var app_alldir_r = getAllDir(app_custFolderPath);
            res.status(200).send({
                message: "Success",
                data: data2,
                "TotalCustomers": user.count,
                "TotalDocuments": app_allfiles_r.length,
                "TotalFolders": app_alldir_r.length == 0 ? 0 : app_alldir_r.length - 1,
                "CurrentPage": q_offset,
                "TotalPages": Math.ceil(user.count / q_limit)
            });
        }).catch(err => {
            res.status(500).send({ data: null, message: err.message });
        });
    }
};


//DONE
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
        var custFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }));

        if (!sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }).startsWith(custRes.rootfoldername)) {
            return res.status(404).send({ data: null, message: "Invalid Path" });
        }

        fs.unlink(custFolderPath, (err) => {
            if (err) {

                return res.status(404).send({ data: null, message: "File not found" });
            }
            return res.status(200).send({ data: "Customer file removed", message: "Success." });
        });
    });
};


//DONE
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


//DONE
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
        var custFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }));

        if (sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }) == custRes.rootfoldername) {
            return res.status(404).send({ data: null, message: "Root folder cannot be removed" });
        }
        fs.rm(custFolderPath, { recursive: true }, (err) => {
            if (err) {
                return res.status(404).send({ data: null, message: "Folder not found" });
            }
            return res.status(200).send({ data: "Folder Removed", message: "Success" });
        });
    });
};


exports.renamecustomerfolder = (req, res) => {
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(custRes => {
        if (!custRes) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }

        if (sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }) == custRes.rootfoldername) {
            return res.status(404).send({ data: null, message: "Root folder cannot be renamed" });
        }

        var custFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }));

        if (!fs.existsSync(custFolderPath)) {
            return res.status(404).send({ data: null, message: "Folder not found" });
        }

        var renamedcustFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.newfolderpathwithname, { allowedTags: [], allowedAttributes: {} }));


        if (!sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }).startsWith(custRes.rootfoldername)) {
            return res.status(404).send({ data: null, message: "Invalid Complete Path" });
        }

        if (!sanitizeHtml(req.body.newfolderpathwithname, { allowedTags: [], allowedAttributes: {} }).startsWith(custRes.rootfoldername)) {
            return res.status(404).send({ data: null, message: "Inavlid new folder path" });
        }

        if (fs.existsSync(renamedcustFolderPath)) {
            return res.status(404).send({ data: null, message: "Folder with same name already exists" });
        }

        fs.rename(custFolderPath, renamedcustFolderPath, function (err) {
            if (err) {
                return res.status(404).send({ data: null, message: err });
            } else {
                return res.status(200).send({ data: "Folder Renamed", message: "Success" });
            }
        });
    });
};



exports.renamecustomerfile = (req, res) => {
    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(custRes => {
        if (!custRes) {
            return res.status(404).send({ data: null, message: "Customer Not found." });
        }

        if (sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }) == custRes.rootfoldername) {
            return res.status(404).send({ data: null, message: "Root folder cannot be renamed" });
        }

        var custFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }));


        if (!fs.existsSync(custFolderPath)) {
            return res.status(404).send({ data: null, message: "File not found" });
        }

        var renamedcustFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.newfilepathwithname, { allowedTags: [], allowedAttributes: {} }));


        if (!sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }).startsWith(custRes.rootfoldername)) {
            return res.status(404).send({ data: null, message: "Invalid Complete Path" });
        }

        if (!sanitizeHtml(req.body.newfilepathwithname, { allowedTags: [], allowedAttributes: {} }).startsWith(custRes.rootfoldername)) {
            return res.status(404).send({ data: null, message: "Inavlid new file path" });
        }

        if (fs.existsSync(renamedcustFolderPath)) {

            var filenamematched = getFileNameMatching(path.parse(custFolderPath).dir, path.basename(renamedcustFolderPath));
            console.log('filenamematched=' + filenamematched);

            var newappendedfilename = path.parse(renamedcustFolderPath).name + "_" + (filenamematched + 1).toString() + path.extname(renamedcustFolderPath);
            console.log('newappendedfilename=' + newappendedfilename);

            var newpath = renamedcustFolderPath.replace(path.parse(renamedcustFolderPath).base, newappendedfilename);
            console.log('newpath=' + newpath);

            fs.rename(custFolderPath, newpath, function (err) {
                if (err) {
                    console.log('in err')
                    return res.status(400).send({ data: null, message: err });
                }
                return res.status(200).send({ data: newappendedfilename, message: "Success" });
            });
        }
        else {
            fs.rename(custFolderPath, renamedcustFolderPath, function (err) {
                if (err) {
                    return res.status(404).send({ data: null, message: err });
                } else {
                    return res.status(200).send({ data: "File Renamed", message: "Success" });
                }
            });
        }
    });
};


//DONE
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


//DONE
exports.removeuser = (req, res) => {
    Customer.findOne({
        where: {
            userid: sanitizeHtml(req.body.userid, { allowedTags: [], allowedAttributes: {} }),
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} })
            , isdeleted: false
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
                var custFolderPath = path.join(uploadFilesFolder, user.rootfoldername);
                fs.rmdirSync(custFolderPath, { recursive: true });
                return res.status(200).send({ data: user.companyemail + " User Removed", message: "Success" });
            });
        });
    }).catch(err => {
        return res.status(500).send({ data: null, message: err.message });
    });
};

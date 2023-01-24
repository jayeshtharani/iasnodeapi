const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Customer = db.customers;
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
const dateTime = require('date-and-time');
const dirTree = require("directory-tree");

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
    const validTypes = [".pdf", ".pdfx", ".doc", ".docx", ".ppt", ".pptx", ".jpeg", ".jpg", ".png", ".xls", ".xlsx"];
    if (validTypes.indexOf(type) === -1) {
        return false;
    }
    return true;
};

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
    if (files_last_cahr_ints.length===0) {
        return 0;
    }
    else {
        return Math.max(...files_last_cahr_ints);
    }
    
};



//DONE
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



//DONE
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
            //var yourDate = new Date();
            //var epochTicks = 621355968000000000;
            //var ticksPerMillisecond = 10000;
            //var yourTicks = epochTicks + (yourDate.getTime() * ticksPerMillisecond);

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
                        var custfolderpath;
                        if (fields.customerfolderpath) {
                            custfolderpath = fields.customerfolderpath;
                        }
                        else {
                            custfolderpath = custResult.rootfoldername;
                        }
                        var oldPath = file.filepath;
                        var rawData = fs.readFileSync(oldPath);
                        var newPathTemp = path.join(uploadFilesFolder, custfolderpath, file.originalFilename);
                        var originalfileNamewithoutextension = path.parse(newPathTemp).name;
                        var originalfileNameextension = path.extname(newPathTemp);
                        //var newFilename = originalfileNamewithoutextension + "_" + yourTicks + originalfileNameextension;
                        var newFilename = originalfileNamewithoutextension + originalfileNameextension;
                        var newPath = path.join(uploadFilesFolder, custfolderpath, newFilename);
                        if (fs.existsSync(newPath)) {
                            //file abc.txt uploaded
                            //next upload file abc.txt exists so it will rename to abc_1.txt
                            //again user uploaded file abc.txt then abc_1.txt get updated
                            var filenamematched = getFileNameMatching(path.join(uploadFilesFolder, custfolderpath), newFilename);
                            var newappendedfilename = originalfileNamewithoutextension + "_" + (filenamematched + 1).toString() + originalfileNameextension;
                            var newappendedfilepath = path.join(uploadFilesFolder, custfolderpath, newappendedfilename);
                            fs.writeFile(newappendedfilepath, rawData, function (err) {
                                if (err) {
                                    return res.status(400).send({ data: null, message: err });
                                }
                                return res.status(200).send({ data: newappendedfilename, message: "Success" });
                            });
                        }
                        else {
                            fs.writeFile(newPath, rawData, function (err) {
                                if (err) {
                                    return res.status(400).send({ data: null, message: err });
                                }
                                return res.status(200).send({ data: newFilename, message: "Success" });

                            });
                        }
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

//DONE
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
        var custfolderpath;
        if (req.body.customerfolderpath) {
            custfolderpath = req.body.customerfolderpath;
        }
        else {
            custfolderpath = user.rootfoldername;
        }
        var crtfolderpath = path.join(uploadFilesFolder, custfolderpath, sanitizeHtml(req.body.foldername, { allowedTags: [], allowedAttributes: {} }));
        if (!fs.existsSync(crtfolderpath)) {
            fs.mkdirSync(crtfolderpath);
            return res.status(200).send({ data: sanitizeHtml(req.body.foldername, { allowedTags: [], allowedAttributes: {} }), message: "Success" });
        }
        else {
            return res.status(406).send({ data: null, message: "Folder already exists." });
        }
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//DONE
exports.create = (req, res) => {
    var length = 12,
        charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
        password = "",
        cdate = new Date();
    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    //var foldername = sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }).substring(0,
    //    sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }).indexOf("@"));
    var foldername = sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} });
    User.create({
        username: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
        email: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
        plaintextpassword: password,
        password: bcrypt.hashSync(password, 8)
    }).then(userResult => {
        userResult.setRoles([2]).then(roleResult => {
            Customer.create({
                companyname: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
                companyphone: sanitizeHtml(req.body.companyphone, { allowedTags: [], allowedAttributes: {} }) || '',
                companyemail: sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }),
                companyaddress: sanitizeHtml(req.body.companyaddress, { allowedTags: [], allowedAttributes: {} }) || '',
                cpfirstname: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }),
                cplastname: sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }) || '',
                cpgenderid: req.body.cpgenderid || 1,
                cpemail: sanitizeHtml(req.body.cpemail, { allowedTags: [], allowedAttributes: {} }) || '',
                cpdob: req.body.cpdob || dateTime.format(cdate, "YYYY-MM-DD"),
                cpnotes: sanitizeHtml(req.body.cpnotes, { allowedTags: [], allowedAttributes: {} }) || '',
                userid: userResult.userid,
                profilepic: '',
                rootfoldername: foldername
            }).then(custResult => {
                var isSendMail = parseInt(req.body.sendmail) || 0;
                if (isSendMail === 1) {
                    var regmessage = "<p>";
                    regmessage += "Hi ";
                    regmessage += sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} });
                    regmessage += ",";
                    regmessage += "</p>";
                    regmessage += "<p>A new customer account with Indo Aerospace Solution Pvt. Ltd. has been created for you.</p>";
                    regmessage += "<p>Email: " + sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} }) + "</p>";
                    regmessage += "<p>Password: " + password;
                    regmessage += "</p>";
                    regmessage += "<p>We recommend you to change your account password by using Change Password option in your profile section.</p>";
                    regmessage += "<p></p>";
                    regmessage += "Thank You, <br/>";
                    regmessage += "Team Indo Aerospace Solutions";
                    send_email_message.send_email_message(sanitizeHtml(req.body.companyemail, { allowedTags: [], allowedAttributes: {} })
                        , "Welcome to Indo Aerospace Solutions", regmessage);
                }

                var custFolderPath = path.join(uploadFilesFolder, foldername);
                fs.access(custFolderPath, (error) => {
                    if (error) {
                        fs.mkdir(custFolderPath, { recursive: false }, (error) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("New Directory created successfully !!");
                            }
                        });
                    } else {
                        console.log("Given Directory already exists !!");
                    }
                });
                res.status(200).send({ data: custResult.customerid, message: "Success" });
            });
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//DONE
exports.edit = (req, res) => {
    var cdate = new Date();
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
                username: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
            },
            {
                where: { userid: sanitizeHtml(user.userid, { allowedTags: [], allowedAttributes: {} }) },
            }
        )
    }).then(ur => {
        Customer.update(
            {
                companyname: sanitizeHtml(req.body.companyname, { allowedTags: [], allowedAttributes: {} }),
                companyphone: sanitizeHtml(req.body.companyphone, { allowedTags: [], allowedAttributes: {} }) || '',
                companyaddress: sanitizeHtml(req.body.companyaddress, { allowedTags: [], allowedAttributes: {} }) || '',
                cpfirstname: sanitizeHtml(req.body.cpfirstname, { allowedTags: [], allowedAttributes: {} }) || '',
                cplastname: sanitizeHtml(req.body.cplastname, { allowedTags: [], allowedAttributes: {} }) || '',
                cpgenderid: req.body.cpgenderid || 1,
                cpemail: sanitizeHtml(req.body.cpemail, { allowedTags: [], allowedAttributes: {} }) || '',
                cpdob: req.body.cpdob || dateTime.format(cdate, "YYYY-MM-DD"),
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

//DONE
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
        var custFolderPath = path.join(uploadFilesFolder, user.rootfoldername);
        var alldirs = [];
        var ctree = dirTree(custFolderPath, null, null, (item, path, stats) => {
            if (process.platform === "win32") {
                alldirs.push(item.path.replace(uploadFilesFolder + '\\', ''));
            }
            else {
                alldirs.push(item.path.replace(uploadFilesFolder + '/', ''));
            }

        });
        res.status(200).send({
            message: "Success",
            data: alldirs,
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//DONE
exports.downloadfile = (req, res) => {

    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }

        if (fs.existsSync(uploadFilesFolder + "/" + req.body.completepath)) {
            const fileaa = uploadFilesFolder + "/" + req.body.completepath;
            return res.download(fileaa);
        } else {
            return res.status(404).send({ data: null, message: "File not found" });
        }
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//DONE
exports.getcustomer = (req, res) => {
    const { customerid } = req.params;
    var pjoiner;
    if (process.platform === "win32") {
        pjoiner = "\\";
    }
    else {
        pjoiner = "/";
    }
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
            if (fs.existsSync(uploadProfilePicFolder + pjoiner + user.profilepic)) {
                const ext = (uploadProfilePicFolder + pjoiner + user.profilepic).split('.').filter(Boolean).slice(1).join('.');
                var bitmap = "data:image/" + ext;
                bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + pjoiner + user.profilepic, 'base64', 'utf-8');
                profilepic = bitmap;
            }
            else {
                profilepic = "";
            }
        }

        var custFolderPath = path.join(uploadFilesFolder, user.rootfoldername);
        var alldirs = [];
        var allfiles = [];
        var allfolderdata = fs.readdirSync(custFolderPath);
        for (var i in allfolderdata) {
            var name = custFolderPath + pjoiner + allfolderdata[i];
            if (fs.statSync(name).isDirectory()) {
                alldirs.push({ name: path.basename(name), path: path.join(user.rootfoldername, path.basename(name)) });
            } else {

                allfiles.push({ name: path.basename(name), path: path.join(user.rootfoldername, path.basename(name)) });
            }
        };

        var alldirs_r = getAllDir(custFolderPath);
        var allfiles_r = getAllDirFiles(custFolderPath);

        var data = [];
        data.push({
            "RootFolder": user.rootfoldername,
            "CompanyName": user.companyname,
            "CompanyEmail": user.companyemail,
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": allfiles_r.length,
            "TotalFolders": alldirs_r.length,
            "ProfilePic": profilepic,
            "Folders": alldirs,
            "Files": allfiles,
        });
        res.status(200).send({
            message: "Success",
            data: data
        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

//done
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

//done
exports.dashboard = (req, res) => {

    var pjoiner;
    if (process.platform === "win32") {
        pjoiner = "\\";
    }
    else {
        pjoiner = "/";
    }
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
            if (fs.existsSync(uploadProfilePicFolder + pjoiner + user.profilepic)) {
                const ext = (uploadProfilePicFolder + pjoiner + user.profilepic).split('.').filter(Boolean).slice(1).join('.');
                var bitmap = "data:image/" + ext;
                bitmap += ";base64," + fs.readFileSync(uploadProfilePicFolder + pjoiner + user.profilepic, 'base64', 'utf-8');
                profilepic = bitmap;
            }
            else {
                profilepic = "";
            }
        }
        var custFolderPath = path.join(uploadFilesFolder, user.rootfoldername);
        var alldirs = [];
        var allfiles = [];
        var allfolderdata = fs.readdirSync(custFolderPath);
        for (var i in allfolderdata) {
            var name = custFolderPath + pjoiner + allfolderdata[i];
            if (fs.statSync(name).isDirectory()) {
                alldirs.push({ name: path.basename(name), path: path.join(user.rootfoldername, path.basename(name)) });
            } else {

                allfiles.push({ name: path.basename(name), path: path.join(user.rootfoldername, path.basename(name)) });
            }
        };
        var alldirs_r = getAllDir(custFolderPath);
        var allfiles_r = getAllDirFiles(custFolderPath);

        var data = [];
        data.push({
            "RootFolder": user.rootfoldername,
            "CompanyName": user.companyname,
            "CompanyEmail": user.companyemail,
            "FirstName": user.cpfirstname,
            "LastName": user.cplastname,
            "CustomerId": user.customerid,
            "TotalDocuments": allfiles_r.length,
            "TotalFolders": alldirs_r.length,
            "ProfilePic": profilepic,
            "Folders": alldirs,
            "Files": allfiles,
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

//DONE
exports.getfolderfiles = (req, res) => {
    var pjoiner;
    if (process.platform === "win32") {
        pjoiner = "\\";
    }
    else {
        pjoiner = "/";
    }

    Customer.findOne({
        where: {
            customerid: sanitizeHtml(req.body.customerid, { allowedTags: [], allowedAttributes: {} }),
            isdeleted: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "Customer not found" });
        }

        var custFolderPath = path.join(uploadFilesFolder, sanitizeHtml(req.body.completepath, { allowedTags: [], allowedAttributes: {} }));


        var alldirs = [];
        var allfiles = [];
        var allfolderdata = fs.readdirSync(custFolderPath);
        for (var i in allfolderdata) {
            var name = custFolderPath + pjoiner + allfolderdata[i];
            if (fs.statSync(name).isDirectory()) {
                alldirs.push({ name: path.basename(name), path: name.replace(uploadFilesFolder + pjoiner, "") });
            } else {

                allfiles.push({ name: path.basename(name), path: name.replace(uploadFilesFolder + pjoiner, "") });
            }
        };
        var data = [];
        data.push({
            "Folders": alldirs,
            "Files": allfiles,
        });
        res.status(200).send({
            message: "Success",
            data: data
        });

    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });


};
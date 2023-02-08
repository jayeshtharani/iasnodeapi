const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/customer.controller");
const { createCustomerValidator } = require('../validators/createcustomer.validator');
const { createSubCustomerValidator } = require('../validators/createsubcustomer.validator');
const { editCustomerValidator } = require('../validators/editcustomer.validator');
const { createFolderValidator } = require('../validators/createfolder.validator');
const { getFolderFilesValidator } = require('../validators/getfolderfiles.validator');
const { searchCustomerValidator } = require('../validators/searchcustomer.validator');
const { removeSubCustomerValidator } = require('../validators/removesubcustomer.validator');
module.exports = function (app) {

    app.post("/api/customer/create", [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkCustomerDuplicateCompanyName], createCustomerValidator, controller.create);
    app.put("/api/customer/edit/:customerid", [authJwt.verifyToken, authJwt.isAdmin], editCustomerValidator, controller.edit);
    app.get("/api/customer/dashboard", [authJwt.verifyToken, authJwt.isCustomer], controller.dashboard);
    app.get('/api/customer/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomer);
    app.get('/api/customer/profile/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomerprofile);
    app.post("/api/customer/createfolder", [authJwt.verifyToken, authJwt.isAdmin], createFolderValidator, controller.createfolder);
    app.post("/api/customer/createfile", [authJwt.verifyToken, authJwt.isAdmin], controller.createfile);
    app.get("/api/customer/getfolders/:customerid", [authJwt.verifyToken, authJwt.isAdmin], controller.getfolders);
    app.post("/api/customer/downloadfile", [authJwt.verifyToken], controller.downloadfile);
    app.post("/api/customer/getfolderfiles", [authJwt.verifyToken], getFolderFilesValidator, controller.getfolderfiles);
    app.post("/api/customer/search", [authJwt.verifyToken], searchCustomerValidator, controller.search);

    app.post("/api/customer/contact", [authJwt.verifyToken, authJwt.isAdmin, verifySignUp.checkSubCustomerDuplicateEmail], createSubCustomerValidator, controller.createcustomercontact);
    app.get('/api/customer/contact/:customerid', [authJwt.verifyToken], controller.getcustomercontacts);
    app.put('/api/customer/contact/:subcustomerid', [authJwt.verifyToken, authJwt.isAdmin], createSubCustomerValidator, controller.editcustomercontact);
    app.delete('/api/customer/contact', [authJwt.verifyToken, authJwt.isAdmin], removeSubCustomerValidator, controller.removecustomercontact);
};
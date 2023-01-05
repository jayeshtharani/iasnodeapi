const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/customer.controller");
const { createCustomerValidator } = require('../validators/createcustomer.validator');
const { createFolderValidator } = require('../validators/createfolder.validator');


module.exports = function (app) {

    app.post("/api/customer/create",
        [authJwt.verifyToken, authJwt.isAdmin,
        verifySignUp.checkUserDuplicateEmail, verifySignUp.checkCustomerDuplicateEmail],
        createCustomerValidator,
        controller.create
    );

    app.put("/api/customer/edit/:customerid",
        [authJwt.verifyToken, authJwt.isAdmin],
        createCustomerValidator,
        controller.edit
    );

    app.get("/api/customer/dashboard",
        [authJwt.verifyToken, authJwt.isCustomer],
        controller.dashboard
    );

    app.get('/api/customer/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomer);

    app.get('/api/customer/profile/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomerprofile);

    app.post("/api/customer/uploadprofilepic", [authJwt.verifyToken, authJwt.isAdmin], controller.uploadprofilepic);

    app.post("/api/customer/createfolder",
        [authJwt.verifyToken, authJwt.isAdmin], createFolderValidator,
        controller.createfolder
    );

    app.post("/api/customer/createfile", [authJwt.verifyToken, authJwt.isAdmin], controller.createfile);

    app.get("/api/customer/getfolders/:customerid", [authJwt.verifyToken, authJwt.isAdmin], controller.getfolders);

    //app.get("/api/customer/profilepic/:customerid",  controller.getprofilepic);

    app.post("/api/customer/downloadfile/:customerfileid", [authJwt.verifyToken],controller.downloadfile);
};
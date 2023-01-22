//https://jayeshchoudhary.hashnode.dev/how-to-easily-validate-request-data-using-express-validator-in-nodejs
const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller");
const { actDeactUserValidator } = require('../validators/actdeactuser.validator');
const { removeUserValidator } = require('../validators/removeuser.validator');
const { removeCustomerFolderValidator } = require('../validators/removecustomerfolder.validator');
const { setCustomerPasswordValidator } = require('../validators/setcustomerpassword.validator');
const { removeCustomerFileValidator } = require('../validators/removecustomerfile.validator');
const { renameCustomerFolderValidator } = require('../validators/renamecustomerfolder.validator');
const { renameCustomerFileValidator } = require('../validators/renamecustomerfile.validator');
module.exports = function (app) {

    app.get("/api/admin/dashboard", [authJwt.verifyToken, authJwt.isAdmin], controller.dashboard);
    app.post("/api/admin/actdeactuser", [authJwt.verifyToken, authJwt.isAdmin], actDeactUserValidator, controller.actdeactuser);
    app.post("/api/admin/removeuser", [authJwt.verifyToken, authJwt.isAdmin], removeUserValidator, controller.removeuser);
    app.post("/api/admin/removecustomerfile", [authJwt.verifyToken, authJwt.isAdmin], removeCustomerFileValidator, controller.removecustomerfile);
    app.post("/api/admin/removecustomerfolder", [authJwt.verifyToken, authJwt.isAdmin], removeCustomerFolderValidator, controller.removecustomerfolder);
    app.post("/api/admin/renamecustomerfolder", [authJwt.verifyToken, authJwt.isAdmin], renameCustomerFolderValidator, controller.renamecustomerfolder);
    app.post("/api/admin/renamecustomerfile", [authJwt.verifyToken, authJwt.isAdmin], renameCustomerFileValidator, controller.renamecustomerfile);
    app.post("/api/admin/setcustomerpassword", [authJwt.verifyToken, authJwt.isAdmin], setCustomerPasswordValidator, controller.setcustomerpassword);

};
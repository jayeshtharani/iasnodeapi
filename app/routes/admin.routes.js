//https://jayeshchoudhary.hashnode.dev/how-to-easily-validate-request-data-using-express-validator-in-nodejs
const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller");
const { actDeactUserValidator } = require('../validators/actdeactuser.validator');
module.exports = function (app) {

    app.get("/api/admin/dashboard", [authJwt.verifyToken, authJwt.isAdmin], controller.dashboard);
    app.post("/api/admin/actdeactuser", [authJwt.verifyToken, authJwt.isAdmin], actDeactUserValidator, controller.actdeactuser);
    app.post("/api/admin/removecustomerfile", [authJwt.verifyToken, authJwt.isAdmin], controller.removecustomerfile);
    //Folder logic needs to be commented 8 Jan 2023
    //app.post("/api/admin/removecustomerfolder", [authJwt.verifyToken, authJwt.isAdmin], controller.removecustomerfolder);
    app.post("/api/admin/setcustomerpassword", [authJwt.verifyToken, authJwt.isAdmin], controller.setcustomerpassword);

};
//https://jayeshchoudhary.hashnode.dev/how-to-easily-validate-request-data-using-express-validator-in-nodejs
const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller");
const { createFolderValidator } = require('../validators/createfolder.validator');
const { createFileValidator } = require('../validators/createfile.validator');
const { actDeactUserValidator } = require('../validators/actdeactuser.validator');
module.exports = function (app) {

    app.post("/api/admin/dashboard", [authJwt.verifyToken, authJwt.isAdmin], controller.dashboard);

    app.post("/api/admin/createfolder",
        [authJwt.verifyToken, authJwt.isAdmin], createFolderValidator,
        controller.createfolder
    );

    app.post("/api/admin/createfile", [authJwt.verifyToken, authJwt.isAdmin], createFileValidator,
        controller.createfile
    );

    app.post("/api/admin/actdeactuser", [authJwt.verifyToken, authJwt.isAdmin], actDeactUserValidator,
        controller.actdeactuser
    );
};
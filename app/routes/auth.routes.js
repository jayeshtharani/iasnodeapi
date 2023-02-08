const controller = require("../controllers/auth.controller");
const { loginValidator } = require('../validators/login.validator');
const { changePasswordValidator } = require('../validators/changepassword.validator ');
const { createAdminValidator } = require('../validators/createadmin.validator');
const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");
const { forgotPasswordValidator } = require('../validators/forgotpassword.validator');


module.exports = function (app) {
    app.post("/api/auth/signin", loginValidator, controller.signin);
    app.post("/api/auth/appsignupbyadminhidethisapi", [verifySignUp.checkUserDuplicateEmail], createAdminValidator, controller.appsignupbyadminhidethisapi);
    app.post("/api/auth/changepassword", [authJwt.verifyToken], changePasswordValidator, controller.changepassword);
    app.post("/api/auth/forgotpassword", forgotPasswordValidator, controller.forgotpassword);
};

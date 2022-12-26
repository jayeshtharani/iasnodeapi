const controller = require("../controllers/auth.controller");
const { loginValidator } = require('../validators/login.validator');
const { createAdminValidator } = require('../validators/createadmin.validator');
const { verifySignUp } = require("../middleware");
module.exports = function (app) {
    
    app.post("/api/auth/signin", loginValidator, controller.signin);
    app.post("/api/auth/appsignupbyadminhidethisapi",
        [verifySignUp.checkUserDuplicateEmail, verifySignUp.checkCustomerDuplicateEmail],
        createAdminValidator, controller.appsignupbyadminhidethisapi);
};

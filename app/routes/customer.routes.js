const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/customer.controller");
const { createCustomerValidator } = require('../validators/createcustomer.validator');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post("/api/customer/create",
        [authJwt.verifyToken, authJwt.isAdmin,
        verifySignUp.checkUserDuplicateEmail, verifySignUp.checkCustomerDuplicateEmail],
        createCustomerValidator,
        controller.create
    );

    app.post("/api/customer/dashboard",
        [authJwt.verifyToken, authJwt.isCustomer],
        controller.dashboard
    );

    app.get('/api/customer/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomer);

    app.get('/api/customer/profile/:customerid', [authJwt.verifyToken, authJwt.isAdmin], controller.getcustomerprofile);
        
};
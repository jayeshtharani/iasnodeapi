const { body, validationResult } = require("express-validator");
exports.loginValidator = [
    body("email").normalizeEmail()
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isString().withMessage("Email should be string")
        .isEmail().withMessage("Provide valid email"),
    body("password")
        .exists({ checkFalsy: true }).withMessage("Password is required")
        .isString().withMessage("Password should be string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({data:null, message: errors.array() });
        next();
    },
];

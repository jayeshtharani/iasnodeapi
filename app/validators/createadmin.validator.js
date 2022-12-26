const { body, validationResult } = require("express-validator");
exports.createAdminValidator = [

    
    body("username").exists({ checkFalsy: true }).withMessage("User Name is required")
        .isString().withMessage("User Name should be string")
        .isLength({ min: 3 }).withMessage("User Name should be at least 3 characters"),
    body("companyemail").normalizeEmail()
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isString().withMessage("Email should be string")
        .isEmail().withMessage("Provide valid email"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

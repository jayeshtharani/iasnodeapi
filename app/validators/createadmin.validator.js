const { body, validationResult } = require("express-validator");
exports.createAdminValidator = [
    body("username").exists({ checkFalsy: true }).withMessage("User Name is required")
        .isString().withMessage("User Name should be string")
        .isLength({ min: 5 }).withMessage("User Name should be at least 5 characters"),
    body("companyemail")
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isEmail().withMessage("Provide valid email"),
    body("sendmail").exists({ checkFalsy: true }).withMessage("Send Mail Paramter is required")
        .isInt({ min: 0, max: 1 }).withMessage("Send Mail should be 0 or 1"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

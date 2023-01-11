const { body, validationResult } = require("express-validator");
exports.forgotPasswordValidator = [
    body("email")
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isEmail().withMessage("Provide valid email"),
    body("newpassword")
        .exists({ checkFalsy: true }).withMessage("Password is required")
        .isLength({ min: 5 }).withMessage("Password should be at least 5 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

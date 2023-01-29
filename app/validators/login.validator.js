const { body, validationResult } = require("express-validator");
exports.loginValidator = [
    body("username")
        .exists({ checkFalsy: true }).withMessage("Username is required"),
    body("password")
        .exists({ checkFalsy: true }).withMessage("Password is required")
        .isLength({ min: 5 }).withMessage("Password should be at least 5 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

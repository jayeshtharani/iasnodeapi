const { body, validationResult } = require("express-validator");
exports.changePasswordValidator = [
    body("currentpassword")
        .exists({ checkFalsy: true }).withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password should be at least 3 characters"),
    body("newpassword")
        .exists({ checkFalsy: true }).withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password should be at least 3 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

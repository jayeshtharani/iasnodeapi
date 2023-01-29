const { body, validationResult } = require("express-validator");
exports.createAdminValidator = [
    body("username").exists({ checkFalsy: true }).withMessage("User Name is required")
        //.isString().withMessage("User Name should be string")
        .isLength({ min: 6 }).withMessage("User Name should be at least 5 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

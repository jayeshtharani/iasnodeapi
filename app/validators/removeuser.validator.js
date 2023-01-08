const { body, validationResult } = require("express-validator");
exports.removeUserValidator = [
    body("userid")
        .exists({ checkFalsy: true }).withMessage("Userid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Userid"),
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

const { body, validationResult } = require("express-validator");
exports.removeCustomerFileValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("completepath")
        .exists({ checkFalsy: true }).withMessage("Path is required")
        .isLength({ min: 1 }).withMessage("Inavlid Path"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

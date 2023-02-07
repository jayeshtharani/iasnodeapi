const { body, validationResult } = require("express-validator");
exports.searchCustomerValidator = [
    body("search")
        .exists({ checkFalsy: true }).withMessage("Search Text is required")
        .isLength({ min: 2 }).withMessage("Search Text should be at least 2 characters"),
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid customer id"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

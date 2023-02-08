const { body, validationResult } = require("express-validator");
exports.removeSubCustomerValidator = [

    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),

    body("subcustomerid")
        .exists({ checkFalsy: true }).withMessage("SubCustomerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid SubCustomerid"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(500).json({ data: null, message: errors.array() });
        }
        next();
    },
];

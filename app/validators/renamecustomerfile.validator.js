const { body, validationResult } = require("express-validator");
exports.renameCustomerFileValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("completepath")
        .exists({ checkFalsy: true }).withMessage("Path is required")
        .isLength({ min: 5 }).withMessage("Inavlid Path"),
    body("newfilepathwithname")
        .exists({ checkFalsy: true }).withMessage("New Path with name is required")
        .isLength({ min: 3 }).withMessage("New Path with name min 3 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

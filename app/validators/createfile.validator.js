const { body, validationResult } = require("express-validator");
exports.createFileValidator = [
    body("filetags")
        .optional({ checkFalsy: true })
        .isString().withMessage("filetags should be string"),
    body("customerfolderid")
        .optional({ checkFalsy: true })
        .isLength({ min: 36 }).withMessage("Inavlid customer id"),
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

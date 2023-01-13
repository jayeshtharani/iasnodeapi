const { body, validationResult } = require("express-validator");
exports.getFolderFilesValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("completepath")
        .exists({ checkFalsy: true }).withMessage("Complete Path is required")
        .isLength({ min: 1 }).withMessage("Inavlid Complete Path"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

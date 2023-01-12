const { body, validationResult } = require("express-validator");
exports.removeCustomerFileValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("customerfolderpath")
        .exists({ checkFalsy: true }).withMessage("Folderpath is required")
        .isLength({ min: 1 }).withMessage("Inavlid Folderpath"),
    body("filename")
        .exists({ checkFalsy: true }).withMessage("Filename is required")
        .isLength({ min: 1 }).withMessage("Filename Foldername"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

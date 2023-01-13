const { body, validationResult } = require("express-validator");
exports.removeCustomerFolderValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("completepath")
        .exists({ checkFalsy: true }).withMessage("Folder Path is required")
        .isLength({ min: 1 }).withMessage("Inavlid Folderpath"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

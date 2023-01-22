const { body, validationResult } = require("express-validator");
exports.renameCustomerFolderValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("completepath")
        .exists({ checkFalsy: true }).withMessage("Folder Path is required")
        .isLength({ min: 1 }).withMessage("Inavlid Folderpath"),
    body("newfolderpathwithname")
        .exists({ checkFalsy: true }).withMessage("New Folder Name is required")
        .isLength({ min: 3 }).withMessage("New Folder Name min 3 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

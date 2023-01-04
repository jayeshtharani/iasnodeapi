const { body, validationResult } = require("express-validator");
exports.createFolderValidator = [
    body("foldername")
        .exists({ checkFalsy: true }).withMessage("Folder name is required")
        .isString().withMessage("Folder name should be string")
        .isLength({ min: 3 }).withMessage("Foldername should be at least 3 characters"),
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

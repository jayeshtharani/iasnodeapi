const { body, validationResult } = require("express-validator");
exports.setCustomerPasswordValidator = [
    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),
    body("userid")
        .exists({ checkFalsy: true }).withMessage("Userid is required")
        .isLength({ min: 36 }).withMessage("Userid Customerid"),
    body("newpassword")
        .exists({ checkFalsy: true }).withMessage("NewPassword is required")
        .isLength({ min: 5 }).withMessage("NewPassword should be min 5 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

const { body, validationResult } = require("express-validator");
exports.actDeactUserValidator = [
    body("statusflag").exists().withMessage("Status Flag is required")
        .isInt({ min: 0, max: 1 }).withMessage("Status flag should be 0 or 1"),
    body("userid")
        .exists({ checkFalsy: true }).withMessage("Userid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Userid"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

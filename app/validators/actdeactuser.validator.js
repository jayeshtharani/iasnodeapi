const { body, validationResult } = require("express-validator");
exports.actDeactUserValidator = [
    body("statusflag").exists().withMessage("Status Flag is required")
        .isInt().withMessage("Status flag should be Integer value"),
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

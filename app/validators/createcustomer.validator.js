const { body, validationResult } = require("express-validator");
exports.createCustomerValidator = [

    body("companyname").exists({ checkFalsy: true }).withMessage("Company Name is required")
        .isString().withMessage("Company Name should be string")
        .isLength({ min: 3 }).withMessage("Company Name should be at least 3 characters"),
    body("cpfirstname").exists({ checkFalsy: true }).withMessage("First Name is required")
        .isString().withMessage("First Name should be string")
        .isLength({ min: 3 }).withMessage("First Name should be at least 3 characters"),
    body("cplastname").exists({ checkFalsy: true }).withMessage("Last Name is required")
        .isString().withMessage("Last Name should be string")
        .isLength({ min: 3 }).withMessage("Last Name should be at least 3 characters"),
    body("cpgenderid").exists({ checkFalsy: true }).withMessage("Gender is required")
        .isInt("Gender should be Int Value").withMessage(),
    body("cpdob").exists().isISO8601().toDate().withMessage("Valid date format YYYY-MM-DD"),
    body("cpemail").normalizeEmail()
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isString().withMessage("Email should be string")
        .isEmail().withMessage("Provide valid email"),
    body("companyemail").normalizeEmail()
        .exists({ checkFalsy: true }).withMessage("Email is required")
        .isString().withMessage("Email should be string")
        .isEmail().withMessage("Provide valid email"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(500).json({ data: null, message: errors.array() });
        next();
    },
];

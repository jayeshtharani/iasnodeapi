const { body, validationResult } = require("express-validator");
exports.editCustomerValidator = [

    body("companyname").exists({ checkFalsy: true }).withMessage("Company Name is required")
        .isString().withMessage("Company Name should be string")
        .isLength({ min: 3 }).withMessage("Company Name should be at least 3 characters"),

    body("companyemail").exists({ checkFalsy: true }).withMessage("Company Email is required")
        .isEmail().withMessage("Provide Valid Company Email"),

    body("cpfirstname").optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("First Name should be string")
        .isLength({ min: 3 }).withMessage("First Name should be at least 3 characters"),

    body("cpfirstname").optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("First Name should be string")
        .isLength({ min: 3 }).withMessage("First Name should be at least 3 characters"),

    body("companyphone").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10 }).withMessage("Company Phone should be at least 10 characters"),

    body("companyaddress").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 5 }).withMessage("Company Address should be at least 5 characters"),

    body("cpgenderid").optional({ nullable: true, checkFalsy: true }).default(1)
        .isInt({ min: 1, max: 2 }).withMessage("Gender  should be 1 or 2"),

    body("cpdob").optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage("Valid date format YYYY-MM-DD"),

    body("cpemail").optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage("Provide Valid Contact Person Email"),

    body("cpnotes").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10 }).withMessage("Notes should be at least 10 characters"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
           
            return res.status(500).json({ data: null, message: errors.array() });
        }
        next();
    },
];

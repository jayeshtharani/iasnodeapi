const { body, validationResult } = require("express-validator");
exports.createCustomerValidator = [

    body("companyname").exists({ checkFalsy: true }).withMessage("Company Name is required")
        .isLength({ min: 5 }).withMessage("Company Name should be at least 5 characters"),

    //body("username").exists({ checkFalsy: true }).withMessage("UserName is required")
    //    .isLength({ min: 6 }).withMessage("UserName should be at least 5 characters"),

    body("companyphone").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10 }).withMessage("Company Phone should be at least 10 characters"),

    body("companyaddress").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 5 }).withMessage("Company Address should be at least 5 characters"),

    //body("cpgenderid").optional({ nullable: true, checkFalsy: true }).default(1)
    //    .isInt({ min: 1, max: 2 }).withMessage("Gender  should be 1 or 2"),

    //body("cpdob").optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage("Valid date format YYYY-MM-DD"),

    //body("cpemail").optional({ nullable: true, checkFalsy: true })
    //    .isEmail().withMessage("Provide Valid Contact Person Email"),

    //body("cpnotes").optional({ nullable: true, checkFalsy: true })
    //    .isLength({ min: 10 }).withMessage("Notes should be at least 10 characters"),

    //body("sendmail").exists({ checkFalsy: true }).withMessage("Send Mail Paramter is required")
    //    .isInt({ min: 0, max: 1 }).withMessage("Send Mail should be 0 or 1"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
           
            return res.status(500).json({ data: null, message: errors.array() });
        }
        next();
    },
];

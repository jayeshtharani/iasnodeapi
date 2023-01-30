const { body, validationResult } = require("express-validator");
exports.createSubCustomerValidator = [

    body("customerid")
        .exists({ checkFalsy: true }).withMessage("Customerid is required")
        .isLength({ min: 36 }).withMessage("Inavlid Customerid"),

    body("firstname").exists({ checkFalsy: true }).withMessage("First Name is required")
        .isString().withMessage("First Name should be string")
        .isLength({ min: 3 }).withMessage("First Name should be at least 3 characters"),

    body("lastname").optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("Last Name should be string")
        .isLength({ min: 3 }).withMessage("Last Name should be at least 3 characters"),

    body("phone").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10 }).withMessage("Phone should be at least 10 characters"),

    body("email").exists({ checkFalsy: true }).withMessage("Email is required")
        .isEmail().withMessage("Provide Valid Email"),

    body("designation").optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 5 }).withMessage("Designation should be at least 5 characters"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(500).json({ data: null, message: errors.array() });
        }
        next();
    },
];

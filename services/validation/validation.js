const { check, validationResult } = require("express-validator");

const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) break;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                message: errors.array()[0].msg
            });
        }
        next();
    };
};


const roleValidation = [
    check("roleName")
        .notEmpty().withMessage("Role Name is required")
        .isString().withMessage("Role Name must be a string")
        .matches(/^[A-Za-z\s]+$/).withMessage("Role Name must contain only letters"),
    check("accessModule")
        .isArray().withMessage("Access Module must be an array")
        .matches(/^[A-Za-z\s]+$/).withMessage("Access Module must contain only letters"),
];

const userValidation = [
    check("firstName")
        .notEmpty().withMessage("First Name is required")
        .isString().withMessage("First Name must be a string")
        .matches(/^[A-Za-z\s]+$/).withMessage("First Name must contain only letters"),

    check("lastName")
        .notEmpty().withMessage("Last Name is required")
        .isString().withMessage("Last Name must be a string")
        .matches(/^[A-Za-z\s]+$/).withMessage("Last Name must contain only letters"),

    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    check("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character"),

    check("roleId")
        .notEmpty().withMessage("Role ID is required")
        .isMongoId().withMessage("Invalid Role ID format")
];


module.exports = { validate, roleValidation,userValidation };

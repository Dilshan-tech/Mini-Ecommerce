const { body } = require("express-validator");

const signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must include a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include a number")
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

module.exports = { signupValidator, loginValidator };

const { body } = require("express-validator");

const createProductValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("discount")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 90 })
    .withMessage("Discount must be between 0 and 90"),
  body("amazonLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Amazon link must be a valid URL"),
  body("stock")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("image")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Image must be a string URL"),
  body("trending")
    .optional()
    .isBoolean()
    .withMessage("Trending must be true or false"),
  body("bestSeller")
    .optional()
    .isBoolean()
    .withMessage("Best seller must be true or false")
];

const updateProductValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
  body("discount")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 90 })
    .withMessage("Discount must be between 0 and 90"),
  body("amazonLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Amazon link must be a valid URL"),
  body("stock")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("image")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Image must be a string URL"),
  body("trending")
    .optional()
    .isBoolean()
    .withMessage("Trending must be true or false"),
  body("bestSeller")
    .optional()
    .isBoolean()
    .withMessage("Best seller must be true or false")
];

module.exports = { createProductValidator, updateProductValidator };

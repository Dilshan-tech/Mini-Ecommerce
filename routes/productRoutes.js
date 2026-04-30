const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createProductValidator,
  updateProductValidator
} = require("../validators/productValidators");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductAuditLogs
} = require("../controllers/productController");

// CREATE
router.post("/", protect, authorize("admin"), createProductValidator, validateRequest, createProduct);

// READ ALL
router.get("/", getProducts);

// AUDIT HISTORY (single backend file log)
router.get("/audit/logs", protect, authorize("admin"), getProductAuditLogs);

// READ ONE
router.get("/:id", getProductById);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProductValidator,
  validateRequest,
  updateProduct
);

// DELETE
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
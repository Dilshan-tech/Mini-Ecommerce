const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { logProductAudit, readProductAudit } = require("../utils/auditLogger");

const normalizeProductPayload = body => {
  const image = body.image ?? body.imageUrl ?? "";
  const trending = body.trending ?? body.isTrending ?? false;
  const bestSeller = body.bestSeller ?? body.isBestSeller ?? false;

  return {
    name: body.name,
    description: body.description,
    category: body.category,
    price: body.price,
    stock: body.stock,
    discount: body.discount,
    amazonLink: body.amazonLink,
    image,
    imageUrl: image,
    trending: Boolean(trending),
    bestSeller: Boolean(bestSeller),
    isTrending: Boolean(trending),
    isBestSeller: Boolean(bestSeller)
  };
};

const createProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const product = await Product.create({
    ...payload,
    stock: payload.stock || 0,
    discount: payload.discount || 0,
    amazonLink: payload.amazonLink || "https://www.amazon.in/s?k=electronics",
    createdBy: req.user._id
  });
  await logProductAudit({
    action: "CREATE",
    user: req.user,
    productId: product._id,
    productName: product.name,
    changes: {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      discount: product.discount
    }
  });
  res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || "";
  const category = req.query.category?.trim();

  const filter = {};
  const andClauses = [];
  if (search) {
    andClauses.push({
      $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
      ]
    });
  }
  if (category) {
    filter.category = category;
  }
  if (req.query.trending !== undefined) {
    andClauses.push({
      $or: [{ trending: req.query.trending === "true" }, { isTrending: req.query.trending === "true" }]
    });
  }
  if (req.query.bestSeller !== undefined) {
    andClauses.push(
      { $or: [{ bestSeller: req.query.bestSeller === "true" }, { isBestSeller: req.query.bestSeller === "true" }] }
    );
  }
  if (andClauses.length) {
    filter.$and = andClauses;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter)
  ]);

  const items = products.map(product => {
    const trustScore = (product.isTrending ? 20 : 0) + (product.isBestSeller ? 30 : 0) + ((product.stock || 0) > 100 ? 10 : 0);
    return { ...product, trustScore };
  });

  res.json({
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const productDoc = await Product.findById(req.params.id);
  if (!productDoc) {
    return res.status(404).json({ message: "Product not found" });
  }
  const product = productDoc.toObject();
  product.trustScore = (product.isTrending ? 20 : 0) + (product.isBestSeller ? 30 : 0) + ((product.stock || 0) > 100 ? 10 : 0);
  res.json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const fields = [
    "name",
    "description",
    "category",
    "price",
    "stock",
    "image",
    "imageUrl",
    "discount",
    "amazonLink",
    "trending",
    "bestSeller",
    "isTrending",
    "isBestSeller"
  ];
  const previous = {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl,
    discount: product.discount,
    amazonLink: product.amazonLink,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller
  };
  const normalized = normalizeProductPayload(req.body);
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = normalized[field] ?? req.body[field];
    }
  });

  const updated = await product.save();
  await logProductAudit({
    action: "UPDATE",
    user: req.user,
    productId: updated._id,
    productName: updated.name,
    changes: {
      before: previous,
      after: {
        name: updated.name,
        description: updated.description,
        category: updated.category,
        price: updated.price,
        stock: updated.stock,
        imageUrl: updated.imageUrl,
        discount: updated.discount,
        amazonLink: updated.amazonLink,
        isTrending: updated.isTrending,
        isBestSeller: updated.isBestSeller
      }
    }
  });
  res.json(updated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  await logProductAudit({
    action: "DELETE",
    user: req.user,
    productId: product._id,
    productName: product.name,
    changes: {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      discount: product.discount
    }
  });
  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});

const getProductAuditLogs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const logs = await readProductAudit(limit);
  res.json({ items: logs, total: logs.length });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductAuditLogs
};
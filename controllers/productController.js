const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "..", "data", "products.json");

function readProducts() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    const products = JSON.parse(data);

    if (!Array.isArray(products)) {
      return [];
    }

    return products;
  } catch (err) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));
}

function getNextId(products) {
  if (products.length === 0) {
    return 1;
  }

  const maxId = products.reduce((max, product) => {
    return product.id > max ? product.id : max;
  }, 0);

  return maxId + 1;
}

// CREATE PRODUCT
exports.createProduct = (req, res) => {
  const { name, price, imageUrl } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: "name and price are required" });
  }

  const parsedPrice = Number(price);

  if (Number.isNaN(parsedPrice)) {
    return res.status(400).json({ message: "price must be a valid number" });
  }

  const products = readProducts();

  const newProduct = {
    id: getNextId(products),
    name,
    price: parsedPrice,
    imageUrl: imageUrl || ""
  };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
};

// GET ALL PRODUCTS
exports.getProducts = (req, res) => {
  const products = readProducts();
  res.json(products);
};

// GET SINGLE PRODUCT
exports.getProductById = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const products = readProducts();
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// UPDATE PRODUCT
exports.updateProduct = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { name, price, imageUrl } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const products = readProducts();
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (name !== undefined) {
    product.name = name;
  }

  if (price !== undefined) {
    const parsedPrice = Number(price);

    if (Number.isNaN(parsedPrice)) {
      return res.status(400).json({ message: "price must be a valid number" });
    }

    product.price = parsedPrice;
  }

  if (imageUrl !== undefined) {
    product.imageUrl = imageUrl;
  }

  writeProducts(products);

  res.json(product);
};

// DELETE PRODUCT
exports.deleteProduct = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const products = readProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(index, 1);
  writeProducts(products);

  res.json({ message: "Product deleted successfully" });
};
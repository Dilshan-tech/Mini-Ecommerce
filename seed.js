const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

const productsData = [
  // Electronics
  { name: "Sony WH-1000XM5 Wireless Headphones", description: "Industry-leading noise cancellation headphones.", category: "Electronics", price: 349, discount: 10, stock: 45, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B09XS7JWHH", imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800" },
  { name: "Apple MacBook Pro M3 Max", description: "16-inch, Liquid Retina XDR display, up to 128GB unified memory.", category: "Electronics", price: 3499, discount: 5, stock: 12, trending: true, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B0CM5B11M3", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" },
  { name: "Samsung Galaxy S24 Ultra", description: "Titanium exterior, AI-powered features, 200MP camera.", category: "Electronics", price: 1299, discount: 8, stock: 30, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0CQ2N2ZXZ", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800" },
  { name: "LG C3 Series 65-Inch OLED TV", description: "4K Smart TV, 120Hz refresh rate, Dolby Vision.", category: "Electronics", price: 1599, discount: 15, stock: 18, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0BVXHMWB1", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800" },
  { name: "Apple iPad Air (5th Gen)", description: "M1 chip, 10.9-inch Liquid Retina display.", category: "Electronics", price: 599, discount: 10, stock: 25, trending: false, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B09V3HN1KC", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
  { name: "Dell XPS 15 Laptop", description: "OLED InfinityEdge display, Intel Core i9, NVIDIA RTX 4070.", category: "Electronics", price: 2199, discount: 12, stock: 15, trending: true, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B0C279YTY3", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800" },
  { name: "Canon EOS R5 Mirrorless Camera", description: "45MP full-frame, 8K video, 12 fps continuous shooting.", category: "Electronics", price: 3399, discount: 5, stock: 8, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B08C6CGKVD", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
  { name: "Logitech MX Master 3S", description: "Wireless performance mouse with 8K DPI.", category: "Electronics", price: 99, discount: 10, stock: 60, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B09HM94VDS", imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800" },
  { name: "Keychron K2 Mechanical Keyboard", description: "75% layout, wireless/wired, hot-swappable.", category: "Electronics", price: 89, discount: 15, stock: 40, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B07Y9Y69N7", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800" },
  
  // Fashion
  { name: "Classic Leather Biker Jacket", description: "Premium genuine leather, slim fit, silver hardware.", category: "Fashion", price: 199, discount: 20, stock: 22, trending: true, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B01MT2BXZ6", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800" },
  { name: "Nike Air Force 1 '07", description: "Classic white sneakers, durable leather upper.", category: "Fashion", price: 110, discount: 0, stock: 80, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B00021MCWC", imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800" },
  { name: "Levi's 501 Original Fit Jeans", description: "Straight leg, classic button fly.", category: "Fashion", price: 79, discount: 15, stock: 50, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0018OK0OQ", imageUrl: "https://images.unsplash.com/photo-1542272604-780c40fbX6Y?w=800" },
  { name: "Adidas Ultraboost Light", description: "Responsive cushioning, breathable mesh upper.", category: "Fashion", price: 190, discount: 10, stock: 35, trending: true, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B0B61HXL1Y", imageUrl: "https://images.unsplash.com/photo-1587563871167-1ea720020c01?w=800" },
  { name: "Ray-Ban Classic Wayfarer Sunglasses", description: "Polarized lenses, durable acetate frame.", category: "Fashion", price: 160, discount: 5, stock: 42, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B001GNBJQY", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800" },
  { name: "The North Face Nuptse Puffer", description: "Water-resistant, 700-fill down insulation.", category: "Fashion", price: 280, discount: 0, stock: 20, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0000X1ABC", imageUrl: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800" },
  { name: "Minimalist Linen Button-Down Shirt", description: "Breathable 100% linen, relaxed fit.", category: "Fashion", price: 45, discount: 10, stock: 65, trending: false, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B07Y9XZ1C2", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800" },

  // Accessories
  { name: "Apple Watch Ultra 2", description: "Rugged titanium case, precision dual-frequency GPS.", category: "Accessories", price: 799, discount: 5, stock: 15, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0CHX547Q7", imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800" },
  { name: "Fossil Gen 6 Smartwatch", description: "Wear OS, stainless steel, fitness tracking.", category: "Accessories", price: 299, discount: 20, stock: 25, trending: false, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B09D1T47ZY", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
  { name: "Herschel Little America Backpack", description: "Classic mountaineering style, padded laptop sleeve.", category: "Accessories", price: 109, discount: 10, stock: 38, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0077B4BNC", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" },
  { name: "Anker PowerCore 10000", description: "Ultra-compact portable charger, high-speed charging.", category: "Accessories", price: 25, discount: 5, stock: 120, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0194WDVHI", imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800" },
  { name: "Hydro Flask Wide Mouth Water Bottle", description: "TempShield insulation, stainless steel, 32 oz.", category: "Accessories", price: 44, discount: 15, stock: 55, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B01KXILB5M", imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800" },
  { name: "Bellroy Leather Wallet", description: "Slim minimalist wallet, RFID protection.", category: "Accessories", price: 79, discount: 0, stock: 30, trending: false, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B07R4D2Q1Z", imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800" },
  { name: "Manta Sleep Mask", description: "100% blackout, adjustable eye cups.", category: "Accessories", price: 35, discount: 10, stock: 75, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B0711CWRV1", imageUrl: "https://images.unsplash.com/photo-1555529771-45415712e519?w=800" },
  
  // Home
  { name: "Dyson V15 Detect Cordless Vacuum", description: "Laser reveals microscopic dust, HEPA filtration.", category: "Home", price: 749, discount: 12, stock: 14, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B093Z3S1R1", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" },
  { name: "Ninja Air Fryer Max XL", description: "5.5 Quart capacity, Max Crisp Technology.", category: "Home", price: 169, discount: 20, stock: 40, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B07S6529QQ", imageUrl: "https://images.unsplash.com/photo-1585515656953-24f79f72c5a6?w=800" },
  { name: "Philips Hue Smart Bulbs Starter Kit", description: "Color changing LED, voice control with Alexa.", category: "Home", price: 199, discount: 15, stock: 22, trending: false, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B07G2PZVSL", imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800" },
  { name: "Nespresso VertuoPlus Coffee Machine", description: "Brews espresso and coffee, fast heat-up.", category: "Home", price: 159, discount: 10, stock: 28, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B01MQE6T9N", imageUrl: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800" },
  { name: "Le Creuset Dutch Oven", description: "Enameled cast iron, 5.5 quart, highly durable.", category: "Home", price: 419, discount: 5, stock: 10, trending: false, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B00004SBH7", imageUrl: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=800" },
  { name: "iRobot Roomba j7+ Robot Vacuum", description: "Self-emptying, obstacle avoidance, smart mapping.", category: "Home", price: 599, discount: 18, stock: 16, trending: true, bestSeller: false, amazonLink: "https://www.amazon.com/dp/B094NSV2R4", imageUrl: "https://images.unsplash.com/photo-1598965684699-27a3a9fbba81?w=800" },
  { name: "Yeti Tundra 45 Cooler", description: "Hard cooler, extraordinary insulation, rotomolded construction.", category: "Home", price: 325, discount: 0, stock: 32, trending: true, bestSeller: true, amazonLink: "https://www.amazon.com/dp/B004X0Q21Q", imageUrl: "https://images.unsplash.com/photo-1621285324545-ec7db6138d8f?w=800" }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Connected to DB...");

    // Try to find an admin, or just the first user
    let user = await User.findOne({ role: "admin" });
    if (!user) {
      user = await User.findOne({});
    }

    // If no user exists, create a dummy admin
    if (!user) {
      console.log("No user found. Creating a dummy admin user...");
      user = await User.create({
        name: "Admin User",
        email: "admin@luxecart.com",
        password: "password123",
        role: "admin"
      });
    }

    console.log("Clearing old products...");
    await Product.deleteMany({});

    console.log(`Inserting ${productsData.length} products...`);
    const payload = productsData.map(product => ({
      ...product,
      isTrending: product.trending,
      isBestSeller: product.bestSeller,
      createdBy: user._id
    }));

    await Product.insertMany(payload);
    console.log("Products seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error with data import", error);
    process.exit(1);
  }
};

seedDB();

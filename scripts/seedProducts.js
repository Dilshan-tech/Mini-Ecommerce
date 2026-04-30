const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const User = require("../models/User");

dotenv.config();

const products = [
  { name: "iPhone 15 Pro", description: "Flagship smartphone with A17 chip", category: "Electronics", price: 1299, discount: 8, stock: 15, isTrending: true, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=iPhone+15+Pro", imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200" },
  { name: "Samsung Galaxy S24", description: "Android premium phone with AI camera", category: "Electronics", price: 1149, discount: 10, stock: 20, isTrending: true, amazonLink: "https://www.amazon.in/s?k=Samsung+Galaxy+S24", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200" },
  { name: "MacBook Air M3", description: "Thin and fast laptop for dev work", category: "Electronics", price: 1499, discount: 7, stock: 10, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=MacBook+Air+M3", imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200" },
  { name: "Dell XPS 13", description: "Ultra-portable Windows laptop", category: "Electronics", price: 1399, discount: 12, stock: 12, amazonLink: "https://www.amazon.in/s?k=Dell+XPS+13", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200" },
  { name: "Sony WH-1000XM5", description: "Noise-cancelling wireless headphones", category: "Audio", price: 399, discount: 15, stock: 30, isTrending: true, amazonLink: "https://www.amazon.in/s?k=Sony+WH-1000XM5", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200" },
  { name: "Apple Watch Series 9", description: "Advanced health and fitness smartwatch", category: "Wearables", price: 449, discount: 9, stock: 18, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=Apple+Watch+Series+9", imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1200" },
  { name: "iPad Air", description: "Powerful tablet for study and design", category: "Electronics", price: 699, discount: 11, stock: 14, isTrending: true, amazonLink: "https://www.amazon.in/s?k=iPad+Air", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200" },
  { name: "Canon EOS R50", description: "Mirrorless camera for creators", category: "Electronics", price: 899, discount: 13, stock: 9, amazonLink: "https://www.amazon.in/s?k=Canon+EOS+R50", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200" },
  { name: "Logitech MX Master 3S", description: "Productivity wireless mouse", category: "Accessories", price: 129, discount: 6, stock: 40, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=Logitech+MX+Master+3S", imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200" },
  { name: "Mechanical Keyboard K8", description: "Hot-swappable RGB keyboard", category: "Accessories", price: 99, discount: 14, stock: 35, isTrending: true, amazonLink: "https://www.amazon.in/s?k=Mechanical+Keyboard+K8", imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200" },
  { name: "ASUS ROG Monitor 27", description: "165Hz gaming monitor", category: "Electronics", price: 329, discount: 12, stock: 16, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=ASUS+ROG+Monitor", imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200" },
  { name: "Seagate 2TB SSD", description: "High-speed external storage", category: "Accessories", price: 219, discount: 9, stock: 27, amazonLink: "https://www.amazon.in/s?k=Seagate+2TB+SSD", imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200" },
  { name: "Dyson V12 Vacuum", description: "Smart cordless vacuum cleaner", category: "Home", price: 549, discount: 18, stock: 11, isTrending: true, amazonLink: "https://www.amazon.in/s?k=Dyson+V12", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200" },
  { name: "Philips Air Fryer XL", description: "Health-first crispy cooking", category: "Home", price: 189, discount: 16, stock: 24, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=Philips+Air+Fryer+XL", imageUrl: "https://images.unsplash.com/photo-1585515656953-24f79f72c5a6?w=1200" },
  { name: "Levi's Slim Fit Denim", description: "Classic stretch denim for daily wear", category: "Fashion", price: 69, discount: 20, stock: 50, amazonLink: "https://www.amazon.in/s?k=Levis+Slim+Fit+Denim", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200" },
  { name: "Nike Air Zoom Pegasus", description: "Responsive running shoes", category: "Fashion", price: 139, discount: 17, stock: 32, isTrending: true, amazonLink: "https://www.amazon.in/s?k=Nike+Air+Zoom+Pegasus", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200" },
  { name: "Fossil Gen 6 Smartwatch", description: "Stylish smartwatch with fitness suite", category: "Wearables", price: 229, discount: 19, stock: 19, amazonLink: "https://www.amazon.in/s?k=Fossil+Gen+6+Smartwatch", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200" },
  { name: "JBL Flip 6", description: "Portable waterproof Bluetooth speaker", category: "Audio", price: 129, discount: 14, stock: 33, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=JBL+Flip+6", imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200" },
  { name: "Sony Alpha ZV-E10", description: "Creator-centric vlogging camera", category: "Electronics", price: 799, discount: 10, stock: 13, amazonLink: "https://www.amazon.in/s?k=Sony+ZV-E10", imageUrl: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1200" },
  { name: "Bose Soundbar 600", description: "Immersive Dolby Atmos audio", category: "Audio", price: 499, discount: 8, stock: 8, amazonLink: "https://www.amazon.in/s?k=Bose+Soundbar+600", imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200" },
  { name: "Kindle Paperwhite", description: "High-clarity e-reader for long reads", category: "Electronics", price: 179, discount: 22, stock: 41, isBestSeller: true, amazonLink: "https://www.amazon.in/s?k=Kindle+Paperwhite", imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200" },
  { name: "Adidas Essentials Hoodie", description: "Soft fleece hoodie for all seasons", category: "Fashion", price: 59, discount: 25, stock: 46, amazonLink: "https://www.amazon.in/s?k=Adidas+Essentials+Hoodie", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200" },
  { name: "Instant Pot Duo 7-in-1", description: "Multi-cooker for modern kitchens", category: "Home", price: 139, discount: 18, stock: 22, amazonLink: "https://www.amazon.in/s?k=Instant+Pot+Duo", imageUrl: "https://images.unsplash.com/photo-1601050690117-94f5f6fa6431?w=1200" },
  { name: "OnePlus Buds Pro 2", description: "Hi-res wireless earbuds", category: "Audio", price: 149, discount: 13, stock: 29, isTrending: true, amazonLink: "https://www.amazon.in/s?k=OnePlus+Buds+Pro+2", imageUrl: "https://images.unsplash.com/photo-1606741965509-157bb60f7f78?w=1200" }
];

const seedProducts = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      throw new Error("Admin user not found. Run npm run seed:admin first.");
    }

    await Product.deleteMany({});
    const payload = products.map(product => ({ ...product, createdBy: admin._id }));
    await Product.insertMany(payload);

    console.log(`${payload.length} products seeded successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Product seed failed:", error.message);
    process.exit(1);
  }
};

seedProducts();

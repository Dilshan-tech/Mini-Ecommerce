const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    image: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      default: ""
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 90
    },
    amazonLink: {
      type: String,
      default: "https://www.amazon.in/s?k=electronics"
    },
    trending: {
      type: Boolean,
      default: false
    },
    bestSeller: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

productSchema.pre("save", function syncCompatFlags(next) {
  this.imageUrl = this.imageUrl || this.image || "";
  this.image = this.image || this.imageUrl || "";

  if (this.isModified("trending")) {
    this.isTrending = this.trending;
  } else if (this.isModified("isTrending")) {
    this.trending = this.isTrending;
  }

  if (this.isModified("bestSeller")) {
    this.isBestSeller = this.bestSeller;
  } else if (this.isModified("isBestSeller")) {
    this.bestSeller = this.isBestSeller;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);

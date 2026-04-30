const fs = require("fs/promises");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const uploadImage = async (filePath, folder) => {
  if (!filePath) return "";

  if (!cloudinary || !isCloudinaryConfigured()) {
    return "";
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image"
    });
    return result.secure_url || "";
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
};

module.exports = uploadImage;

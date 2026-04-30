const fs = require("fs/promises");
const path = require("path");

const auditFilePath = path.join(__dirname, "..", "data", "product-audit.log");

const logProductAudit = async ({ action, user, productId, productName, changes }) => {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId: user?._id || null,
    userEmail: user?.email || "unknown",
    productId,
    productName,
    changes: changes || {}
  };

  await fs.mkdir(path.dirname(auditFilePath), { recursive: true });
  await fs.appendFile(auditFilePath, `${JSON.stringify(entry)}\n`, "utf8");
};

const readProductAudit = async (limit = 100) => {
  try {
    const raw = await fs.readFile(auditFilePath, "utf8");
    const lines = raw.trim() ? raw.trim().split("\n") : [];
    return lines
      .slice(-Math.max(1, Number(limit) || 100))
      .reverse()
      .map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

module.exports = {
  logProductAudit,
  readProductAudit
};

require("dotenv").config();

module.exports = {
  JWT_SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
};

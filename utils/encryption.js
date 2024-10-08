const crypto = require("crypto");

function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, process.env.SALT, 100000, 64, "sha512")
    .toString("hex");
}

module.exports = { hashPassword };

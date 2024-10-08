const fs = require("fs").promises;
const path = require("path");
const { encrypt, decrypt } = require("../config/security");

const SETTINGS_FILE = path.join(__dirname, "..", "settings.opz");

class Settings {
  static async get() {
    try {
      const encryptedData = await fs.readFile(SETTINGS_FILE, "utf8");
      const decryptedData = decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  static async set(settings) {
    const encryptedData = encrypt(JSON.stringify(settings));
    await fs.writeFile(SETTINGS_FILE, encryptedData, "utf8");
  }
}

module.exports = Settings;

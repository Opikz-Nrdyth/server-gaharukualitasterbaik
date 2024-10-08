const fs = require("fs").promises;
const path = require("path");
const { encrypt, decrypt } = require("../config/security");

const CACHE_DIR = path.join(__dirname, "..", "translate");

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Gagal membuat direktori cache:", error);
  }
}

async function getCachedTranslation(lang, productId) {
  const cacheFile = path.join(CACHE_DIR, `${lang}.opz`);
  try {
    await ensureCacheDir(); // Pastikan direktori cache ada sebelum membaca file
    const encryptedData = await fs.readFile(cacheFile, "utf8");
    const decryptedData = decrypt(encryptedData);
    const translations = JSON.parse(decryptedData);
    return {
      translation: translations[productId],
      source: "cache",
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`Cache file ${lang}.opz not found. Will create new cache.`);
    } else {
      console.error(`Error reading cache file ${lang}.opz:`, error);
    }
    return {
      translation: null,
      source: "miss",
    };
  }
}

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create cache directory:", error);
    throw error; // Re-throw error to be handled by caller
  }
}

async function setCachedTranslation(lang, productId, translation) {
  const cacheFile = path.join(CACHE_DIR, `${lang}.opz`);
  try {
    let translations = {};
    try {
      const encryptedData = await fs.readFile(cacheFile, "utf8");
      const decryptedData = decrypt(encryptedData);
      translations = JSON.parse(decryptedData);
    } catch (error) {
      // File tidak ada atau rusak, mulai dengan objek kosong
    }
    translations[productId] = translation;
    const encryptedData = encrypt(JSON.stringify(translations));
    await fs.writeFile(cacheFile, encryptedData);
  } catch (error) {
    console.error("Gagal menyimpan terjemahan ke cache:", error);
  }
}

module.exports = { ensureCacheDir, getCachedTranslation, setCachedTranslation };

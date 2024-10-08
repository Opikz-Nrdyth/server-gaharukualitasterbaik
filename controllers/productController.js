const Product = require("../models/Product");
const { validateProduct } = require("../utils/validation");
const fs = require("fs");
const path = require("path");
const translate = require("translate-google");
const axios = require("axios");
const translationCache = require("../utils/translationCache");

function getFullUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/images/products/${filename}`;
}

async function getCurrencyRates() {
  try {
    const response = await axios.get(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2024.10.5/v1/currencies/idr.json"
    );
    return response.data.idr;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return null;
  }
}

function convertPrice(price, rates, targetCurrency) {
  if (!rates || !rates[targetCurrency.toLowerCase()]) {
    return price;
  }
  return price * rates[targetCurrency.toLowerCase()];
}

function hasProductChanged(currentProduct, cachedProduct) {
  const fieldsToCompare = [
    "id_produk",
    "nama_produk",
    "deskripsi",
    "harga",
    "stok",
  ];
  return fieldsToCompare.some(
    (field) => currentProduct["id_produk"] !== cachedProduct["id_produk"]
  );
}

async function getTranslatedProduct(product, lang) {
  try {
    const { translation, source } = await translationCache.getCachedTranslation(
      lang,
      product.id_produk
    );

    if (translation && !hasProductChanged(product, translation)) {
      return { ...translation, _translationSource: "cache" };
    }
    const translatedProduct = await translate(product, {
      from: "id",
      to: lang,
    });

    await translationCache.setCachedTranslation(
      lang,
      product.id_produk,
      translatedProduct
    );

    return { ...translatedProduct, _translationSource: "api" };
  } catch (error) {
    console.error(
      `Translation failed for product ${product.id_produk}:`,
      error
    );
    return { ...product, _translationSource: "original" };
  }
}

exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      foto_produk: req.files
        ? req.files.map((file) => getFullUrl(req, file.filename))
        : [],
    };

    const { error } = validateProduct(productData);

    if (error) {
      // If validation fails, delete uploaded files
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(400).json({
        status: "error",
        message: "Error Validate Product: " + error.details[0].message,
        body: productData,
      });
    }

    const productId = await Product.create(productData);

    res.status(201).json({
      id: productId,
      status: "success",
      message: "Product created successfully",
      body: productData,
    });
  } catch (error) {
    // If an error occurs, delete uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({
      status: "error",
      message: "Error creating product from controller",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const lang = req.headers["lang"];
    const currency = req.headers["currencycode"] || "IDR";

    const rates = await getCurrencyRates();
    const products = await Product.findAll();

    let productsCurrecy = products.map((product) => {
      let processedProduct = product;

      processedProduct = {
        ...processedProduct,
        harga: convertPrice(parseInt(product.harga), rates, currency),
        currency: currency.toUpperCase(),
      };
      return processedProduct;
    });

    if (!translationCache) {
      console.error("translationCache is not defined");
      throw new Error("Internal server error");
    }

    await translationCache.ensureCacheDir();

    if (lang == "id") {
      res.json(products);
    } else {
      const translatedProducts = await Promise.all(
        productsCurrecy.map(async (product) => {
          try {
            return await getTranslatedProduct(product, lang);
          } catch (error) {
            console.error(
              `Error translating product ${product.id_produk}:`,
              error
            );
            return product;
          }
        })
      );

      res.json(translatedProducts);
    }
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      status: "error",
      message: "Error mengambil produk",
      error: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  const lang = req.headers["lang"];

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });
    }

    if (lang == "id") {
      res.json(product);
    } else {
      const translatedProduct = await getTranslatedProduct(product, lang);
      res.json(translatedProduct);
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error mengambil produk",
      error: error.message,
    });
  }
};

exports.getProductBySearch = async (req, res) => {
  const lang = req.headers["lang"];
  try {
    const products = await Product.findByQuery(req.params.q);
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });
    }

    if (lang == "id") {
      res.json(products);
    } else {
      const translatedProducts = await Promise.all(
        products.map((product) => getTranslatedProduct(product, lang))
      );
      res.json(translatedProducts);
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error mencari produk",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const updatedData = {
      ...req.body,
      foto_produk:
        req.files && req.files.length > 0
          ? req.files.map((file) => getFullUrl(req, file.filename))
          : existingProduct.foto_produk,
    };

    const { error } = validateProduct(updatedData);
    if (error) {
      // If validation fails, delete newly uploaded files
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }

    // Delete old files if new ones are uploaded
    if (req.files && req.files.length > 0) {
      existingProduct.foto_produk.forEach((url) => {
        const filename = path.basename(url);
        const filePath = path.join("images/products/", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Product.update(productId, updatedData);
    res.json({
      status: "success",
      message: "Product updated successfully",
      body: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating product",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting product",
      error: error.message,
    });
  }
};

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const popularityRoutes = require("./routes/popularityRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const slidebarRoutes = require("./routes/slidebarRoutes");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = path.join(destination, filename);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      cb(null, filename);
    },
  });

const uploadProduk = multer({ storage: createStorage("images/products") });
const uploadSettings = multer({ storage: createStorage("images/settings") });

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: {
    status: "error",
    message: "Terlalu banyak permintaan, coba nanti lagi.",
  },
});
app.use(limiter);

app.use(cors());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/products", uploadProduk.array("foto_produk"), productRoutes);
app.use("/api/popularity", popularityRoutes);
app.use("/api/settings", uploadSettings.array("foto_company"), settingsRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/slides", slidebarRoutes);

module.exports = app;

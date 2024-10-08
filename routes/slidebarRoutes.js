const express = require("express");
const router = express.Router();
const slidebarController = require("../controllers/slidebarController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// GET route to retrieve slideshow
router.get("/", slidebarController.getSlideshow);

// PUT route to update slideshow
router.put("/", upload.array("slides"), slidebarController.updateSlideshow);

module.exports = router;

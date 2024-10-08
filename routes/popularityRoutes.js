const express = require("express");
const router = express.Router();
const popularityController = require("../controllers/popularityController");

router.post("/", popularityController.createPopularity);
router.get("/:id", popularityController.getPopularity);
router.put("/:id", popularityController.updatePopularity);
router.delete("/:id", popularityController.deletePopularity);
router.get("/", popularityController.getAllPopularities);

module.exports = router;

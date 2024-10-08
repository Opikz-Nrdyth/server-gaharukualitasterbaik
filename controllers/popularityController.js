const Popularity = require("../models/Popularity");
const { validatePopularity } = require("../utils/validation");

exports.createPopularity = async (req, res) => {
  try {
    const { error } = validatePopularity(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const popularityId = await Popularity.create(req.body);
    res
      .status(201)
      .json({ id: popularityId, message: "Popularity created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating popularity", error: error.message });
  }
};

exports.getPopularity = async (req, res) => {
  try {
    const popularity = await Popularity.findById(req.params.id);
    if (!popularity) {
      return res.status(404).json({ message: "Popularity not found" });
    }
    res.json(popularity);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching popularity", error: error.message });
  }
};

exports.updatePopularity = async (req, res) => {
  try {
    const { error } = validatePopularity(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    await Popularity.update(req.params.id, req.body);
    res.json({ message: "Popularity updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating popularity", error: error.message });
  }
};

exports.deletePopularity = async (req, res) => {
  try {
    await Popularity.delete(req.params.id);
    res.json({ message: "Popularity deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting popularity", error: error.message });
  }
};

exports.getAllPopularities = async (req, res) => {
  try {
    const popularities = await Popularity.findAll();
    res.json(popularities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching popularities", error: error.message });
  }
};

const Slidebar = require("../models/Slidebar");
const { validateSlides } = require("../utils/validation");
const path = require("path");
const fs = require("fs").promises;

let urlHost = "";
const uploadDir = path.join(__dirname, "../images/slideshow");

exports.getSlideshow = async (req, res) => {
  urlHost = `${req.protocol}://${req.get("host")}`;
  try {
    const slideshow = await Slidebar.getSlideshow();
    res.json(slideshow);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slideshow" });
  }
};

exports.updateSlideshow = async (req, res) => {
  urlHost = `${req.protocol}://${req.get("host")}`;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const slides = await Promise.all(
      req.files.map(async (file) => {
        const extension = path.extname(file.originalname);
        const filename = `${file.filename}${extension}`;
        const filePath = path.join(uploadDir, filename);

        // Move file to the correct directory
        await fs.rename(file.path, filePath);

        return {
          url: `${urlHost}/images/slideshow/${filename}`,
          filename: filename,
        };
      })
    );

    const { error } = validateSlides({
      slides: slides.map((slide) => slide.url),
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await Slidebar.updateSlideshow(slides);
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: "Failed to update slideshow" });
  }
};

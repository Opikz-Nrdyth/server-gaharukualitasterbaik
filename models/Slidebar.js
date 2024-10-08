const fs = require("fs").promises;
const path = require("path");

class Slidebar {
  constructor() {
    this.filePath = path.join(__dirname, "../utils/slideshow.json");
  }

  async getSlideshow() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        // File doesn't exist, return empty array
        return [];
      }
      throw error;
    }
  }

  async updateSlideshow(slides) {
    const data = JSON.stringify(slides, null, 2);
    await fs.writeFile(this.filePath, data, "utf8");
  }
}

module.exports = new Slidebar();

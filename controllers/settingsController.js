const Settings = require("../models/Settings");
const { validateSettings } = require("../utils/validation");
const fs = require("fs").promises;
const path = require("path");
const translate = require("translate-google");

function getFullUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/images/settings/${filename}`;
}
exports.getSettings = async (req, res) => {
  const lang = req.headers["lang"];
  try {
    const settings = await Settings.get();
    if (!settings) {
      return res
        .status(404)
        .json({ status: "error", message: "Settings not found" });
    }
    translate(settings, { to: lang })
      .then((ressult) => {
        res.json(ressult);
      })
      .catch((err) => {
        res.json(settings);
      });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let fotoCompany;
    if (req.files && req.files.length > 0) {
      fotoCompany = req.files.map((file) => getFullUrl(req, file.filename));
    } else if (req.body.foto_company) {
      // Jika foto_company adalah string, ubah menjadi array
      fotoCompany = Array.isArray(req.body.foto_company)
        ? req.body.foto_company
        : [req.body.foto_company];
    } else {
      fotoCompany = [];
    }

    const settingsData = {
      ...req.body,
      foto_company: fotoCompany,
    };

    const { error } = validateSettings(settingsData);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }
    await Settings.set(settingsData);
    res.json({ status: "success", message: "Pengaturan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui pengaturan",
      error: error.message,
    });
  }
};

exports.resetSettings = async (req, res) => {
  try {
    // Baca file setSettings.json
    const defaultSettingsPath = path.join(
      __dirname,
      "..",
      "utils",
      "setSettings.json"
    );
    const defaultSettingsJSON = await fs.readFile(defaultSettingsPath, "utf8");
    const defaultSettings = JSON.parse(defaultSettingsJSON);

    // Simpan pengaturan default ke database
    await Settings.set(defaultSettings);

    res.json({
      status: "success",
      message: "Pengaturan berhasil direset ke setelan pabrik",
      data: defaultSettings,
    });
  } catch (error) {
    console.error("Error saat mereset pengaturan:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mereset pengaturan",
      error: error.message,
    });
  }
};

exports.saveCurrentSettingsAsDefault = async (req, res) => {
  try {
    // Ambil pengaturan saat ini dari database
    const currentSettings = await Settings.get();

    // Path ke file setSettings.json
    const defaultSettingsPath = path.join(
      __dirname,
      "..",
      "utils",
      "setSettings.json"
    );

    // Konversi pengaturan saat ini ke format JSON
    const settingsJSON = JSON.stringify(currentSettings, null, 2);

    // Tulis ke file setSettings.json
    await fs.writeFile(defaultSettingsPath, settingsJSON, "utf8");

    res.json({
      status: "success",
      message:
        "Pengaturan saat ini berhasil disimpan sebagai pengaturan default",
      data: currentSettings,
    });
  } catch (error) {
    console.error("Error saat menyimpan pengaturan default:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menyimpan pengaturan default",
      error: error.message,
    });
  }
};

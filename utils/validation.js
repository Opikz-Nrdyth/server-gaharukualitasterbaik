const Joi = require("joi");

const productSchema = Joi.object({
  foto_produk: Joi.array().items(Joi.string().uri()).required(),
  nama_produk: Joi.string().required(),
  jenis: Joi.string().required(),
  negara_asal: Joi.string().required(),
  harga: Joi.number().required(),
  stok: Joi.number().integer().required(),
  deskripsi: Joi.string().required(),
  link_catalog: Joi.string().required(),
});

const popularitySchema = Joi.object({
  id_produk: Joi.number().integer().required(),
  nama_produk: Joi.string().required(),
  skor_popularity: Joi.number().required(),
  presentase_popularity: Joi.number().required(),
});

const settingsSchema = Joi.object({
  foto_company: Joi.array().items(Joi.string().uri()).optional(),
  nama_company: Joi.string().required(),
  alamat: Joi.string().required(),
  intregrate_pembayaran: Joi.array()
    .items(
      Joi.object({
        logo: Joi.string().required(),
        nama: Joi.string().required(),
      })
    )
    .required(),
  intregrate_pengiriman: Joi.array()
    .items(
      Joi.object({
        logo: Joi.string().required(),
        nama: Joi.string().required(),
      })
    )
    .required(),
  nomer_whatsapp_bisnis: Joi.string().required(),
  akun_sosmed_lainnya: Joi.object().pattern(/^/, Joi.string()).optional(),
  username_admin: Joi.string().required(),
  password_admin: Joi.string().required(),
  avcance_settings: Joi.object().optional(),
});

const slidesSchema = Joi.object({
  slides: Joi.array().items().required(),
});

function validateProduct(product) {
  return productSchema.validate(product);
}

function validatePopularity(popularity) {
  return popularitySchema.validate(popularity);
}

function validateSettings(settings) {
  return settingsSchema.validate(settings);
}

function validateSlides(slides) {
  return slidesSchema.validate(slides);
}

module.exports = {
  validateProduct,
  validatePopularity,
  validateSettings,
  validateSlides,
};

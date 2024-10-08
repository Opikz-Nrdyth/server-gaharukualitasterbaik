const { pool } = require("../config/database");
const Popularity = require("./Popularity");
const { encrypt, decrypt } = require("../config/security");

class Invoice {
  static async createInvoice(productId, quantity) {
    const [rows] = await pool.query(
      "SELECT id_produk, nama_produk, harga FROM produk WHERE id_produk = ?",
      [productId]
    );

    if (rows.length === 0) {
      throw new Error("Product not found");
    }
    const { id_produk, nama_produk, harga } = rows[0];
    const total = harga * quantity;
    const query =
      "INSERT INTO invoices (product_id, quantity, total, status) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(query, [
      id_produk,
      quantity,
      total,
      "pending",
    ]);

    // Update popularity

    await Popularity.updateBuyCount(id_produk, nama_produk, quantity);

    return result.insertId;
  }

  static async updateInvoice(productId, id_invoice) {
    const [rows] = await pool.query(
      "SELECT id_produk, nama_produk, harga FROM produk WHERE id_produk = ?",
      [productId]
    );

    if (rows.length === 0) {
      throw new Error("Product not found " + productId);
    }

    const query = "UPDATE `invoices` SET `status`=? WHERE id=?";
    const [result] = await pool.query(query, ["success", id_invoice]);

    return result;
  }

  static async deleteInvoice(invoice_id) {
    const query = "DELETE FROM `invoices` WHERE id=?";
    const [result] = await pool.query(query, [invoice_id]);
    return result;
  }

  static async getInvoiceById(id) {
    const query =
      "SELECT * FROM `invoices` LEFT JOIN produk ON invoices.product_id = produk.id_produk WHERE id = ?";
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async getAllInvoices() {
    const query =
      "SELECT * FROM `invoices` LEFT JOIN produk ON invoices.product_id = produk.id_produk";
    const [rows] = await pool.query(query);

    return rows.map((item) => ({
      ...item,
      nama_produk: decrypt(item.nama_produk),
      deskripsi: decrypt(item.deskripsi),
    }));
  }

  static async getStatusInvoice(status) {
    const query = `SELECT invoices.*, produk.nama_produk, produk.jenis, produk.harga, produk.negara_asal, produk.deskripsi FROM invoices LEFT JOIN produk ON invoices.product_id = produk.id_produk WHERE status='${status}'`;

    const [rows] = await pool.query(query);

    return rows.map((item) => ({
      ...item,
      nama_produk: item.nama_produk ? decrypt(item.nama_produk) : null,
      deskripsi: item.deskripsi ? decrypt(item.deskripsi) : null,
    }));
  }
}

module.exports = Invoice;

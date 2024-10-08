const e = require("express");
const { pool } = require("../config/database");
const { encrypt, decrypt } = require("../config/security");

class Popularity {
  static async create(popularity) {
    const encryptedPopularity = {
      ...popularity,
      nama_produk: popularity.nama_produk,
    };

    const [result] = await pool.query(
      "INSERT INTO popularity SET ?",
      encryptedPopularity
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM popularity WHERE id_produk = ?",
      [id]
    );
    if (rows.length === 0) return null;

    const popularity = rows[0];
    return {
      ...popularity,
      nama_produk: decrypt(popularity.nama_produk),
    };
  }

  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM popularity");
    return rows.map((popularity) => ({
      ...popularity,
      nama_produk: decrypt(popularity.nama_produk),
    }));
  }

  static async update(id, popularity) {
    const encryptedPopularity = {
      ...popularity,
      nama_produk: popularity.nama_produk ? popularity.nama_produk : undefined,
    };

    await pool.query("UPDATE popularity SET ? WHERE id_produk = ?", [
      encryptedPopularity,
      id,
    ]);
  }

  static async delete(id) {
    await pool.query("DELETE FROM popularity WHERE id_produk = ?", [id]);
  }

  static async updateBuyCount(id_produk, nama_produk, quantity) {
    const [rows] = await pool.query(
      "SELECT * FROM popularity WHERE id_produk = ?",
      [id_produk]
    );

    if (rows.length === 0) {
      // Jika belum ada data popularitas, buat baru
      const newPopularity = {
        id_produk,
        nama_produk: nama_produk,
        klik: 0,
        buy: quantity,
        skor_popularity: this.calculateScore(0, quantity),
        presentase_popularity: 0, // Ini akan dihitung nanti
      };
      await this.create(newPopularity);
    } else {
      // Update data yang sudah ada
      const currentPopularity = rows[0];
      const newBuy = currentPopularity.buy + quantity;
      const newSkor = this.calculateScore(currentPopularity.klik, newBuy);

      await this.update(id_produk, {
        buy: newBuy,
        nama_produk: nama_produk,
        skor_popularity: newSkor,
      });
    }

    // Hitung ulang persentase untuk semua produk
    await this.recalculateAllPercentages();
  }

  static async updateClickCount(id_produk, namaProduk) {
    const [rows] = await pool.query(
      "SELECT * FROM popularity larity WHERE id_produk = ?",
      [id_produk]
    );
    if (rows.length === 0) {
      // Jika belum ada data popularitas, buat baru
      const newPopularity = {
        id_produk,
        nama_produk: namaProduk,
        klik: 1,
        buy: 0,
        skor_popularity: this.calculateScore(1, 0),
        presentase_popularity: 0, // Ini akan dihitung nanti
      };
      await this.create(newPopularity);
    } else {
      const currentPopularity = rows[0];
      const nama_produk = currentPopularity.nama_produk;

      const newKlik = currentPopularity.klik + 1;
      const newSkor = this.calculateScore(newKlik, currentPopularity.buy);

      await this.update(id_produk, {
        klik: newKlik,
        skor_popularity: newSkor,
        nama_produk: nama_produk,
      });
    }

    // Hitung ulang persentase untuk semua produk
    const presentase = await this.recalculateAllPercentages();
  }

  static async recalculateAllPercentages() {
    const [rows] = await pool.query(
      "SELECT id_produk, skor_popularity FROM popularity"
    );
    const totalScore = rows.reduce((sum, row) => sum + row.skor_popularity, 0);

    for (const row of rows) {
      const percentage = (row.skor_popularity / parseFloat(totalScore)) * 100;

      await pool.query(
        "UPDATE popularity SET presentase_popularity = ? WHERE id_produk = ?",
        [percentage, row.id_produk]
      );
    }
  }

  static calculateScore(klik, buy) {
    return klik * 0.3 + buy * 0.7;
  }

  static async getTopPopularProducts(limit = 10) {
    const [rows] = await pool.query(
      "SELECT * FROM popularity ORDER BY skor_popularity DESC LIMIT ?",
      [limit]
    );
    return rows.map((popularity) => ({
      ...popularity,
      nama_produk: decrypt(popularity.nama_produk),
    }));
  }
}

module.exports = Popularity;

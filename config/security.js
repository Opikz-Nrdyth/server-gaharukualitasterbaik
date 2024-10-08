const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  if (Buffer.from(ENCRYPTION_KEY).length !== 32) {
    console.log(
      `Invalid key length: ENCRYPTION_KEY must be 32 bytes long, your key length: ${
        Buffer.from(ENCRYPTION_KEY).length
      }`
    );

    throw new Error("Invalid key length: ENCRYPTION_KEY must be 32 bytes long");
  }

  if (iv.length !== 16) {
    console.log(
      `Invalid IV length: IV must be 16 bytes long, Your IV length: ${iv.length}`
    );

    throw new Error("Invalid IV length: IV must be 16 bytes long");
  }

  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };

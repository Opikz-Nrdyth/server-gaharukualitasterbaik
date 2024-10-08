const Invoice = require("../models/Invoice");

exports.createInvoice = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const invoiceId = await Invoice.createInvoice(productId, quantity);
    res.status(201).json({
      status: "success",
      message: "Invoice created successfully",
      invoiceId,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { productId, invoice_id } = req.body;
    const invoiceId = await Invoice.updateInvoice(productId, invoice_id);
    res.status(201).json({
      status: "success",
      message: "Invoice confirm successfully",
      invoiceId,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const deleteInvoice = await Invoice.deleteInvoice(req.params.id);
    res.status(201).json({
      status: "success",
      message: "Invoice confirm successfully",
      deleteInvoice,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.getInvoiceById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ status: "error", message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

exports.getStatusInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getStatusInvoice(req.params.status);
    res.json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: error.message });
  }
};

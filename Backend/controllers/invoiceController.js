const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const user = req.user;
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
    } = req.body;

    // Validate required fields
    if (!invoiceNumber || !invoiceDate || !dueDate || !billTo || !items || items.length === 0) {
      return res.status(400).json({
        message: "Missing required fields",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Auto-populate billFrom from user data if not provided
    const invoiceBillFrom = billFrom || {
      businessName: user.businessName || user.name || "",
      email: user.email || "",
      address: user.address || "",
      phone: user.phone || ""
    };

    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach((item) => {
      const itemQuantity = Number(item.quantity) || 0;
      const itemUnitPrice = Number(item.unitPrice) || 0;
      const itemTaxPercent = Number(item.taxPercent) || 0;
      const itemTotal = itemQuantity * itemUnitPrice;
      
      subtotal += itemTotal;
      taxTotal += (itemTotal * itemTaxPercent) / 100;
    });

    const total = subtotal + taxTotal;

    const invoice = new Invoice({
      user: user._id,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom: invoiceBillFrom,
      billTo,
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        taxPercent: Number(item.taxPercent) || 0,
        total: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
      })),
      notes,
      paymentTerms,
      subtotal,
      taxTotal,
      total,
    });

    await invoice.save();
    
    // Return the saved invoice with proper _id
    res.status(201).json({
      ...invoice.toObject(),
      _id: invoice._id // Ensure _id is included
    });
    
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
        code: "VALIDATION_ERROR"
      });
    }
    
    res.status(500).json({
      message: "Error creating invoice",
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};

// @desc    Get all invoices of logged-in user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    // Only get invoices for the authenticated user
    const invoices = await Invoice.find({ user: req.user._id });
    
    console.log(`Found ${invoices.length} invoices for user: ${req.user._id}`);
    
    // Debug: Check for invoices without _id
    const invoicesWithoutId = invoices.filter(inv => !inv._id);
    if (invoicesWithoutId.length > 0) {
      console.error(`${invoicesWithoutId.length} invoices missing _id field`);
    }
    
    // Ensure all invoices have _id field and billFrom populated
    const safeInvoices = invoices.map(invoice => {
      const invoiceObj = invoice.toObject();
      
      // Auto-populate billFrom if missing
      if (!invoiceObj.billFrom || !invoiceObj.billFrom.businessName) {
        invoiceObj.billFrom = {
          businessName: req.user.businessName || req.user.name || "",
          email: req.user.email || "",
          address: req.user.address || "",
          phone: req.user.phone || ""
        };
      }
      
      return {
        ...invoiceObj,
        _id: invoice._id || mongoose.Types.ObjectId() // Fallback if missing
      };
    });
    
    res.json(safeInvoices);
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        message: "Invalid invoice ID",
        code: "INVALID_ID"
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
        code: "INVOICE_NOT_FOUND"
      });
    }

    // Security check: Ensure the invoice belongs to the logged-in user
    if (invoice.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized to access this invoice",
        code: "UNAUTHORIZED"
      });
    }

    // Ensure invoice has _id and billFrom populated
    const safeInvoice = invoice.toObject();
    safeInvoice._id = invoice._id;
    
    // Auto-populate billFrom if missing
    if (!safeInvoice.billFrom || !safeInvoice.billFrom.businessName) {
      safeInvoice.billFrom = {
        businessName: req.user.businessName || req.user.name || "",
        email: req.user.email || "",
        address: req.user.address || "",
        phone: req.user.phone || ""
      };
    }
    
    res.json(safeInvoice);
  } catch (error) {
    console.error("GET INVOICE BY ID ERROR:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }
    
    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        message: "Invalid invoice ID",
        code: "INVALID_ID"
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }

    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
    } = req.body;

    // First check if invoice exists and belongs to user
    const existingInvoice = await Invoice.findOne({
      _id: id,
      user: req.user._id
    });

    if (!existingInvoice) {
      return res.status(404).json({ 
        message: "Invoice not found",
        code: "INVOICE_NOT_FOUND"
      });
    }

    // Auto-populate billFrom from user data if not provided
    const invoiceBillFrom = billFrom || existingInvoice.billFrom || {
      businessName: req.user.businessName || req.user.name || "",
      email: req.user.email || "",
      address: req.user.address || "",
      phone: req.user.phone || ""
    };

    // Recalculate totals if items changed
    let subtotal = 0;
    let taxTotal = 0;
    let updatedItems = items;
    
    if (items && items.length > 0) {
      updatedItems = items.map(item => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const taxPercent = Number(item.taxPercent) || 0;
        const itemTotal = quantity * unitPrice;
        
        subtotal += itemTotal;
        taxTotal += (itemTotal * taxPercent) / 100;
        
        return {
          ...item,
          quantity,
          unitPrice,
          taxPercent,
          total: itemTotal
        };
      });
    } else {
      // Use existing items if no new items provided
      subtotal = existingInvoice.subtotal;
      taxTotal = existingInvoice.taxTotal;
      updatedItems = existingInvoice.items;
    }

    const total = subtotal + taxTotal;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        invoiceNumber,
        invoiceDate,
        dueDate,
        billFrom: invoiceBillFrom,
        billTo,
        items: updatedItems,
        notes,
        paymentTerms,
        status,
        subtotal,
        taxTotal,
        total,
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    // Ensure updated invoice has _id
    const safeUpdatedInvoice = {
      ...updatedInvoice.toObject(),
      _id: updatedInvoice._id
    };
    
    res.json(safeUpdatedInvoice);
  } catch (error) {
    console.error("UPDATE INVOICE ERROR:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
        code: "VALIDATION_ERROR"
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }
    
    res.status(500).json({ 
      message: "Error updating invoice", 
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        message: "Invalid invoice ID",
        code: "INVALID_ID"
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }

    // Only delete if invoice belongs to current user
    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      user: req.user._id // Security: only delete user's own invoices
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
        code: "INVOICE_NOT_FOUND"
      });
    }

    res.json({
      message: "Invoice deleted successfully",
      deletedInvoiceId: invoice._id,
      code: "DELETE_SUCCESS"
    });
  } catch (error) {
    console.error("DELETE INVOICE ERROR:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid invoice ID format",
        code: "INVALID_ID_FORMAT"
      });
    }
    
    res.status(500).json({
      message: "Error deleting invoice",
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          paidAmount: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Paid"] }, "$total", 0] 
            } 
          },
          pendingAmount: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Pending"] }, "$total", 0] 
            } 
          },
          overdueAmount: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Unpaid"] }, "$total", 0] 
            } 
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };

    res.json(result);
  } catch (error) {
    console.error("GET INVOICE STATS ERROR:", error);
    res.status(500).json({
      message: "Error fetching invoice statistics",
      error: error.message,
      code: "SERVER_ERROR"
    });
  }
};
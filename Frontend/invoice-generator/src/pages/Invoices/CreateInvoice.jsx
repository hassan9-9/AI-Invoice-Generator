import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

const CreateInvoice = ({ existingInvoice, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    existingInvoice || {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName || "",
        email: user?.email || "",
        address: user?.address || "",
        phone: user?.phone || "",
      },
      billTo: {
        clientName: "",
        email: "",
        address: "",
        phone: "",
      },
      items: [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }],
      notes: "",
      paymentTerms: "Net 15",
    }
  );

  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  useEffect(() => {
    const a1Data = location.state?.a1Data;

    if (a1Data) {
      setFormData((prev) => ({
        ...prev,
        billTo: {
          clientName: a1Data.clientName || "",
          email: a1Data.email || "",
          address: a1Data.address || "",
          phone: a1Data.phone || "",
        },
        items: a1Data.items || [
          { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
        ],
      }));
    }

    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        invoiceDate: moment(existingInvoice.invoiceDate).format("YYYY-MM-DD"),
        dueDate: moment(existingInvoice.dueDate).format("YYYY-MM-DD"),
      });
    } else {
      const generateNewInvoiceNumber = async () => {
        setIsGeneratingNumber(true);
        try {
          const response = await axiosInstance.get(
            API_PATHS.INVOICE.GET_ALL_INVOICES
          );
          const invoices = response.data;
          let maxNum = 0;
          invoices.forEach((inv) => {
            const num = parseInt(inv.invoiceNumber.split("-")[1]);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
          const newInvoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;
          setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error("Failed to generate invoice number", error);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: `INV-${Date.now().toString().slice(-3)}`,
          }));
        }
        setIsGeneratingNumber(false);
      };
      generateNewInvoiceNumber();
    }
  }, [existingInvoice, location.state]);

  const handleInputChange = (e, section, index) => {
    const { name, value } = e.target;

    if (section && index !== undefined) {
      // Handle items array
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        ),
      }));
    } else if (section) {
      // Handle nested objects (billFrom, billTo)
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const { subtotal, taxTotal, total } = (() => {
    let subtotal = 0,
      taxTotal = 0;
    formData.items.forEach((item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += itemTotal;
      taxTotal += itemTotal * ((item.taxPercent || 0) / 100);
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onSave) {
        // If onSave prop is provided, use it (for modal or embedded usage)
        await onSave(formData);
        toast.success(
          existingInvoice
            ? "Invoice updated successfully!"
            : "Invoice created successfully!"
        );
      } else {
        // Otherwise, use direct API call
        const endpoint = existingInvoice
          ? `${API_PATHS.INVOICE.UPDATE_INVOICE}/${existingInvoice._id}`
          : API_PATHS.INVOICE.CREATE;

        const method = existingInvoice ? "put" : "post";

        await axiosInstance[method](endpoint, formData);

        toast.success(
          existingInvoice
            ? "Invoice updated successfully!"
            : "Invoice created successfully!"
        );
        navigate("/invoices");
      }
    } catch (error) {
      console.error("Failed to save invoice", error);
      toast.error("Failed to save invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {existingInvoice ? "Edit Invoice" : "Create Invoice"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded"
              required
              disabled={isGeneratingNumber}
            />
            {isGeneratingNumber && (
              <p className="text-xs text-gray-500 mt-1">
                Generating invoice number...
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Terms
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded"
            >
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 60">Net 60</option>
              <option value="Due on receipt">Due on receipt</option>
            </select>
          </div>
        </div>

        {/* Bill From */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Bill From</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={formData.billFrom.businessName}
              onChange={(e) => handleInputChange(e, "billFrom")}
              className="p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.billFrom.email}
              onChange={(e) => handleInputChange(e, "billFrom")}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.billFrom.address}
              onChange={(e) => handleInputChange(e, "billFrom")}
              className="p-2 border rounded col-span-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.billFrom.phone}
              onChange={(e) => handleInputChange(e, "billFrom")}
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Bill To */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Bill To</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={formData.billTo.clientName}
              onChange={(e) => handleInputChange(e, "billTo")}
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.billTo.email}
              onChange={(e) => handleInputChange(e, "billTo")}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.billTo.address}
              onChange={(e) => handleInputChange(e, "billTo")}
              className="p-2 border rounded col-span-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.billTo.phone}
              onChange={(e) => handleInputChange(e, "billTo")}
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Items */}
        <div className="border p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  name="name"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-4 p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2 p-2 border rounded"
                  min="1"
                />
                <input
                  type="number"
                  name="unitPrice"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2 p-2 border rounded"
                  step="0.01"
                  min="0"
                />
                <input
                  type="number"
                  name="taxPercent"
                  placeholder="Tax %"
                  value={item.taxPercent}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2 p-2 border rounded"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={formData.items.length === 1}
                  className="col-span-1 p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Tax:</span>
            <span>${taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange(e)}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Additional notes..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isGeneratingNumber}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Saving..."
              : existingInvoice
              ? "Update Invoice"
              : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/ui/InputField";
import SelectField from "../../components/ui/SelectField";
import TextareaField from "../../components/ui/TextareaField";

const CreateInvoice = ({ existingInvoice, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Helper function to safely initialize invoice data
  const initializeInvoiceData = (invoice) => {
    const defaultData = {
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
      items: [{ 
        name: "", 
        quantity: 1, 
        unitPrice: 0, 
        taxPercent: 0,
        total: 0 
      }],
      notes: "",
      paymentTerms: "Net 15",
      subtotal: 0,
      taxTotal: 0,
      total: 0
    };

    if (!invoice) return defaultData;

    // Merge existing invoice with defaults, ensuring all nested objects exist
    return {
      ...defaultData,
      ...invoice,
      billFrom: {
        businessName: invoice.billFrom?.businessName || defaultData.billFrom.businessName,
        email: invoice.billFrom?.email || defaultData.billFrom.email,
        address: invoice.billFrom?.address || defaultData.billFrom.address,
        phone: invoice.billFrom?.phone || defaultData.billFrom.phone,
      },
      billTo: {
        clientName: invoice.billTo?.clientName || "",
        email: invoice.billTo?.email || "",
        address: invoice.billTo?.address || "",
        phone: invoice.billTo?.phone || "",
      },
      items: Array.isArray(invoice.items) && invoice.items.length > 0
        ? invoice.items.map(item => ({
            name: item.name || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            taxPercent: item.taxPercent || 0,
            total: item.total || 0
          }))
        : defaultData.items
    };
  };

  const [formData, setFormData] = useState(() => initializeInvoiceData(existingInvoice));
  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  // Helper function to calculate item total
  const calculateItemTotal = (quantity, unitPrice) => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    return qty * price;
  };

  // Helper function to calculate tax amount for an item
  const calculateItemTax = (itemTotal, taxPercent) => {
    const total = Number(itemTotal) || 0;
    const tax = Number(taxPercent) || 0;
    return total * (tax / 100);
  };

  // Recalculate all totals when formData changes
  useEffect(() => {
    let subtotal = 0;
    let taxTotal = 0;
    
    formData.items.forEach((item) => {
      const itemTotal = calculateItemTotal(item.quantity, item.unitPrice);
      const itemTax = calculateItemTax(itemTotal, item.taxPercent);
      subtotal += itemTotal;
      taxTotal += itemTax;
    });
    
    const total = subtotal + taxTotal;
    
    // Update formData with calculated totals (but don't cause infinite loop)
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxTotal,
      total
    }));
  }, [formData.items]);

  useEffect(() => {
    const a1Data = location.state?.a1Data;

    if (a1Data) {
      setFormData((prev) => {
        const itemsWithTotals = (a1Data.items || [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0 }])
          .map(item => ({
            ...item,
            total: calculateItemTotal(item.quantity, item.unitPrice)
          }));
        
        return {
          ...prev,
          billTo: {
            clientName: a1Data.clientName || "",
            email: a1Data.email || "",
            address: a1Data.address || "",
            phone: a1Data.phone || "",
          },
          items: itemsWithTotals,
        };
      });
    }

    if (existingInvoice) {
      // Ensure existing invoice items have total calculated
      const itemsWithTotals = (existingInvoice.items || []).map(item => ({
        ...item,
        total: item.total || calculateItemTotal(item.quantity, item.unitPrice)
      }));
      
      setFormData(prev => ({
        ...initializeInvoiceData(existingInvoice),
        items: itemsWithTotals.length > 0 ? itemsWithTotals : prev.items,
        invoiceDate: existingInvoice.invoiceDate 
          ? moment(existingInvoice.invoiceDate).format("YYYY-MM-DD")
          : prev.invoiceDate,
        dueDate: existingInvoice.dueDate 
          ? moment(existingInvoice.dueDate).format("YYYY-MM-DD")
          : prev.dueDate,
      }));
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
      setFormData((prev) => {
        const updatedItems = prev.items.map((item, i) => {
          if (i === index) {
            const updatedItem = { ...item, [name]: value };
            
            // Recalculate total when quantity, unitPrice, or taxPercent changes
            if (name === 'quantity' || name === 'unitPrice' || name === 'taxPercent') {
              const quantity = Number(updatedItem.quantity) || 0;
              const unitPrice = Number(updatedItem.unitPrice) || 0;
              const taxPercent = Number(updatedItem.taxPercent) || 0;
              
              updatedItem.total = calculateItemTotal(quantity, unitPrice);
              // Note: tax calculation is done in the totals useEffect
            }
            
            return updatedItem;
          }
          return item;
        });
        
        return {
          ...prev,
          items: updatedItems
        };
      });
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
        { name: "", quantity: 1, unitPrice: 0, taxPercent: 0, total: 0 },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with properly calculated totals
      const preparedData = {
        ...formData,
        items: formData.items.map(item => ({
          name: item.name,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          total: Number(item.total) || 0 // This should already be calculated
        })),
        subtotal: Number(formData.subtotal) || 0,
        taxTotal: Number(formData.taxTotal) || 0,
        total: Number(formData.total) || 0
      };

      console.log("Submitting invoice data:", preparedData);

      if (onSave) {
        // If onSave prop is provided, use it (for modal or embedded usage)
        await onSave(preparedData);
        toast.success(
          existingInvoice
            ? "Invoice updated successfully!"
            : "Invoice created successfully!"
        );
      } else {
        // Otherwise, use direct API call
        const endpoint = existingInvoice
          ? API_PATHS.INVOICE.UPDATE_INVOICE(existingInvoice._id)
          : API_PATHS.INVOICE.CREATE;

        const method = existingInvoice ? "put" : "post";

        await axiosInstance[method](endpoint, preparedData);

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
          <InputField
            label="Invoice Number"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => handleInputChange(e)}
            required
            disabled={isGeneratingNumber}
          />
          
          <InputField
            label="Invoice Date"
            name="invoiceDate"
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => handleInputChange(e)}
            required
          />
          
          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange(e)}
            required
          />
          
          <SelectField
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => handleInputChange(e)}
            options={[
              { value: "Net 15", label: "Net 15" },
              { value: "Net 30", label: "Net 30" },
              { value: "Net 60", label: "Net 60" },
              { value: "Due on receipt", label: "Due on receipt" }
            ]}
          />
        </div>

        {isGeneratingNumber && (
          <p className="text-xs text-gray-500 mt-1">
            Generating invoice number...
          </p>
        )}

        {/* Bill From */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Bill From</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="businessName"
              placeholder="Business Name"
              value={formData.billFrom?.businessName || ""}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
            
            <InputField
              name="email"
              type="email"
              placeholder="Email"
              value={formData.billFrom?.email || ""}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
            
            <InputField
              name="address"
              placeholder="Address"
              value={formData.billFrom?.address || ""}
              onChange={(e) => handleInputChange(e, "billFrom")}
              className="col-span-2"
            />
            
            <InputField
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.billFrom?.phone || ""}
              onChange={(e) => handleInputChange(e, "billFrom")}
            />
          </div>
        </div>

        {/* Bill To */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Bill To</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="clientName"
              placeholder="Client Name"
              value={formData.billTo?.clientName || ""}
              onChange={(e) => handleInputChange(e, "billTo")}
              required
            />
            
            <InputField
              name="email"
              type="email"
              placeholder="Email"
              value={formData.billTo?.email || ""}
              onChange={(e) => handleInputChange(e, "billTo")}
            />
            
            <InputField
              name="address"
              placeholder="Address"
              value={formData.billTo?.address || ""}
              onChange={(e) => handleInputChange(e, "billTo")}
              className="col-span-2"
            />
            
            <InputField
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.billTo?.phone || ""}
              onChange={(e) => handleInputChange(e, "billTo")}
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
                <InputField
                  name="name"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-4"
                  required
                />
                
                <InputField
                  name="quantity"
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2"
                  min="1"
                  step="1"
                />
                
                <InputField
                  name="unitPrice"
                  type="number"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2"
                  step="0.01"
                  min="0"
                />
                
                <InputField
                  name="taxPercent"
                  type="number"
                  placeholder="Tax %"
                  value={item.taxPercent}
                  onChange={(e) => handleInputChange(e, "items", index)}
                  className="col-span-2"
                  step="0.01"
                  min="0"
                  max="100"
                />
                
                <div className="col-span-1 text-sm text-gray-600">
                  ${calculateItemTotal(item.quantity, item.unitPrice).toFixed(2)}
                </div>
                
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
            <span>${formData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Tax:</span>
            <span>${formData.taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${formData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <TextareaField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange(e)}
          placeholder="Additional notes..."
          rows={3}
        />

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
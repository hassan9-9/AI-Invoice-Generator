import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Loader2, Edit, Printer, AlertCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import CreateInvoice from "./CreateInvoice";
import Button from "../../components/ui/Button";
import ReminderModal from "../../components/Invoices/ReminderModal";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    console.log("InvoiceDetail mounted with ID:", id, "Type:", typeof id);
    
    // Validate ID before making API call
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid invoice ID:", id);
      setError("Invalid invoice ID");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        console.log("Fetching invoice with ID:", id);
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_INVOICE_BY_ID(id)
        );
        console.log("Raw API Response:", response.data);
        console.log("billFrom from API:", response.data.billFrom);
        console.log("billTo from API:", response.data.billTo);
        // Normalize the invoice data immediately after fetching
        const normalizedInvoice = normalizeInvoiceForEdit(response.data);
        console.log("Normalized Invoice:", normalizedInvoice);
        setInvoice(normalizedInvoice);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch invoice:", error);
        setError(error.message || "Failed to load invoice");
        
        if (error.response?.status === 400 || error.response?.status === 404) {
          toast.error("Invoice not found or invalid ID");
        } else if (error.response?.status === 401) {
          toast.error("Please login to view this invoice");
          navigate("/login");
        } else {
          toast.error("Failed to fetch invoice. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  const handleUpdate = async (formData) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.INVOICE.UPDATE_INVOICE(id),
        formData
      );
      toast.success("Invoice updated successfully!");
      setIsEditing(false);
      // Normalize the updated invoice data
      const normalizedInvoice = normalizeInvoiceForEdit(response.data);
      setInvoice(normalizedInvoice);
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to update invoice.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function to normalize the invoice data structure
  const normalizeInvoiceForEdit = (invoice) => {
    if (!invoice) return null;
    
    // Ensure all nested objects have proper structure
    return {
      ...invoice,
      billFrom: {
        businessName: invoice.billFrom?.businessName || "",
        address: invoice.billFrom?.address || "",
        email: invoice.billFrom?.email || "",
        phone: invoice.billFrom?.phone || ""
      },
      billTo: {
        clientName: invoice.billTo?.clientName || "",
        address: invoice.billTo?.address || "",
        email: invoice.billTo?.email || "",
        phone: invoice.billTo?.phone || ""
      },
      items: Array.isArray(invoice.items) && invoice.items.length > 0 
        ? invoice.items.map(item => ({
            name: item.name || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            taxPercent: item.taxPercent || 0,
            total: item.total || 0
          }))
        : [{ name: "", quantity: 1, unitPrice: 0, taxPercent: 0, total: 0 }],
      notes: invoice.notes || "",
      invoiceNumber: invoice.invoiceNumber || "",
      invoiceDate: invoice.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate: invoice.dueDate || new Date().toISOString().split("T")[0],
      paymentTerms: invoice.paymentTerms || "Net 30",
      status: invoice.status || "Pending",
      subtotal: invoice.subtotal || 0,
      taxTotal: invoice.taxTotal || 0,
      total: invoice.total || 0
    };
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Error Loading Invoice
        </h3>
        <p className="text-slate-500 mb-6 max-w-md">
          {error}
        </p>
        <Button onClick={() => navigate("/invoices")}>
          Back to All Invoices
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Invoice Not Found
        </h3>
        <p className="text-slate-500 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate("/invoices")}>
          Back to All Invoices
        </Button>
      </div>
    );
  }

  if (isEditing) {
    // Pass normalized invoice data to CreateInvoice
    return <CreateInvoice existingInvoice={normalizeInvoiceForEdit(invoice)} onSave={handleUpdate} />;
  }

  // Safely render invoice details with null checks
  return (
    <div className="invoice-detail">
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4 sm:mb-0">
          Invoice{" "}
          <span className="font-mono text-slate-500">
            {invoice?.invoiceNumber || "N/A"}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {invoice?.status !== "Paid" && (
            <Button
              variant="secondary"
              onClick={() => setIsReminderModalOpen(true)}
              icon={Mail}
            >
              Send Reminder
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
            icon={Edit}
          >
            Edit
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={Printer}>
            Print or Download
          </Button>
        </div>
      </div>

      <div id="invoice-content-wrapper">
        <div
          ref={invoiceRef}
          id="invoice-preview"
          className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md border border-slate-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">INVOICE</h2>
              <p className="text-sm text-slate-500 mt-2">
                # {invoice?.invoiceNumber || "N/A"}
              </p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  invoice?.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : invoice?.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {invoice?.status || "Unknown"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                From
              </h3>
              <p className="font-semibold text-slate-800">
                {invoice?.billFrom?.businessName || "N/A"}
              </p>
              <p className="text-slate-600">{invoice?.billFrom?.address || "N/A"}</p>
              <p className="text-slate-600">{invoice?.billFrom?.email || "N/A"}</p>
              <p className="text-slate-600">{invoice?.billFrom?.phone || "N/A"}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Bill To
              </h3>
              <p className="font-semibold text-slate-800">
                {invoice?.billTo?.clientName || "N/A"}
              </p>
              <p className="text-slate-600">{invoice?.billTo?.address || "N/A"}</p>
              <p className="text-slate-600">{invoice?.billTo?.email || "N/A"}</p>
              <p className="text-slate-600">{invoice?.billTo?.phone || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Invoice Date
              </h3>
              <p className="font-medium text-slate-800">
                {invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Due Date
              </h3>
              <p className="font-medium text-slate-800">
                {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Payment Terms
              </h3>
              <p className="font-medium text-slate-800">
                {invoice?.paymentTerms || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {invoice?.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">
                        {item.name || "N/A"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-center text-slate-900">
                        {item.quantity || 0}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-right text-slate-900">
                        ${(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-right text-slate-900">
                        ${(item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 py-4 text-center text-slate-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${(invoice?.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>${(invoice?.taxTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-slate-900 border-t border-slate-200 pt-3">
                <span>Total</span>
                <span>${(invoice?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice?.notes && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Notes
              </h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Print Styles */}
      <style>
        {`
          @page {
            padding: 10px;
            margin: 0;
          }
          
          @media print {
            body * {
              visibility: hidden;
            }
            
            #invoice-content-wrapper, 
            #invoice-content-wrapper * {
              visibility: visible;
            }
            
            #invoice-content-wrapper {
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              width: 100%;
            }
            
            #invoice-preview {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            .invoice-detail > div:first-child,
            .invoice-detail > div:first-child * {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default InvoiceDetail;
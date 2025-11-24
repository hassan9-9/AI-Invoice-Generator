import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';
// import TextareaField from '../ui/TextareaField';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateWithAIModal = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!text.trim()) {
            toast.error('Please enter some text describing the invoice');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(API_PATHS.CREATE_INVOICE_AI, {
                description: text
            });
            
            toast.success('Invoice created successfully!');
            onClose();
            // Navigate to the newly created invoice or invoices list
            navigate(`/invoices/${response.data.id}`);
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/10 bg-opacity-50 transition-opacity" 
                    onClick={onClose}
                />
                
                {/* Modal */}
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative text-left transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                            Create Invoice with AI
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="text-slate-400 hover:text-slate-600 text-xl"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <p className="text-slate-600 text-sm">
                            Enter any text that contains invoice details (like client name, items, quantities, and prices) and we'll generate a professional invoice for you.
                        </p>
                        
                        {/* <TextareaField
                            label="Invoice Description"
                            placeholder="E.g., Create an invoice for John Doe for 2 laptops at $999 each, plus 3 mice at $25 each. Tax rate 8%."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                        /> */}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !text.trim()}
                            loading={isLoading}
                            className="flex items-center"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Invoice
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWithAIModal;
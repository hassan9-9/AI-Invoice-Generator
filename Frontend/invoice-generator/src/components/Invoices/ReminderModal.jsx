import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
// import TextareaField from '../ui/TextareaField';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const ReminderModal = ({ isOpen, onClose, invoiceId }) => {
    const [reminderText, setReminderText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        if (isOpen && invoiceId) {
            const generateReminder = async () => {
                setIsLoading(true);
                setReminderText('');
                try {
                    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_REMINDER, { invoiceId });
                    setReminderText(response.data.reminderText);
                } catch (error) {
                    toast.error('Failed to generate reminder.');
                    console.error('AI reminder error:', error);
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            generateReminder();
        }
    }, [isOpen, invoiceId, onClose]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(reminderText);
        setHasCopied(true);
        toast.success('Reminder copied to clipboard!');
        setTimeout(() => setHasCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Payment Reminder</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
                
                <div className="mb-4">
                    {/* <TextareaField
                        label="Reminder Text"
                        value={reminderText}
                        onChange={(e) => setReminderText(e.target.value)}
                        placeholder="Generating reminder text..."
                        rows={8}
                        disabled={isLoading}
                    /> */}
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCopyToClipboard}
                        disabled={isLoading || !reminderText}
                        startIcon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                    >
                        {hasCopied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                        onClick={() => {
                            // TODO: Implement send email functionality
                            toast.success('Reminder sent via email!');
                            onClose();
                        }}
                        disabled={isLoading || !reminderText}
                        startIcon={<Mail size={16} />}
                    >
                        Send Email
                    </Button>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                        <span className="ml-2">Generating reminder...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReminderModal;
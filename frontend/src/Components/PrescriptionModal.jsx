import React, { useState } from 'react';
import { X, Send, Activity, Pill, FileText, CheckCircle } from 'lucide-react';
import api from '../api/api';

export default function PrescriptionModal({ isOpen, onClose, patient, onSuccess }) {
    const [formData, setFormData] = useState({
        diagnosis: '',
        medicines: '',
        instructions: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !patient) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Send the prescription (Backend saves and sends SMS)
            await api.post('/api/prescription/save-and-send', {
                diagnosis: formData.diagnosis,
                medicines: formData.medicines,
                instructions: formData.instructions
                // mobileNumber and doctor are handled by backend session/entity relations if needed, 
                // but the requested DTO only needs diagnosis, medicines, instructions.
            });

            // Success
            onSuccess("Prescription saved and sent successfully to the patient.");
            onClose();

            // Reset form
            setFormData({
                diagnosis: '',
                medicines: '',
                instructions: ''
            });
        } catch (err) {
            console.error("Error managing prescription:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to save or send prescription.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Failed to process prescription.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-emerald-600" size={24} />
                            Write Prescription
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            For Token #{patient.tokenNumber} ({patient.mobileNumber || 'No Contact'})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-sm">
                            <X size={18} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form id="prescription-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Diagnosis */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" />
                                Diagnosis
                            </label>
                            <textarea
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm"
                                placeholder="E.g., Viral Fever, Mild dehydration..."
                            />
                        </div>

                        {/* Medicines */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Pill size={16} className="text-blue-500" />
                                Medicines / Treatment
                            </label>
                            <textarea
                                name="medicines"
                                value={formData.medicines}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                                placeholder="E.g., 1. Paracetamol 500mg (1-1-1) for 3 days&#10;2. ORS Powder - 1 sachet in 1L water..."
                            />
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <CheckCircle size={16} className="text-amber-500" />
                                Additional Instructions
                            </label>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none shadow-sm"
                                placeholder="E.g., Drink plenty of fluids. Rest for 2 days. Come back if fever persists."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="prescription-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Save & Send SMS
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

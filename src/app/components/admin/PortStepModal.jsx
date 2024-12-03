'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const steps = [
    {
        id: 'port_code',
        title: 'What is the port code?',
        description: 'Enter the unique port code (e.g., BOM, SIN)',
        placeholder: 'Enter port code'
    },
    {
        id: 'port_name',
        title: 'What is the port name?',
        description: 'Enter the full name of the port',
        placeholder: 'Enter port name'
    },
    {
        id: 'country',
        title: 'Which country is it in?',
        description: 'Enter the country where the port is located',
        placeholder: 'Enter country name'
    }
];

export default function PortStepModal({ isOpen, onClose, onSubmit, existingPorts }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        port_code: '',
        port_name: '',
        country: ''
    });
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInputChange = (value) => {
        const currentField = steps[currentStep].id;
        // Convert port code to uppercase
        const processedValue = currentField === 'port_code' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [currentField]: processedValue }));

        // Generate suggestions based on current field
        if (value.length >= 2) {
            let filtered = existingPorts.filter(port => {
                const fieldValue = port[currentField]?.toLowerCase();
                return fieldValue?.includes(value.toLowerCase());
            });

            // For country field, remove duplicates
            if (currentField === 'country') {
                filtered = filtered.filter((port, index, self) =>
                    index === self.findIndex((p) => p.country === port.country)
                );
            }

            setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const currentField = steps[currentStep].id;
        setFormData(prev => ({ ...prev, [currentField]: suggestion[currentField] }));
        setSuggestions([]);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSuggestions([]);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setSuggestions([]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(formData);
            setIsSuccess(true);
            toast.success('Port added successfully!');
            setTimeout(() => {
                setIsSuccess(false);
                setCurrentStep(0);
                setFormData({
                    port_code: '',
                    port_name: '',
                    country: ''
                });
                onClose();
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Failed to add port');
        } finally {
            setLoading(false);
        }
    };

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        className="h-full bg-[#C6082C]"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-8"
                        >
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900">Port Added Successfully!</h3>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-gray-900">
                                {currentStepData.title}
                            </h2>
                            <p className="text-gray-600">{currentStepData.description}</p>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData[currentStepData.id]}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder={currentStepData.placeholder}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                />

                                {/* Suggestions dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                            >
                                                <span>{suggestion[currentStepData.id]}</span>
                                                <CheckIcon className="w-5 h-5 text-green-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <div className="flex space-x-2">
                                    {!isFirstStep && (
                                        <button
                                            onClick={handleBack}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        disabled={loading || !formData[currentStepData.id]}
                                        className={`px-6 py-2 rounded-lg ${
                                            loading || !formData[currentStepData.id]
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-[#C6082C] hover:bg-[#a00624]'
                                        } text-white flex items-center`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            isLastStep ? 'Add Port' : 'Next'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
} 
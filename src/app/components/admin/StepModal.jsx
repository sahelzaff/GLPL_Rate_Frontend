'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const steps = [
    {
        id: 'name',
        title: 'What is the user\'s name?',
        placeholder: 'Enter full name',
        type: 'text'
    },
    {
        id: 'email',
        title: 'What is their email address?',
        placeholder: 'Enter email address',
        type: 'email'
    },
    {
        id: 'password',
        title: 'Create a password',
        placeholder: 'Enter password',
        type: 'password'
    },
    {
        id: 'company',
        title: 'Which company do they work for?',
        placeholder: 'Enter company name',
        type: 'text'
    },
    {
        id: 'role',
        title: 'Select their role',
        type: 'select',
        options: [
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' }
        ]
    }
];

export default function StepModal({ isOpen, onClose, onSubmit }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
        role: 'user'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setIsSuccess(true);
            toast.success('User created successfully!');
            setTimeout(() => {
                setIsSuccess(false);
                setCurrentStep(0);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    company: '',
                    role: 'user'
                });
                onClose();
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
                            <h3 className="text-xl font-semibold text-gray-900">User Created Successfully!</h3>
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
                                {steps[currentStep].title}
                            </h2>

                            {steps[currentStep].type === 'select' ? (
                                <select
                                    value={formData[steps[currentStep].id]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [steps[currentStep].id]: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                >
                                    {steps[currentStep].options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={steps[currentStep].type}
                                    placeholder={steps[currentStep].placeholder}
                                    value={formData[steps[currentStep].id]}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [steps[currentStep].id]: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                    required
                                />
                            )}

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData[steps[currentStep].id] || isSubmitting}
                                    className="px-6 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : null}
                                    {currentStep === steps.length - 1 ? 'Create User' : 'Next'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
} 
'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const steps = [
    {
        id: 'basic',
        title: 'Basic Details',
        description: 'Edit route and validity details'
    },
    {
        id: 'rates',
        title: 'Container Rates',
        description: 'Edit container rates'
    }
];

export default function EditRateModal({ isOpen, onClose, onSubmit, rate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        shipping_line: '',
        pol: '',
        pod: '',
        valid_from: '',
        valid_to: '',
        container_rates: []
    });
    const [loading, setLoading] = useState(false);
    const [shippingLines, setShippingLines] = useState([]);
    const [ports, setPorts] = useState([]);
    const [shippingLineSuggestions, setShippingLineSuggestions] = useState([]);
    const [polSuggestions, setPolSuggestions] = useState([]);
    const [podSuggestions, setPodSuggestions] = useState([]);
    const [inputValues, setInputValues] = useState({
        shipping_line_name: '',
        pol_name: '',
        pod_name: ''
    });

    useEffect(() => {
        if (isOpen && rate) {
            setCurrentStep(0);
            setFormData({
                shipping_line: rate.shipping_line_id || '',
                pol: rate.pol_id || '',
                pod: rate.pod_id || '',
                valid_from: rate.valid_from?.split('T')[0] || '',
                valid_to: rate.valid_to?.split('T')[0] || '',
                container_rates: rate.container_rates || []
            });
            fetchShippingLines();
            fetchPorts();
        }
    }, [isOpen, rate, ports, shippingLines, fetchShippingLines, fetchPorts]);

    const fetchShippingLines = useCallback(async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/shipping-lines');
            const data = await response.json();
            setShippingLines(data);
        } catch (error) {
            console.error('Error fetching shipping lines:', error);
            toast.error('Failed to fetch shipping lines');
        }
    }, []);

    const fetchPorts = useCallback(async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/ports');
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error('Error fetching ports:', error);
            toast.error('Failed to fetch ports');
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.container_rates || formData.container_rates.length === 0) {
            toast.error('Please add at least one container rate');
            return;
        }

        setLoading(true);
        try {
            const formattedRates = formData.container_rates
                .filter(rate => rate.rate && !isNaN(parseFloat(rate.rate)) && parseFloat(rate.rate) > 0)
                .map(rate => ({
                    type: rate.type,
                    rate: parseFloat(rate.rate)
                }));

            if (formattedRates.length === 0) {
                throw new Error('Please add valid container rates');
            }

            await onSubmit({
                ...formData,
                container_rates: formattedRates
            });
            onClose();
        } catch (error) {
            console.error('Error updating rate:', error);
            toast.error(error.message || 'Failed to update rate');
        } finally {
            setLoading(false);
        }
    };

    const filterShippingLines = (value) => {
        const filtered = shippingLines.filter(line => 
            line.name.toLowerCase().includes(value.toLowerCase())
        );
        setShippingLineSuggestions(filtered);
    };

    const filterPorts = (value, setter) => {
        const filtered = ports.filter(port => 
            port.port_name.toLowerCase().includes(value.toLowerCase()) ||
            port.port_code.toLowerCase().includes(value.toLowerCase())
        );
        setter(filtered);
    };

    const renderBasicDetails = () => (
        <div className="space-y-6">
            {/* Shipping Line */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Line
                </label>
                <input
                    type="text"
                    value={inputValues.shipping_line_name}
                    onChange={(e) => {
                        const value = e.target.value;
                        setInputValues(prev => ({ ...prev, shipping_line_name: value }));
                        filterShippingLines(value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                    placeholder="Type to search shipping lines..."
                />
                {/* Shipping Line Suggestions */}
                {shippingLineSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {shippingLineSuggestions.map(line => (
                            <div
                                key={line._id}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, shipping_line: line._id }));
                                    setInputValues(prev => ({ ...prev, shipping_line_name: line.name }));
                                    setShippingLineSuggestions([]);
                                }}
                            >
                                {line.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ports */}
            <div className="grid grid-cols-2 gap-4">
                {/* POL */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port of Loading (POL)
                    </label>
                    <input
                        type="text"
                        value={inputValues.pol_name}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInputValues(prev => ({ ...prev, pol_name: value }));
                            filterPorts(value, setPolSuggestions);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        placeholder="Type to search POL..."
                    />
                    {/* POL Suggestions */}
                    {polSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                            {polSuggestions.map(port => (
                                <div
                                    key={port._id}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, pol: port._id }));
                                        setInputValues(prev => ({ ...prev, pol_name: `${port.port_name} (${port.port_code})` }));
                                        setPolSuggestions([]);
                                    }}
                                >
                                    <div className="font-medium">{port.port_name}</div>
                                    <div className="text-sm text-gray-500">{port.port_code} - {port.country}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* POD */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port of Discharge (POD)
                    </label>
                    <input
                        type="text"
                        value={inputValues.pod_name}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInputValues(prev => ({ ...prev, pod_name: value }));
                            filterPorts(value, setPodSuggestions);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        placeholder="Type to search POD..."
                    />
                    {/* POD Suggestions */}
                    {podSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                            {podSuggestions.map(port => (
                                <div
                                    key={port._id}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, pod: port._id }));
                                        setInputValues(prev => ({ ...prev, pod_name: `${port.port_name} (${port.port_code})` }));
                                        setPodSuggestions([]);
                                    }}
                                >
                                    <div className="font-medium">{port.port_name}</div>
                                    <div className="text-sm text-gray-500">{port.port_code} - {port.country}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid From
                    </label>
                    <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid To
                    </label>
                    <input
                        type="date"
                        value={formData.valid_to}
                        onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );

    const renderContainerRates = () => (
        <div className="space-y-6">
            <div className="space-y-3">
                {['20', '40', '40HC', '45'].map(type => (
                    <div key={type} className="flex items-center space-x-4">
                        <label className="w-24 text-sm font-medium text-gray-700">
                            {type}'
                        </label>
                        <input
                            type="number"
                            placeholder={`Rate for ${type}' container`}
                            value={formData.container_rates.find(r => r.type === type)?.rate || ''}
                            onChange={(e) => {
                                const newRates = [...formData.container_rates];
                                const index = newRates.findIndex(r => r.type === type);
                                if (index >= 0) {
                                    newRates[index].rate = e.target.value;
                                } else {
                                    newRates.push({ type, rate: e.target.value });
                                }
                                setFormData({ ...formData, container_rates: newRates });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const isStepValid = () => {
        if (currentStep === 0) {
            return formData.shipping_line && formData.pol && formData.pod && 
                   formData.valid_from && formData.valid_to;
        }
        return true;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        className="h-full bg-[#C6082C]"
                    />
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
                            <p className="text-gray-500">{steps[currentStep].description}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {currentStep === 0 ? renderBasicDetails() : renderContainerRates()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <div className="flex space-x-3">
                                {currentStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5 mr-1" />
                                        Back
                                    </button>
                                )}
                                {currentStep < steps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!isStepValid()}
                                        className={`flex items-center px-6 py-2 rounded-lg text-white
                                            ${!isStepValid() 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-[#C6082C] hover:bg-[#a00624]'}`}
                                    >
                                        Next
                                        <ArrowRightIcon className="w-5 h-5 ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-6 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : null}
                                        Update Rate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 
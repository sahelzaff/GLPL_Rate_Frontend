'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon, CheckCircleIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useSession } from 'next-auth/react';
const steps = [
    {
        id: 'shipping_line',
        title: 'Select Shipping Line',
        description: 'Choose the shipping line for this rate'
    },
    {
        id: 'pol',
        title: 'Port of Loading (POL)',
        description: 'Select the port of loading'
    },
    {
        id: 'pod',
        title: 'Port of Discharge (POD)',
        description: 'Select the port of discharge'
    },
    {
        id: 'validity',
        title: 'Validity Period',
        description: 'Set the validity period for this rate'
    },
    {
        id: 'container_rates',
        title: 'Container Rates',
        description: 'Enter rates for different container types'
    },
    {
        id: 'notes',
        title: 'Additional Notes',
        description: 'Add any additional information or remarks'
    }
];

export default function RateStepModal({ isOpen, onClose, onSubmit, initialData }) {
    const { data: _session } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        shipping_line: '',
        pol_ids: [],
        pod_ids: [],
        valid_from: '',
        valid_to: '',
        container_rates: [],
        notes: []
    });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shippingLines, setShippingLines] = useState([]);
    const [ports, setPorts] = useState([]);

    // Reset form when opening modal
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsSuccess(false);
            
            if (initialData) {
                // If editing, populate form with initial data
                setFormData({
                    shipping_line: initialData.shipping_line_id || '',
                    pol_ids: initialData.pol_ids || [],
                    pod_ids: initialData.pod_ids || [],
                    valid_from: initialData.valid_from || '',
                    valid_to: initialData.valid_to || '',
                    container_rates: initialData.container_rates || [],
                    notes: initialData.notes || []
                });
            } else {
                // If adding new, reset form
                setFormData({
                    shipping_line: '',
                    pol_ids: [],
                    pod_ids: [],
                    valid_from: '',
                    valid_to: '',
                    container_rates: [],
                    notes: []
                });
            }
            
            // Fetch fresh data
            fetchShippingLines();
            fetchPorts();
        }
    }, [isOpen, initialData]);

    const fetchShippingLines = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/shipping-lines');
            const data = await response.json();
            setShippingLines(data);
        } catch (error) {
            console.error('Error fetching shipping lines:', error);
            toast.error('Failed to fetch shipping lines');
        }
    };

    const fetchPorts = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/ports');
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error('Error fetching ports:', error);
            toast.error('Failed to fetch ports');
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) {
            toast.error('Please add at least one container rate');
            return;
        }

        setLoading(true);
        try {
            const validContainerRates = formData.container_rates.filter(rate => 
                rate.base_rate > 0 || rate.ewrs_laden > 0 || 
                rate.ewrs_empty > 0 || rate.baf > 0 || 
                rate.reefer_surcharge > 0
            );

            const rateData = {
                ...formData,
                container_rates: validContainerRates
            };

            await onSubmit(rateData);
            setLoading(false);
            setIsSuccess(true);
            toast.success('Rate added successfully!');
            
            // Instead of closing immediately, show success for a moment
            setTimeout(() => {
                setIsSuccess(false);
                setCurrentStep(0);
                setFormData({
                    shipping_line: '',
                    pol_ids: [],
                    pod_ids: [],
                    valid_from: '',
                    valid_to: '',
                    container_rates: [],
                    notes: []
                });
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Error submitting rate:', error);
            toast.error(error.message || 'Failed to add rate');
            setIsSuccess(false);
            setLoading(false);
        }
    };

    const isStepValid = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case 'shipping_line':
                return formData.shipping_line !== '';
            case 'pol':
                return formData.pol_ids.length > 0;
            case 'pod':
                return formData.pod_ids.length > 0;
            case 'validity':
                return formData.valid_from && formData.valid_to && 
                       new Date(formData.valid_from) <= new Date(formData.valid_to);
            case 'container_rates':
                // Check if at least one container type has rates
                return formData.container_rates.some(rate => 
                    rate.base_rate > 0 || rate.ewrs_laden > 0 || 
                    rate.ewrs_empty > 0 || rate.baf > 0 || 
                    rate.reefer_surcharge > 0
                );
            case 'notes':
                return true; // Notes are optional
            default:
                return true;
        }
    };

    const renderStepContent = () => {
        if (isSuccess) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center h-full py-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20 
                        }}
                        className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
                    >
                        <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    </motion.div>
                    <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-semibold text-gray-900 mb-2"
                    >
                        Rate Added Successfully!
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500"
                    >
                        Your rate has been added to the system
                    </motion.p>
                </motion.div>
            );
        }

        switch (steps[currentStep].id) {
            case 'shipping_line':
                return (
                    <div className="space-y-2">
                        <select
                            value={formData.shipping_line}
                            onChange={(e) => setFormData({ ...formData, shipping_line: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        >
                            <option value="">Select Shipping Line</option>
                            {shippingLines.map(line => (
                                <option key={line._id} value={line._id}>
                                    {line.name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case 'pol':
                return (
                    <div className="space-y-2">
                        <Select
                            isMulti
                            options={ports.map(port => ({
                                value: port._id,
                                label: `${port.port_name} (${port.port_code}) - ${port.country}`
                            }))}
                            value={ports
                                .filter(port => formData.pol_ids.includes(port._id))
                                .map(port => ({
                                    value: port._id,
                                    label: `${port.port_name} (${port.port_code}) - ${port.country}`
                                }))}
                            onChange={(selected) => setFormData({
                                ...formData,
                                pol_ids: selected ? selected.map(item => item.value) : []
                            })}
                            className="w-full"
                            placeholder="Select Ports of Loading..."
                        />
                        {formData.pol_ids.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Selected {formData.pol_ids.length} port{formData.pol_ids.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'pod':
                return (
                    <div className="space-y-2">
                        <Select
                            isMulti
                            options={ports.map(port => ({
                                value: port._id,
                                label: `${port.port_name} (${port.port_code}) - ${port.country}`
                            }))}
                            value={ports
                                .filter(port => formData.pod_ids.includes(port._id))
                                .map(port => ({
                                    value: port._id,
                                    label: `${port.port_name} (${port.port_code}) - ${port.country}`
                                }))}
                            onChange={(selected) => setFormData({
                                ...formData,
                                pod_ids: selected ? selected.map(item => item.value) : []
                            })}
                            className="w-full"
                            placeholder="Select Ports of Discharge..."
                        />
                        {formData.pod_ids.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Selected {formData.pod_ids.length} port{formData.pod_ids.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                        {formData.pol_ids.length > 0 && formData.pod_ids.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-800">
                                    This will create {formData.pol_ids.length * formData.pod_ids.length} rate combinations
                                </p>
                                <div className="mt-2 max-h-40 overflow-auto">
                                    {formData.pol_ids.flatMap(polId => 
                                        formData.pod_ids.map(podId => {
                                            const pol = ports.find(p => p._id === polId);
                                            const pod = ports.find(p => p._id === podId);
                                            return (
                                                <div key={`${polId}-${podId}`} className="text-xs text-blue-600 py-1">
                                                    {pol?.port_name} → {pod?.port_name}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'validity':
                return (
                    <div className="space-y-4">
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
                );
            case 'container_rates':
                return renderContainerRates();
            case 'notes':
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700">
                                Add any additional notes or remarks for this rate.
                            </p>
                        </div>
                        
                        {formData.notes.map((note, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <textarea
                                    value={note.description}
                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                    className="flex-1 p-3 border rounded-lg min-h-[100px]"
                                    placeholder="Enter note..."
                                />
                                <button
                                    onClick={() => removeNote(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        
                        <button
                            onClick={addNote}
                            className="flex items-center space-x-2 text-[#C6082C] hover:bg-red-50 px-4 py-2 rounded-lg"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Add Note</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderContainerRates = () => {
        return (
        <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                    Enter rates for applicable container types only. Leave others empty if not available.
                </p>
            </div>
            
            {/* First Row - 20' and 40' containers */}
            <div className="grid grid-cols-2 gap-10">
                {['20', '40'].map(type => (
                    <div key={type} className="bg-gray-50 p-8 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-4 text-lg">{type}' Container</h4>
                        <div className="space-y-6">
                            {/* Base Rate and EWRS Laden */}
                            <div className="grid grid-cols-2 gap-6">
                        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                Base Rate (USD)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter base rate"
                                value={formData.container_rates.find(r => r.type === type)?.base_rate || ''}
                                        onChange={(e) => handleRateChange(type, 'base_rate', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            />
                        </div>
                        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                EWRS Laden (USD)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter EWRS laden"
                                value={formData.container_rates.find(r => r.type === type)?.ewrs_laden || ''}
                                        onChange={(e) => handleRateChange(type, 'ewrs_laden', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            />
                        </div>
                            </div>

                            {/* EWRS Empty and BAF */}
                            <div className="grid grid-cols-2 gap-6">
                        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                EWRS Empty (USD)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter EWRS empty"
                                value={formData.container_rates.find(r => r.type === type)?.ewrs_empty || ''}
                                        onChange={(e) => handleRateChange(type, 'ewrs_empty', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            />
                        </div>
                        <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                BAF (USD)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter BAF"
                                value={formData.container_rates.find(r => r.type === type)?.baf || ''}
                                        onChange={(e) => handleRateChange(type, 'baf', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            />
                                </div>
                            </div>

                            {/* Total Cost */}
                            <div className="pt-4 border-t mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                                    <span className="text-xl font-bold text-[#C6082C]">
                                        USD {calculateTotalCost(type)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                        </div>

            {/* Second Row - 40HC and 45' containers */}
            <div className="grid grid-cols-2 gap-10">
                {['40HC', '45'].map(type => (
                    <div key={type} className="bg-gray-50 p-8 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-4 text-lg">{type}' Container</h4>
                        <div className="space-y-6">
                            {/* Base Rate and EWRS Laden */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Rate (USD)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter base rate"
                                        value={formData.container_rates.find(r => r.type === type)?.base_rate || ''}
                                        onChange={(e) => handleRateChange(type, 'base_rate', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        EWRS Laden (USD)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter EWRS laden"
                                        value={formData.container_rates.find(r => r.type === type)?.ewrs_laden || ''}
                                        onChange={(e) => handleRateChange(type, 'ewrs_laden', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* EWRS Empty and BAF */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        EWRS Empty (USD)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter EWRS empty"
                                        value={formData.container_rates.find(r => r.type === type)?.ewrs_empty || ''}
                                        onChange={(e) => handleRateChange(type, 'ewrs_empty', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                    />
                                </div>
                            <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        BAF (USD)
                                </label>
                                <input
                                    type="number"
                                        placeholder="Enter BAF"
                                        value={formData.container_rates.find(r => r.type === type)?.baf || ''}
                                        onChange={(e) => handleRateChange(type, 'baf', e.target.value)}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                                />
                            </div>
                            </div>

                            {/* Total Cost */}
                            <div className="pt-4 border-t mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                                    <span className="text-xl font-bold text-[#C6082C]">
                                    USD {calculateTotalCost(type)}
                                </span>
                                    </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    };

    const calculateTotalCost = (type) => {
        const rate = formData.container_rates.find((r) => r.type === type);
        if (!rate) return 0;

        const total = (
            (rate.base_rate || 0) +
            (rate.ewrs_laden || 0) +
            (rate.baf || 0) +
            (rate.reefer_surcharge || 0)
        );

        return total.toFixed(2);
    };

    const handleRateChange = (type, field, value) => {
        const newRates = [...formData.container_rates];
        const index = newRates.findIndex((r) => r.type === type);
        const parsedValue = parseFloat(value) || 0;

        if (index >= 0) {
            newRates[index] = {
                ...newRates[index],
                [field]: parsedValue
            };
        } else {
            newRates.push({
                type,
                base_rate: field === 'base_rate' ? parsedValue : 0,
                ewrs_laden: field === 'ewrs_laden' ? parsedValue : 0,
                ewrs_empty: field === 'ewrs_empty' ? parsedValue : 0,
                baf: field === 'baf' ? parsedValue : 0,
                reefer_surcharge: field === 'reefer_surcharge' ? parsedValue : 0
            });
        }

        setFormData({ ...formData, container_rates: newRates });
    };

    const addNote = () => {
        setFormData((prev) => ({
            ...prev,
            notes: [...prev.notes, { description: '' }]
        }));
    };

    const removeNote = (index) => {
        setFormData((prev) => ({
            ...prev,
            notes: prev.notes.filter((_, i) => i !== index)
        }));
    };

    const handleNoteChange = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            notes: prev.notes.map((note, i) => 
                i === index ? { ...note, description: value } : note
            )
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-xl shadow-xl relative
                    ${currentStep === steps.findIndex(s => s.id === 'container_rates') ? 'w-[1400px]' : 'w-full max-w-md'}
                    ${currentStep === steps.findIndex(s => s.id === 'container_rates') ? 'h-[650px]' : 'max-h-[90vh]'}`}
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 rounded-lg bg-gray-200">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        className="h-full bg-[#C6082C] rounded-lg"
                    />
                </div>

                {/* Content Area with Fixed Header */}
                <div className="h-full flex flex-col">
                    {/* Fixed Header */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-gray-600">{steps[currentStep].description}</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
                    </div>

                    {/* Fixed Footer */}
                    <div className="border-t p-6 bg-gray-50">
                        <div className="flex justify-between">
                            {!isSuccess && (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <div className="flex space-x-2">
                                        {currentStep > 0 && (
                                            <button
                                                onClick={handleBack}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                            >
                                                Back
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            disabled={loading || !isStepValid()}
                                            className={`px-6 py-2 rounded-lg text-white flex items-center
                                                ${!isStepValid() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C6082C] hover:bg-[#a00624]'}`}
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            ) : null}
                                            {currentStep === steps.length - 1 ? 'Add Rate' : 'Next'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 
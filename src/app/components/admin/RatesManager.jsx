'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';

export default function RatesManager() {
    const [rates, setRates] = useState([]);
    const [isAddingRate, setIsAddingRate] = useState(false);
    const [shippingLines, setShippingLines] = useState([]);
    const [ports, setPorts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newRate, setNewRate] = useState({
        shippingLineId: '',
        polIds: [],
        podIds: [],
        validityFrom: '',
        validityTo: '',
        remarks: '',
        rate20: '',
        rate40: '',
        rate40HC: '',
        rate40RF: ''
    });

    // Memoize port options
    const portOptions = useMemo(() => 
        ports.map(port => ({
            value: port._id,
            label: `${port.name} (${port.region})`
        })), [ports]
    );

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [ratesRes, linesRes, portsRes, containersRes] = await Promise.all([
                fetch('http://localhost:5001/api/rates'),
                fetch('http://localhost:5001/api/shipping-lines'),
                fetch('http://localhost:5001/api/ports'),
                fetch('http://localhost:5001/api/containers')
            ]);

            const [ratesData, linesData, portsData, containersData] = await Promise.all([
                ratesRes.json(),
                linesRes.json(),
                portsRes.json(),
                containersRes.json()
            ]);

            setRates(ratesData);
            setShippingLines(linesData);
            setPorts(portsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create container rates array from individual fields
            const containerRates = [];
            
            if (newRate.rate20) {
                containerRates.push({
                    containerId: "1", // ID for 20' container
                    rate: parseFloat(newRate.rate20)
                });
            }
            if (newRate.rate40) {
                containerRates.push({
                    containerId: "2", // ID for 40' container
                    rate: parseFloat(newRate.rate40)
                });
            }
            if (newRate.rate40HC) {
                containerRates.push({
                    containerId: "3", // ID for 40' HC container
                    rate: parseFloat(newRate.rate40HC)
                });
            }
            if (newRate.rate40RF) {
                containerRates.push({
                    containerId: "4", // ID for 40' RF container
                    rate: parseFloat(newRate.rate40RF)
                });
            }

            if (containerRates.length === 0) {
                alert('Please enter at least one container rate');
                return;
            }

            const ratesArray = [];
            newRate.polIds.forEach(polId => {
                newRate.podIds.forEach(podId => {
                    ratesArray.push({
                        shippingLineId: newRate.shippingLineId,
                        polId,
                        podId,
                        containerRates,
                        validityFrom: newRate.validityFrom,
                        validityTo: newRate.validityTo,
                        remarks: newRate.remarks
                    });
                });
            });

            const response = await fetch('http://localhost:5001/api/rates/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rates: ratesArray }),
            });

            if (response.ok) {
                await fetchData();
                setIsAddingRate(false);
                // Reset state
                setNewRate({
                    shippingLineId: '',
                    polIds: [],
                    podIds: [],
                    validityFrom: '',
                    validityTo: '',
                    remarks: '',
                    rate20: '',
                    rate40: '',
                    rate40HC: '',
                    rate40RF: ''
                });
            }
        } catch (error) {
            console.error('Error adding rates:', error);
        }
    };

    const renderContainerRates = () => (
        <div className="mt-4">
            <h3 className="font-medium mb-2">Container Rates</h3>
            <div className="grid grid-cols-1 gap-4">
                {/* 20' Container */}
                <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">
                        20' Standard container
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter rate"
                            value={newRate.rate20}
                            onChange={(e) => setNewRate(prev => ({ ...prev, rate20: e.target.value }))}
                            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            min="0"
                            step="0.01"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            USD
                        </span>
                    </div>
                </div>

                {/* 40' Container */}
                <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">
                        40' Standard container
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter rate"
                            value={newRate.rate40}
                            onChange={(e) => setNewRate(prev => ({ ...prev, rate40: e.target.value }))}
                            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            min="0"
                            step="0.01"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            USD
                        </span>
                    </div>
                </div>

                {/* 40' HC Container */}
                <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">
                        45' Highcube container
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter rate"
                            value={newRate.rate40HC}
                            onChange={(e) => setNewRate(prev => ({ ...prev, rate40HC: e.target.value }))}
                            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            min="0"
                            step="0.01"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            USD
                        </span>
                    </div>
                </div>

                {/* 40' Reefer Container */}
                <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">
                        40' Reefer container
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter rate"
                            value={newRate.rate40RF}
                            onChange={(e) => setNewRate(prev => ({ ...prev, rate40RF: e.target.value }))}
                            className="border rounded-lg px-4 py-2 w-32 focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                            min="0"
                            step="0.01"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            USD
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderForm = () => (
        <motion.form
            key="rate-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 border rounded-lg"
            onSubmit={handleSubmit}
        >
            <div className="grid grid-cols-1 gap-4">
                {/* Shipping Line Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Line
                    </label>
                    <select
                        value={newRate.shippingLineId}
                        onChange={(e) => setNewRate(prev => ({ ...prev, shippingLineId: e.target.value }))}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select Shipping Line</option>
                        {shippingLines.map((line) => (
                            <option key={line._id} value={line._id}>
                                {line.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* POL Multi-select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ports of Loading (POL)
                    </label>
                    <Select
                        isMulti
                        options={portOptions}
                        value={portOptions.filter(option => newRate.polIds.includes(option.value))}
                        onChange={(selected) => setNewRate(prev => ({
                            ...prev,
                            polIds: selected ? selected.map(item => item.value) : []
                        }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </div>

                {/* POD Multi-select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ports of Discharge (POD)
                    </label>
                    <Select
                        isMulti
                        options={portOptions}
                        value={portOptions.filter(option => newRate.podIds.includes(option.value))}
                        onChange={(selected) => setNewRate(prev => ({
                            ...prev,
                            podIds: selected ? selected.map(item => item.value) : []
                        }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </div>

                {/* Date inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Validity From
                        </label>
                        <input
                            type="date"
                            value={newRate.validityFrom}
                            onChange={(e) => setNewRate(prev => ({ ...prev, validityFrom: e.target.value }))}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Validity To
                        </label>
                        <input
                            type="date"
                            value={newRate.validityTo}
                            onChange={(e) => setNewRate(prev => ({ ...prev, validityTo: e.target.value }))}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>
                </div>

                {renderContainerRates()}

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                    </label>
                    <input
                        type="text"
                        placeholder="Remarks"
                        value={newRate.remarks}
                        onChange={(e) => setNewRate(prev => ({ ...prev, remarks: e.target.value }))}
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-lg"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAddingRate(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </motion.form>
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Rates</h2>
                <button
                    onClick={() => setIsAddingRate(true)}
                    className="bg-[#C6082C] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Rate</span>
                </button>
            </div>

            <AnimatePresence>
                {isAddingRate && renderForm()}
            </AnimatePresence>

            <div className="grid gap-4">
                {rates.map((rate) => (
                    <motion.div
                        key={rate._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border rounded-lg p-4"
                    >
                        <div className="flex justify-between mb-2">
                            <h3 className="font-medium">{rate.shippingLine}</h3>
                            <span className="text-sm text-gray-500">
                                Valid: {new Date(rate.validityFrom).toLocaleDateString()} - 
                                {new Date(rate.validityTo).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {rate.pol} → {rate.pod}
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {rate.containerRates.map((container, idx) => (
                                <div key={`${rate._id}-${idx}`} className="text-sm">
                                    {container.type}': USD {container.rate}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 
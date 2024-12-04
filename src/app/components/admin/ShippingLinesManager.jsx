'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ShippingLinesManager() {
    const [shippingLines, setShippingLines] = useState([]);
    const [isAddingLine, setIsAddingLine] = useState(false);
    const [newLine, setNewLine] = useState({ name: '', details: '' });
    const [_editingLine, setEditingLine] = useState(null);

    useEffect(() => {
        fetchShippingLines();
    }, []);

    const fetchShippingLines = async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app//api/shipping-lines');
            const data = await response.json();
            setShippingLines(data);
        } catch (error) {
            console.error('Error fetching shipping lines:', error);
        }
    };

    const handleAddLine = async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app//api/shipping-lines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLine),
            });
            if (response.ok) {
                fetchShippingLines();
                setNewLine({ name: '', details: '' });
                setIsAddingLine(false);
            }
        } catch (error) {
            console.error('Error adding shipping line:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Shipping Lines</h2>
                <button
                    onClick={() => setIsAddingLine(true)}
                    className="bg-[#C6082C] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Shipping Line</span>
                </button>
            </div>

            {isAddingLine && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 border rounded-lg"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Shipping Line Name"
                            value={newLine.name}
                            onChange={(e) => setNewLine({ ...newLine, name: e.target.value })}
                            className="border rounded-lg px-4 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Details"
                            value={newLine.details}
                            onChange={(e) => setNewLine({ ...newLine, details: e.target.value })}
                            className="border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={handleAddLine}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsAddingLine(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-4">
                {shippingLines.map((line) => (
                    <motion.div
                        key={line._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border rounded-lg p-4 flex justify-between items-center"
                    >
                        <div>
                            <h3 className="font-medium">{line.name}</h3>
                            <p className="text-sm text-gray-500">{line.details}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setEditingLine(line)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 
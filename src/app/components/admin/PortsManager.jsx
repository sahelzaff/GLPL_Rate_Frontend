'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AdminAutocomplete from './AdminAutocomplete';
import { getPorts } from '../../services/api';

export default function PortsManager() {
    const [ports, setPorts] = useState([]);
    const [isAddingPort, setIsAddingPort] = useState(false);
    const [newPort, setNewPort] = useState({ name: '', region: '' });
    const [_editingPort, setEditingPort] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [regions, setRegions] = useState([]);

    const fetchPorts = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getPorts();
            if (Array.isArray(data)) {
                const cleanedPorts = data.map(port => ({
                    ...port,
                    'Port Code': port['Port Code'] || '',
                    'Country': port['Country'] || '',
                    'Region': port['Region'] || ''
                }));
                setPorts(cleanedPorts);
            } else {
                setPorts([]);
            }
        } catch (error) {
            console.warn('Error fetching ports:', error);
            setPorts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch('https://glplratebackend-production.up.railway.app/api/regions');
                const data = await response.json();
                setRegions(data);
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };

        fetchRegions();
        fetchPorts();
    }, [fetchPorts]);

    const handleAddPort = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/ports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPort),
            });
            if (response.ok) {
                await fetchPorts();
                setNewPort({ name: '', region: '' });
                setIsAddingPort(false);
            }
        } catch (error) {
            console.error('Error adding port:', error);
        }
    };

    const handleDeletePort = async (portId) => {
        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/ports/${portId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchPorts();
            }
        } catch (error) {
            console.error('Error deleting port:', error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Ports</h2>
                <button
                    onClick={() => setIsAddingPort(true)}
                    className="bg-[#C6082C] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Port</span>
                </button>
            </div>

            <AnimatePresence>
                {isAddingPort && (
                    <motion.form
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 border rounded-lg"
                        onSubmit={handleAddPort}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AdminAutocomplete
                                value={newPort.name}
                                onChange={(value) => setNewPort({ ...newPort, name: value })}
                                placeholder="Enter Port Name"
                                label="Port Name"
                                field="name"
                            />
                            
                            <AdminAutocomplete
                                value={newPort.region}
                                onChange={(value) => setNewPort({ ...newPort, region: value })}
                                placeholder="Enter Region"
                                label="Region"
                                field="region"
                                suggestions={regions}
                            />
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                type="submit"
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingPort(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <motion.div layout className="grid gap-4">
                <AnimatePresence>
                    {ports.map((port) => (
                        <motion.div
                            key={port.uniqueId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                            className="border rounded-lg p-4 flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-medium">{port.name}</h3>
                                <p className="text-sm text-gray-500">{port.region}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingPort(port)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeletePort(port._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
} 
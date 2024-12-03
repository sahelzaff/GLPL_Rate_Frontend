'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline';
import PortStepModal from '@/app/components/admin/PortStepModal';

export default function PortsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [_editingPort, setEditingPort] = useState(null);

    const fetchPorts = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/ports');
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error('Error fetching ports:', error);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        if (session?.user?.role !== 'admin') {
            router.push('/');
            toast.error('Admin access required');
            return;
        }
        fetchPorts().finally(() => setLoading(false));
    }, [session?.user?.role, router, fetchPorts]);

    const handleAddPort = async (portData) => {
        try {
            const response = await fetch('http://localhost:5001/api/ports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(portData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add port');
            }

            await fetchPorts();
            setShowAddModal(false);
            toast.success('Port added successfully');
        } catch (error) {
            toast.error(error.message);
            throw error; // Re-throw to be handled by the modal
        }
    };

    const _handleUpdatePort = useCallback(async (portId, data) => {
        try {
            const response = await fetch(`http://localhost:5001/api/ports/${portId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update port');
            await fetchPorts();
            toast.success('Port updated successfully');
        } catch (error) {
            toast.error(error.message);
        }
    }, [session?.accessToken, fetchPorts]);

    const handleDeletePort = async (portId) => {
        if (!window.confirm('Are you sure you want to delete this port?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/ports/${portId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete port');
            }

            await fetchPorts();
            toast.success('Port deleted successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredPorts = ports.filter(port => 
        port.port_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        port.port_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        port.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ports Management</h1>
                    <p className="text-gray-500">Manage all ports in the system</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Port</span>
                </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search ports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Ports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Port Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Port Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Country
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Region
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPorts.map((port) => (
                            <tr key={port._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <GlobeAsiaAustraliaIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="font-medium text-gray-900">{port.port_code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {port.port_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {port.country}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {port.region || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setEditingPort(port)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePort(port._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Replace the old modal with the new step modal */}
            <PortStepModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddPort}
                existingPorts={ports}
            />
        </div>
    );
} 
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
    BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import ShippingLineStepModal from '@/app/components/admin/ShippingLineStepModal';

export default function ShippingLinesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [shippingLines, setShippingLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingLine, setEditingLine] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
        if (session?.user?.role !== 'admin') {
            router.push('/');
            toast.error('Admin access required');
        }
    }, [session, status, router]);

    const fetchShippingLines = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/shipping-lines', {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch shipping lines');
            }
            const data = await response.json();
            setShippingLines(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching shipping lines:', error);
            toast.error('Failed to fetch shipping lines');
            setShippingLines([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.accessToken) {
            fetchShippingLines();
        }
    }, [session?.accessToken, fetchShippingLines]);

    const handleAddShippingLine = async (lineData) => {
        try {
            const response = await fetch('http://localhost:5001/api/shipping-lines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(lineData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add shipping line');
            }

            await fetchShippingLines();
            setShowAddModal(false);
            toast.success('Shipping line added successfully');
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const handleUpdateShippingLine = useCallback(async (lineId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:5001/api/shipping-lines/${lineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Failed to update shipping line');
            await fetchShippingLines();
            setEditingLine(null);
            toast.success('Shipping line updated successfully');
        } catch (error) {
            toast.error(error.message);
        }
    }, [session?.accessToken, fetchShippingLines]);

    const handleDeleteShippingLine = async (lineId) => {
        if (!window.confirm('Are you sure you want to delete this shipping line?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/shipping-lines/${lineId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete shipping line');
            }

            await fetchShippingLines();
            toast.success('Shipping line deleted successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredShippingLines = Array.isArray(shippingLines) ? shippingLines.filter(line => 
        line.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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
                    <h1 className="text-2xl font-bold text-gray-900">Shipping Lines Management</h1>
                    <p className="text-gray-500">Manage all shipping lines in the system</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Shipping Line</span>
                </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search shipping lines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Shipping Lines Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Website
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredShippingLines.map((line) => (
                            <tr key={line._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="font-medium text-gray-900">{line.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {line.contact_email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {line.website || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setEditingLine(line)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShippingLine(line._id)}
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

            {/* Add/Edit Modal */}
            <ShippingLineStepModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddShippingLine}
                existingShippingLines={shippingLines}
            />
        </div>
    );
} 
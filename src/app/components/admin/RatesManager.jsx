'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    FunnelIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    TruckIcon,
    BuildingLibraryIcon
} from "@heroicons/react/24/outline";
import { useSession } from 'next-auth/react';
import RateStepModal from '@/app/components/admin/RateStepModal';
import EditRateModal from '@/app/components/admin/EditRateModal';
import toast from 'react-hot-toast';

export default function RatesManager() {
    const { data: session } = useSession();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState(() => new Set());
    const [sortConfig, setSortConfig] = useState({
        field: 'created_at',
        direction: 'desc'
    });

    const fetchRates = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/rates', {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch rates');
            }
            const data = await response.json();
            setRates(data);
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error('Failed to fetch rates');
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.accessToken) {
            fetchRates();
        }
    }, [session?.accessToken, fetchRates]);

    const handleAddRate = async (rateData) => {
        try {
            const response = await fetch('http://localhost:5001/api/rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(rateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create rate');
            }

            await fetchRates();
            setShowAddModal(false);
            toast.success('Rate added successfully');
        } catch (error) {
            console.error('Error creating rate:', error);
            toast.error(error.message || 'Failed to create rate');
            throw error;
        }
    };

    const handleDeleteRate = async (rateId) => {
        if (!window.confirm('Are you sure you want to delete this rate?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/rates/${rateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete rate');
            }

            await fetchRates();
            toast.success('Rate deleted successfully');
        } catch (error) {
            console.error('Error deleting rate:', error);
            toast.error('Failed to delete rate');
        }
    };

    const toggleRowExpansion = (rateId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(rateId)) {
            newExpandedRows.delete(rateId);
        } else {
            newExpandedRows.add(rateId);
        }
        setExpandedRows(newExpandedRows);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rates Management</h1>
                    <p className="text-gray-500">Manage shipping rates and routes</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Rate</span>
                </motion.button>
            </div>

            {/* Modals */}
            <RateStepModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddRate}
            />

            <EditRateModal
                isOpen={editingRate !== null}
                onClose={() => setEditingRate(null)}
                onSubmit={(data) => handleUpdateRate(editingRate?._id, data)}
                rate={editingRate}
            />
        </div>
    );
} 
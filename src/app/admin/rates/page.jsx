'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// Wrap the entire rates page content in a component
function RatesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
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

    // Add authentication check
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }
        if (session?.user?.role !== 'admin') {
            router.push('/');
            toast.error('Admin access required');
            return;
        }
    }, [session, status, router]);

    const fetchRates = useCallback(async () => {
        if (!session?.accessToken) return;
        
        try {
            setLoading(true);
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates', {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rates');
            }

            const responseData = await response.json();
            const ratesData = responseData.data || [];
            setRates(ratesData);
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error('Failed to fetch rates');
            setRates([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.accessToken) {
            fetchRates();
        }
    }, [fetchRates, session?.accessToken]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    const handleAddRate = async (rateData) => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates', {
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
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete rate');
            }

            if (data.status === 'success') {
                toast.success('Rate deleted successfully');
                await fetchRates(); // Refresh the rates list
            } else {
                throw new Error(data.message || 'Failed to delete rate');
            }
        } catch (error) {
            console.error('Error deleting rate:', error);
            toast.error(error.message || 'Failed to delete rate');
        }
    };

    const handleUpdateRate = async (rateId, updatedData) => {
        try {
            // Clean and prepare data
            const payload = {
                shipping_line: updatedData.shipping_line_id,
                pol: updatedData.pol_id,
                pod: updatedData.pod_id,
                valid_from: updatedData.valid_from,
                valid_to: updatedData.valid_to,
                container_rates: updatedData.container_rates.map(cr => ({
                    type: cr.type,
                    base_rate: parseFloat(cr.base_rate || 0),
                    ewrs_laden: parseFloat(cr.ewrs_laden || 0),
                    ewrs_empty: parseFloat(cr.ewrs_empty || 0),
                    baf: parseFloat(cr.baf || 0),
                    reefer_surcharge: parseFloat(cr.reefer_surcharge || 0)
                }))
            };

            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update rate');
            }

            if (data.status === 'success') {
                toast.success('Rate updated successfully');
                setEditingRate(null);
                await fetchRates(); // Refresh the rates list
            } else {
                throw new Error(data.message || 'Failed to update rate');
            }
        } catch (error) {
            console.error('Error updating rate:', error);
            toast.error(error.message || 'Failed to update rate');
        }
    };

    // Toggle row expansion
    const toggleRowExpansion = (rateId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(rateId)) {
            newExpandedRows.delete(rateId);
        } else {
            newExpandedRows.add(rateId);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleSort = (field) => {
        setSortConfig(prevConfig => {
            const newDirection = prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc';
            return { field, direction: newDirection };
        });

        let aValue = 0, bValue = 0;
        const sortedRates = [...rates].sort((a, b) => {
            if (field === 'price_asc' || field === 'price_desc') {
                aValue = field === 'price_asc' 
                    ? Math.min(...a.containerRates.map(r => r.rate))
                    : Math.max(...a.containerRates.map(r => r.rate));
                bValue = field === 'price_asc'
                    ? Math.min(...b.containerRates.map(r => r.rate))
                    : Math.max(...b.containerRates.map(r => r.rate));
            }

            switch (field) {
                case 'price_asc':
                    return aValue - bValue;
                case 'price_desc':
                    return bValue - aValue;
                case 'transit_time':
                    return (a.transitTime || 0) - (b.transitTime || 0);
                default:
                    return 0;
            }
        });

        setRates(sortedRates);
    };

    const sortOptions = [
        { 
            label: 'Date Added', 
            value: 'created_at',
            icon: CalendarIcon,
            group: 'Date'
        },
        { 
            label: 'Validity Start', 
            value: 'valid_from',
            icon: CalendarIcon,
            group: 'Date'
        },
        { 
            label: 'Validity End', 
            value: 'valid_to',
            icon: CalendarIcon,
            group: 'Date'
        },
        { 
            label: 'Shipping Line', 
            value: 'shipping_line',
            icon: BuildingLibraryIcon,
            group: 'Basic'
        },
        { 
            label: 'Port of Loading', 
            value: 'pol',
            icon: TruckIcon,
            group: 'Basic'
        },
        { 
            label: 'Port of Discharge', 
            value: 'pod',
            icon: TruckIcon,
            group: 'Basic'
        },
        { 
            label: 'Lowest Rate', 
            value: 'lowest_rate',
            icon: CurrencyDollarIcon,
            group: 'Rate'
        },
        { 
            label: 'Highest Rate', 
            value: 'highest_rate',
            icon: CurrencyDollarIcon,
            group: 'Rate'
        }
    ];

    const filteredRates = searchTerm
        ? rates.filter(rate => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (rate.pol?.toLowerCase() || '').includes(searchLower) ||
                (rate.pod?.toLowerCase() || '').includes(searchLower) ||
                (rate.shipping_line?.toLowerCase() || '').includes(searchLower)
            );
        })
        : rates;

    const sortedRates = [...filteredRates].sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        switch (sortConfig.field) {
            case 'created_at':
                return direction * (new Date(a.created_at) - new Date(b.created_at));
            case 'valid_from':
                return direction * (new Date(a.valid_from) - new Date(b.valid_from));
            case 'valid_to':
                return direction * (new Date(a.valid_to) - new Date(b.valid_to));
            case 'shipping_line':
                return direction * a.shipping_line.localeCompare(b.shipping_line);
            case 'pol':
                return direction * a.pol.localeCompare(b.pol);
            case 'pod':
                return direction * a.pod.localeCompare(b.pod);
            case 'lowest_rate':
                const aMin = Math.min(...a.container_rates.map(r => r.total_cost || r.rate || 0));
                const bMin = Math.min(...b.container_rates.map(r => r.total_cost || r.rate || 0));
                return direction * (aMin - bMin);
            case 'highest_rate':
                const aMax = Math.max(...a.container_rates.map(r => r.total_cost || r.rate || 0));
                const bMax = Math.max(...b.container_rates.map(r => r.total_cost || r.rate || 0));
                return direction * (aMax - bMax);
            default:
                return 0;
        }
    });

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

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search rates by POL, POD, or shipping line..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Sorting Options */}
            <div className="flex items-center justify-between">
                <div className="relative group">
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C6082C] focus:ring-offset-2"
                    >
                        <FunnelIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">Sort By</span>
                        <ArrowsUpDownIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {/* Dropdown Content */}
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-2">
                            {/* Group options */}
                            {Object.entries(
                                sortOptions.reduce((acc, option) => {
                                    if (!acc[option.group]) acc[option.group] = [];
                                    acc[option.group].push(option);
                                    return acc;
                                }, {})
                            ).map(([group, options]) => (
                                <div key={group} className="mb-2">
                                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {group}
                                    </div>
                                    {options.map((option) => {
                                        const isActive = sortConfig.field === option.value;
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSort(option.value)}
                                                className={`w-full flex items-center space-x-2 px-2 py-2 text-sm rounded-lg ${
                                                    isActive ? 'bg-[#C6082C]/10 text-[#C6082C]' : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{option.label}</span>
                                                {isActive && (
                                                    <span className="ml-auto text-xs">
                                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    {filteredRates.length} rates found
                </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shipping Line
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Route
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Validity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRates.map((rate) => (
                            <React.Fragment key={rate._id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {rate.shipping_line}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {rate.pol} → {rate.pod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            Valid until {new Date(rate.valid_to).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleRowExpansion(rate._id)}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                {expandedRows.has(rate._id) ? (
                                                    <ChevronUpIcon className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDownIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setEditingRate(rate)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRate(rate._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedRows.has(rate._id) && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-gray-900">Container Rates</h4>
                                                <div className="grid grid-cols-4 gap-4">
                                                    {rate.container_rates.map((cr, idx) => (
                                                        <div key={`${rate._id}-${cr.type}-${idx}`} className="bg-white p-4 rounded-lg shadow-sm">
                                                            <div className="font-medium text-gray-900 mb-2">
                                                                {cr.type}' Container
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Base Rate:</span>
                                                                    <span>USD {cr.base_rate?.toLocaleString() || cr.rate?.toLocaleString()}</span>
                                                                </div>
                                                                {cr.ewrs_laden > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">EWRS Laden:</span>
                                                                        <span>USD {cr.ewrs_laden.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {cr.ewrs_empty > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">EWRS Empty:</span>
                                                                        <span>USD {cr.ewrs_empty.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {cr.baf > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">BAF:</span>
                                                                        <span>USD {cr.baf.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                                                                    <span>Total:</span>
                                                                    <span className="text-[#C6082C]">
                                                                        USD {(cr.total_cost || cr.rate).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showAddModal && (
                <RateStepModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddRate}
                />
            )}

            {editingRate && (
                <EditRateModal
                    isOpen={!!editingRate}
                    onClose={() => setEditingRate(null)}
                    onSubmit={(data) => handleUpdateRate(editingRate._id, data)}
                    rate={editingRate}
                />
            )}
        </div>
    );
}

// Dynamically import modals
const RateStepModal = dynamic(() => import('@/app/components/admin/RateStepModal'), {
    ssr: false,
    loading: () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C6082C]"></div>
});

const EditRateModal = dynamic(() => import('@/app/components/admin/EditRateModal'), {
    ssr: false,
    loading: () => <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C6082C]"></div>
});

// Main page component with Suspense
export default function RatesPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        }>
            <RatesContent />
        </Suspense>
    );
} 
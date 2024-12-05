'use client';
import React, { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import RateCard from '@/app/components/admin/RateCard';

function RatesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

            const data = await response.json();
            if (data.status === 'success') {
                setRates(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch rates');
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error(error.message || 'Failed to fetch rates');
            setRates([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
            fetchRates();
    }, [fetchRates]);

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
                throw new Error(error.message || 'Failed to create rate');
            }

            const data = await response.json();
            if (data.status === 'success') {
                toast.success(data.message || 'Rate added successfully');
            setShowAddModal(false);
                fetchRates();
            } else {
                throw new Error(data.message || 'Failed to create rate');
            }
        } catch (error) {
            console.error('Error creating rate:', error);
            toast.error(error.message || 'Failed to create rate');
        }
    };

    const handleUpdateRate = async (rateId, data) => {
        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update rate');
            }

            const responseData = await response.json();
            if (responseData.status === 'success') {
                toast.success('Rate updated successfully');
            setEditingRate(null);
                fetchRates();
            } else {
                throw new Error(responseData.message || 'Failed to update rate');
            }
        } catch (error) {
            console.error('Error updating rate:', error);
            toast.error(error.message || 'Failed to update rate');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    const filteredRates = searchTerm
        ? rates.filter(rate => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (rate.shipping_line?.toLowerCase() || '').includes(searchLower) ||
                (rate.pol?.toLowerCase() || '').includes(searchLower) ||
                (rate.pod?.toLowerCase() || '').includes(searchLower)
            );
        })
        : rates;

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

            {/* Rates Grid */}
            <div className="grid gap-4">
                {filteredRates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No rates found
                                        </div>
                ) : (
                    filteredRates.map(rate => (
                        <RateCard
                            key={rate._id}
                            rate={rate}
                            onEdit={() => setEditingRate(rate)}
                            onRefresh={fetchRates}
                        />
                    ))
                )}
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
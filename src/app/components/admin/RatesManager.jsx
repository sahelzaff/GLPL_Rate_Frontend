'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from "@heroicons/react/24/outline";
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// Dynamically import the modals
const RateStepModal = dynamic(() => import('./RateStepModal'), { ssr: false });
const EditRateModal = dynamic(() => import('./EditRateModal'), { ssr: false });
const RateCard = dynamic(() => import('../RateCard'), { ssr: false });

export default function RatesManager() {
    const { data: session } = useSession();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRate, setEditingRate] = useState(null);

    const fetchRates = useCallback(async () => {
        if (!session?.accessToken) return;
        
        try {
            setLoading(true);
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rates');
            }

            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                setRates(data.data);
            } else {
                setRates([]);
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error('Failed to fetch rates');
            setRates([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

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
                throw new Error('Failed to update rate');
            }

            await fetchRates();
            setEditingRate(null);
            toast.success('Rate updated successfully');
        } catch (error) {
            console.error('Error updating rate:', error);
            toast.error('Failed to update rate');
        }
    };

    const handleDeleteRate = async (rateId) => {
        if (!confirm('Are you sure you want to delete this rate?')) return;

        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rateId}`, {
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
                throw new Error('Failed to add rate');
            }

            await fetchRates();
            setShowAddModal(false);
            toast.success('Rate added successfully');
        } catch (error) {
            console.error('Error adding rate:', error);
            toast.error('Failed to add rate');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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

            <RateStepModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddRate}
            />

            <EditRateModal
                isOpen={editingRate !== null}
                onClose={() => setEditingRate(null)}
                onSubmit={handleUpdateRate}
                rate={editingRate}
            />

            {rates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No rates found
                </div>
            ) : (
                <div className="grid gap-4">
                    {rates.map(rate => (
                        <RateCard 
                            key={rate._id} 
                            rate={rate}
                            onEdit={() => setEditingRate(rate)}
                            onDelete={handleDeleteRate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 
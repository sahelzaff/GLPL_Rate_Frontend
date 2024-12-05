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
    FunnelIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

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
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

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
        fetchRates();
    }, [session, status, router, fetchRates]);

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
                throw new Error(error.message || 'Failed to add rate');
            }

            await fetchRates();
            setShowAddModal(false);
            toast.success('Rate added successfully');
        } catch (error) {
            console.error('Error adding rate:', error);
            toast.error(error.message || 'Failed to add rate');
        }
    };

    const handleUpdateRate = async (id, rateData) => {
        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(rateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update rate');
            }

            await fetchRates();
            setEditingRate(null);
            toast.success('Rate updated successfully');
        } catch (error) {
            console.error('Error updating rate:', error);
            toast.error(error.message || 'Failed to update rate');
        }
    };

    const handleDeleteRate = async (id) => {
        if (!confirm('Are you sure you want to delete this rate?')) return;

        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete rate');
            }

            await fetchRates();
            toast.success('Rate deleted successfully');
        } catch (error) {
            console.error('Error deleting rate:', error);
            toast.error(error.message || 'Failed to delete rate');
        }
    };

    // ... rest of your component code (UI rendering) ...
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
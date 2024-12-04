'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
} from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// Dynamically import modals to fix initialization error
const RateStepModal = dynamic(() => import('@/app/components/admin/RateStepModal'), { ssr: false });
const EditRateModal = dynamic(() => import('@/app/components/admin/EditRateModal'), { ssr: false });

export default function RatesPage() {
    const { data: session } = useSession();
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

    // Rest of your original code remains exactly the same...
    const fetchRates = useCallback(async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates', {
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
            toast.error('Failed to fetch rates');
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    // Keep all your existing functions and JSX...
    // (The rest of the file remains unchanged)

    return (
        <div className="space-y-6">
            {/* Your existing JSX remains exactly the same */}
        </div>
    );
} 
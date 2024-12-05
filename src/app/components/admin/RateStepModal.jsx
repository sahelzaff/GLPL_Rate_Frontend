'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon, CheckCircleIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useSession } from 'next-auth/react';
const steps = [
    {
        id: 'shipping_line',
        title: 'Select Shipping Line',
        description: 'Choose the shipping line for this rate'
    },
    {
        id: 'pol',
        title: 'Port of Loading (POL)',
        description: 'Select the port of loading'
    },
    {
        id: 'pod',
        title: 'Port of Discharge (POD)',
        description: 'Select the port of discharge'
    },
    {
        id: 'validity',
        title: 'Validity Period',
        description: 'Set the validity period for this rate'
    },
    {
        id: 'container_rates',
        title: 'Container Rates',
        description: 'Enter rates for different container types'
    },
    {
        id: 'notes',
        title: 'Additional Notes',
        description: 'Add any additional information or remarks'
    }
];

export default function RateStepModal({ isOpen, onClose, onSubmit }) {
    const { data: session } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        shipping_line_id: '',
        pol_id: '',
        pod_id: '',
        valid_from: '',
        valid_to: '',
        container_rates: []
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
            toast.success('Rate added successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to add rate');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your component code ...
} 
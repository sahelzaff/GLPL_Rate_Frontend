'use client';
import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function RateCard({ rate, onEdit, onDelete }) {
    if (!rate) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rate.shipping_line}</h3>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">POL:</span> {rate.pol}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">POD:</span> {rate.pod}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Valid:</span> {rate.valid_from} to {rate.valid_to}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(rate)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(rate._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <h4 className="font-medium text-gray-900">Container Rates:</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                    {rate.container_rates?.map((containerRate, index) => (
                        <div key={index} className="text-sm text-gray-600">
                            <span className="font-medium">{containerRate.type}:</span> ${containerRate.rate}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
} 
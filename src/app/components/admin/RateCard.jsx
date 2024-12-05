import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function RateCard({ rate, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rate.shipping_line}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                        {rate.pol} → {rate.pod}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(rate)}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(rate._id)}
                        className="text-gray-400 hover:text-red-500"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rate.container_rates && rate.container_rates.map((containerRate, index) => (
                    <div key={`${rate._id}-${containerRate.type}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium text-gray-900 mb-2">
                            {containerRate.type}' Container
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Rate:</span>
                                <span>USD {containerRate.rate?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4 mt-4">
                <div>
                    Valid: {new Date(rate.valid_from).toLocaleDateString()} - {new Date(rate.valid_to).toLocaleDateString()}
                </div>
                <div>
                    Updated: {new Date(rate.updated_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
} 
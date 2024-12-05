import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function RateCard({ rate, onEdit, onDelete, onRefresh }) {
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this rate?')) return;
        
        try {
            const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rate._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete rate');
            }

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Rate deleted successfully');
                if (onRefresh) onRefresh();
            } else {
                throw new Error(data.message || 'Failed to delete rate');
            }
        } catch (error) {
            console.error('Error deleting rate:', error);
            toast.error(error.message || 'Failed to delete rate');
        }
    };

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
                        onClick={handleDelete}
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
                                <span className="text-gray-500">Base Rate:</span>
                                <span>USD {containerRate.base_rate?.toLocaleString()}</span>
                            </div>
                            {containerRate.ewrs_laden > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">EWRS Laden:</span>
                                    <span>USD {containerRate.ewrs_laden?.toLocaleString()}</span>
                                </div>
                            )}
                            {containerRate.ewrs_empty > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">EWRS Empty:</span>
                                    <span>USD {containerRate.ewrs_empty?.toLocaleString()}</span>
                                </div>
                            )}
                            {containerRate.baf > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">BAF:</span>
                                    <span>USD {containerRate.baf?.toLocaleString()}</span>
                                </div>
                            )}
                            {containerRate.reefer_surcharge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reefer Surcharge:</span>
                                    <span>USD {containerRate.reefer_surcharge?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                                <span>Total:</span>
                                <span className="text-[#C6082C]">
                                    USD {containerRate.total_cost?.toLocaleString()}
                                </span>
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
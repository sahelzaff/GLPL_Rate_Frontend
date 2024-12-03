'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FunnelIcon, 
    XMarkIcon,
    CurrencyDollarIcon,
    ClockIcon,
    TruckIcon,
    BuildingOffice2Icon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

export default function RateFilters({ onFilterChange }) {
    const [filters, setFilters] = useState({
        priceRange: { min: '', max: '' },
        transitTime: { min: '', max: '' },
        shippingLines: [],
        containerTypes: [],
        sortBy: 'price_asc'
    });

    const handleFilterChange = (category, value) => {
        const newFilters = { ...filters, [category]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#C6082C]" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button
                    onClick={() => {
                        const defaultFilters = {
                            priceRange: { min: '', max: '' },
                            transitTime: { min: '', max: '' },
                            shippingLines: [],
                            containerTypes: [],
                            sortBy: 'price_asc'
                        };
                        setFilters(defaultFilters);
                        onFilterChange(defaultFilters);
                    }}
                    className="text-sm text-gray-500 hover:text-[#C6082C] flex items-center space-x-1"
                >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Clear all</span>
                </button>
            </div>

            <div className="space-y-6 mt-6">
                {/* Sort By - Moved to top */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                        <FunnelIcon className="w-5 h-5 mr-2 text-[#C6082C]" />
                        Sort Results
                    </h3>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6082C] bg-white"
                    >
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="transit_time">Transit Time</option>
                    </select>
                </div>

                {/* Price Range Filter */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 mr-2 text-[#C6082C]" />
                        Price Range (USD)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.priceRange.min}
                                onChange={(e) => handleFilterChange('priceRange', { 
                                    ...filters.priceRange, 
                                    min: e.target.value 
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6082C] bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                            <input
                                type="number"
                                placeholder="Any"
                                value={filters.priceRange.max}
                                onChange={(e) => handleFilterChange('priceRange', { 
                                    ...filters.priceRange, 
                                    max: e.target.value 
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6082C] bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Transit Time Filter */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2 text-[#C6082C]" />
                        Transit Time (Days)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.transitTime.min}
                                onChange={(e) => handleFilterChange('transitTime', { 
                                    ...filters.transitTime, 
                                    min: e.target.value 
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6082C] bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                            <input
                                type="number"
                                placeholder="Any"
                                value={filters.transitTime.max}
                                onChange={(e) => handleFilterChange('transitTime', { 
                                    ...filters.transitTime, 
                                    max: e.target.value 
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6082C] bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Container Types Filter */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                        <TruckIcon className="w-5 h-5 mr-2 text-[#C6082C]" />
                        Container Types
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {['20 Standard', '40 Standard', '40 HC', '20 Reefer', '40 Reefer'].map((type) => (
                            <label key={type} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filters.containerTypes.includes(type)}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.containerTypes, type]
                                            : filters.containerTypes.filter(t => t !== type);
                                        handleFilterChange('containerTypes', newTypes);
                                    }}
                                    className="rounded text-[#C6082C] focus:ring-[#C6082C]"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 
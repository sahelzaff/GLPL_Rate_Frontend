'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import BulkUploadTab from '@/app/components/admin/BulkUploadTab';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function BulkUploadPage() {
    const tabs = [
        { name: 'Ports', type: 'ports' },
        { name: 'Shipping Lines', type: 'shipping-lines' },
        { name: 'Rates', type: 'rates' }
    ];

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-8"
            >
                Bulk Upload
            </motion.h1>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.type}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                        'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white text-[#C6082C] shadow'
                                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                                    )
                                }
                            >
                                {tab.name}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels className="mt-6">
                        {tabs.map((tab) => (
                            <Tab.Panel
                                key={tab.type}
                                className={classNames(
                                    'rounded-xl p-3',
                                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2'
                                )}
                            >
                                <BulkUploadTab type={tab.type} />
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
} 
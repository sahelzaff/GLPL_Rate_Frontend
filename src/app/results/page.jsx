'use client';
import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { searchRates } from '@/services/api';
import toast from 'react-hot-toast';

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const pol = searchParams.get('pol');
                const pod = searchParams.get('pod');
                
                if (!pol || !pod) {
                    throw new Error('Missing search parameters');
                }

                const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        pol_code: pol,
                        pod_code: pod
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                
                if (data.status === 'success') {
                    // Ensure data.data is always an array
                    setResults(Array.isArray(data.data) ? data.data : []);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error('Error fetching results:', error);
                setError(error.message);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624]"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <main className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Search Results</h1>
                    
                    {results.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No rates found for this route</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 px-4 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624]"
                            >
                                Try Another Search
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {results.map((result) => (
                                <motion.div
                                    key={result._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-md p-6"
                                >
                                    {/* Rate card content */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold">{result.shipping_line}</h3>
                                            <div className="mt-2 space-y-2">
                                                <p>POL: {result.pol}</p>
                                                <p>POD: {result.pod}</p>
                                                <p>Valid: {result.valid_from} to {result.valid_to}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Container rates */}
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Container Rates:</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {result.container_rates?.map((rate, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded">
                                                    <p className="font-medium">{rate.type}</p>
                                                    <p className="text-[#C6082C]">${rate.rate}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function Results() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
} 
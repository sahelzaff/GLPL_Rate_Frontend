'use client';
import React, { Suspense } from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
    MagnifyingGlassIcon,
    CalendarIcon,
    TruckIcon,
    GlobeAltIcon,
    ArrowLongRightIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    ClockIcon,
    CheckBadgeIcon,
    ExclamationCircleIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import Navbar from '../components/Navbar';
import Autocomplete from '../components/Autocomplete';
import { searchRates } from '@/services/api';
import assets from '../../../public/assets/asset';
import toast from 'react-hot-toast';
import RateFilters from '../components/RateFilters';
import { LuShip } from "react-icons/lu";

const getRateHighlights = (results) => {
    if (!results.length) return null;

    const getLowestRate = (containerRates) => {
        return Math.min(...containerRates.map(r => {
            if (r.total_cost !== undefined && r.total_cost !== null) return r.total_cost;
            if (r.base_rate !== undefined && r.base_rate !== null) return r.base_rate;
            if (r.rate !== undefined && r.rate !== null) return r.rate;
            return Infinity;
        }));
    };

    const highlights = {
        recommended: null,
        cheapest: null,
        fastest: null
    };

    // Get the cheapest rate
    highlights.cheapest = results.reduce((min, current) => {
        const minRate = getLowestRate(min.containerRates);
        const currentRate = getLowestRate(current.containerRates);
        return currentRate < minRate ? current : min;
    }, results[0]);

    // Get the fastest based on transit time
    highlights.fastest = results.reduce((fastest, current) => {
        if (!current.transitTime) return fastest;
        if (!fastest.transitTime) return current;
        return current.transitTime < fastest.transitTime ? current : fastest;
    }, results[0]);

    // Get recommended based on a combination of factors
    highlights.recommended = results.reduce((recommended, current) => {
        const currentScore = calculateRecommendationScore(current);
        const recommendedScore = calculateRecommendationScore(recommended);
        return currentScore > recommendedScore ? current : recommended;
    }, results[0]);

    return highlights;
};

const calculateRecommendationScore = (rate) => {
    if (!rate) return 0;
    
    const avgPrice = rate.containerRates.reduce((sum, r) => sum + r.rate, 0) / rate.containerRates.length;
    const transitTimeScore = rate.transitTime ? 100 - (rate.transitTime * 2) : 0; // Lower transit time is better
    const priceScore = 100 - (avgPrice / 100); // Lower price is better
    
    return transitTimeScore * 0.6 + priceScore * 0.4; // Weighted score
};

const RateHighlights = ({ highlights, onHighlightClick }) => {
    const getDisplayRate = (rate) => {
        const containerRates = rate.containerRates || [];
        const lowestRate = Math.min(...containerRates.map(r => {
            if (r.total_cost !== undefined && r.total_cost !== null) return r.total_cost;
            if (r.base_rate !== undefined && r.base_rate !== null) return r.base_rate;
            if (r.rate !== undefined && r.rate !== null) return r.rate;
            return Infinity;
        }));
        return lowestRate === Infinity ? 0 : lowestRate;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Recommended */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onHighlightClick('recommended')}
                className="bg-green-50 p-6 rounded-xl shadow-sm cursor-pointer border border-green-100"
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-green-700 font-medium">Recommended</h3>
                    <CheckIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    ${getDisplayRate(highlights.recommended).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{highlights.recommended.shippingLine}</p>
                <p className="text-sm text-gray-500">
                    {highlights.recommended.transitTime || 'N/A'} days transit time
                </p>
            </motion.div>

            {/* Cheapest */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onHighlightClick('cheapest')}
                className="bg-blue-50 p-6 rounded-xl shadow-sm cursor-pointer border border-blue-100"
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-blue-700 font-medium">Cheapest</h3>
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    ${getDisplayRate(highlights.cheapest).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{highlights.cheapest.shippingLine}</p>
                <p className="text-sm text-gray-500">
                    {highlights.cheapest.transitTime || 'N/A'} days transit time
                </p>
            </motion.div>

            {/* Fastest */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onHighlightClick('fastest')}
                className="bg-purple-50 p-6 rounded-xl shadow-sm cursor-pointer border border-purple-100"
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-purple-700 font-medium">Fastest</h3>
                    <ClockIcon className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    ${getDisplayRate(highlights.fastest).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{highlights.fastest.shippingLine}</p>
                <p className="text-sm text-gray-500">
                    {highlights.fastest.transitTime || 'N/A'} days transit time
                </p>
            </motion.div>
        </div>
    );
};

const SearchSection = ({ newPol, setNewPol, newPod, setNewPod, handleNewSearch, searchError, pol, pod }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#C6082C]/10 to-[#C6082C]/5 rounded-xl" />
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Port of Loading (POL)
            </label>
            <Autocomplete
              initialValue={pol}
              value={newPol}
              onChange={setNewPol}
              placeholder="Enter port of loading"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Port of Discharge (POD)
            </label>
            <Autocomplete
              initialValue={pod}
              value={newPod}
              onChange={setNewPod}
              placeholder="Enter port of discharge"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewSearch}
            className="flex items-center justify-center space-x-2 bg-[#C6082C] hover:bg-[#a00624] text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>Search Rates</span>
          </motion.button>
        </div>

        {searchError && (
          <div className="mt-3 text-red-500 text-sm text-center">{searchError}</div>
        )}
      </div>
    </motion.div>
  );
};

const getShippingLineLogo = (shippingLineName) => {
    const name = shippingLineName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    console.log('Shipping Line Name:', shippingLineName);
    console.log('Processed Name:', name);

    if (name.includes('maersk')) {
        console.log('Maersk logo path:', assets.maersk);
        return assets.maersk;
    }
    if (name.includes('hapag') || name.includes('lloyd')) {
        return assets.hapag_lloyd;
    }
    if (name.includes('cosco')) {
        return assets.cosco;
    }
    if (name.includes('msc')) {
        return assets.msc;
    }
    if (name.includes('one')) {
        return assets.one;
    }
    if (name.includes('evergreen')) {
        return assets.evergreen;
    }
    if (name.includes('cma') || name.includes('cgm')) {
        return assets.cma_cgm;
    }
    if (name.includes('unifeeder')) {
        return assets.unifeeder;
    }
    
    return null;
};

const ContainerRateDisplay = ({ containerRate }) => {
    const [showBreakup, setShowBreakup] = useState(false);
    
    // Helper function to get the display rate
    const getDisplayRate = (rate) => {
        if (rate.total_cost !== undefined && rate.total_cost !== null) return rate.total_cost;
        if (rate.base_rate !== undefined && rate.base_rate !== null) return rate.base_rate;
        if (rate.rate !== undefined && rate.rate !== null) return rate.rate;
        return 0;
    };

    const totalRate = getDisplayRate(containerRate);
    const hasBreakup = containerRate.base_rate !== undefined;

    return (
        <div className="bg-gray-50 rounded-lg overflow-hidden">
            {/* Main Rate Display */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h4 className="font-medium text-gray-900">{containerRate.type}' Container</h4>
                        <span className="text-lg font-bold text-[#C6082C]">
                            USD {totalRate.toLocaleString()}
                        </span>
                    </div>
                    {hasBreakup && (
                        <button
                            onClick={() => setShowBreakup(!showBreakup)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {showBreakup ? 'Hide Breakup' : 'View Breakup'}
                        </button>
                    )}
                </div>
            </div>

            {/* Rate Breakup */}
            {showBreakup && hasBreakup && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                >
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Base Rate:</span>
                            <span className="font-medium">USD {(containerRate.base_rate || 0).toLocaleString()}</span>
                        </div>
                        {containerRate.ewrs_laden > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">EWRS Laden:</span>
                                <span className="font-medium">USD {containerRate.ewrs_laden.toLocaleString()}</span>
                            </div>
                        )}
                        {containerRate.ewrs_empty > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">EWRS Empty:</span>
                                <span className="font-medium">USD {containerRate.ewrs_empty.toLocaleString()}</span>
                            </div>
                        )}
                        {containerRate.baf > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">BAF:</span>
                                <span className="font-medium">USD {containerRate.baf.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                            <span className="font-medium text-gray-900">Total Cost:</span>
                            <span className="font-bold text-[#C6082C]">
                                USD {totalRate.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const NotesModal = ({ isOpen, onClose, notes }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg"
            >
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {notes && notes.length > 0 ? (
                        <div className="space-y-4">
                            {notes.map((note, index) => (
                                <div 
                                    key={note.id || index} 
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <p className="text-gray-700">{note.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No additional notes available</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const RateCard = ({ rate }) => {
    const [showNotes, setShowNotes] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            {/* Card Header - Shipping Line Info */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {getShippingLineLogo(rate.shippingLine) ? (
                            <div className="h-10 w-24 relative">
                                <img 
                                    src={getShippingLineLogo(rate.shippingLine)} 
                                    alt={rate.shippingLine}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                        console.error('Image load error for:', rate.shippingLine);
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = ''; // Clear the source
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `<div class="h-8 w-8 text-gray-400"><BuildingOffice2Icon /></div>`;
                                    }}
                                />
                            </div>
                        ) : (
                            <BuildingOffice2Icon className="h-8 w-8 text-gray-400" />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {rate.shippingLine}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Valid until {new Date(rate.validTo).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-[#C6082C]/10 text-[#C6082C] rounded-lg font-medium text-sm"
                    >
                        {rate.transitTime ? `${rate.transitTime} days` : 'Transit time N/A'}
                    </motion.div>
                </div>
            </div>

            {/* Route Information */}
            <div className="p-6">
                <div className="flex items-center justify-start space-x-4 mb-6">
                    <div className="text-right">
                        <p className="font-medium text-gray-900">{rate.pol}</p>
                        <p className="text-sm text-gray-500">Port of Loading</p>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <div className="w-3 h-3 rounded-full bg-[#C6082C]" />
                        <ArrowLongRightIcon className="w-10 h-6 text-[#C6082C]" />
                        <div className="w-3 h-3 rounded-full bg-[#C6082C]" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-900">{rate.pod}</p>
                        <p className="text-sm text-gray-500">Port of Discharge</p>
                    </div>
                </div>

                {/* Container Rates */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Container Rates</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {rate.containerRates.map((containerRate, index) => (
                            <ContainerRateDisplay 
                                key={index} 
                                containerRate={containerRate} 
                            />
                        ))}
                    </div>
                </div>

                {/* Add Notes Button */}
                {rate.notes && rate.notes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <button
                            onClick={() => setShowNotes(true)}
                            className="flex items-center space-x-2 text-[#C6082C] hover:text-[#a00624] transition-colors"
                        >
                            <DocumentTextIcon className="w-5 h-5" />
                            <span className="font-medium">
                                View Additional Notes ({rate.notes.length})
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Service Information */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50">
                <div className="flex items-center">
                    <LuShip  className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 ml-2">Direct Service</span>
                </div>
                
                {rate.transitTime && (
                    <div className="flex items-center ml-4">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-2">
                            {rate.transitTime} days
                        </span>
                    </div>
                )}
                
                {rate.verified && (
                    <div className="flex items-center ml-4">
                        <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-500 ml-2">Verified Rate</span>
                    </div>
                )}
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={showNotes}
                onClose={() => setShowNotes(false)}
                notes={rate.notes}
            />
        </motion.div>
    );
};

const saveToRecentSearches = (polCode, podCode, polName, podName) => {
  if (!polCode || !podCode || !polName || !podName) return;

  const newSearch = {
    id: Date.now(),
    pol: { code: polCode, name: polName },
    pod: { code: podCode, name: podName },
    timestamp: new Date().toISOString()
  };

  // Get existing searches
  const savedSearches = localStorage.getItem('recentSearches');
  let searches = savedSearches ? JSON.parse(savedSearches) : [];

  // Check if this exact search already exists
  const existingSearchIndex = searches.findIndex(
    search => search.pol.code === polCode && search.pod.code === podCode
  );

  if (existingSearchIndex !== -1) {
    // Move existing search to top and update timestamp
    searches = [
      { ...searches[existingSearchIndex], timestamp: newSearch.timestamp },
      ...searches.slice(0, existingSearchIndex),
      ...searches.slice(existingSearchIndex + 1)
    ];
  } else {
    // Add new search
    searches = [newSearch, ...searches];
  }

  // Keep only the most recent 4 searches
  searches = searches.slice(0, 4);
  
  localStorage.setItem('recentSearches', JSON.stringify(searches));
};

function ResultsContent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPol, setNewPol] = useState('');
    const [newPod, setNewPod] = useState('');
    const [searchError, setSearchError] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);
    const [highlights, setHighlights] = useState(null);
    const rateRefs = {
        recommended: React.useRef(null),
        cheapest: React.useRef(null),
        fastest: React.useRef(null)
    };

    // Get current pol and pod from searchParams
    const currentPol = searchParams.get('pol');
    const currentPod = searchParams.get('pod');

    const handleSearch = async (pol, pod) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pol_code: pol,
                    pod_code: pod
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch rates');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Error fetching results:', err);
            setError(err.message || 'Failed to fetch results. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/results');
            return;
        }

        const pol = searchParams.get('pol');
        const pod = searchParams.get('pod');

        if (!pol || !pod) {
            // Check for stored search params
            const storedSearch = localStorage.getItem('searchParams');
            if (storedSearch) {
                const { pol: storedPol, pod: storedPod } = JSON.parse(storedSearch);
                localStorage.removeItem('searchParams'); // Clean up
                router.push(`/results?pol=${encodeURIComponent(storedPol)}&pod=${encodeURIComponent(storedPod)}`);
            } else {
                router.push('/');
            }
            return;
        }

        setNewPol(pol);
        setNewPod(pod);
        handleSearch(pol, pod);
    }, [status, searchParams, router]);

    const handleNewSearch = async () => {
        if (!newPol || !newPod) {
            setSearchError('Please enter both POL and POD');
            return;
        }

        // Get the full port names from the input fields
        const polInput = document.querySelector('input[placeholder="Enter POL"]');
        const podInput = document.querySelector('input[placeholder="Enter POD"]');
        
        if (polInput && podInput && polInput.value && podInput.value) {
            saveToRecentSearches(newPol, newPod, polInput.value, podInput.value);
        }

        router.push(`/results?pol=${encodeURIComponent(newPol)}&pod=${encodeURIComponent(newPod)}`);
    };

    const getContainerIcon = (type) => {
        const size = type.split("'")[0]; // Gets "20", "40", "45" etc.
        const description = type.split("'")[1]?.toLowerCase() || ''; // Gets the description in lowercase

        if (description.includes('standard')) {
            return size === '20' ? assets.standard_20 
                 : size === '40' ? assets.standard_40 
                 : assets.standard_45;
        }
        if (description.includes('reefer')) {
            return size === '20' ? assets.reefer_20 
                 : size === '40' ? assets.reefer_40 
                 : assets.reefer_45;
        }
        if (description.includes('open top')) {
            return size === '20' ? assets.ot_20 
                 : size === '40' ? assets.ot_40 
                 : assets.ot_40hc;
        }
        // Default to standard container if no match
        return assets.standard_20;
    };

    useEffect(() => {
        // Debug shipping line logos
        results.forEach(result => {
            const logo = getShippingLineLogo(result.shippingLine);
            console.log(`Shipping Line: ${result.shippingLine}, Logo Path: ${logo}`);
        });
    }, [results]);

    useEffect(() => {
        // Debug image paths
        const logos = {
            maersk: assets.maersk,
            hapag_lloyd: assets.hapag_lloyd,
            cosco: assets.cosco,
            msc: assets.msc,
            one: assets.one,
            evergreen: assets.evergreen,
            cma_cgm: assets.cma_cgm
        };
        
        console.log('Available logo paths:', logos);
        
        // Test image loading
        Object.entries(logos).forEach(([name, path]) => {
            const img = new Image();
            img.onload = () => console.log(`✅ ${name} logo loaded successfully`);
            img.onerror = () => console.error(`❌ Failed to load ${name} logo from: ${path}`);
            img.src = path;
        });
    }, []);

    useEffect(() => {
        if (results.length > 0) {
            setFilteredResults(results);
            setHighlights(getRateHighlights(results));
        }
    }, [results]);

    const handleFilterChange = (filters) => {
        let filtered = [...results];

        // Filter by price range
        if (filters.priceRange.min) {
            filtered = filtered.filter(result => 
                result.containerRates.some(rate => rate.rate >= Number(filters.priceRange.min))
            );
        }
        if (filters.priceRange.max) {
            filtered = filtered.filter(result => 
                result.containerRates.some(rate => rate.rate <= Number(filters.priceRange.max))
            );
        }

        // Filter by transit time
        if (filters.transitTime.min) {
            filtered = filtered.filter(result => 
                result.transitTime >= Number(filters.transitTime.min)
            );
        }
        if (filters.transitTime.max) {
            filtered = filtered.filter(result => 
                result.transitTime <= Number(filters.transitTime.max)
            );
        }

        // Filter by container types
        if (filters.containerTypes.length > 0) {
            filtered = filtered.filter(result =>
                result.containerRates.some(rate =>
                    filters.containerTypes.some(type =>
                        rate.type.toLowerCase().includes(type.toLowerCase())
                    )
                )
            );
        }

        // Sort results
        switch (filters.sortBy) {
            case 'price_asc':
                filtered.sort((a, b) => Math.min(...a.containerRates.map(r => r.rate)) - Math.min(...b.containerRates.map(r => r.rate)));
                break;
            case 'price_desc':
                filtered.sort((a, b) => Math.max(...b.containerRates.map(r => r.rate)) - Math.max(...a.containerRates.map(r => r.rate)));
                break;
            case 'transit_time':
                filtered.sort((a, b) => (a.transitTime || 0) - (b.transitTime || 0));
                break;
        }

        setFilteredResults(filtered);
    };

    const handleHighlightClick = (type) => {
        const index = filteredResults.findIndex(rate => rate === highlights[type]);
        if (index !== -1) {
            const element = document.getElementById(`rate-${index}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight animation
                element.classList.add('highlight-pulse');
                setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
                </div>
            </div>
        );
    }

    return (
    
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 mt-16">
                <SearchSection
                    newPol={newPol}
                    setNewPol={setNewPol}
                    newPod={newPod}
                    setNewPod={setNewPod}
                    handleNewSearch={handleNewSearch}
                    searchError={searchError}
                    pol={currentPol}
                    pod={currentPod}
                />

                <div className="flex flex-col md:flex-row gap-6 mt-8">
                    {/* Filters Section - Left Side */}
                    <div className="md:w-1/4">
                        {!loading && !error && results.length > 0 && (
                            <div className="sticky top-24">
                                <RateFilters onFilterChange={handleFilterChange} />
                            </div>
                        )}
                    </div>

                    {/* Results Section - Right Side */}
                    <div className="md:w-3/4">
                        {!loading && !error && highlights && (
                            <RateHighlights 
                                highlights={highlights} 
                                onHighlightClick={handleHighlightClick}
                            />
                        )}

                        {error ? (
                            <div className="text-center text-red-600">{error}</div>
                        ) : filteredResults.length === 0 ? (
                            <div className="text-center text-gray-600">No results found</div>
                        ) : (
                            <div className="space-y-6">
                                {filteredResults.map((result, index) => (
                                    <div 
                                        key={index}
                                        id={`rate-${index}`}
                                        className="transition-all duration-300"
                                    >
                                        <RateCard rate={result} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
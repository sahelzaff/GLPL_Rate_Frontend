'use client';
import React, { 
    Suspense, 
    useState, 
    useEffect, 
    useRef, 
    useCallback 
} from 'react';
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
    XMarkIcon,
    CubeIcon,
    BeakerIcon,
    Square3Stack3DIcon
} from "@heroicons/react/24/outline";
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Autocomplete from '../components/Autocomplete';
import { searchRates } from '@/services/api';
import assets from '../../../public/assets/asset';
import toast from 'react-hot-toast';
import RateFilters from '../components/RateFilters';
import { LuShip } from "react-icons/lu";

const getRateHighlights = (rates) => {
    if (!rates?.data?.data || !Array.isArray(rates.data.data) || rates.data.data.length === 0) return null;

    const getLowestRate = (container_rates) => {
        if (!Array.isArray(container_rates)) return Infinity;
        return Math.min(...container_rates.map(r => {
            // Handle both rate structures
            if (r.total) return r.total;
            if (r.rate) return r.rate;
            return Infinity;
        }));
    };

    let cheapest = rates.data.data[0];
    let fastest = rates.data.data[0];
    let recommended = rates.data.data[0];

    rates.data.data.forEach(rate => {
        if (rate && Array.isArray(rate.container_rates)) {
            const currentRate = getLowestRate(rate.container_rates);
            const cheapestRate = getLowestRate(cheapest.container_rates);
            
            if (currentRate < cheapestRate) {
                cheapest = rate;
            }
        }
    });

    recommended = cheapest;
    fastest = cheapest;

    return {
        recommended,
        cheapest,
        fastest
    };
};

const calculateRecommendationScore = (rate) => {
    if (!rate) return 0;
    
    const avgPrice = rate.containerRates.reduce((sum, r) => sum + r.rate, 0) / rate.containerRates.length;
    const transitTimeScore = rate.transitTime ? 100 - (rate.transitTime * 2) : 0; // Lower transit time is better
    const priceScore = 100 - (avgPrice / 100); // Lower price is better
    
    return transitTimeScore * 0.6 + priceScore * 0.4; // Weighted score
};

const RateHighlights = ({ highlights, onHighlightClick }) => {
    if (!highlights) return null;

    const getDisplayRate = (rate) => {
        if (!rate?.container_rates) return 0;
        const lowestRate = Math.min(...rate.container_rates.map(r => r.total || Infinity));
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
                <p className="text-sm text-gray-600">{highlights.recommended.shipping_line}</p>
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
                <p className="text-sm text-gray-600">{highlights.cheapest.shipping_line}</p>
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
                <p className="text-sm text-gray-600">{highlights.fastest.shipping_line}</p>
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
    // const name = shippingLineName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    // console.log('Shipping Line Name:', shippingLineName);
    // console.log('Processed Name:', name);

    if (name.includes('maersk')) {
        // console.log('Maersk logo path:', assets.maersk);
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
                                    key={note._id || index} 
                                    className="p-4 bg-gray-50 rounded-lg whitespace-pre-line"
                                >
                                    <p className="text-gray-700">{note.description}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Added: {new Date(note.created_at).toLocaleString()}
                                    </p>
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
    const [notes, setNotes] = useState([]);
    const [logoError, setLogoError] = useState(false);
    
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch(`https://glplratebackend-production.up.railway.app/api/rates/${rate._id}/notes`);
                const data = await response.json();
                if (data.status === 'success') {
                    setNotes(data.data);
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        if (rate._id) {
            fetchNotes();
        }
    }, [rate._id]);
    
    if (!rate) return null;

    // Ensure container_rates is mapped to handle both structures
    const containerRates = rate.container_rates?.map(cr => ({
        type: cr.type,
        total_cost: cr.total || cr.rate, // Handle both structures
        base_rate: cr.base_rate || cr.rate, // If no base_rate, use rate
        ewrs_laden: cr.ewrs_laden || 0,
        ewrs_empty: cr.ewrs_empty || 0,
        baf: cr.baf || 0,
        reefer_surcharge: cr.reefer_surcharge || 0
    })) || [];

    // Function to get shipping line logo
    const getShippingLineLogo = useCallback((shippingLine) => {
        try {
        const logos = {
            'Unifeeder': assets.unifeeder,
            'Evergreen': assets.evergreen,
            'COSCO': assets.cosco,
            'Hapag Lloyd': assets.hapag_lloyd,
            // Add more shipping lines as needed
        };
            return logos[shippingLine] || null;
        } catch (error) {
            console.error('Error getting shipping line logo:', error);
            return null;
        }
    }, []);

    const getContainerTypeIcon = (type) => {
        const cleanType = type.toString().toLowerCase();
        
        // Return appropriate icon based on container type
        if (cleanType.includes('rf') || cleanType.includes('reefer')) {
            return <BeakerIcon className="w-6 h-6 text-blue-500" />;
        }
        if (cleanType.includes('ot') || cleanType.includes('open') || cleanType.includes('hc')) {
            return <Square3Stack3DIcon className="w-6 h-6 text-orange-500" />;
        }
        return <CubeIcon className="w-6 h-6 text-gray-500" />;
    };

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
                        {!logoError && getShippingLineLogo(rate.shipping_line) ? (
                            <div className="h-10 w-24 relative">
                                <Image 
                                    src={getShippingLineLogo(rate.shipping_line)} 
                                    alt={rate.shipping_line}
                                    width={96}
                                    height={40}
                                    className="h-full w-full object-contain"
                                    onError={() => setLogoError(true)}
                                    priority
                                    loading="eager"
                                />
                            </div>
                        ) : (
                            <BuildingOffice2Icon className="h-8 w-8 text-gray-400" />
                        )}
                <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {rate.shipping_line}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Valid until {new Date(rate.valid_to).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
            </div>

            {/* Route Information */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div>
                            <p className="font-medium text-gray-900">{rate.pol}</p>
                            <p className="text-sm text-gray-500">Port of Loading</p>
                        </div>
                        <div className="flex items-center space-x-2 text-[#C6082C]">
                            <div className="w-2 h-2 rounded-full bg-current" />
                            <ArrowLongRightIcon className="w-8 h-5" />
                            <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{rate.pod}</p>
                            <p className="text-sm text-gray-500">Port of Discharge</p>
                        </div>
                    </div>
                </div>

                {/* Container Rates */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Container Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {containerRates.map((containerRate, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {getContainerTypeIcon(containerRate.type)}
                                        <span className="font-medium">{containerRate.type}</span>
                                    </div>
                                    <span className="text-lg font-bold text-[#C6082C]">
                                        ${(containerRate.total_cost || containerRate.base_rate).toLocaleString()}
                                    </span>
                                </div>
                                
                                {/* Only show breakdown if additional charges exist */}
                                {(containerRate.ewrs_laden || 
                                  containerRate.ewrs_empty || 
                                  containerRate.baf || 
                                  containerRate.reefer_surcharge) && (
                                    <div className="text-sm space-y-1 mt-2 pt-2 border-t">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Base Rate:</span>
                                            <span>${containerRate.base_rate.toLocaleString()}</span>
                                        </div>
                                        {containerRate.ewrs_laden > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">EWRS Laden:</span>
                                                <span>${containerRate.ewrs_laden.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {/* ... other charges ... */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Information */}
            <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <LuShip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 ml-2">Direct Service</span>
                </div>
                <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 ml-2">
                        {new Date(rate.valid_from).toLocaleDateString()} - {new Date(rate.valid_to).toLocaleDateString()}
                    </span>
                </div>
            </div>
                
                {notes.length > 0 && (
                    <button
                        onClick={() => setShowNotes(true)}
                        className="flex items-center space-x-1 text-[#C6082C] hover:text-[#a00624] text-sm"
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>View Notes</span>
                    </button>
                )}
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={showNotes}
                onClose={() => setShowNotes(false)}
                notes={notes}
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
            if (!pol || !pod) {
                setError('Both origin and destination ports are required');
                setResults([]);
                setFilteredResults([]);
                setHighlights(null);
                return;
            }

            setLoading(true);
            setError(null);

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

            const data = await response.json();

            if (data.status === 'success') {
                setResults(data);
                setFilteredResults(data.data.data);
                setHighlights(getRateHighlights(data));
                } else {
                setError(data.message || 'No rates found');
                setResults([]);
                setFilteredResults([]);
                setHighlights(null);
            }
        } catch (err) {
            console.error('Error fetching results:', err);
            setError('Failed to fetch results. Please try again.');
            setResults([]);
            setFilteredResults([]);
            setHighlights(null);
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
        // Remove any quotes and convert to lowercase for consistent comparison
        const cleanType = type.toString().replace(/['"]/g, '').toLowerCase();

        // Check for container size and type
        if (cleanType.includes('20')) {
            if (cleanType.includes('rf') || cleanType.includes('reefer')) {
                return assets.reefer_20;
            }
            if (cleanType.includes('ot') || cleanType.includes('open top')) {
                return assets.ot_20;
            }
            return assets.standard_20;
        }

        if (cleanType.includes('40')) {
            if (cleanType.includes('rf') || cleanType.includes('reefer')) {
                return assets.reefer_40;
            }
            if (cleanType.includes('ot') || cleanType.includes('open top')) {
                if (cleanType.includes('hc') || cleanType.includes('high cube')) {
                    return assets.ot_40hc;
                }
                return assets.ot_40;
            }
            return assets.standard_40;
        }

        if (cleanType.includes('45')) {
            if (cleanType.includes('rf') || cleanType.includes('reefer')) {
                return assets.reefer_45;
            }
            return assets.standard_45;
        }

        // Default to standard 20ft container if no match
        return assets.standard_20;
    };

    useEffect(() => {
        // Debug shipping line logos
        if (Array.isArray(results)) {
        results.forEach(result => {
            const logo = getShippingLineLogo(result.shippingLine);
            // console.log(`Shipping Line: ${result.shippingLine}, Logo Path: ${logo}`);
        });
        }
    }, [results]);

    // Add this function instead if you need to check image availability
    const validateImageUrl = async (url) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
        } catch (error) {
            console.error(`Failed to validate image URL: ${url}`, error);
            return false;
        }
    };

    // If you need to check logos, use this approach
    useEffect(() => {
        const checkLogos = async () => {
        const logos = {
                unifeeder: assets.unifeeder,
            evergreen: assets.evergreen,
                cosco: assets.cosco,
                hapag_lloyd: assets.hapag_lloyd,
                // Add other logos as needed
            };

            for (const [name, path] of Object.entries(logos)) {
                const isValid = await validateImageUrl(path);
                if (!isValid) {
                    console.warn(`⚠️ Logo not found: ${name} (${path})`);
                } else {
                    console.log(`✅ Logo verified: ${name}`);
                }
            }
        };

        checkLogos();
    }, []);

    useEffect(() => {
        if (Array.isArray(results?.data?.data) && results.data.data.length > 0) {
            setFilteredResults(results.data.data);
            const newHighlights = getRateHighlights(results);
            setHighlights(newHighlights);
        } else {
            setFilteredResults([]);
            setHighlights(null);
        }
    }, [results]);

    const handleFilterChange = (filters) => {
        if (!results?.data?.data) return;

        let filtered = [...results.data.data];

        // Filter by price range
        if (filters.priceRange.min) {
            filtered = filtered.filter(result => 
                result.container_rates.some(rate => 
                    (rate.total || rate.rate) >= Number(filters.priceRange.min)
                )
            );
        }
        if (filters.priceRange.max) {
            filtered = filtered.filter(result => 
                result.container_rates.some(rate => 
                    (rate.total || rate.rate) <= Number(filters.priceRange.max)
                )
            );
        }

        // Sort results
        switch (filters.sortBy) {
            case 'price_asc':
                filtered.sort((a, b) => {
                    const aMin = Math.min(...a.container_rates.map(r => r.total || r.rate || Infinity));
                    const bMin = Math.min(...b.container_rates.map(r => r.total || r.rate || Infinity));
                    return aMin - bMin;
                });
                break;
            case 'price_desc':
                filtered.sort((a, b) => {
                    const aMax = Math.max(...a.container_rates.map(r => r.total || r.rate || -Infinity));
                    const bMax = Math.max(...b.container_rates.map(r => r.total || r.rate || -Infinity));
                    return bMax - aMax;
                });
                break;
        }

        setFilteredResults(filtered);
    };

    const handleHighlightClick = (type) => {
        if (!highlights) return;
        
        const rate = highlights[type];
        if (!rate) return;

        // Scroll to the rate card
        const rateElement = document.getElementById(`rate-${rate._id}`);
        if (rateElement) {
            rateElement.scrollIntoView({ behavior: 'smooth' });
            // Add a highlight effect
            rateElement.classList.add('highlight-pulse');
            setTimeout(() => {
                rateElement.classList.remove('highlight-pulse');
            }, 2000);
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
                        {!loading && !error && filteredResults.length > 0 && (
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
                                        key={result._id}
                                        id={`rate-${result._id}`}
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
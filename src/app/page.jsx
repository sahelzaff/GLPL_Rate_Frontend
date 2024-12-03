'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, ClockIcon, ArrowLongRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import Autocomplete from "./components/Autocomplete";
import { Toaster, toast } from 'react-hot-toast';

const MAX_RECENT_SEARCHES = 4;

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pol, setPol] = useState('');
  const [pod, setPod] = useState('');
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from local storage on component mount
  useEffect(() => {
    if (session?.user?.email) {
      const userKey = `recentSearches_${session.user.email}`;
      const savedSearches = localStorage.getItem(userKey);
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } else {
      setRecentSearches([]); // Clear searches if user is not authenticated
    }
  }, [session]); // Re-run when session changes

  const saveSearch = (polCode, podCode, polName, podName) => {
    if (!session?.user?.email) return; // Don't save if user is not authenticated
    if (!polCode || !podCode || !polName || !podName) return; // Don't save incomplete searches

    const userKey = `recentSearches_${session.user.email}`;
    const newSearch = {
      id: Date.now(),
      pol: { code: polCode, name: polName },
      pod: { code: podCode, name: podName },
      timestamp: new Date().toISOString()
    };

    // Check if this exact search already exists
    const existingSearchIndex = recentSearches.findIndex(
      search => search.pol.code === polCode && search.pod.code === podCode
    );

    let updatedSearches;
    if (existingSearchIndex !== -1) {
      // Move existing search to top and update timestamp
      updatedSearches = [
        { ...recentSearches[existingSearchIndex], timestamp: newSearch.timestamp },
        ...recentSearches.slice(0, existingSearchIndex),
        ...recentSearches.slice(existingSearchIndex + 1)
      ];
    } else {
      // Add new search
      updatedSearches = [newSearch, ...recentSearches];
    }

    // Keep only the most recent searches
    updatedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem(userKey, JSON.stringify(updatedSearches));

    // TODO: Send to backend via Celery worker
    // This will be implemented later
  };

  const removeSearch = (e, searchId) => {
    e.stopPropagation();
    if (!session?.user?.email) return; // Don't remove if user is not authenticated

    const userKey = `recentSearches_${session.user.email}`;
    const updatedSearches = recentSearches.filter(search => search.id !== searchId);
    setRecentSearches(updatedSearches);
    localStorage.setItem(userKey, JSON.stringify(updatedSearches));
  };

  const handleRecentSearchClick = (search) => {
    if (!session) {
      toast('Please log in to view rates', {
        icon: 'ℹ️',
        duration: 4000,
      });
      router.push('/auth/login');
      return;
    }

    router.push(`/results?pol=${encodeURIComponent(search.pol.code)}&pod=${encodeURIComponent(search.pod.code)}`);
  };

  const handleSearch = () => {
    if (!pol || !pod) {
      setError('Please enter both POL and POD');
      return;
    }

    if (!session) {
      localStorage.setItem('searchParams', JSON.stringify({ pol, pod }));
      toast('Please log in to view rates', {
        icon: 'ℹ️',
        duration: 4000,
      });
      router.push('/auth/login');
      return;
    }

    // Get the full port names from the input fields
    const polInput = document.querySelector('input[placeholder="Enter POL"]');
    const podInput = document.querySelector('input[placeholder="Enter POD"]');
    
    if (polInput && podInput && polInput.value && podInput.value) {
      saveSearch(pol, pod, polInput.value, podInput.value);
    }

    router.push(`/results?pol=${encodeURIComponent(pol)}&pod=${encodeURIComponent(pod)}`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Background />
      <Navbar />
      <Toaster position="top-right" />
      <main className="min-h-screen flex flex-col items-center pt-32 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl space-y-8"
        >
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-center text-white font-montserrat mb-8"
          >
            Find Your Shipping Rate
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-xl"
          >
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Autocomplete
                value={pol}
                onChange={setPol}
                placeholder="Enter POL"
                label="Port of Loading (POL)"
              />
              
              <Autocomplete
                value={pod}
                onChange={setPod}
                placeholder="Enter POD"
                label="Port of Discharge (POD)"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="w-full bg-[#C6082C] hover:bg-[#a00624] text-gray-100 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 font-poppins shadow-md"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span>Search Rates</span>
            </motion.button>
          </motion.div>

          {/* Recent Searches Section */}
          {session?.user && recentSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 text-white">
                <ClockIcon className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Recent Searches</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentSearches.map((search) => (
                  <motion.div
                    key={search.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-lg rounded-lg p-4 shadow-md relative group cursor-pointer"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <button
                      onClick={(e) => removeSearch(e, search.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <span className="font-medium truncate">{search.pol.name}</span>
                          <ArrowLongRightIcon className="w-4 h-4 flex-shrink-0 text-[#C6082C]" />
                          <span className="font-medium truncate">{search.pod.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(search.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}

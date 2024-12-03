'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAutocomplete({ 
    value, 
    onChange, 
    placeholder, 
    label, 
    field = 'name',
    suggestions: externalSuggestions = null
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (inputValue) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/search-ports?term=${encodeURIComponent(inputValue)}&field=${field}`
            );
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    };

    const handleInputChange = async (e) => {
        const inputValue = e.target.value;
        onChange(inputValue);

        if (externalSuggestions) {
            const filtered = externalSuggestions.filter(item => 
                item.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filtered);
            setIsOpen(filtered.length > 0);
            return;
        }

        if (inputValue.length >= 2) {
            setLoading(true);
            const results = await fetchSuggestions(inputValue);
            setSuggestions(results);
            setIsOpen(true);
            setLoading(false);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleFocus = async () => {
        if (externalSuggestions) {
            setSuggestions(externalSuggestions);
            setIsOpen(true);
            return;
        }

        if (!value) {
            setLoading(true);
            const results = await fetchSuggestions('');
            setSuggestions(results);
            setIsOpen(true);
            setLoading(false);
        }
    };

    const handleSelect = (suggestion) => {
        onChange(typeof suggestion === 'object' ? suggestion[field] : suggestion);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                placeholder={placeholder}
            />
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={typeof suggestion === 'object' ? suggestion[field] : suggestion}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSelect(suggestion)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {typeof suggestion === 'object' ? (
                                        <>
                                            <div className="font-medium">{suggestion.name}</div>
                                            <div className="text-sm text-gray-500">{suggestion.region}</div>
                                        </>
                                    ) : (
                                        <div className="font-medium">{suggestion}</div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">No suggestions found</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 
'use client';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

export default function Autocomplete({ type, value, onChange, placeholder }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchTerm) => {
            if (!searchTerm || (typeof searchTerm === 'string' && searchTerm.trim().length < 2)) {
                setSuggestions([]);
                return;
            }

            try {
                setLoading(true);
                const response = await searchPorts(searchTerm);
                if (response.status === 'success') {
                    setSuggestions(response.data || []);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setError('Failed to fetch suggestions');
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        // Only search if we have a query
        if (query) {
            debouncedSearch(query);
        } else {
            setSuggestions([]);
        }
    }, [query, debouncedSearch]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value || '';
        setQuery(inputValue);
    };

    const handleSelect = (suggestion) => {
        setQuery(suggestion.port_name);
        onChange(suggestion);
        setSuggestions([]);
    };

    // Initialize input value from prop
    useEffect(() => {
        if (value) {
            setQuery(value);
        }
    }, [value]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query || ''}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
            />
            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-[#C6082C] border-t-transparent rounded-full"></div>
                </div>
            )}
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion._id}
                            onClick={() => handleSelect(suggestion)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {suggestion.port_name} ({suggestion.port_code})
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
} 
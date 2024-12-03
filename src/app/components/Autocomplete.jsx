'use client';
import { useState, useEffect } from 'react';

export default function Autocomplete({ value, onChange, placeholder, initialValue }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchInitialPort = async () => {
            if (initialValue) {
                try {
                    const response = await fetch(`http://localhost:5001/api/ports/search?term=${initialValue}`);
                    const data = await response.json();
                    if (data && data[0]) {
                        setInputValue(data[0].label);
                    }
                } catch (error) {
                    console.error('Error fetching initial port:', error);
                }
            }
        };

        fetchInitialPort();
    }, [initialValue]);

    const fetchSuggestions = async (searchTerm) => {
        try {
            const response = await fetch(`http://localhost:5001/api/ports/search?term=${searchTerm}`);
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value.length >= 2) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (port) => {
        setInputValue(port.label);
        onChange(port.code);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                    {suggestions.map((port, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect(port)}
                        >
                            {port.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 
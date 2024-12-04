import { getSession } from 'next-auth/react';

const API_URL = 'https://glplratebackend-production.up.railway.app/';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    try {
        // Get session token
        const session = await getSession();
        if (!session?.accessToken) {
            throw new Error('No authentication token available');
        }

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
            ...(options.headers || {})
        };

        // Make request
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Parse response
        const data = await response.json();

        // Handle error responses
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const getUsers = async () => {
    return await apiCall('/api/users');
};

export const getDashboardStats = async () => {
    return await apiCall('/api/dashboard/stats');
};

export const addUser = async (userData) => {
    return await apiCall('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const updateUser = async (userId, userData) => {
    return await apiCall(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
};

export const deleteUser = async (userId) => {
    return await apiCall(`/api/users/${userId}`, {
        method: 'DELETE'
    });
};

export const searchRates = async (pol, pod) => {
    try {
        const response = await fetch(`${API_URL}/api/rates/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pol_code: pol, pod_code: pod }),
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error searching rates:', error);
        throw error;
    }
};

export const searchPorts = async (term) => {
    try {
        const response = await fetch(`${API_URL}/api/ports/search?term=${encodeURIComponent(term)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching ports:', error);
        throw error;
    }
};

export const addBulkRates = async (ratesData) => {
    try {
        const response = await fetch(`${API_URL}/api/rates/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ratesData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add rates');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding bulk rates:', error);
        throw error;
    }
}; 
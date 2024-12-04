'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ConnectionCheck() {
    const [isConnected, setIsConnected] = useState(true);

    const checkConnection = async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/test');
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                setIsConnected(true);
                return true;
            } else {
                setIsConnected(false);
                return false;
            }
        } catch (error) {
            setIsConnected(false);
            return false;
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const isConnected = await checkConnection();
            if (!isConnected) {
                toast.error('Lost connection to server', {
                    id: 'connection-error',
                    duration: 3000
                });
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {!isConnected && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
                >
                    Connection lost. Trying to reconnect...
                </motion.div>
            )}
        </AnimatePresence>
    );
} 
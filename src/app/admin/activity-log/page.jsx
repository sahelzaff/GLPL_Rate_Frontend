'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ActivityIcon } from '../page';

export default function ActivityLogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchActivities = useCallback(async () => {
        if (!session?.accessToken) return;
        
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/dashboard/historical-activity?limit=100', {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
                setLastUpdate(new Date());
            } else {
                console.error('Failed to fetch activities:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to load activity log');
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }
        if (session?.user?.role !== 'admin') {
            router.push('/');
            toast.error('Admin access required');
            return;
        }

        const fetchAndSetActivities = async () => {
            await fetchActivities();
        };

        fetchAndSetActivities();
        
        const pollInterval = setInterval(fetchActivities, 10000);
        const updateInterval = setInterval(() => {
            setLastUpdate(new Date());
        }, 1000);
        
        return () => {
            clearInterval(pollInterval);
            clearInterval(updateInterval);
        };
    }, [session, status, router, fetchActivities]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = lastUpdate;
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const weeks = Math.floor(diffInSeconds / 604800);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Activity Log</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 space-y-6">
                    {activities && activities.length > 0 ? (
                        activities.map((activity) => (
                            <motion.div
                                key={activity._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between py-4 border-b last:border-b-0"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{activity.description}</p>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span>{formatTimestamp(activity.timestamp)}</span>
                                            <span>•</span>
                                            <span>by {activity.user?.name || 'System'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No activities found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
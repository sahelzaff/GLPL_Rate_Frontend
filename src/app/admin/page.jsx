'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    UsersIcon,
    GlobeAsiaAustraliaIcon,
    BuildingOffice2Icon,
    TruckIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon,
    UserPlusIcon,
    UserMinusIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-md"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                {trend && (
                    <div className="flex items-center mt-2">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-500">{trend}% this month</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </motion.div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
    </div>
);

export const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'user_created':
            return <UserPlusIcon className="w-5 h-5 text-green-500" />;
        case 'user_deleted':
            return <UserMinusIcon className="w-5 h-5 text-red-500" />;
        case 'user_updated':
            return <PencilIcon className="w-5 h-5 text-blue-500" />;
        case 'port_created':
        case 'rate_created':
            return <PlusIcon className="w-5 h-5 text-green-500" />;
        case 'port_deleted':
        case 'rate_deleted':
            return <TrashIcon className="w-5 h-5 text-red-500" />;
        case 'port_updated':
        case 'rate_updated':
            return <PencilIcon className="w-5 h-5 text-blue-500" />;
        default:
            return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
};

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPorts: 0,
        totalShippingLines: 0,
        totalRates: 0
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchActivities = useCallback(async () => {
        if (!session?.accessToken) return;
        
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app//api/dashboard/recent-activity', {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to load activity log');
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

        const fetchData = async () => {
            if (!session?.accessToken) return;
            
            try {
                setLoading(true);
                
                // Fetch stats
                const statsResponse = await fetch('https://glplratebackend-production.up.railway.app//api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                });

                if (!statsResponse.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const statsData = await statsResponse.json();
                setStats(statsData);
                
                // Initial activities fetch
                await fetchActivities();
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Set up polling for activities - every 5 seconds
        const pollInterval = setInterval(fetchActivities, 5000);
        
        // Set up interval for updating relative timestamps
        const updateInterval = setInterval(() => {
            setLastUpdate(new Date());
        }, 1000);
        
        return () => {
            clearInterval(pollInterval);
            clearInterval(updateInterval);
        };
    }, [session, status, router, fetchActivities]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = lastUpdate; // Use lastUpdate instead of new Date()
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) { // Less than a week
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) { // Less than a month
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={UsersIcon}
                    trend={12}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Ports"
                    value={stats.totalPorts}
                    icon={GlobeAsiaAustraliaIcon}
                    trend={8}
                    color="bg-green-500"
                />
                <StatCard
                    title="Shipping Lines"
                    value={stats.totalShippingLines}
                    icon={BuildingOffice2Icon}
                    trend={15}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Rates"
                    value={stats.totalRates}
                    icon={TruckIcon}
                    trend={20}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Rate Trends">
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <ChartBarIcon className="w-12 h-12" />
                        <span className="ml-2">Chart will be implemented here</span>
                    </div>
                </ChartCard>
                <ChartCard title="Popular Routes">
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <ChartBarIcon className="w-12 h-12" />
                        <span className="ml-2">Chart will be implemented here</span>
                    </div>
                </ChartCard>
            </div>

            {/* Recent Activity */}
            <ChartCard title={
                <div className="flex justify-between items-center">
                    <span>Recent Activity</span>
                    <Link 
                        href="/admin/activity-log"
                        className="text-sm text-[#C6082C] hover:text-[#a00624] font-medium"
                    >
                        View All
                    </Link>
                </div>
            }>
                <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center space-x-3">
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
                        </div>
                    ))}
                    
                    {activities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No recent activities
                        </div>
                    )}

                    {activities.length > 5 && (
                        <Link 
                            href="/admin/activity-log"
                            className="block text-center py-3 text-[#C6082C] hover:text-[#a00624] font-medium border-t"
                        >
                            View {activities.length - 5} more activities
                        </Link>
                    )}
                </div>
            </ChartCard>
        </div>
    );
} 
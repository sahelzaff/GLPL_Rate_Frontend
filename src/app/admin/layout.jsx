'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { 
    ChartBarIcon,
    UsersIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowLeftOnRectangleIcon,
    GlobeAsiaAustraliaIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    HomeIcon,
    ArrowUpTrayIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const timeoutRef = useRef(null);

    // Function to start the auto-collapse timer
    const startAutoCollapseTimer = () => {
        // Clear any existing timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Set new timer
        timeoutRef.current = setTimeout(() => {
            setIsSidebarOpen(false);
        }, 5000);
    };

    // Initialize timer on mount and reset on unmount
    useEffect(() => {
        startAutoCollapseTimer();

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // Reset timer when sidebar state changes
    useEffect(() => {
        if (isSidebarOpen) {
            startAutoCollapseTimer();
        }
    }, [isSidebarOpen]);

    // Handle manual toggle
    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        { path: '/admin', icon: ChartBarIcon, label: 'Dashboard' },
        { path: '/admin/users', icon: UsersIcon, label: 'Users' },
        { path: '/admin/ports', icon: GlobeAsiaAustraliaIcon, label: 'Ports' },
        { path: '/admin/shipping-lines', icon: BuildingOffice2Icon, label: 'Shipping Lines' },
        { path: '/admin/rates', icon: CurrencyDollarIcon, label: 'Rates' },
        { path: '/admin/bulk-upload', icon: ArrowUpTrayIcon, label: 'Bulk Upload' },
        { path: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex pt-16">
                {/* Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ 
                        width: isSidebarOpen ? 256 : 80,
                        transition: { duration: 0.3 }
                    }}
                    className="fixed left-0 h-[calc(100vh-4rem)] bg-white shadow-lg z-10"
                >
                    <div className="flex flex-col h-full">
                        {/* Menu Items */}
                        <div 
                            className="flex-1 py-6 overflow-y-auto"
                            style={{
                                msOverflowStyle: 'none',  // IE and Edge
                                scrollbarWidth: 'none',    // Firefox
                                '::-webkit-scrollbar': {   // Chrome, Safari, Opera
                                    display: 'none'
                                }
                            }}
                        >
                            <div className="px-4 mb-6">
                                <Link
                                    href="/"
                                    className={`flex items-center ${
                                        isSidebarOpen ? 'space-x-2' : 'justify-center'
                                    } text-gray-600 hover:text-gray-900`}
                                >
                                    <div className="flex items-center justify-center w-6">
                                        <HomeIcon className="w-5 h-5" />
                                    </div>
                                    {isSidebarOpen && <span>Back to Home</span>}
                                </Link>
                            </div>
                            <nav className="space-y-1 px-3">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            className={`flex items-center ${
                                                isSidebarOpen ? 'px-3' : 'px-0 justify-center'
                                            } py-2 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-[#C6082C] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center w-6">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            {isSidebarOpen && (
                                                <span className="ml-3">{item.label}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Toggle Button */}
                        <div className="p-4 border-t">
                            <button
                                onClick={handleSidebarToggle}
                                className={`w-full flex items-center ${
                                    isSidebarOpen ? 'justify-between px-3' : 'justify-center'
                                } py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg`}
                            >
                                {isSidebarOpen && <span>Collapse Menu</span>}
                                <div className="flex items-center justify-center w-6">
                                    {isSidebarOpen ? (
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    ) : (
                                        <ChevronRightIcon className="w-5 h-5" />
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* User Section */}
                        {session && (
                            <div className="p-4 border-t">
                                <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0">
                                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        {isSidebarOpen && (
                                            <div className="ml-3 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {session.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {session.user.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {isSidebarOpen && (
                                        <button
                                            onClick={() => signOut()}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.main
                    initial={{ marginLeft: isSidebarOpen ? 256 : 80 }}
                    animate={{ marginLeft: isSidebarOpen ? 256 : 80 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 p-8"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
} 
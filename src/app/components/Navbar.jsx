'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import assets from '../../../public/assets/asset';

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 bg-[#C6082C] shadow-lg h-16">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src={assets.GLPL_Logo_White}
                                alt="GLPL Logo"
                                width={48}
                                height={48}
                                priority
                            />
                            <span className="text-white font-bold text-xl">GLPL Rate Card</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 text-white hover:text-gray-200"
                                >
                                    <UserCircleIcon className="h-6 w-6" />
                                    <span>{session.user.name}</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                        {session.user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => signOut()}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center space-x-1 bg-white text-[#C6082C] hover:bg-gray-100 px-4 py-2 rounded-md transition-colors font-medium"
                            >
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 
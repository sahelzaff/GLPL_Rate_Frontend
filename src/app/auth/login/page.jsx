'use client';
import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import assets from '../../../../public/assets/asset';
import { 
    EnvelopeIcon, 
    LockClosedIcon,
    ArrowRightIcon 
} from '@heroicons/react/24/outline';

function LoginContent() {
    const router = useRouter();
    const { data: _session, status } = useSession();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Login successful!');
                router.replace(callbackUrl);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster position="top-right" />
            
            <div className="relative w-full max-w-md">
                {/* Background Decorations */}
                <div className="absolute inset-0 -z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1 }}
                        className="absolute top-0 -left-4 w-72 h-72 bg-[#C6082C] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute top-0 -right-4 w-72 h-72 bg-[#ff4444] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="absolute -bottom-8 left-20 w-72 h-72 bg-[#ff8866] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
                    />
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 m-4"
                >
                    <div className="mb-8 text-center">
                        <motion.img
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            src={assets.GLPL_Logo}
                            alt="GLPL Logo"
                            className="h-20 mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-600 mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C6082C] focus:border-[#C6082C] sm:text-sm"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C6082C] focus:border-[#C6082C] sm:text-sm"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#C6082C] hover:bg-[#a00624] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C6082C] transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Additional Links */}
                    <div className="mt-6 text-center text-sm">
                        <a href="#" className="text-[#C6082C] hover:text-[#a00624]">
                            Forgot your password?
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
} 
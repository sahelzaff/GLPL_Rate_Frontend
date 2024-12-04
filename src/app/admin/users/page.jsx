'use client';
import { motion } from 'framer-motion';
import UserManager from '../../components/admin/UserManager';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-8"
            >
                User Management
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <UserManager />
            </motion.div>
        </div>
    );
} 
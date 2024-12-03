'use client';
import { motion } from 'framer-motion';
import UserManager from '../../components/admin/UserManager';

export default function UsersPage() {
    return (
        <>
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
        </>
    );
} 
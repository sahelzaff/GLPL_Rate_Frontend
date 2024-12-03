'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getUsers, addUser, updateUser, deleteUser } from '@/services/api';
import StepModal from './StepModal';
import { Toaster, toast } from 'react-hot-toast';

const UserDetailsModal = ({ user, isOpen, onClose, onUpdate }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [editedUser, setEditedUser] = useState({
        ...user,
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const updateData = {
                ...editedUser,
                ...(passwordChanged && editedUser.password ? { password: editedUser.password } : {})
            };
            
            await onUpdate(user._id, updateData);
            toast.success('User updated successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordChanged(true);
        setEditedUser({ ...editedUser, password: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
            >
                <h2 className="text-2xl font-semibold mb-6">Edit User</h2>

                <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={editedUser.name}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={editedUser.email}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password {!passwordChanged && <span className="text-gray-500">(leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={editedUser.password}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Company Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            value={editedUser.company}
                            onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6082C] focus:border-transparent"
                        />
                    </div>

                    {/* Role Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div 
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => setEditedUser({ 
                                ...editedUser, 
                                role: editedUser.role === 'admin' ? 'user' : 'admin' 
                            })}
                        >
                            <div className="flex items-center space-x-2">
                                {editedUser.role === 'admin' ? (
                                    <ShieldCheckIcon className="h-5 w-5 text-[#C6082C]" />
                                ) : (
                                    <UserIcon className="h-5 w-5 text-gray-600" />
                                )}
                                <span className="font-medium">
                                    {editedUser.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                                editedUser.role === 'admin' ? 'bg-[#C6082C]' : 'bg-gray-300'
                            }`}>
                                <motion.div 
                                    className="w-4 h-4 bg-white rounded-full"
                                    animate={{ 
                                        x: editedUser.role === 'admin' ? 24 : 0 
                                    }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624] disabled:opacity-50 flex items-center space-x-2"
                    >
                        {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>Save Changes</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getUsers();
            console.log('Fetched users:', data); // Debug log
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Error loading users');
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (userData) => {
        try {
            await addUser(userData);
            await fetchUsers();
            setIsAddingUser(false);
            toast.success('User added successfully');
            return true;
        } catch (error) {
            toast.error(error.message || 'Failed to add user');
            return false;
        }
    };

    const handleUpdateUser = async (userId, updatedData) => {
        try {
            // Remove empty password if not changed
            if (updatedData.password === '') {
                delete updatedData.password;
            }

            // Clean undefined values
            const cleanedData = Object.fromEntries(
                Object.entries(updatedData).filter(([_, v]) => v !== undefined)
            );

            await updateUser(userId, cleanedData);
            await fetchUsers();
            setEditingUser(null);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await deleteUser(userId);
            await fetchUsers();
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6082C]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624]"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
                    <button
                        onClick={() => setIsAddingUser(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624] transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add User</span>
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No users found. Click "Add User" to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.company}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {editingUser && (
                    <UserDetailsModal
                        user={editingUser}
                        isOpen={!!editingUser}
                        onClose={() => setEditingUser(null)}
                        onUpdate={handleUpdateUser}
                    />
                )}
            </AnimatePresence>

            {/* Add User Modal */}
            <StepModal
                isOpen={isAddingUser}
                onClose={() => setIsAddingUser(false)}
                onSubmit={handleAddUser}
            />
        </div>
    );
} 
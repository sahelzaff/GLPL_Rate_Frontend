'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function BulkUploadTab({ type }) {
    const { data: session } = useSession();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [loading, setLoading] = useState(false);

    const downloadTemplate = async () => {
        if (downloading) return;
        
        setDownloading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/templates/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error('Failed to download template');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create and trigger download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${type}_template.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Template downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download template. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.xlsx')) {
            toast.error('Please upload an Excel (.xlsx) file');
            return;
        }

        setFile(file);
        setLoading(true);

        // Preview the data
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`http://localhost:5001/api/${type}/preview`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to preview data');
            }

            const data = await response.json();
            setPreview(data);
            toast.success(`Loaded ${data.total_records} records for preview`);
        } catch (error) {
            console.error('Preview error:', error);
            toast.error(error.message || 'Failed to preview file');
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/${type}/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            
            // Show detailed success message
            if (type === 'ports') {
                toast.success(
                    `Successfully added ${result.inserted} new ports to database${result.errors ? ` (${result.errors.length} errors)` : ''}`
                );
            } else {
                toast.success(`Successfully uploaded ${result.count} records`);
            }

            // Clear the form
            setFile(null);
            setPreview(null);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePreviewRow = (indexToDelete) => {
        setPreview(prev => ({
            ...prev,
            data: prev.data.filter((_, index) => index !== indexToDelete),
            total_records: prev.total_records - 1
        }));
        toast.success('Entry removed from preview');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button
                    onClick={downloadTemplate}
                    disabled={downloading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {downloading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Downloading...</span>
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Download Template</span>
                        </>
                    )}
                </button>

                <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload Excel</span>
                    <input
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6082C]"></div>
                </div>
            )}

            {preview && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            Preview ({preview.total_records} records)
                        </h3>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || preview.total_records === 0}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#C6082C] text-white rounded-lg hover:bg-[#a00624] disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <span>Upload to Database</span>
                            )}
                        </button>
                    </div>

                    <div className="max-h-96 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {preview.columns.map((column) => (
                                        <th
                                            key={column}
                                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column.replace('_', ' ')}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {preview.data.map((row, idx) => (
                                    <tr key={idx} className={`hover:bg-gray-50 ${
                                        row.status === 'Update' ? 'bg-yellow-50' : ''
                                    }`}>
                                        {preview.columns.map((column) => (
                                            <td
                                                key={column}
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                            >
                                                {column === 'status' ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        row.status === 'New' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                ) : column === 'rate' && row.status === 'Update' ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="line-through text-red-500">{row.current_rate}</span>
                                                        <span className="text-green-500">{row.rate}</span>
                                                    </div>
                                                ) : (
                                                    row[column] || '-'
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <button
                                                onClick={() => handleDeletePreviewRow(idx)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Remove from preview"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {preview.total_records === 0 && (
                        <div className="text-center text-gray-500 py-4">
                            No new entries to upload
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
} 
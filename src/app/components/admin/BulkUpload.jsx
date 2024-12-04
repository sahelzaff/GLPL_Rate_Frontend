'use client';
import { useState } from 'react';
import { CloudArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function BulkUpload() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const downloadTemplate = async () => {
        try {
            const response = await fetch('https://glplratebackend-production.up.railway.app/api/template/download');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rate_card_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download template');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setMessage('');
            setError('');

            const response = await fetch('https://glplratebackend-production.up.railway.app/api/rates/bulk', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`Successfully uploaded: ${data.count} rates`);
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Download Template</span>
                </button>

                <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Excel'}</span>
                    <input
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {message && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                    {message}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
} 
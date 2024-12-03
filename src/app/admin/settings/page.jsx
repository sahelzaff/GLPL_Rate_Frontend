'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { 
    Cog6ToothIcon, 
    UserIcon, 
    BellIcon, 
    ShieldCheckIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    ServerIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    
    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        appName: 'GLPL Rate',
        defaultCurrency: 'USD',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Asia/Kolkata',
        language: 'en'
    });

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPassword: '',
        senderName: '',
        senderEmail: ''
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        rateUpdates: true,
        newUserRegistrations: true,
        systemAlerts: true,
        dailyReports: false
    });

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        requireMFA: false,
        passwordExpiry: 90,
        minPasswordLength: 8,
        sessionTimeout: 30,
        maxLoginAttempts: 5
    });

    // Theme Settings
    const [themeSettings, setThemeSettings] = useState({
        primaryColor: '#C6082C',
        darkMode: false,
        sidebarCollapsed: false,
        compactMode: false
    });

    // API Settings
    const [apiSettings, setApiSettings] = useState({
        apiKey: '',
        rateLimit: 100,
        timeout: 30,
        enableCache: true,
        cacheExpiry: 3600
    });

    // Backup Settings
    const [backupSettings, setBackupSettings] = useState({
        autoBackup: true,
        backupFrequency: 'daily',
        retentionPeriod: 30,
        includeAttachments: true
    });

    const handleSave = async (section) => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`${section} settings saved successfully`);
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        {
            name: 'General',
            icon: Cog6ToothIcon,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">Application Name</label>
                            <input
                                type="text"
                                value={generalSettings.appName}
                                onChange={(e) => setGeneralSettings({...generalSettings, appName: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C6082C] focus:ring-[#C6082C]"
                            />
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                            <select
                                value={generalSettings.defaultCurrency}
                                onChange={(e) => setGeneralSettings({...generalSettings, defaultCurrency: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C6082C] focus:ring-[#C6082C]"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date Format</label>
                            <select
                                value={generalSettings.dateFormat}
                                onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C6082C] focus:ring-[#C6082C]"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                            <select
                                value={generalSettings.timeZone}
                                onChange={(e) => setGeneralSettings({...generalSettings, timeZone: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C6082C] focus:ring-[#C6082C]"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleSave('General')}
                            disabled={saving}
                            className="bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )
        },
        {
            name: 'Email',
            icon: GlobeAltIcon,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                            <input
                                type="text"
                                value={emailSettings.smtpHost}
                                onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C6082C] focus:ring-[#C6082C]"
                            />
                        </div>
                        {/* Add other email settings fields */}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleSave('Email')}
                            disabled={saving}
                            className="bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )
        },
        {
            name: 'Notifications',
            icon: BellIcon,
            content: (
                <div className="space-y-6">
                    <div className="space-y-4">
                        {Object.entries(notificationSettings).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {key.split(/(?=[A-Z])/).join(' ')}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setNotificationSettings({
                                            ...notificationSettings,
                                            [key]: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C6082C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6082C]"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleSave('Notifications')}
                            disabled={saving}
                            className="bg-[#C6082C] text-white px-4 py-2 rounded-lg hover:bg-[#a00624] disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )
        },
        {
            name: 'Security',
            icon: ShieldCheckIcon,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add security settings fields */}
                    </div>
                </div>
            )
        },
        {
            name: 'Theme',
            icon: PaintBrushIcon,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add theme settings fields */}
                    </div>
                </div>
            )
        },
        {
            name: 'API',
            icon: ServerIcon,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add API settings fields */}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-8"
            >
                Settings
            </motion.h1>

            <div className="bg-white rounded-lg shadow-lg">
                <Tab.Group>
                    <div className="border-b border-gray-200">
                        <Tab.List className="flex space-x-8 p-4">
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.name}
                                    className={({ selected }) =>
                                        classNames(
                                            'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm',
                                            selected
                                                ? 'border-[#C6082C] text-[#C6082C]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        )
                                    }
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span>{tab.name}</span>
                                </Tab>
                            ))}
                        </Tab.List>
                    </div>
                    <Tab.Panels className="p-6">
                        {tabs.map((tab) => (
                            <Tab.Panel
                                key={tab.name}
                                className={classNames(
                                    'rounded-xl focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[#C6082C] ring-white ring-opacity-60'
                                )}
                            >
                                {tab.content}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
} 
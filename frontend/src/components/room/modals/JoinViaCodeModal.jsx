'use client';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Hash, X } from 'lucide-react';
import { useState } from 'react';

export default function JoinViaCodeModal({
    isOpen,
    onClose,
    onJoin,
    isLoading
}) {
    const [teamCode, setTeamCode] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [error, setError] = useState('');

    // 5-6 DSA-themed roles
    const roles = [
        { value: 'Algorithm Master', label: 'Algorithm Master', color: 'text-blue-700' },
        { value: 'Data Wizard', label: 'Data Wizard', color: 'text-purple-700' },
        { value: 'Code Ninja', label: 'Code Ninja', color: 'text-emerald-700' },
        { value: 'Debug Specialist', label: 'Debug Specialist', color: 'text-orange-700' },
        { value: 'Performance Optimizer', label: 'Performance Optimizer', color: 'text-pink-700' },
        { value: 'System Architect', label: 'System Architect', color: 'text-indigo-700' },
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamCode.trim()) {
            setError('Team code is required');
            return;
        }

        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        try {
            await onJoin({ teamCode: teamCode.trim(), role: selectedRole });
            // Reset form
            setTeamCode('');
            setSelectedRole('');
            setError('');
        } catch (err) {
            console.error('Join via code error:', err);
        }
    };

    const handleClose = () => {
        setTeamCode('');
        setSelectedRole('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Join via Code</h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Info Card */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                                Join with Code
                            </p>
                        </div>
                        <p className="text-sm text-gray-700">
                            Enter the team code provided by the team leader to join
                        </p>
                    </div>

                    {/* Team Code Input */}
                    <div className="mb-5">
                        <Input
                            label="Team Code"
                            placeholder="Enter team code"
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                            required
                            disabled={isLoading}
                            helperText="Get this code from the team leader"
                            className="font-mono"
                            maxLength={10}
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setSelectedRole(role.value)}
                                    disabled={isLoading}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${selectedRole === role.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        } disabled:opacity-50`}
                                >
                                    <span className={`text-sm font-semibold ${selectedRole === role.value ? 'text-blue-700' : role.color
                                        }`}>
                                        {role.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Select your preferred role for this challenge
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            Join Team
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

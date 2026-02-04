'use client';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Users, X } from 'lucide-react';
import { useState } from 'react';

const ROLES = [
    { id: 'architect', label: 'Architect', icon: '📐' },
    { id: 'builder', label: 'Builder', icon: '🛠️' },
    { id: 'debugger', label: 'Debugger', icon: '🐛' },
    { id: 'optimiser', label: 'Optimiser', icon: '⚡' },
];

export default function CreateTeamModal({
    isOpen,
    onClose,
    onCreate,
    isLoading
}) {
    const [teamName, setTeamName] = useState('');
    const [selectedRole, setSelectedRole] = useState('architect');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamName.trim()) {
            setError('Team name is required');
            return;
        }

        try {
            await onCreate({
                teamName: teamName.trim(),
                role: selectedRole
            });
            // Reset form
            setTeamName('');
            setSelectedRole('architect');
            setError('');
        } catch (err) {
            console.error('Create team error:', err);
        }
    };

    const handleClose = () => {
        setTeamName('');
        setSelectedRole('architect');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Create Team</h2>
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
                    {/* Info Card - Original Emerald Style */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                                New Team
                            </p>
                        </div>
                        <p className="text-sm text-gray-700">
                            Create your team and choose your role. Each role in the team must be unique!
                        </p>
                    </div>

                    {/* Team Name Input */}
                    <div className="mb-5">
                        <Input
                            label="Team Name"
                            placeholder="Enter your team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            disabled={isLoading}
                            helperText="Choose a unique and memorable name"
                            maxLength={30}
                        />
                    </div>

                    {/* Role Selection - Simplified UI to match existing design */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Role in Team
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${selectedRole === role.id
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{role.icon}</span>
                                    <span className="text-xs font-bold">{role.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Actions - Restoring original button classes */}
                    <div className="flex gap-3 mt-4">
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
                            Create Team
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

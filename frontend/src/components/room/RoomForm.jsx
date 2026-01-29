'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import NumberInput from '@/components/common/NumberInput';
import Toggle from '@/components/common/Toggle';
import { Copy, Check, Globe } from 'lucide-react';
import RadioButtonCard from '../common/RadioCard';

const RoomForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    roomName: 'Weekly DSA Team Battle',
    mode: 'team',
    maxTeamSize: 3,
    duration: '60',
    scoringMode: 'points',
    difficulty: {
      easy: 1,
      medium: 1,
      hard: 0,
    },
    privacy: 'private',
    roomCode: '',
    leaderApprovalRequired: true,
    allowSolosInTeamMode: false,
  });

  const [copiedCode, setCopiedCode] = useState(false);

  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Generate room code only on client to avoid hydration mismatch
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      roomCode: generateRoomCode(),
    }));
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map difficulty to problemConfig for backend
    const submissionData = {
      ...formData,
      problemConfig: formData.difficulty
    };
    onSubmit(submissionData);
    // onSubmit(formData);
  };

  const durationOptions = [
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '60 Minutes' },
    { value: '90', label: '90 Minutes' },
    { value: '120', label: '120 Minutes' },
  ];

  const scoringOptions = [
    { value: 'time', label: 'Time Based (ICPC)' },
    { value: 'points', label: 'Points Based' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Info */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Identity</h3>
          <span className="text-xs text-gray-400 font-medium">Step 1 of 3</span>
        </div>

        <Input
          label="Room Name"
          value={formData.roomName}
          onChange={(e) =>
            setFormData({ ...formData, roomName: e.target.value })
          }
          placeholder="Enter room name"
          helperText="This will be the public name of your contest lobby."
        />
      </div>

      <div className="h-px bg-gray-100 w-full"></div>

      {/* Section 2: Contest Mode */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Contest Mode</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Solo Mode */}
          <RadioButtonCard
            name="mode"
            value="solo"
            direction='vertical'
            checked={formData.mode === 'solo'}
            onChange={(value) =>
              setFormData({ ...formData, mode: value })
            }
            title="Solo Mode"
            description="Every coder for themselves. Standard ranked rules apply."
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 stroke-[1.5]">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>}
          />

          {/* Team Mode */}
          <RadioButtonCard
            name="mode"
            value="team"
            direction='vertical'
            checked={formData.mode === 'team'}
            onChange={(value) =>
              setFormData({ ...formData, mode: value })
            }
            title="Team Mode"
            description="Every coder for themselves. Standard ranked rules apply."
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-5 h-5 stroke-[1.5]">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>}
          />


        </div>

        {/* Team Settings */}
        {formData.mode === 'team' && (
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/60 flex items-center justify-between transition-all">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus w-4 h-4 text-gray-400 stroke-[1.5]">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              Max Team Size
            </label>
            <div className="flex items-center gap-3">
              <NumberInput
                min={1}
                max={10}
                value={formData.maxTeamSize}
                onChange={(value) =>
                  setFormData({ ...formData, maxTeamSize: value })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 w-full"></div>

      {/* Section 3: Rules & Difficulty */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Rules Configuration</h3>

        <div className="grid grid-cols-2 gap-6">
          <Select
            label="Duration"
            options={durationOptions}
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
          />

          <Select
            label="Scoring Mode"
            options={scoringOptions}
            value={formData.scoringMode}
            onChange={(e) =>
              setFormData({ ...formData, scoringMode: e.target.value })
            }
          />
        </div>

        {/* Difficulty Mix */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Problem Difficulty Mix</label>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard >= 5
              ? 'text-amber-600 bg-amber-50 border-amber-100'
              : 'text-blue-600 bg-blue-50 border-blue-100'
              }`}>
              {formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard} / 5 Problems
            </span>
          </div>

          <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
            {/* Easy */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Easy</span>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        easy: Math.max(0, formData.difficulty.easy - 1),
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-gray-900">{formData.difficulty.easy}</span>
                <button
                  type="button"
                  disabled={formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard >= 5}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        easy: formData.difficulty.easy + 1,
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-200"></div>

            {/* Medium */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Medium</span>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        medium: Math.max(0, formData.difficulty.medium - 1),
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-gray-900">{formData.difficulty.medium}</span>
                <button
                  type="button"
                  disabled={formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard >= 5}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        medium: formData.difficulty.medium + 1,
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-200"></div>

            {/* Hard */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Hard</span>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        hard: Math.max(0, formData.difficulty.hard - 1),
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-gray-900">{formData.difficulty.hard}</span>
                <button
                  type="button"
                  disabled={formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard >= 5}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: {
                        ...formData.difficulty,
                        hard: formData.difficulty.hard + 1,
                      },
                    })
                  }
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full"></div>

      {/* Section 4: Access Control */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Access Control</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Public */}
          <RadioButtonCard
            name="privacy"
            value="public"
            checked={formData.privacy === 'public'}
            onChange={(value) =>
              setFormData({ ...formData, privacy: value })
            }
            title="Public"
            description="Anyone can search and join."
            icon={<Globe className="w-4 h-4" />}
          />

          {/* Private */}
          <RadioButtonCard
            name="privacy"
            value="private"
            checked={formData.privacy === 'private'}
            onChange={(value) =>
              setFormData({ ...formData, privacy: value })
            }
            title="Private"
            description="Only people with link can join."
            icon={<Globe className="w-4 h-4" />}
          />
        </div>

        {/* Room Code Display (for Private rooms) */}
        {formData.privacy === 'private' && (
          <div className="bg-gray-50/50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Room Code</label>
              <span className="text-xs font-medium text-blue-600">Share with team members</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-xl font-mono font-bold text-lg text-gray-900 tracking-wider">
                {formData.roomCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                {copiedCode ? (
                  <>
                    <Check size={16} className="text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Toggle Options */}
        <div className="space-y-4 pt-2">
          <Toggle
            label="Leader Approval Required"
            description="Team leader must accept requests to join."
            checked={formData.leaderApprovalRequired}
            onChange={(checked) =>
              setFormData({ ...formData, leaderApprovalRequired: checked })
            }
          />

          <Toggle
            label="Allow Solos in Team Mode"
            description="Allow 1-person teams to compete."
            checked={formData.allowSolosInTeamMode}
            onChange={(checked) =>
              setFormData({ ...formData, allowSolosInTeamMode: checked })
            }
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4">

        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className='w-full'
        >
          Create Room
        </Button>
      </div>
    </form>
  );
};

export default RoomForm;

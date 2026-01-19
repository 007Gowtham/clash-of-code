'use client';

import React, { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Lock, Share2 } from 'lucide-react';
import RadioButtonCard from '../common/RadioCard';

const RoomJoin = ({ onJoin, isLoading = false }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [joinMethod, setJoinMethod] = useState('code');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (roomCode.length < 6) {
      setError('Room code must be at least 6 characters');
      return;
    }

    onJoin(roomCode);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRoomCode(text.trim().toUpperCase());
      setError('');
    } catch (err) {
      setError('Unable to read from clipboard');
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Selection */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">How to Join</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Code Option */}
            <RadioButtonCard
            name="joinMethod"
            value="code"
            checked={joinMethod === 'code'}
            onChange={() => {
              setJoinMethod('code');
              setError('');
            }}
            title="Room Code"
            description="Join using a unique room code provided by the room owner."
            direction="vertical"
            icon={
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center peer-checked:bg-black/10 peer-checked:text-black transition-colors">
                <Lock className="w-5 h-5" strokeWidth={1.5} />
              </div>
            }
          />

          {/* Link Option */}
         <RadioButtonCard
            name="joinMethod"
            value="link"
            checked={joinMethod === 'link'}
            onChange={() => {
              setJoinMethod('link');
              setError('');
            }}
            title="Invite Link"
            description="Join using a special invite link sent by the room owner."
            direction="vertical"
            icon={
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center peer-checked:bg-black/10 peer-checked:text-black transition-colors">
                <Share2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
            }
          />
        </div>
      </div>
    
      <div className="h-px bg-gray-100 w-full"></div>

      {/* Join Form */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Enter Room Details</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {joinMethod === 'code' ? 'Room Code' : 'Invite Link'}
            </label>

            {joinMethod === 'code' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="e.g., ABC123"
                    maxLength={8}
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Paste from clipboard
                </button>
              </div>
            ) : (
                <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="url"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g., https://aura.com/invite/ABC123"
                    maxLength={8}
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Paste from clipboard
                </button>
              </div>
              
            )}

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            <p className="text-xs text-gray-500">
              {joinMethod === 'code'
                ? 'Case-insensitive. Ask the room owner if you don\'t have the code.'
                : 'Must be a valid invite link from the room owner.'}
            </p>
          </div>


          
          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
           
            <Button
              type="submit"
              className='w-full'
              disabled={isLoading || !roomCode.trim()}
              isLoading={isLoading}
            >
              Join Room
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
        <div className="flex gap-3">
          <div className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-5 h-5 text-blue-600 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Codes are case-insensitive</li>
              <li>• You'll need to join before the contest starts</li>
              <li>• Some rooms may require leader approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;

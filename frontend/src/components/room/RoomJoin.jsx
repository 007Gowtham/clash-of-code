'use client';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Copy } from 'lucide-react';
import { useState } from 'react';

const RoomJoin = ({ onJoin, isLoading = false }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

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
      {/* Join Form */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Enter Room Details</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Room Code
            </label>

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
                className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3 h-3" />
                Paste from clipboard
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            <p className="text-xs text-gray-500">
              Case-insensitive. Ask the room owner if you don't have the code.
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
      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200">
        <div className="flex gap-3">
          <div className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-5 h-5 text-slate-400 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Tips</h4>
            <ul className="text-xs text-slate-500 space-y-1">
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

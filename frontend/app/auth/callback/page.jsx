'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authAPI from '@/lib/api/services/auth';
import { toast } from 'react-hot-toast';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                toast.error('Authentication failed: ' + error);
                router.push('/auth/login');
                return;
            }

            if (!token) {
                toast.error('No authentication token received');
                router.push('/auth/login');
                return;
            }

            try {
                // Handle Google callback directly with auth service
                await authAPI.handleGoogleCallback(token);

                toast.success('Successfully logged in with Google');
                // Redirect to room page as that seems to be the main app area
                router.push('/room');
            } catch (err) {
                console.error('Callback error:', err);
                toast.error('Failed to complete authentication');
                router.push('/auth/login');
            } finally {
                setProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Completing login...</h2>
                <p className="text-gray-500 mt-2">Please wait while we redirect you.</p>
            </div>
        </div>
    );
}

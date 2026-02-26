'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push(`/auth/verify-forgot-password?email=${encodeURIComponent(email)}`);
        }, 800);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <PageTransition className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="mb-8 text-center">
                        <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                            <Mail size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            Enter your email address to receive a verification code.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white"
                        />

                        <Button
                            type="submit"
                            className="w-full py-2.5 font-bold"
                            isLoading={loading}
                            variant="primary"
                        >
                            Send Verification Code
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </PageTransition>

            <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                Protected by reCAPTCHA and subject to the Privacy Policy.
            </p>
        </div>
    );
};

export default ForgotPasswordPage;

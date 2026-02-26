'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';

const VerifyEmailContent = () => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const codeFromUrl = searchParams.get('code');
    const pendingEmail = typeof window !== 'undefined' ? localStorage.getItem('pendingEmail') : null;
    const targetEmail = emailFromUrl || pendingEmail;

    if (targetEmail) {
      setEmail(targetEmail);
    } else {
      router.push('/auth/signup');
    }

    if (codeFromUrl && codeFromUrl.length === 6) {
      setCode(codeFromUrl.split(''));
    }
  }, [router, searchParams]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...code];
    newOtp[index] = value.slice(0, 1);
    setCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpString = code.join('');
    if (otpString.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/auth/login');
    }, 800);
  };

  const handleResend = () => {
    if (!email) return;
    setResending(true);
    setTimeout(() => setResending(false), 1500);
  };

  return (
    <PageTransition className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
            Λ
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-sm text-gray-600 font-medium">
            We've sent a 6-digit code to <strong className="text-gray-900">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-11 text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-gray-900 placeholder:text-gray-300"
                placeholder="-"
                disabled={loading}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full font-bold"
            disabled={code.some(c => !c)}
          >
            Verify Email
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 font-medium">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 font-bold hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-gray-500 font-medium">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
};

export default VerifyEmailPage;

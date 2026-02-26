'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');
  const router = useRouter();

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!tokenFromUrl && otp.join('').length !== 6) {
      newErrors.otp = 'Please enter the 6-digit code';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/auth/login');
    }, 800);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-600 font-medium">
            {tokenFromUrl
              ? 'Set your new password below.'
              : 'Enter the verification code from your email and your new password.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleReset}>

          {!tokenFromUrl && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
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
              {errors.otp && (
                <p className="text-xs text-red-600 text-center mt-2 font-medium">{errors.otp}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="••••••••"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              disabled={loading}
              required
            />

            <Input
              type="password"
              placeholder="••••••••"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={loading}
              required
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
              {errors.submit}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full font-bold"
          >
            Reset Password
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-xs font-semibold text-gray-600 hover:text-gray-900">
            Back to Sign In
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

const VerifyForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-gray-500 font-medium">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

export default VerifyForgotPasswordPage;

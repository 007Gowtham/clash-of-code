'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AuthTabs from '@/components/auth/AuthTabs';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import SocialButton from '@/components/common/SocialButton';
import { PageTransition } from '@/components/common/PageTransition';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/room');
    }, 800);
  };

  const handleGoogleLogin = () => {
    // Google login - no backend interaction
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      <PageTransition className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="Logo" width={48} height={48} />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to DSA Multiplayer</h1>
            <p className="text-sm text-gray-600 font-medium">Sign in to access your account and compete</p>
          </div>

          <SocialButton
            provider="google"
            onClick={handleGoogleLogin}
            disabled={loading}
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-500 font-bold uppercase">Or</span>
            </div>
          </div>

          <AuthTabs activeTab="signin" />

          <form className="space-y-5" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="name@example.com"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
              required
            />

            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
              required
            />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-gray-700 hover:text-black">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full font-bold"
            >
              Sign in with Email
            </Button>
          </form>

          <p className="text-[11px] text-gray-500 text-center mt-6 font-medium">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-900">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>
          </p>
        </div>
      </PageTransition>
    </div>
  );
};

export default LoginPage;

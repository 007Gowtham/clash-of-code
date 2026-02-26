'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthTabs from '@/components/auth/AuthTabs';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import SocialButton from '@/components/common/SocialButton';
import { PageTransition } from '@/components/common/PageTransition';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/room');
    }, 800);
  };

  const handleGoogleSignup = () => {
    // Google signup - no backend interaction
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      <PageTransition className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-8">

          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
              Λ
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm text-gray-600 font-medium">Sign up to start competing in DSA challenges</p>
          </div>

          <SocialButton
            provider="google"
            onClick={handleGoogleSignup}
            disabled={loading}
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/50 px-3 text-xs text-gray-500 font-bold uppercase">Or</span>
            </div>
          </div>

          <AuthTabs activeTab="signup" />

          <form className="space-y-5" onSubmit={handleSignup}>
            <Input
              type="text"
              placeholder="john_doe"
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              disabled={loading}
              required
            />

            <Input
              type="email"
              placeholder="name@example.com"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={loading}
              required
            />

            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full font-bold"
            >
              Sign up with Email
            </Button>
          </form>

          <p className="text-[11px] text-gray-500 text-center mt-6 font-medium">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-900">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>
          </p>
        </div>
      </PageTransition>
    </div>
  );
};

export default SignupPage;

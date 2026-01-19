/**
 * Authentication Hooks
 * Ready-to-use hooks for authentication features
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import API from '../index';
import { useAPI, useMutation } from './useAPI';

/**
 * Hook for user registration
 */
export function useRegister() {
    const router = useRouter();

    return useMutation(API.auth.register, {
        successMessage: 'Registration successful! Please check your email.',
        onSuccess: (data) => {
            // Store email for verification page
            if (typeof window !== 'undefined') {
                localStorage.setItem('pendingEmail', data.email);
            }
            router.push('/auth/verify-email');
        },
    });
}

/**
 * Hook for email verification
 */
export function useVerifyEmail() {
    const router = useRouter();

    return useMutation(
        ({ email, code }) => API.auth.verifyEmail(email, code),
        {
            successMessage: 'Email verified successfully!',
            onSuccess: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('pendingEmail');
                }
                router.push('/room');
            },
        }
    );
}

/**
 * Hook for login
 */
export function useLogin() {
    const router = useRouter();

    return useMutation(
        ({ email, password }) => API.auth.login(email, password),
        {
            successMessage: 'Login successful!',
            onSuccess: () => {
                router.push('/room');
            },
        }
    );
}

/**
 * Hook for logout
 */
export function useLogout() {
    const router = useRouter();

    const logout = useCallback(() => {
        API.auth.logout();
        router.push('/auth/login');
    }, [router]);

    return { logout };
}

/**
 * Hook for getting current user
 */
export function useCurrentUser() {
    return useAPI(API.auth.getCurrentUser, {
        showErrorToast: false,
    });
}

/**
 * Hook for resending verification code
 */
export function useResendVerification() {
    return useMutation(
        (email) => API.auth.resendVerification(email),
        {
            successMessage: 'Verification code sent!',
        }
    );
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
    return useMutation(
        ({ email }) => API.auth.forgotPassword(email),
        {
            successMessage: 'Password reset code sent to your email!',
        }
    );
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
    const router = useRouter();

    return useMutation(
        ({ resetToken, newPassword }) => API.auth.resetPassword(resetToken, newPassword),
        {
            successMessage: 'Password reset successful!',
            onSuccess: () => {
                router.push('/auth/login');
            },
        }
    );
}

/**
 * Hook for checking authentication status
 */
export function useAuth() {
    const isAuthenticated = API.auth.isAuthenticated();
    const user = API.auth.getUser();

    return {
        isAuthenticated,
        user,
    };
}

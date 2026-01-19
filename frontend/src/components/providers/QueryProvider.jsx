'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                retry: 1,
                retryDelay: 1000,
                staleTime: 10 * 60 * 1000, // 10 minutes
                cacheTime: 15 * 60 * 1000, // 15 minutes
            },
            mutations: {
                retry: 0, // Don't retry mutations
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

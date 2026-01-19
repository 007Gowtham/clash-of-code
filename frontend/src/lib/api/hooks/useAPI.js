/**
 * Custom React Hooks for API Calls
 * Provides loading states, error handling, and data management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { APIError, ErrorTypes } from '../client';

/**
 * Base hook for API calls with loading and error states
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useAPI(apiFunction, options = {}) {
    const {
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Operation successful',
        initialData = null,
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const execute = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);

            try {
                const result = await apiFunction(...args);

                if (isMountedRef.current) {
                    setData(result);
                    setLoading(false);

                    if (showSuccessToast) {
                        toast.success(successMessage);
                    }

                    if (onSuccess) {
                        onSuccess(result);
                    }
                }

                return result;
            } catch (err) {
                if (isMountedRef.current) {
                    setError(err);
                    setLoading(false);

                    if (showErrorToast) {
                        const message = err instanceof APIError ? err.message : 'An error occurred';
                        toast.error(message);
                    }

                    if (onError) {
                        onError(err);
                    }
                }

                throw err;
            }
        },
        [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
    );

    const reset = useCallback(() => {
        setData(initialData);
        setLoading(false);
        setError(null);
    }, [initialData]);

    return {
        data,
        loading,
        error,
        execute,
        reset,
        setData,
    };
}

/**
 * Hook for fetching data on mount
 * @param {Function} apiFunction - API function to call
 * @param {Array} dependencies - Dependencies for refetch
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useFetch(apiFunction, dependencies = [], options = {}) {
    const { skip = false, ...apiOptions } = options;
    const { data, loading, error, execute, reset } = useAPI(apiFunction, apiOptions);
    const [refetchIndex, setRefetchIndex] = useState(0);

    useEffect(() => {
        if (!skip) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, refetchIndex, skip]);

    const refetch = useCallback(() => {
        setRefetchIndex((prev) => prev + 1);
    }, []);

    return {
        data,
        loading,
        error,
        refetch,
        reset,
    };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useMutation(apiFunction, options = {}) {
    return useAPI(apiFunction, {
        showSuccessToast: true,
        showErrorToast: true,
        ...options,
    });
}

/**
 * Hook for pagination
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function usePagination(apiFunction, options = {}) {
    const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    const { data, loading, error, execute } = useAPI(apiFunction, apiOptions);

    useEffect(() => {
        execute({ page, limit });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const nextPage = useCallback(() => {
        setPage((prev) => prev + 1);
    }, []);

    const prevPage = useCallback(() => {
        setPage((prev) => Math.max(1, prev - 1));
    }, []);

    const goToPage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    const changeLimit = useCallback((newLimit) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page
    }, []);

    return {
        data,
        loading,
        error,
        page,
        limit,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
    };
}

/**
 * Hook for infinite scroll
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useInfiniteScroll(apiFunction, options = {}) {
    const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [allData, setAllData] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const { data, loading, error, execute } = useAPI(apiFunction, apiOptions);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        try {
            const result = await execute({ page, limit });

            if (result && result.data) {
                setAllData((prev) => [...prev, ...result.data]);
                setHasMore(result.pagination?.hasMore || false);
                setPage((prev) => prev + 1);
            }
        } catch (err) {
            console.error('Load more error:', err);
        }
    }, [page, limit, loading, hasMore, execute]);

    const reset = useCallback(() => {
        setPage(initialPage);
        setAllData([]);
        setHasMore(true);
    }, [initialPage]);

    return {
        data: allData,
        loading,
        error,
        hasMore,
        loadMore,
        reset,
    };
}

/**
 * Hook for debounced API calls (e.g., search)
 * @param {Function} apiFunction - API function to call
 * @param {number} delay - Debounce delay in ms
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function useDebouncedAPI(apiFunction, delay = 500, options = {}) {
    const { data, loading, error, execute, reset } = useAPI(apiFunction, options);
    const [debouncedLoading, setDebouncedLoading] = useState(false);
    const timeoutRef = useRef(null);

    const debouncedExecute = useCallback(
        (...args) => {
            setDebouncedLoading(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(async () => {
                try {
                    await execute(...args);
                } finally {
                    setDebouncedLoading(false);
                }
            }, delay);
        },
        [execute, delay]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        data,
        loading: loading || debouncedLoading,
        error,
        execute: debouncedExecute,
        reset,
    };
}

/**
 * Hook for polling (periodic API calls)
 * @param {Function} apiFunction - API function to call
 * @param {number} interval - Polling interval in ms
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function usePolling(apiFunction, interval = 5000, options = {}) {
    const { enabled = true, ...apiOptions } = options;
    const { data, loading, error, execute } = useAPI(apiFunction, apiOptions);
    const intervalRef = useRef(null);

    const startPolling = useCallback(() => {
        if (intervalRef.current) return;

        execute(); // Initial call

        intervalRef.current = setInterval(() => {
            execute();
        }, interval);
    }, [execute, interval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [enabled, startPolling, stopPolling]);

    return {
        data,
        loading,
        error,
        startPolling,
        stopPolling,
    };
}

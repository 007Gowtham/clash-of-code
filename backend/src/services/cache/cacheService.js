/**
 * Cache Service for Code Execution Results
 * Provides in-memory caching with TTL to reduce Judge0 API calls
 */

const NodeCache = require('node-cache');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class CacheService {
    constructor() {
        // Initialize cache with 1-hour TTL
        this.cache = new NodeCache({
            stdTTL: 3600, // 1 hour in seconds
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false, // Don't clone objects (better performance)
        });

        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
        };

        // Log cache stats periodically
        setInterval(() => this.logStats(), 300000); // Every 5 minutes
    }

    /**
     * Generate cache key from code execution parameters
     * @param {Object} params - Execution parameters
     * @returns {string} Cache key
     */
    generateKey({ sourceCode, languageId, stdin, expectedOutput }) {
        const data = JSON.stringify({
            sourceCode,
            languageId,
            stdin: stdin || '',
            expectedOutput: expectedOutput || '',
        });

        // Create SHA-256 hash
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    /**
     * Get cached result
     * @param {Object} params - Execution parameters
     * @returns {Object|null} Cached result or null
     */
    get(params) {
        const key = this.generateKey(params);
        const result = this.cache.get(key);

        if (result) {
            this.stats.hits++;
            logger.info('Cache hit', {
                key: key.substring(0, 16) + '...',
                hitRate: this.getHitRate()
            });
            return result;
        }

        this.stats.misses++;
        logger.debug('Cache miss', {
            key: key.substring(0, 16) + '...',
            hitRate: this.getHitRate()
        });
        return null;
    }

    /**
     * Set cache result
     * @param {Object} params - Execution parameters
     * @param {Object} result - Execution result
     * @param {number} ttl - Optional TTL override (seconds)
     */
    set(params, result, ttl = null) {
        const key = this.generateKey(params);
        const success = ttl
            ? this.cache.set(key, result, ttl)
            : this.cache.set(key, result);

        if (success) {
            this.stats.sets++;
            logger.debug('Cache set', {
                key: key.substring(0, 16) + '...',
                ttl: ttl || 'default'
            });
        }

        return success;
    }

    /**
     * Delete cache entry
     * @param {Object} params - Execution parameters
     */
    delete(params) {
        const key = this.generateKey(params);
        return this.cache.del(key);
    }

    /**
     * Invalidate all cache entries for a specific question
     * (Called when test cases are updated)
     * @param {string} questionId - Question ID
     */
    invalidateQuestion(questionId) {
        const keys = this.cache.keys();
        let deleted = 0;

        // Note: This is a simple implementation
        // For production, consider storing question metadata with cache keys
        keys.forEach(key => {
            this.cache.del(key);
            deleted++;
        });

        logger.info('Cache invalidated for question', {
            questionId,
            keysDeleted: deleted
        });

        return deleted;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.flushAll();
        logger.info('Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            hitRate: hitRate.toFixed(2) + '%',
            keys: this.cache.keys().length,
            size: this.cache.getStats(),
        };
    }

    /**
     * Get hit rate
     */
    getHitRate() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return '0%';
        return ((this.stats.hits / total) * 100).toFixed(2) + '%';
    }

    /**
     * Log cache statistics
     */
    logStats() {
        const stats = this.getStats();
        logger.logMetrics('cache_hit_rate', parseFloat(stats.hitRate), {
            hits: stats.hits,
            misses: stats.misses,
            keys: stats.keys
        });
    }

    /**
     * Get cache info
     */
    getInfo() {
        return {
            stats: this.getStats(),
            config: {
                stdTTL: this.cache.options.stdTTL,
                checkperiod: this.cache.options.checkperiod,
            }
        };
    }
}

// Export singleton instance
module.exports = new CacheService();

const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const logger = require('../utils/logger');

class Judge0Service {
    constructor() {
        // Self-hosted Judge0 URL (no API key needed)
        this.baseUrl = process.env.JUDGE0_API_URL || 'http://127.0.0.1:2358';

        // Configuration
        this.maxRetries = parseInt(process.env.JUDGE0_MAX_RETRIES || '3', 10);
        this.pollInterval = parseInt(process.env.JUDGE0_POLL_INTERVAL || '500', 10);
        this.pollMaxAttempts = parseInt(process.env.JUDGE0_POLL_MAX_ATTEMPTS || '20', 10);

        logger.info('🔧 Judge0 Service Configuration:', {
            baseUrl: this.baseUrl,
            maxRetries: this.maxRetries,
            pollInterval: this.pollInterval,
            pollMaxAttempts: this.pollMaxAttempts
        });

        // Initialize axios client for self-hosted Judge0
        // NO API KEY, NO RAPIDAPI HEADERS
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10s timeout
        });

        // Configure retry logic
        axiosRetry(this.client, {
            retries: this.maxRetries,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                    error.response?.status === 429; // Retry on rate limit
            }
        });
    }

    /**
     * Map language name to Judge0 language ID
     * @param {string} language - Language name (e.g., 'javascript', 'python')
     * @returns {number} Judge0 language ID
     */
    mapLanguageToId(language) {
        const lang = language.toLowerCase();
        const map = {
            'c++': 54,
            'cpp': 54,
            'java': 62,
            'javascript': 63,
            'js': 63,
            'python': 71,
            'python3': 71,
            'py': 71,
            'c': 50,
            'c#': 51,
            'csharp': 51,
            'ruby': 72,
            'go': 60,
            'golang': 60,
            'swift': 83,
            'kotlin': 78,
            'rust': 73,
            'typescript': 74,
            'ts': 74
        };

        const id = map[lang];
        if (!id) {
            throw new Error(`Unsupported language: ${language}`);
        }
        return id;
    }

    /**
     * Parse Judge0 status to our verdict format
     * @param {Object} judgeStatus - Judge0 status object { id, description }
     * @returns {string} Verdict string
     */
    parseVerdict(judgeStatus) {
        if (!judgeStatus || !judgeStatus.id) return 'UNKNOWN';

        const statusId = judgeStatus.id;

        // Map Judge0 status IDs
        if (statusId === 3) return 'ACCEPTED';
        if (statusId === 4) return 'WRONG_ANSWER';
        if (statusId === 5) return 'TIME_LIMIT_EXCEEDED';
        if (statusId === 6) return 'COMPILATION_ERROR';
        if (statusId >= 7 && statusId <= 12) return 'RUNTIME_ERROR'; // 7-11 are various runtime errors, 12 is also runtime error (SIGSEGV, etc maps usually)
        if (statusId === 13 || statusId === 14) return 'INTERNAL_ERROR';
        if (statusId === 1 || statusId === 2) return 'PROCESSING'; // In Queue/Processing

        return 'RUNTIME_ERROR'; // Default fallback
    }

    /**
     * Submit code to Judge0 for execution
     * @param {string} sourceCode 
     * @param {number|string} languageId 
     * @param {string} stdin 
     * @param {string} expectedOutput 
     * @param {number} timeLimit 
     * @param {number} memoryLimit 
     * @returns {Promise<string>} Submission token
     */
    async submitCode(sourceCode, languageId, stdin, expectedOutput, timeLimit, memoryLimit) {
        try {
            // Ensure languageId is a number if a string name was passed
            const id = typeof languageId === 'string' && isNaN(languageId)
                ? this.mapLanguageToId(languageId)
                : languageId;

            // Always use base64 encoding to prevent encoding issues (UTF-8, etc.)
            const toBase64 = (str) => Buffer.from(str || '').toString('base64');

            const payload = {
                source_code: toBase64(sourceCode),
                language_id: id,
                stdin: toBase64(stdin),
                expected_output: expectedOutput ? toBase64(expectedOutput) : null,
                // CPU Time Limit
                ...(timeLimit && { cpu_time_limit: timeLimit }),
                // Memory Limit (KB)
                ...(memoryLimit && { memory_limit: memoryLimit })
            };

            logger.info('Submitting code to Judge0', { languageId: id, base64: true });

            const response = await this.client.post('/submissions', payload, {
                params: {
                    base64_encoded: 'true', // Enable Base64
                    wait: 'false' // Async submission
                }
            });

            if (!response.data.token) {
                throw new Error('No submission token received from Judge0');
            }

            return response.data.token;

        } catch (error) {
            logger.error('Judge0 submission failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Get submission result from Judge0
     * @param {string} token - Submission token
     * @returns {Promise<Object>} Submission result
     */
    async getSubmissionResult(token) {
        try {
            const response = await this.client.get(`/submissions/${token}`, {
                params: {
                    base64_encoded: 'true',
                    fields: 'stdout,stderr,status,message,compile_output,time,memory,token'
                }
            });

            const data = response.data;
            const fromBase64 = (str) => str ? Buffer.from(str, 'base64').toString('utf-8') : '';

            return {
                status: data.status, // Object { id, description }
                output: fromBase64(data.stdout),
                error: fromBase64(data.stderr) || fromBase64(data.compile_output) || data.message || '',
                time: data.time,
                memory: data.memory,
                verdict: this.parseVerdict(data.status),
                raw: data
            };

        } catch (error) {
            logger.error('Failed to get submission result', { token, error: error.message });
            throw error;
        }
    }

    /**
     * Poll Judge0 until execution completes
     * @param {string} token 
     * @param {number} maxAttempts 
     * @param {number} interval 
     * @returns {Promise<Object>} Final result
     */
    async pollUntilComplete(token, maxAttempts = this.pollMaxAttempts, interval = this.pollInterval) {
        logger.info(`Polling submission ${token}`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const result = await this.getSubmissionResult(token);

            const statusId = result.status.id;

            // Status 1 (In Queue) or 2 (Processing) -> continue polling
            if (statusId !== 1 && statusId !== 2) {
                logger.info(`Submission ${token} completed`, { verdict: result.verdict });
                return result;
            }

            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error(`Submission ${token} polling timed out after ${maxAttempts} attempts`);
    }

    /**
     * Execute code and wait for result (convenience method)
     * @param {string} sourceCode - Source code to execute
     * @param {string} language - Language name or ID
     * @param {string} input - Standard input
     * @param {string} expectedOutput - Expected output for verification
     * @param {Object} options - Additional options (timeLimit, memoryLimit)
     * @returns {Promise<Object>} Execution result
     */
    async execute(sourceCode, language, input, expectedOutput, options = {}) {
        const { timeLimit, memoryLimit } = options;

        try {
            const token = await this.submitCode(sourceCode, language, input, expectedOutput, timeLimit, memoryLimit);
            return await this.pollUntilComplete(token);
        } catch (error) {
            // Enhanced Error Handling & Fallback
            const isConnectionError = error.code === 'ECONNREFUSED' ||
                error.message.includes('Network Error') ||
                error.message.includes('Judge0');

            const langStr = typeof language === 'string' ? language.toLowerCase() : '';
            const isJS = langStr.includes('javascript') || langStr.includes('js') || langStr.includes('node') || language === 63;
            const isPython = langStr.includes('python') || langStr.includes('py') || language === 71;

            if (isConnectionError) {
                if (isJS) {
                    logger.warn('Judge0 unavailable, falling back to local JS execution');
                    return this.executeLocally(sourceCode, input, 'node');
                }
                if (isPython) {
                    logger.warn('Judge0 unavailable, falling back to local Python execution');
                    return this.executeLocally(sourceCode, input, 'python');
                }
            }

            logger.error('Judge0 execution failed', {
                error: error.message,
                language,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Fallback for local execution (Sandbox-like)
     */
    async executeLocally(sourceCode, input, type = 'node') {
        return new Promise((resolve) => {
            const { spawn } = require('child_process');

            let cmd = 'node';
            let args = ['-e', sourceCode];

            if (type === 'python') {
                cmd = 'python3';
                args = ['-c', sourceCode];
            }

            const p = spawn(cmd, args);

            let stdout = '';
            let stderr = '';

            p.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            p.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            if (input) {
                p.stdin.write(input);
                p.stdin.end();
            }

            // Timeout safety
            const timeout = setTimeout(() => {
                p.kill();
                resolve({
                    status: { id: 5, description: 'Time Limit Exceeded' },
                    verdict: 'TIME_LIMIT_EXCEEDED',
                    output: stdout,
                    error: 'Execution timed out',
                    time: '1.0',
                    memory: 0
                });
            }, 3000); // 3s timeout

            p.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0) {
                    resolve({
                        status: { id: 3, description: 'Accepted' },
                        verdict: 'ACCEPTED',
                        output: stdout,
                        error: stderr,
                        time: '0.1',
                        memory: 0
                    });
                } else {
                    resolve({
                        status: { id: 6, description: 'Runtime Error' },
                        verdict: 'RUNTIME_ERROR',
                        output: stdout,
                        error: stderr || `Process exited with code ${code}`,
                        time: '0.1',
                        memory: 0
                    });
                }
            });

            p.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    status: { id: 6, description: 'Runtime Error' },
                    verdict: 'RUNTIME_ERROR',
                    output: stdout,
                    error: err.message,
                    time: '0.0',
                    memory: 0
                });
            })
        });
    }
}

module.exports = Judge0Service;

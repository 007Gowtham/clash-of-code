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

            const payload = {
                source_code: sourceCode,
                language_id: id,
                stdin: stdin || '',
                expected_output: expectedOutput || null,
                // Judge0 expects seconds (float) usually, unless configured otherwise
                // Assuming input is milliseconds if large, or seconds. 
                // Standard Judge0 is seconds. If system provides ms, convert.
                // Assuming standard Judge0 API.
                // Let's assume input is in seconds or we trust the caller. 
                // If needed, we can normalize.
                // CPU Time Limit
                ...(timeLimit && { cpu_time_limit: timeLimit }),
                // Memory Limit (KB)
                ...(memoryLimit && { memory_limit: memoryLimit })
            };

            logger.info('Submitting code to Judge0', { languageId: id });

            const response = await this.client.post('/submissions', payload, {
                params: {
                    base64_encoded: 'false', // Using plain text for now, change to true if dealing with binary
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
                    base64_encoded: 'false',
                    fields: 'stdout,stderr,status,message,compile_output,time,memory,token'
                }
            });

            const data = response.data;

            return {
                status: data.status, // Object { id, description }
                output: data.stdout || '',
                error: data.stderr || data.compile_output || data.message || '',
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
            logger.error('Judge0 execution failed', {
                error: error.message,
                language,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Fallback for local execution of JS code (Sandbox-like)
     */
    async executeLocally(sourceCode, input) {
        return new Promise((resolve) => {
            const { spawn } = require('child_process');

            // Create a wrapper to inject input as stdin
            // We run "node -e '...code...'"
            // But sourceCode is complex. Better to write to a temp file or pipe stdin.

            // We'll spawn a node process.
            // We need to ensure the code reads from stdin if the harness expects it.
            // But usually the harness provided by TemplateBuilder does `require('fs').readFileSync(0, 'utf-8')`
            // Wait, TemplateBuilder relies on `require('fs')`.
            // Let's verify if the harness uses fs. 
            // If it does, we can pipe input.

            const p = spawn('node', ['-e', sourceCode]);

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

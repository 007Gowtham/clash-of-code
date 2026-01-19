const { prisma } = require('../config/database');
const logger = require('../utils/logger');

class TemplateBuilder {
    /**
     * Build executable code by combining user code with template parts
     * @param {string} questionId 
     * @param {string} userCode 
     * @param {string} language 
     * @returns {Promise<string>} Complete executable code
     */
    async buildExecutableCode(questionId, userCode, language) {
        try {
            // 1. Fetch template
            const template = await prisma.questionTemplate.findUnique({
                where: {
                    questionId_language: {
                        questionId,
                        language
                    }
                }
            });

            if (!template) {
                throw new Error(`Template not found for question ${questionId} and language ${language}`);
            }

            // 2. Validate user code
            const validation = this.validateUserCode(userCode, language);
            if (!validation.valid) {
                throw new Error(`Security validation failed: ${validation.errors.join(', ')}`);
            }

            // 3. Assemble code
            // Check if we need to inject into a placeholder or concatenate
            let executableCode;

            let finalCode;
            // Check if mainFunction expects injection
            if (template.mainFunction.includes('{{USER_FUNCTION}}')) {
                executableCode = this.injectUserCode(template.mainFunction, userCode);

                // Prepend header and definitions if they exist and aren't part of the mainFunction injection
                const parts = [];
                if (template.headerCode) parts.push(template.headerCode);
                // if (template.definition) parts.push(template.definition); // Removed to avoid duplication (frontend sends definition)
                parts.push(executableCode);

                finalCode = parts.join('\n\n');
            } else {
                // Standard concatenation strategy
                const parts = [];

                if (template.headerCode) parts.push(template.headerCode);
                // if (template.definition) parts.push(template.definition); // Removed to avoid duplication (frontend sends definition)
                parts.push(userCode);
                if (template.mainFunction) parts.push(template.mainFunction);

                finalCode = parts.join('\n\n');
            }

            console.log('--- EXECUTABLE CODE START ---');
            console.log(finalCode);
            console.log('--- EXECUTABLE CODE END ---');

            return finalCode;

        } catch (error) {
            logger.error('Failed to build executable code', {
                questionId,
                language,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get boilerplate code for the editor
     * @param {string} questionId 
     * @param {string} language 
     * @returns {Promise<string>} Boilerplate code
     */
    async getBoilerplate(questionId, language) {
        try {
            const template = await prisma.questionTemplate.findUnique({
                where: {
                    questionId_language: {
                        questionId,
                        language
                    }
                },
                select: {
                    boilerplate: true
                }
            });

            if (!template) {
                throw new Error(`Template not found for question ${questionId} and language ${language}`);
            }

            return template.boilerplate || '';

        } catch (error) {
            logger.error('Failed to fetch boilerplate', {
                questionId,
                language,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Validate user code for basic security and syntax
     * @param {string} userCode 
     * @param {string} language 
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateUserCode(userCode, language) {
        const errors = [];
        const codev = userCode || '';

        // Basic check
        if (!codev.trim()) {
            return { valid: false, errors: ['Code cannot be empty'] };
        }

        // Security checks (mostly for JS/Node environments, but good practice generic)
        // These are regexes ensuring we don't have obviously dangerous calls
        const dangerousPatterns = [
            { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/, message: "Use of 'child_process' is forbidden" },
            { pattern: /require\s*\(\s*['"]fs['"]\s*\)/, message: "Use of 'fs' module is forbidden" },
            { pattern: /process\.exit/, message: "Use of process.exit is forbidden" },
            { pattern: /eval\s*\(/, message: "Use of eval() is forbidden" },
            { pattern: /exec\s*\(/, message: "Use of exec() is forbidden" },
            { pattern: /spawn\s*\(/, message: "Use of spawn() is forbidden" },
        ];

        // Only apply Node.js specific checks if language is Javascript-ish
        if (['javascript', 'typescript', 'js', 'ts'].includes(language.toLowerCase())) {
            dangerousPatterns.forEach(check => {
                if (check.pattern.test(codev)) {
                    errors.push(check.message);
                }
            });
        }

        // Language specific syntax check can be added here
        // e.g., balancing braces (simple heuristic)
        // This is not a compiler, just a sanity check

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Inject user code into a template string replacing {{USER_FUNCTION}}
     * @param {string} template 
     * @param {string} userCode 
     * @returns {string} Code with injection
     */
    injectUserCode(template, userCode) {
        if (!template) return userCode;
        if (!template.includes('{{USER_FUNCTION}}')) return template + '\n' + userCode;

        return template.replace('{{USER_FUNCTION}}', userCode);
    }
}

module.exports = new TemplateBuilder();

/**
 * Code Template Service (Simplified)
 * 
 * This service replaces the complex wrapper generation system.
 * Instead of auto-generating wrappers, we:
 * 1. Store pre-written wrapper code in the database (QuestionTemplate table)
 * 2. Simply concatenate wrapper parts with user code when executing
 * 
 * Template Structure:
 * - headerCode: Imports, includes, helper functions
 * - definition: Data structure definitions (ListNode, TreeNode, etc.)
 * - userFunction: User's function signature (shown in editor)
 * - mainFunction: Wrapper code that reads input, calls user function, prints output
 * - boilerplate: Any additional boilerplate code
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

class CodeTemplateService {
    /**
     * Get template for a specific question and language
     * @param {string} questionId - Question UUID
     * @param {string} language - Language code (cpp, python, javascript, java)
     * @returns {Promise<Object>} Template object
     */
    async getTemplate(questionId, language) {
        try {
            const template = await prisma.questionTemplate.findUnique({
                where: {
                    questionId_language: {
                        questionId,
                        language
                    }
                }
            });

            if (!template) {
                throw new Error(`Template not found for question ${questionId}, language ${language}`);
            }

            return template;
        } catch (error) {
            logger.error(`Failed to get template for question ${questionId}, language ${language}:`, error);
            throw error;
        }
    }

    /**
     * Generate complete executable code by combining user function with wrapper
     * @param {string} questionId - Question UUID
     * @param {string} language - Language code (cpp, python, javascript, java)
     * @param {string} userFunctionCode - User's function implementation
     * @returns {Promise<string>} Complete executable code ready for Judge0
     */
    async generateExecutableCode(questionId, language, userFunctionCode) {
        try {
            // Get the template for this question and language
            const template = await this.getTemplate(questionId, language);

            // Combine all parts in the correct order
            const parts = [];

            // 1. Header code (imports, includes, helper functions)
            if (template.headerCode) {
                parts.push(template.headerCode.trim());
            }

            // 2. Data structure definitions (ListNode, TreeNode, etc.)
            // NOTE: Excluded for now as the current data set uses this field for descriptions, causing SyntaxErrors.
            // if (template.definition) {
            //     parts.push(template.definition.trim());
            // }

            // 3. User's function implementation
            if (userFunctionCode) {
                parts.push(userFunctionCode.trim());
            }


            // 5. Additional boilerplate (if any)
            if (template.boilerplate) {
                parts.push(template.boilerplate.trim());
            }
            // 4. Main execution harness (reads input, calls user function, prints output)
            if (template.mainFunction) {
                parts.push(template.mainFunction.trim());
            }

            // Join all parts with double newlines for readability
            const executableCode = parts.filter(part => part).join('\n\n');

            logger.info(`Generated executable code for question ${questionId}, language ${language}`);

            return executableCode;
        } catch (error) {
            logger.error(`Failed to generate executable code for question ${questionId}, language ${language}:`, error);
            throw error;
        }
    }

    /**
     * Get user function template (what user sees in the editor)
     * @param {string} questionId - Question UUID
     * @param {string} language - Language code
     * @returns {Promise<string>} User function template
     */
    async getUserFunctionTemplate(questionId, language) {
        try {
            const template = await this.getTemplate(questionId, language);
            return template.userFunction || '';
        } catch (error) {
            logger.error(`Failed to get user function template:`, error);
            throw error;
        }
    }

    /**
     * Save or update template for a question
     * @param {string} questionId - Question UUID
     * @param {string} language - Language code
     * @param {Object} templateData - Template components
     * @returns {Promise<Object>} Saved template
     */
    async saveTemplate(questionId, language, templateData) {
        try {
            const template = await prisma.questionTemplate.upsert({
                where: {
                    questionId_language: {
                        questionId,
                        language
                    }
                },
                update: {
                    headerCode: templateData.headerCode,
                    definition: templateData.definition,
                    userFunction: templateData.userFunction,
                    mainFunction: templateData.mainFunction,
                    boilerplate: templateData.boilerplate,
                    diagram: templateData.diagram,
                    updatedAt: new Date()
                },
                create: {
                    questionId,
                    language,
                    headerCode: templateData.headerCode,
                    definition: templateData.definition,
                    userFunction: templateData.userFunction,
                    mainFunction: templateData.mainFunction,
                    boilerplate: templateData.boilerplate,
                    diagram: templateData.diagram
                }
            });

            logger.info(`Saved template for question ${questionId}, language ${language}`);
            return template;
        } catch (error) {
            logger.error(`Failed to save template:`, error);
            throw error;
        }
    }

    /**
     * Get all templates for a question (all languages)
     * @param {string} questionId - Question UUID
     * @returns {Promise<Array>} Array of templates
     */
    async getAllTemplatesForQuestion(questionId) {
        try {
            const templates = await prisma.questionTemplate.findMany({
                where: { questionId }
            });

            return templates;
        } catch (error) {
            logger.error(`Failed to get templates for question ${questionId}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new CodeTemplateService();

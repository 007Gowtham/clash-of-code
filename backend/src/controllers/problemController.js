/**
 * Problem Controller
 * Handles problem templates, code execution, and submissions
 * PROFESSIONAL ERROR HANDLING: Separates editor errors from test case errors
 */

const { prisma } = require('../config/database');
const CodeTemplateGenerator = require('../services/codeTemplateGenerator');
const logger = require('../utils/logger');

/**
 * Get problem details with code template
 * GET /api/problems/:slug
 */
exports.getProblem = async (req, res) => {
    try {
        const { slug } = req.params;
        const { language = 'python' } = req.query;

        // Get problem with test cases and template for the requested language
        const problem = await prisma.question.findUnique({
            where: { slug },
            include: {
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                },
                hints: {
                    orderBy: { order: 'asc' }
                },
                constraints: {
                    orderBy: { order: 'asc' }
                },
                templates: {
                    where: { language }
                }
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }

        let codeTemplate;
        let templateParts = {};

        // Prioritize specific database template if it exists
        if (problem.templates && problem.templates.length > 0) {
            const template = problem.templates[0];
            // Combine parts for editor: UserFunction only (Header/Boilerplate handled by UI)
            codeTemplate = template.userFunction || '';

            templateParts = {
                headerCode: template.headerCode || '',
                boilerplate: template.boilerplate || '',
                definition: template.definition || '',
                userFunction: template.userFunction || ''
            };
        } else {
            // Fallback to generator
            codeTemplate = '// Template not found for this language';
            logger.warn(`No template found for slug:${slug} lang:${language}`);
        }

        res.json({
            success: true,
            data: {
                id: problem.id,
                slug: problem.slug,
                title: problem.title,
                difficulty: problem.difficulty,
                points: problem.points,
                description: problem.description,
                sampleTestCases: problem.testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation
                })),
                hints: problem.hints.map(h => h.content),
                constraints: problem.constraints.map(c => c.content),
                constraints: problem.constraints.map(c => c.content),
                codeTemplate,
                templateParts,
                functionName: problem.functionName,
                functionSignature: problem.functionSignature
            }
        });

    } catch (error) {
        logger.error('Get problem failed', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Run code against sample test cases
 * POST /api/problems/:slug/run
 */
// Execution methods removed as per request to rebuild pipeline.

/**
 * Get submission history
 * GET /api/problems/:slug/submissions
 */
exports.getSubmissions = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        const problem = await prisma.question.findUnique({
            where: { slug }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }

        const submissions = await prisma.submission.findMany({
            where: {
                questionId: problem.id,
                userId
            },
            orderBy: { submittedAt: 'desc' },
            take: parseInt(limit),
            select: {
                id: true,
                verdict: true,
                mode: true,
                testsPassed: true,
                totalTests: true,
                points: true,
                language: true,
                submittedAt: true
            }
        });

        res.json({
            success: true,
            data: submissions
        });

    } catch (error) {
        logger.error('Get submissions failed', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Add Questions to Room (Admin Only)
exports.addQuestions = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { questions } = req.body;

        // Verify room exists and user is admin
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can add questions', 403);
        }

        if (room.status !== 'WAITING') {
            return errorResponse(res, 'Cannot add questions after room has started', 400);
        }

        // Create questions with templates and test cases
        const createdQuestions = await Promise.all(
            questions.map((q) =>
                prisma.question.create({
                    data: {
                        roomId,
                        title: q.title,
                        description: q.description,
                        sampleInput: q.sampleInput,
                        sampleOutput: q.sampleOutput,
                        hint1: q.hint1 || null,
                        hint2: q.hint2 || null,
                        points: q.points || 100,
                        difficulty: q.difficulty,
                        timeLimit: q.timeLimit || 2000,
                        memoryLimit: q.memoryLimit || 256,
                        functionName: q.functionName,
                        functionSignature: q.functionSignature,
                        inputType: q.inputType,
                        outputType: q.outputType,
                        slug: q.slug || q.title.toLowerCase().replace(/ /g, '-'),

                        // Nested creates for relationships
                        testCases: {
                            create: q.testCases || []
                        },
                        templates: {
                            create: q.templates || []
                        },
                        constraints: {
                            create: (q.constraints || []).map((c, i) => ({
                                content: typeof c === 'string' ? c : c.content,
                                order: i
                            }))
                        },
                        hints: {
                            create: (q.hints || []).map((h, i) => ({
                                content: typeof h === 'string' ? h : h.content,
                                order: i
                            }))
                        }
                    },
                    include: {
                        templates: true,
                        testCases: true
                    }
                })
            )
        );

        return successResponse(
            res,
            {
                count: createdQuestions.length,
                questions: createdQuestions.map((q) => ({
                    id: q.id,
                    title: q.title,
                    difficulty: q.difficulty,
                    points: q.points,
                    slug: q.slug,
                    templates: q.templates,
                    testCasesCount: q.testCases.length
                })),
            },
            `${createdQuestions.length} question(s) added successfully`,
            201
        );
    } catch (error) {
        next(error);
    }
};

// Get Room Questions
exports.getRoomQuestions = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { difficulty, status, teamId } = req.query;

        const where = { roomId };
        if (difficulty) {
            where.difficulty = difficulty;
        }

        const questions = await prisma.question.findMany({
            where,
            include: {
                hints: {
                    orderBy: { order: 'asc' }
                },
                constraints: {
                    orderBy: { order: 'asc' }
                },
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                },
                assignments: {
                    where: teamId ? { teamId } : {},
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                submissions: {
                    select: {
                        id: true,
                        verdict: true,
                        userId: true,
                    },
                },
                templates: {
                    select: {
                        language: true,
                        headerCode: true,
                        boilerplate: true,
                        definition: true,
                        userFunction: true,
                        mainFunction: true,
                        diagram: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const formattedQuestions = questions.map((q) => {
            const totalAttempts = q.submissions.length;
            const totalSolved = q.submissions.filter((s) => s.verdict === 'ACCEPTED').length;
            const myTeamAssignment = q.assignments.find((a) => a.teamId === teamId);

            const templatesMap = {};
            if (q.templates) {
                q.templates.forEach(t => {
                    templatesMap[t.language] = {
                        headerCode: t.headerCode || '',
                        boilerplate: t.boilerplate || '',
                        definition: t.definition || '',
                        userFunction: t.userFunction || '',
                        mainFunction: t.mainFunction || '',
                        diagram: t.diagram || null
                    };
                });
            }

            return {
                id: q.id,
                title: q.title,
                description: q.description,
                difficulty: q.difficulty,
                points: q.points,
                sampleInput: q.sampleInput,
                sampleOutput: q.sampleOutput,
                functionName: q.functionName,
                functionSignature: q.functionSignature,
                inputType: q.inputType,
                outputType: q.outputType,
                hints: (q.hints || []).map(h => h.content),
                constraints: (q.constraints || []).map(c => c.content),
                testCases: (q.testCases || []).map(tc => ({
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation
                })),
                totalSolved,
                totalAttempts,
                successRate: totalAttempts > 0 ? ((totalSolved / totalAttempts) * 100).toFixed(2) : 0,
                myTeamStatus: myTeamAssignment?.status || 'UNASSIGNED',
                assignedTo: myTeamAssignment?.user
                    ? {
                        userId: myTeamAssignment.user.id,
                        username: myTeamAssignment.user.username,
                    }
                    : null,
                solvedAt: myTeamAssignment?.solvedAt || null,
                templates: templatesMap
            };
        });

        const summary = {
            total: formattedQuestions.length,
            easy: formattedQuestions.filter((q) => q.difficulty === 'EASY').length,
            medium: formattedQuestions.filter((q) => q.difficulty === 'MEDIUM').length,
            hard: formattedQuestions.filter((q) => q.difficulty === 'HARD').length,
            solved: formattedQuestions.filter((q) => q.myTeamStatus === 'SOLVED').length,
            assigned: formattedQuestions.filter((q) => q.myTeamStatus === 'ASSIGNED').length,
            unassigned: formattedQuestions.filter((q) => q.myTeamStatus === 'UNASSIGNED').length,
        };

        return successResponse(res, {
            questions: formattedQuestions,
            summary,
        });
    } catch (error) {
        console.error('getRoomQuestions error:', error);
        next(error);
    }
};

// Get Question Details
exports.getQuestionDetails = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
                assignments: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                members: {
                                    where: {
                                        userId: req.user.id,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                submissions: {
                    select: {
                        id: true,
                        status: true,
                        submittedAt: true,
                    },
                },
                templates: {
                    select: {
                        language: true,
                        headerCode: true,
                        boilerplate: true,
                        userFunction: true,
                        mainFunction: true,
                        diagram: true
                    }
                }
            },
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Check if user has access to this question
        const myTeamAssignment = question.assignments.find(
            (a) => a.team.members.length > 0
        );

        const totalAttempts = question.submissions.length;
        const totalSolved = question.submissions.filter((s) => s.status === 'ACCEPTED').length;

        const templatesMap = {};
        if (question.templates) {
            question.templates.forEach(t => {
                templatesMap[t.language] = {
                    headerCode: t.headerCode || '',
                    boilerplate: t.boilerplate || '',
                    userFunction: t.userFunction || '',
                    mainFunction: t.mainFunction || '',
                    diagram: t.diagram || null
                };
            });
        }

        return successResponse(res, {
            id: question.id,
            title: question.title,
            description: question.description,
            sampleInput: question.sampleInput,
            sampleOutput: question.sampleOutput,
            hint1: question.hint1,
            hint2: question.hint2,
            points: question.points,
            difficulty: question.difficulty,
            constraints: question.constraints,
            timeLimit: question.timeLimit,
            memoryLimit: question.memoryLimit,
            testCasesCount: question.testCases.length,
            sampleTestCases: question.testCases
                .filter((tc) => !tc.isHidden)
                .map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                })),
            roomId: question.room.id,
            roomName: question.room.name,
            myTeamAssignment: myTeamAssignment
                ? {
                    status: myTeamAssignment.status,
                    assignedTo: myTeamAssignment.user
                        ? {
                            userId: myTeamAssignment.user.id,
                            username: myTeamAssignment.user.username,
                        }
                        : null,
                    assignedAt: myTeamAssignment.assignedAt,
                    canView: true,
                    canSolve: myTeamAssignment.userId === req.user.id || myTeamAssignment.status === 'UNASSIGNED',
                }
                : null,
            statistics: {
                totalAttempts,
                totalSolved,
                successRate: totalAttempts > 0 ? ((totalSolved / totalAttempts) * 100).toFixed(2) : 0,
            },
            createdAt: question.createdAt,
            templates: templatesMap
        });
    } catch (error) {
        next(error);
    }
};

// Assign Question to Team Member
exports.assignQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { teamId, userId } = req.body;

        // Verify team leader
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: true,
            },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.leaderId !== req.user.id) {
            return errorResponse(res, 'Only team leader can assign questions', 403);
        }

        // Check if user is team member
        const isMember = team.members.some((m) => m.userId === userId);
        if (!isMember) {
            return errorResponse(res, 'User is not a member of this team', 400);
        }

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Create or update assignment
        const assignment = await prisma.questionAssignment.upsert({
            where: {
                questionId_teamId: {
                    questionId,
                    teamId,
                },
            },
            update: {
                userId,
                status: 'ASSIGNED',
                assignedAt: new Date(),
            },
            create: {
                questionId,
                teamId,
                userId,
                status: 'ASSIGNED',
                assignedAt: new Date(),
            },
            include: {
                question: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        points: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // TODO: Emit socket event

        return successResponse(res, {
            assignment: {
                id: assignment.id,
                questionId: assignment.question.id,
                questionTitle: assignment.question.title,
                teamId: assignment.teamId,
                userId: assignment.user.id,
                username: assignment.user.username,
                status: assignment.status,
                assignedAt: assignment.assignedAt,
            },
        }, 'Question assigned successfully');
    } catch (error) {
        next(error);
    }
};

// Update Question (Admin Only)
exports.updateQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                room: true,
            },
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        if (question.room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can update questions', 403);
        }

        const updatedQuestion = await prisma.question.update({
            where: { id: questionId },
            data: updates,
        });

        return successResponse(res, {
            id: updatedQuestion.id,
            title: updatedQuestion.title,
            points: updatedQuestion.points,
        }, 'Question updated successfully');
    } catch (error) {
        next(error);
    }
};

// Delete Question (Admin Only)
exports.deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                room: true,
                submissions: true,
            },
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // if (question.room.adminId !== req.user.id) {
        //     return errorResponse(res, 'Only room admin can delete questions', 403);
        // }

       

        await prisma.question.delete({
            where: { id: questionId },
        });

        return successResponse(res, {}, 'Question deleted successfully');
    } catch (error) {
        next(error);
    }
};

// Get All Questions (Public - No Authentication Required)
exports.getAllQuestions = async (req, res, next) => {
    try {
        console.log('📚 Fetching all questions (public endpoint)');

        // Fetch all questions with their related data
        const questions = await prisma.question.findMany({
            include: {
                hints: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        content: true,
                        order: true
                    }
                },
                constraints: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        content: true,
                        order: true
                    }
                },
                testCases: {
                    where: { isSample: true }, // Only return sample test cases
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        input: true,
                        output: true,
                        explanation: true,
                        isSample: true
                    }
                },
                templates: {
                    select: {
                        language: true,
                        userFunction: true,
                        boilerplate: true,
                        headerCode: true,
                        definition: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`✅ Found ${questions.length} questions`);

        // Format the response
        const formattedQuestions = questions.map(question => {
            // Group templates by language
            const templatesMap = {};
            if (question.templates) {
                question.templates.forEach(t => {
                    templatesMap[t.language] = {
                        userFunction: t.userFunction || '',
                        boilerplate: t.boilerplate || '',
                        headerCode: t.headerCode || '',
                        definition: t.definition || ''
                    };
                });
            }

            return {
                id: question.id,
                title: question.title,
                slug: question.slug,
                description: question.description,
                difficulty: question.difficulty,
                points: question.points,
                sampleInput: question.sampleInput,
                sampleOutput: question.sampleOutput,
                functionName: question.functionName,
                functionSignature: question.functionSignature,
                inputType: question.inputType,
                outputType: question.outputType,
                timeLimit: question.timeLimit,
                memoryLimit: question.memoryLimit,
                hints: question.hints.map(h => ({
                    id: h.id,
                    content: h.content,
                    order: h.order
                })),
                constraints: question.constraints.map(c => ({
                    id: c.id,
                    content: c.content,
                    order: c.order
                })),
                sampleTestCases: question.testCases.map(tc => ({
                    id: tc.id,
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation
                })),
                templates: templatesMap,
                createdAt: question.createdAt
            };
        });

        return successResponse(res, {
            questions: formattedQuestions,
            total: formattedQuestions.length
        });
    } catch (error) {
        console.error('❌ getAllQuestions error:', error);
        next(error);
    }
};

// Create Global Question (Admin Only)

exports.createQuestion = async (req, res, next) => {
    try {
        // Handle both single object and array of questions
        const inputData = req.body;
        let questionsToProcess = [];

        if (inputData.questions && Array.isArray(inputData.questions)) {
            questionsToProcess = inputData.questions;
        } else if (Array.isArray(inputData)) {
            questionsToProcess = inputData;
        } else {
            questionsToProcess = [inputData];
        }

        const createdQuestions = [];

        for (const item of questionsToProcess) {
            // Extract question core data (handle nested 'question' object if present)
            const qData = item.question || item;

            // Extract relationships (usually siblings to 'question' object in the provided JSON)
            const hints = item.hints || qData.hints || [];
            const constraints = item.constraints || qData.constraints || [];
            const testCases = item.testCases || qData.testCases || [];
            const templates = item.templates || qData.templates || [];

            const question = await prisma.question.create({
                data: {

                    title: qData.title,
                    description: qData.description,
                    sampleInput: qData.sampleInput,
                    sampleOutput: qData.sampleOutput,

                    points: qData.points || 100,
                    difficulty: qData.difficulty,
                    timeLimit: qData.timeLimit || 2000,
                    memoryLimit: qData.memoryLimit || 256,
                    functionName: qData.functionName,
                    functionSignature: qData.functionSignature,
                    inputType: qData.inputType,
                    outputType: qData.outputType,
                    slug: qData.slug || qData.title.toLowerCase().replace(/ /g, '-'),

                    // Metadata fields
                    inputFormats: qData.inputFormats || null,
                    outputFormat: qData.outputFormat || null,
                    customTypes: qData.customTypes || null,

                    // Nested creates for relationships
                    testCases: {
                        create: testCases.map((tc, i) => ({
                            input: tc.input,
                            output: tc.output,
                            explanation: tc.explanation,
                            isHidden: tc.isHidden !== undefined ? tc.isHidden : false,
                            isSample: tc.isSample !== undefined ? tc.isSample : false,
                            category: tc.category || 'BASIC',
                            points: tc.points || 5,
                            order: tc.order || i,
                            timeLimit: tc.timeLimit,
                            memoryLimit: tc.memoryLimit
                        }))
                    },
                    templates: {
                        create: templates.map(t => ({
                            language: t.language,
                            headerCode: t.headerCode,
                            boilerplate: t.boilerplate,
                            diagram: t.diagram,
                            mainFunction: t.mainFunction,
                            userFunction: t.userFunction,
                            definition: t.definition
                        }))
                    },
                    constraints: {
                        create: constraints.map((c, i) => ({
                            content: typeof c === 'string' ? c : c.content,
                            order: c.order !== undefined ? c.order : i
                        }))
                    },
                    hints: {
                        create: hints.map((h, i) => ({
                            content: typeof h === 'string' ? h : h.content,
                            order: h.order !== undefined ? h.order : i
                        }))
                    }
                },
                include: {
                    templates: true,
                    testCases: true,
                    constraints: true,
                    hints: true
                }
            });
            createdQuestions.push(question);
        }

        return successResponse(
            res,
            {
                count: createdQuestions.length,
                questions: createdQuestions
            },
            `${createdQuestions.length} question(s) created successfully`,
            201
        );
    } catch (error) {
        console.error('Create question error:', error);
        next(error);
    }
};

module.exports = exports;

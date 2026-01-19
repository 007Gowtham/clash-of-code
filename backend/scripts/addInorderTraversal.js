const { PrismaClient } = require('@prisma/client');
const problemSet = require('../src/data/problemSet');

const prisma = new PrismaClient();

async function addInorderTraversal() {
    console.log('🌱 Adding "Binary Tree Inorder Traversal" to database...\n');

    try {
        // 1. Find the target problem in problemSet
        const targetSlug = 'binary-tree-inorder-traversal';
        const problem = problemSet.problems.find(p => p.slug === targetSlug);

        if (!problem) {
            throw new Error(`Problem with slug "${targetSlug}" not found in problemSet.js`);
        }

        // 2. Find a room to add it to (e.g., 'Beginner Battle Arena')
        let room = await prisma.room.findFirst({
            where: { name: 'Beginner Battle Arena' }
        });

        if (!room) {
            // Fallback to any active room if specific one not found
            console.log('⚠️ "Beginner Battle Arena" not found, looking for any active room...');
            room = await prisma.room.findFirst({
                where: { status: 'ACTIVE' }
            });
        }

        if (!room) {
            throw new Error('No suitable room found to add the problem to.');
        }

        console.log(`📍 Targeting Room: ${room.name} (${room.code})`);

        // 3. Check if problem already exists (globally by slug)
        const existingQuestion = await prisma.question.findUnique({
            where: { slug: targetSlug }
        });

        if (existingQuestion) {
            console.log('⚠️ Problem already exists in database. Updating details...');
            // Update existing problem details (in case we changed template logic/types)
            await prisma.question.update({
                where: { id: existingQuestion.id },
                data: {
                    title: problem.title,
                    description: problem.description,
                    functionName: problem.functionName,
                    functionSignature: problem.functionSignature,
                    inputType: problem.inputType,
                    outputType: problem.outputType,
                    points: problem.points,
                    difficulty: problem.difficulty
                }
            });
            console.log('✅ Updated existing problem details.');
            return;
        }

        // 4. Create the Question
        console.log('📝 Creating question...');
        const question = await prisma.question.create({
            data: {
                title: problem.title,
                slug: problem.slug,
                description: problem.description,
                difficulty: problem.difficulty,
                points: problem.points,
                functionName: problem.functionName,
                functionSignature: problem.functionSignature,
                inputType: problem.inputType,
                outputType: problem.outputType,
                roomId: room.id,
                sampleInput: JSON.stringify(problem.examples[0].input),
                sampleOutput: JSON.stringify(problem.examples[0].output)
            }
        });

        console.log(`✅ Created Question: ${question.title}`);

        // 5. Add Constraints
        console.log('📝 Adding constraints...');
        for (let i = 0; i < problem.constraints.length; i++) {
            await prisma.constraint.create({
                data: {
                    content: problem.constraints[i],
                    order: i,
                    questionId: question.id
                }
            });
        }

        // 6. Add Hints
        console.log('📝 Adding hints...');
        if (problem.hints) {
            for (let i = 0; i < problem.hints.length; i++) {
                await prisma.hint.create({
                    data: {
                        content: problem.hints[i],
                        order: i,
                        questionId: question.id
                    }
                });
            }
        }

        // 7. Add Test Cases
        console.log('📝 Adding test cases...');
        for (let i = 0; i < problem.testCases.length; i++) {
            const tc = problem.testCases[i];
            await prisma.testCase.create({
                data: {
                    input: JSON.stringify(tc.input),
                    output: JSON.stringify(tc.output),
                    isSample: tc.isSample || false,
                    isHidden: tc.isHidden || false,
                    order: i,
                    questionId: question.id,
                    explanation: problem.examples && problem.examples[i] ? problem.examples[i].explanation : null
                }
            });
        }

        console.log('\n✅ Successfully added "Binary Tree Inorder Traversal"!');

    } catch (error) {
        console.error('❌ Error adding problem:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

addInorderTraversal();

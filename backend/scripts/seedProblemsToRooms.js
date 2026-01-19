/**
 * Simple Seed Script: Add Problems to Existing Rooms
 * Run: node backend/scripts/seedProblemsToRooms.js
 */

const { PrismaClient } = require('@prisma/client');
const problemSet = require('../src/data/problemSet');

const prisma = new PrismaClient();

async function seedProblemsToRooms() {
    console.log('🌱 Adding problems to existing rooms...\n');

    try {
        // Get all rooms
        const rooms = await prisma.room.findMany();

        if (rooms.length === 0) {
            console.log('⚠️  No rooms found. Please create a room first.');
            return;
        }

        console.log(`✅ Found ${rooms.length} room(s)\n`);

        for (const room of rooms) {
            console.log(`📦 Processing room: ${room.name} (${room.code})`);

            // Check if room already has questions
            const existingQuestions = await prisma.question.count({
                where: { roomId: room.id }
            });

            if (existingQuestions > 0) {
                console.log(`⚠️  Room already has ${existingQuestions} questions, skipping...`);
                continue;
            }

            // Add all 5 problems to this room
            console.log(`📚 Adding ${problemSet.problems.length} problems...`);

            for (const problem of problemSet.problems) {
                // Create question
                const question = await prisma.question.create({
                    data: {
                        title: problem.title,
                        slug: problem.slug,
                        description: problem.description,
                        difficulty: problem.difficulty,
                        points: problem.points,
                        functionName: problem.functionName,
                        functionSignature: JSON.stringify(problem.functionSignature),
                        inputType: JSON.stringify(problem.inputType),
                        outputType: problem.outputType,
                        roomId: room.id
                    }
                });

                console.log(`  ✅ Added: ${question.title}`);

                // Add test cases
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
                            explanation: problem.examples[i]?.explanation || null
                        }
                    });
                }

                console.log(`    📝 Added ${problem.testCases.length} test cases`);
            }
        }

        console.log('\n✅ Seeding completed successfully!\n');

        const totalQuestions = await prisma.question.count();
        const totalTestCases = await prisma.testCase.count();

        console.log('📊 Summary:');
        console.log(`  Questions: ${totalQuestions}`);
        console.log(`  Test Cases: ${totalTestCases}`);
        console.log('\n🎉 Problems are now available in your rooms!\n');

    } catch (error) {
        console.error('❌ Error seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedProblemsToRooms()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

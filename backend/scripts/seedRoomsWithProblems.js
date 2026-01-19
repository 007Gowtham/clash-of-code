/**
 * Seed Script: Create Rooms with Problems
 * Run: node backend/scripts/seedRoomsWithProblems.js
 */

const { PrismaClient } = require('@prisma/client');
const problemSet = require('../src/data/problemSet');

const prisma = new PrismaClient();

async function seedRoomsWithProblems() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Create a default user if needed
        let user = await prisma.user.findFirst();

        if (!user) {
            console.log('📝 Creating default user...');
            user = await prisma.user.create({
                data: {
                    username: 'admin',
                    email: 'admin@example.com',
                    password: '$2b$10$YourHashedPasswordHere', // Replace with actual hashed password
                    isVerified: true
                }
            });
            console.log('✅ User created:', user.username);
        } else {
            console.log('✅ Using existing user:', user.username);
        }

        // Create 3 rooms with different difficulties
        const roomConfigs = [
            {
                name: 'Beginner Battle Arena',
                description: 'Perfect for beginners! Solve easy problems and build your foundation.',
                difficulty: 'EASY',
                maxTeams: 10,
                problemDifficulties: ['EASY']
            },
            {
                name: 'Intermediate Challenge',
                description: 'Ready for more? Tackle medium-level algorithmic challenges.',
                difficulty: 'MEDIUM',
                maxTeams: 8,
                problemDifficulties: ['EASY', 'MEDIUM']
            },
            {
                name: 'Advanced Coding Arena',
                description: 'For experienced coders. Mix of medium and hard problems.',
                difficulty: 'HARD',
                maxTeams: 6,
                problemDifficulties: ['MEDIUM', 'HARD']
            }
        ];

        for (const config of roomConfigs) {
            console.log(`\n📦 Creating room: ${config.name}`);

            // Check if room already exists
            const existingRoom = await prisma.room.findFirst({
                where: { name: config.name }
            });

            if (existingRoom) {
                console.log(`⚠️  Room "${config.name}" already exists, skipping...`);
                continue;
            }

            // Create room
            const roomCode = `ROOM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const room = await prisma.room.create({
                data: {
                    name: config.name,
                    description: config.description,
                    code: roomCode,
                    inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/room/join/${roomCode}`,
                    difficulty: config.difficulty,
                    maxTeams: config.maxTeams,
                    isActive: true,
                    admin: {
                        connect: { id: user.id }
                    }
                }
            });

            console.log(`✅ Room created: ${room.name} (${room.code})`);

            // Filter problems based on room difficulty
            const roomProblems = problemSet.problems.filter(p =>
                config.problemDifficulties.includes(p.difficulty)
            );

            console.log(`📚 Adding ${roomProblems.length} problems to room...`);

            // Add problems to room
            for (const problem of roomProblems) {
                // Create question
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
                        roomId: room.id
                    }
                });

                console.log(`  ✅ Added: ${question.title}`);

                // Add constraints
                for (let i = 0; i < problem.constraints.length; i++) {
                    await prisma.constraint.create({
                        data: {
                            content: problem.constraints[i],
                            order: i,
                            questionId: question.id
                        }
                    });
                }

                // Add hints
                for (let i = 0; i < problem.hints.length; i++) {
                    await prisma.hint.create({
                        data: {
                            content: problem.hints[i],
                            order: i,
                            questionId: question.id
                        }
                    });
                }

                // Add test cases
                for (let i = 0; i < problem.testCases.length; i++) {
                    const tc = problem.testCases[i];
                    await prisma.testCase.create({
                        data: {
                            input: tc.input,
                            output: tc.output,
                            isSample: tc.isSample || false,
                            isHidden: tc.isHidden || false,
                            order: i,
                            questionId: question.id,
                            explanation: problem.examples[i]?.explanation || null
                        }
                    });
                }

                console.log(`    📝 Added ${problem.constraints.length} constraints, ${problem.hints.length} hints, ${problem.testCases.length} test cases`);
            }
        }

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');

        const totalRooms = await prisma.room.count();
        const totalQuestions = await prisma.question.count();
        const totalTestCases = await prisma.testCase.count();

        console.log(`  Rooms: ${totalRooms}`);
        console.log(`  Questions: ${totalQuestions}`);
        console.log(`  Test Cases: ${totalTestCases}`);

        console.log('\n🎉 You can now access the rooms in your application!\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeding
seedRoomsWithProblems()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

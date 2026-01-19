/**
 * Seed Sample Question with Test Cases
 * Run with: node scripts/seedSampleQuestion.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSampleQuestion() {
    try {
        console.log('🌱 Seeding sample question with test cases...\n');

        // Find a room (or create one)
        let room = await prisma.room.findFirst({
            where: { status: 'ACTIVE' }
        });

        if (!room) {
            console.log('No active room found. Please create a room first.');
            return;
        }

        console.log(`📦 Using room: ${room.name} (${room.id})\n`);

        // Create question with test cases
        const question = await prisma.question.create({
            data: {
                roomId: room.id,
                title: "Two Sum",
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
                sampleInput: "nums = [2,7,11,15], target = 9",
                sampleOutput: "[0,1]",
                points: 100,
                difficulty: "EASY",
                timeLimit: 2000,
                memoryLimit: 256,

                // Create hints
                hints: {
                    create: [
                        {
                            content: "Try using a hash map to store numbers you've seen",
                            order: 0
                        },
                        {
                            content: "For each number, check if target - number exists in the hash map",
                            order: 1
                        }
                    ]
                },

                // Create constraints
                constraints: {
                    create: [
                        {
                            content: "2 <= nums.length <= 10^4",
                            order: 0
                        },
                        {
                            content: "-10^9 <= nums[i] <= 10^9",
                            order: 1
                        },
                        {
                            content: "-10^9 <= target <= 10^9",
                            order: 2
                        },
                        {
                            content: "Only one valid answer exists",
                            order: 3
                        }
                    ]
                },

                // Create test cases
                testCases: {
                    create: [
                        // Sample test cases (visible to users)
                        {
                            input: "nums = [2,7,11,15], target = 9",
                            output: "[0,1]",
                            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
                            isSample: true,
                            isHidden: false,
                            category: 'BASIC',
                            order: 0,
                            points: 10
                        },
                        {
                            input: "nums = [3,2,4], target = 6",
                            output: "[1,2]",
                            explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]",
                            isSample: true,
                            isHidden: false,
                            category: 'BASIC',
                            order: 1,
                            points: 10
                        },
                        {
                            input: "nums = [3,3], target = 6",
                            output: "[0,1]",
                            explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]",
                            isSample: true,
                            isHidden: false,
                            category: 'BASIC',
                            order: 2,
                            points: 10
                        },

                        // Hidden test cases
                        {
                            input: "nums = [1,5,3,7,9,2], target = 10",
                            output: "[0,4]",
                            explanation: "1 + 9 = 10",
                            isSample: false,
                            isHidden: true,
                            category: 'EDGE',
                            order: 3,
                            points: 15
                        },
                        {
                            input: "nums = [-1,-2,-3,-4,-5], target = -8",
                            output: "[2,4]",
                            explanation: "-3 + -5 = -8",
                            isSample: false,
                            isHidden: true,
                            category: 'EDGE',
                            order: 4,
                            points: 15
                        },
                        {
                            input: "nums = [1000000,2000000,3000000], target = 5000000",
                            output: "[1,2]",
                            explanation: "Large numbers test",
                            isSample: false,
                            isHidden: true,
                            category: 'LARGE',
                            order: 5,
                            points: 20
                        }
                    ]
                }
            },
            include: {
                hints: true,
                constraints: true,
                testCases: true
            }
        });

        console.log('✅ Question created successfully!\n');
        console.log(`📝 Question ID: ${question.id}`);
        console.log(`📚 Title: ${question.title}`);
        console.log(`💡 Hints: ${question.hints.length}`);
        console.log(`📋 Constraints: ${question.constraints.length}`);
        console.log(`🧪 Test Cases: ${question.testCases.length}`);
        console.log(`   - Sample: ${question.testCases.filter(tc => tc.isSample).length}`);
        console.log(`   - Hidden: ${question.testCases.filter(tc => tc.isHidden).length}`);
        console.log('\n✨ Done! You can now test the code execution with this question.\n');

    } catch (error) {
        console.error('❌ Error seeding question:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSampleQuestion();

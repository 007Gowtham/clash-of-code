require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function main() {
    console.log('🌱 Seeding Two Sum (Enhanced)...');

    const SLUG = 'two-sum-db-test';
    const ROOM_CODE = 'TEST_ROOM_TWOSUM';

    try {
        // 1. Find or Create User (Admin)
        let admin = await prisma.user.findFirst({ where: { email: 'admin@test.com' } });
        if (!admin) {
            admin = await prisma.user.create({
                data: {
                    email: 'admin@test.com',
                    username: 'TestAdmin',
                    password: 'password123',
                    role: 'USER'
                }
            });
            console.log('   ✓ Admin user created');
        } else {
            console.log('   ✓ Admin user found');
        }

        // 2. Find or Create Room
        let room = await prisma.room.findUnique({ where: { code: ROOM_CODE } });
        if (!room) {
            room = await prisma.room.create({
                data: {
                    name: 'Two Sum Test Room',
                    code: ROOM_CODE,
                    adminId: admin.id,
                    inviteLink: `http://localhost:3000/room/join/${ROOM_CODE}`
                }
            });
            console.log('   ✓ Room created');
        } else {
            console.log('   ✓ Room found');
        }

        // 3. Delete existing Two Sum Question if exists
        const existingQ = await prisma.question.findUnique({ where: { slug: SLUG } });
        if (existingQ) {
            await prisma.question.delete({ where: { id: existingQ.id } });
            console.log('   ✓ Deleted existing question');
        }

        // 4. Create Question
        const question = await prisma.question.create({
            data: {
                roomId: room.id,
                title: 'Two Sum',
                slug: SLUG,
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                difficulty: 'EASY',
                sampleInput: '[2,7,11,15]\n9',
                sampleOutput: '[0,1]',
                inputType: JSON.stringify(['array', 'int']),
                outputType: JSON.stringify(['array']),
                points: 100,
                functionName: 'twoSum',
                testCases: {
                    create: [
                        { input: '[2,7,11,15]\n9', output: '[0,1]', isSample: true, order: 1 },
                        { input: '[3,2,4]\n6', output: '[1,2]', isSample: true, order: 2 },
                        { input: '[3,3]\n6', output: '[0,1]', isSample: true, order: 3 },
                        { input: '[0,4,3,0]\n0', output: '[0,3]', isSample: false, order: 4 },
                        { input: '[-1,-2,-3,-4,-5]\n-8', output: '[2,4]', isSample: false, order: 5 },
                        { input: '[1,2,3,4,5]\n9', output: '[3,4]', isSample: false, order: 6 },
                        { input: '[10,20,35,40]\n50', output: '[0,3]', isSample: false, order: 7 },
                        { input: '[1,5,9]\n10', output: '[0,2]', isSample: false, order: 8 },
                        { input: '[100,200,300]\n500', output: '[1,2]', isSample: false, order: 9 },
                        { input: '[-50,50]\n0', output: '[0,1]', isSample: false, order: 10 }
                    ]
                }
            }
        });
        console.log(`   ✓ Question created (ID: ${question.id})`);

        // 5. Create Template (JavaScript)
        await prisma.questionTemplate.create({
            data: {
                questionId: question.id,
                language: 'javascript',
                headerCode: '// Two Sum Header',
                definition: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */',
                userFunction: 'function twoSum(nums, target) {\n    // Your code\n}',
                mainFunction: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
    if (lines.length < 2) return;
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
});`,
                boilerplate: 'function twoSum(nums, target) {\n}'
            }
        });
        console.log('   ✓ Template created (JavaScript)');

        console.log('\n✅ SEED_SUCCESS');
        console.log(`   Slug: ${SLUG}`);

    } catch (error) {
        console.error('❌ SEED_FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

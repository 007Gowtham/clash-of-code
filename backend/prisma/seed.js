const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [];
    for (let i = 1; i <= 15; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@test.com` },
            update: {},
            create: {
                email: `user${i}@test.com`,
                username: `TestUser${i}`,
                password: hashedPassword,
                isEmailVerified: true,
            },
        });
        users.push(user);
        console.log(`✓ Created user: ${user.username}`);
    }

    // Create 10 rooms with different configurations
    const rooms = [];
    const roomConfigs = [
        { name: 'Weekly DSA Challenge', privacy: 'PUBLIC', maxParticipants: 50, duration: 60 },
        { name: 'Advanced Algorithms Battle', privacy: 'PUBLIC', maxParticipants: 30, duration: 90 },
        { name: 'Beginner Friendly Contest', privacy: 'PUBLIC', maxParticipants: 100, duration: 45 },
        { name: 'Elite Coders Only', privacy: 'PRIVATE', maxParticipants: 20, duration: 120 },
        { name: 'Team Practice Session', privacy: 'PUBLIC', maxParticipants: 40, duration: 60 },
        { name: 'Interview Prep Marathon', privacy: 'PUBLIC', maxParticipants: 60, duration: 90 },
        { name: 'Private Study Group', privacy: 'PRIVATE', maxParticipants: 15, duration: 60 },
        { name: 'Speed Coding Challenge', privacy: 'PUBLIC', maxParticipants: 80, duration: 30 },
        { name: 'Graph Theory Special', privacy: 'PUBLIC', maxParticipants: 35, duration: 75 },
        { name: 'Dynamic Programming Deep Dive', privacy: 'PRIVATE', maxParticipants: 25, duration: 120 },
    ];

    for (let i = 0; i < roomConfigs.length; i++) {
        const config = roomConfigs[i];
        const creator = users[i % users.length];

        const room = await prisma.room.create({
            data: {
                name: config.name,
                code: `ROOM${String(i + 1).padStart(3, '0')}`,
                password: config.privacy === 'PRIVATE' ? 'test123' : null,
                inviteLink: `https://dsa-arena.com/join/ROOM${String(i + 1).padStart(3, '0')}`,
                adminId: creator.id,
                duration: config.duration,
                status: 'WAITING',
                settings: {
                    privacy: config.privacy,
                    maxParticipants: config.maxParticipants,
                    mode: 'team',
                    maxTeamSize: 4,
                    scoringMode: 'points',
                    difficulty: { easy: 2, medium: 2, hard: 1 }
                },
                startTime: new Date(Date.now() + 3600000), // 1 hour from now
                endTime: new Date(Date.now() + 3600000 + config.duration * 60000),
            },
        });
        rooms.push(room);
        console.log(`✓ Created room: ${room.name} (${room.privacy})`);

        // Create 3-5 teams per room
        const numTeams = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numTeams; j++) {
            const teamLeader = users[(i * numTeams + j) % users.length];
            const teamNames = [
                'Runtime Terror',
                'Segmentation Fault',
                'Null Pointers',
                'Stack Overflow',
                'Infinite Loop',
                'Binary Bandits',
                'Algorithm Avengers',
                'Code Crushers',
                'Debug Demons',
                'Syntax Squad',
            ];

            const isPrivate = j % 3 === 0;
            const teamCode = isPrivate ? `TEAM${String(i * 10 + j).padStart(3, '0')}` : null;

            const team = await prisma.team.create({
                data: {
                    name: `${teamNames[j % teamNames.length]} ${i + 1}`,
                    code: teamCode,
                    roomId: room.id,
                    leaderId: teamLeader.id,
                    visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
                    members: {
                        create: {
                            userId: teamLeader.id,
                        },
                    },
                },
            });

            // Add 1-2 additional members to some teams
            const numMembers = Math.floor(Math.random() * 3);
            for (let k = 0; k < numMembers; k++) {
                const memberUser = users[(i * numTeams + j + k + 1) % users.length];
                if (memberUser.id !== teamLeader.id) {
                    await prisma.teamMember.create({
                        data: {
                            teamId: team.id,
                            userId: memberUser.id,
                        },
                    });
                }
            }

            console.log(`  ✓ Created team: ${team.name}`);
        }
    }

    // Create sample questions for each room
    for (let i = 0; i < Math.min(3, rooms.length); i++) {
        const questionData = [
            {
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                difficulty: 'EASY',
                points: 100,
                constraints: '2 <= nums.length <= 10^4',
                sampleInput: 'nums = [2,7,11,15], target = 9',
                sampleOutput: '[0,1]',
                hint1: 'Try using a hash map to store values you\'ve seen',
                hint2: 'For each number, check if target - number exists in the map',
                testCases: [
                    { input: '[2,7,11,15]\n9', output: '[0,1]', isHidden: false },
                    { input: '[3,2,4]\n6', output: '[1,2]', isHidden: false },
                    { input: '[3,3]\n6', output: '[0,1]', isHidden: true },
                ],
            },
            {
                title: 'Reverse Linked List',
                description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
                difficulty: 'EASY',
                points: 150,
                constraints: 'The number of nodes in the list is the range [0, 5000]',
                sampleInput: 'head = [1,2,3,4,5]',
                sampleOutput: '[5,4,3,2,1]',
                hint1: 'Use three pointers: prev, current, and next',
                testCases: [
                    { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', isHidden: false },
                    { input: '[1,2]', output: '[2,1]', isHidden: false },
                    { input: '[]', output: '[]', isHidden: true },
                ],
            },
            {
                title: 'Binary Tree Level Order Traversal',
                description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
                difficulty: 'MEDIUM',
                points: 200,
                constraints: 'The number of nodes in the tree is in the range [0, 2000]',
                sampleInput: 'root = [3,9,20,null,null,15,7]',
                sampleOutput: '[[3],[9,20],[15,7]]',
                hint1: 'Use a queue for breadth-first search',
                testCases: [
                    { input: '[3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', isHidden: false },
                ],
            },
            {
                title: 'Longest Palindromic Substring',
                description: 'Given a string s, return the longest palindromic substring in s.',
                difficulty: 'MEDIUM',
                points: 250,
                constraints: '1 <= s.length <= 1000',
                sampleInput: 's = "babad"',
                sampleOutput: '"bab" or "aba"',
                hint1: 'Expand around center for each character',
                testCases: [
                    { input: 'babad', output: 'bab', isHidden: false },
                    { input: 'cbbd', output: 'bb', isHidden: false },
                ],
            },
            {
                title: 'Merge K Sorted Lists',
                description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
                difficulty: 'HARD',
                points: 400,
                constraints: 'k == lists.length, 0 <= k <= 10^4',
                sampleInput: 'lists = [[1,4,5],[1,3,4],[2,6]]',
                sampleOutput: '[1,1,2,3,4,4,5,6]',
                hint1: 'Use a min heap to efficiently get the smallest element',
                testCases: [
                    { input: '[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', isHidden: false },
                ],
            },
        ];

        for (const q of questionData) {
            const question = await prisma.question.create({
                data: {
                    ...q,
                    roomId: rooms[i].id,
                    testCases: q.testCases,
                },
            });
            console.log(`  ✓ Created question: ${question.title} for ${rooms[i].name}`);
        }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${rooms.length} rooms created`);
    console.log(`   - 15 questions created (5 per room for first 3 rooms)`);
    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Email: user1@test.com`);
    console.log(`   Password: password123`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

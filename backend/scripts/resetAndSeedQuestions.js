/**
 * Database Reset and Sample Questions Script
 * 
 * This script:
 * 1. Creates a sample room (or uses existing)
 * 2. Deletes all existing questions
 * 3. Inserts new sample questions with metadata-driven format specifications
 * 4. Includes proper test cases for each question
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🏠 Setting up sample room...');

    // Get or create a sample user
    let sampleUser = await prisma.user.findFirst();

    if (!sampleUser) {
        sampleUser = await prisma.user.create({
            data: {
                email: 'sample@example.com',
                password: '$2a$10$samplehashedpassword', // Placeholder hashed password
                username: 'sampleuser',
                isEmailVerified: true
            }
        });
        console.log(`✅ Created sample user: ${sampleUser.email}`);
    } else {
        console.log(`✅ Using existing user: ${sampleUser.email}`);
    }

    // Get or create a sample room
    let room = await prisma.room.findFirst({
        where: { name: 'Sample Problems Room' }
    });

    if (!room) {
        room = await prisma.room.create({
            data: {
                name: 'Sample Problems Room',
                code: 'SAMPLE001',
                inviteLink: 'sample-problems-room',
                adminId: sampleUser.id,
                status: 'WAITING'
            }
        });
        console.log(`✅ Created sample room: ${room.name}`);
    } else {
        console.log(`✅ Using existing room: ${room.name}`);
    }

    console.log('\n🗑️  Deleting all existing questions...');

    // Delete all questions (cascades to test cases)
    await prisma.testCase.deleteMany({});
    await prisma.question.deleteMany({});

    console.log('✅ All questions deleted\n');

    console.log('📝 Inserting new questions with metadata format...\n');

    const questions = [];

    // Question 1: Two Sum
    questions.push(await prisma.question.create({
        data: {
            roomId: room.id,
            title: 'Two Sum',
            description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9`,
            difficulty: 'EASY',
            sampleInput: '[2,7,11,15]\n9',
            sampleOutput: '[0,1]',
            functionName: 'twoSum',
            functionSignature: JSON.stringify({
                returnType: 'vector<int>',
                params: [
                    { type: 'vector<int>&', name: 'nums' },
                    { type: 'int', name: 'target' }
                ]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'nums',
                    baseType: 'array',
                    elementType: 'int',
                    parseStrategy: 'json_array',
                    inputFormatExample: '[2,7,11,15]'
                },
                {
                    paramIndex: 1,
                    paramName: 'target',
                    baseType: 'primitive',
                    elementType: 'int',
                    parseStrategy: 'primitive',
                    inputFormatExample: '9'
                }
            ],
            outputFormat: {
                baseType: 'array',
                elementType: 'int',
                serializeStrategy: 'json_array',
                outputFormatExample: '[0,1]'
            },
            inputType: '["array<int>", "int"]',
            outputType: '"array<int>"',
            testCases: {
                create: [
                    {
                        input: '[2,7,11,15]\n9',
                        output: '[0,1]',
                        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
                    },
                    {
                        input: '[3,2,4]\n6',
                        output: '[1,2]'
                    },
                    {
                        input: '[3,3]\n6',
                        output: '[0,1]'
                    }
                ]
            }
        }
    }));
    console.log(`✅ Created: Two Sum`);

    // Question 2: Reverse Linked List
    questions.push(await prisma.question.create({
        data: {
            roomId: room.id,
            title: 'Reverse Linked List',
            description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Example:**
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

**Constraints:**
- The number of nodes in the list is the range [0, 5000]
- -5000 <= Node.val <= 5000`,
            difficulty: 'EASY',
            sampleInput: '[1,2,3,4,5]',
            sampleOutput: '[5,4,3,2,1]',
            functionName: 'reverseList',
            functionSignature: JSON.stringify({
                returnType: 'ListNode*',
                params: [{ type: 'ListNode*', name: 'head' }]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'head',
                    baseType: 'linked_list',
                    parseStrategy: 'linked_list_array',
                    inputFormatExample: '[1,2,3,4,5]'
                }
            ],
            outputFormat: {
                baseType: 'linked_list',
                serializeStrategy: 'linked_list_array',
                outputFormatExample: '[5,4,3,2,1]'
            },
            inputType: '["linked_list"]',
            outputType: '"linked_list"',
            testCases: {
                create: [
                    {
                        input: '[1,2,3,4,5]',
                        output: '[5,4,3,2,1]'
                    },
                    {
                        input: '[1,2]',
                        output: '[2,1]'
                    },
                    {
                        input: '[]',
                        output: '[]'
                    }
                ]
            }
        }
    }));
    console.log(`✅ Created: Reverse Linked List`);

    // Question 3: Maximum Depth of Binary Tree
    questions.push(await prisma.question.create({
        data: {
            roomId: room.id,
            title: 'Maximum Depth of Binary Tree',
            description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Example:**
Input: root = [3,9,20,null,null,15,7]
Output: 3

**Constraints:**
- The number of nodes in the tree is in the range [0, 10^4]
- -100 <= Node.val <= 100`,
            difficulty: 'EASY',
            sampleInput: '[3,9,20,null,null,15,7]',
            sampleOutput: '3',
            functionName: 'maxDepth',
            functionSignature: JSON.stringify({
                returnType: 'int',
                params: [{ type: 'TreeNode*', name: 'root' }]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'root',
                    baseType: 'tree',
                    parseStrategy: 'tree_array',
                    inputFormatExample: '[3,9,20,null,null,15,7]'
                }
            ],
            outputFormat: {
                baseType: 'primitive',
                elementType: 'int',
                serializeStrategy: 'primitive',
                outputFormatExample: '3'
            },
            inputType: '["tree"]',
            outputType: '"int"',
            testCases: {
                create: [
                    {
                        input: '[3,9,20,null,null,15,7]',
                        output: '3'
                    },
                    {
                        input: '[1,null,2]',
                        output: '2'
                    },
                    {
                        input: '[]',
                        output: '0'
                    }
                ]
            }
        }
    }));
    console.log(`✅ Created: Maximum Depth of Binary Tree`);

    // Question 4: Search a 2D Matrix
    questions.push(await prisma.question.create({
        data: {
            roomId: room.id,
            title: 'Search a 2D Matrix',
            description: `Write an efficient algorithm that searches for a value target in an m x n integer matrix.

**Example:**
Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
Output: true

**Constraints:**
- m == matrix.length
- n == matrix[i].length
- 1 <= m, n <= 100`,
            difficulty: 'MEDIUM',
            sampleInput: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n3',
            sampleOutput: 'true',
            functionName: 'searchMatrix',
            functionSignature: JSON.stringify({
                returnType: 'bool',
                params: [
                    { type: 'vector<vector<int>>&', name: 'matrix' },
                    { type: 'int', name: 'target' }
                ]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'matrix',
                    baseType: 'matrix',
                    elementType: 'int',
                    parseStrategy: 'nested_array',
                    inputFormatExample: '[[1,3,5,7],[10,11,16,20]]'
                },
                {
                    paramIndex: 1,
                    paramName: 'target',
                    baseType: 'primitive',
                    elementType: 'int',
                    parseStrategy: 'primitive',
                    inputFormatExample: '3'
                }
            ],
            outputFormat: {
                baseType: 'primitive',
                elementType: 'boolean',
                serializeStrategy: 'primitive',
                outputFormatExample: 'true'
            },
            inputType: '["matrix<int>", "int"]',
            outputType: '"boolean"',
            testCases: {
                create: [
                    {
                        input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n3',
                        output: 'true'
                    },
                    {
                        input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n13',
                        output: 'false'
                    },
                    {
                        input: '[[1]]\n1',
                        output: 'true'
                    }
                ]
            }
        }
    }));
    console.log(`✅ Created: Search a 2D Matrix`);

    // Question 5: Valid Parentheses
    questions.push(await prisma.question.create({
        data: {
            roomId: room.id,
            title: 'Valid Parentheses',
            description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

**Example:**
Input: s = "()[]{}"
Output: true

**Constraints:**
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'`,
            difficulty: 'EASY',
            sampleInput: '()[]{}',
            sampleOutput: 'true',
            functionName: 'isValid',
            functionSignature: JSON.stringify({
                returnType: 'bool',
                params: [{ type: 'string', name: 's' }]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 's',
                    baseType: 'primitive',
                    elementType: 'string',
                    parseStrategy: 'primitive',
                    inputFormatExample: '()[]{}'
                }
            ],
            outputFormat: {
                baseType: 'primitive',
                elementType: 'boolean',
                serializeStrategy: 'primitive',
                outputFormatExample: 'true'
            },
            inputType: '["string"]',
            outputType: '"boolean"',
            testCases: {
                create: [
                    {
                        input: '()',
                        output: 'true'
                    },
                    {
                        input: '()[]{}',
                        output: 'true'
                    },
                    {
                        input: '(]',
                        output: 'false'
                    },
                    {
                        input: '([)]',
                        output: 'false'
                    }
                ]
            }
        }
    }));
    console.log(`✅ Created: Valid Parentheses`);

    console.log('\n📊 Summary:');
    const questionCount = await prisma.question.count();
    const testCaseCount = await prisma.testCase.count();
    console.log(`   Total Questions: ${questionCount}`);
    console.log(`   Total Test Cases: ${testCaseCount}`);
    console.log(`   Room: ${room.name} (${room.code})`);

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 Questions created with NEW metadata format:');
    console.log('   1. Two Sum (Array + Primitive)');
    console.log('   2. Reverse Linked List (Linked List)');
    console.log('   3. Maximum Depth of Binary Tree (Tree)');
    console.log('   4. Search a 2D Matrix (Matrix)');
    console.log('   5. Valid Parentheses (String)');
    console.log('\n🎯 All questions use metadata-driven format specifications!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

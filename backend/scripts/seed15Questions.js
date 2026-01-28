/**
 * Seed 15 Different Question Types with 4 Language Support
 * Run with: node scripts/seed15Questions.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questions = [
    // 1. Array - Two Pointers
    {
        title: "Two Sum",
        slug: "two-sum",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        sampleInput: "nums = [2,7,11,15], target = 9",
        sampleOutput: "[0,1]",
        difficulty: "EASY",
        points: 100,
        functionName: "twoSum",
        inputType: JSON.stringify(["array<int>", "int"]),
        outputType: JSON.stringify("array<int>"),
        functionSignature: JSON.stringify({
            returnType: "vector<int>",
            params: [
                { name: "nums", type: "vector<int>" },
                { name: "target", type: "int" }
            ]
        }),
        hints: [
            "Try using a hash map to store numbers you've seen",
            "For each number, check if target - number exists in the hash map"
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists"
        ],
        testCases: [
            { input: "[2,7,11,15]\n9", output: "[0,1]", isSample: true, category: 'BASIC', points: 10 },
            { input: "[3,2,4]\n6", output: "[1,2]", isSample: true, category: 'BASIC', points: 10 },
            { input: "[3,3]\n6", output: "[0,1]", isSample: false, category: 'EDGE', points: 15 },
            { input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]", isSample: false, isHidden: true, category: 'EDGE', points: 20 }
        ]
    },

    // 2. Binary Tree - Level Order Traversal
    {
        title: "Binary Tree Level Order Traversal",
        slug: "binary-tree-level-order",
        description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
        sampleInput: "root = [3,9,20,null,null,15,7]",
        sampleOutput: "[[3],[9,20],[15,7]]",
        difficulty: "MEDIUM",
        points: 150,
        functionName: "levelOrder",
        inputType: JSON.stringify("tree"),
        outputType: JSON.stringify("array<array<int>>"),
        functionSignature: JSON.stringify({
            returnType: "vector<vector<int>>",
            params: [{ name: "root", type: "TreeNode*" }]
        }),
        hints: [
            "Use a queue to perform BFS traversal",
            "Track the level size before processing each level"
        ],
        constraints: [
            "The number of nodes in the tree is in the range [0, 2000]",
            "-1000 <= Node.val <= 1000"
        ],
        testCases: [
            { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[1]", output: "[[1]]", isSample: true, category: 'EDGE', points: 10 },
            { input: "[]", output: "[]", isSample: false, category: 'EDGE', points: 10 },
            { input: "[1,2,3,4,5,6,7]", output: "[[1],[2,3],[4,5,6,7]]", isSample: false, isHidden: true, category: 'BASIC', points: 20 }
        ]
    },

    // 3. Linked List - Reverse
    {
        title: "Reverse Linked List",
        slug: "reverse-linked-list",
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        sampleInput: "head = [1,2,3,4,5]",
        sampleOutput: "[5,4,3,2,1]",
        difficulty: "EASY",
        points: 100,
        functionName: "reverseList",
        inputType: JSON.stringify("linked_list"),
        outputType: JSON.stringify("linked_list"),
        functionSignature: JSON.stringify({
            returnType: "ListNode*",
            params: [{ name: "head", type: "ListNode*" }]
        }),
        hints: [
            "Use three pointers: prev, current, and next",
            "Iterate through the list and reverse the links"
        ],
        constraints: [
            "The number of nodes in the list is the range [0, 5000]",
            "-5000 <= Node.val <= 5000"
        ],
        testCases: [
            { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[1,2]", output: "[2,1]", isSample: true, category: 'BASIC', points: 10 },
            { input: "[]", output: "[]", isSample: false, category: 'EDGE', points: 10 },
            { input: "[1]", output: "[1]", isSample: false, isHidden: true, category: 'EDGE', points: 15 }
        ]
    },

    // 4. String - Palindrome
    {
        title: "Valid Palindrome",
        slug: "valid-palindrome",
        description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.`,
        sampleInput: "s = \"A man, a plan, a canal: Panama\"",
        sampleOutput: "true",
        difficulty: "EASY",
        points: 80,
        functionName: "isPalindrome",
        inputType: JSON.stringify("string"),
        outputType: JSON.stringify("bool"),
        functionSignature: JSON.stringify({
            returnType: "bool",
            params: [{ name: "s", type: "string" }]
        }),
        hints: [
            "Use two pointers from both ends",
            "Skip non-alphanumeric characters"
        ],
        constraints: [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters"
        ],
        testCases: [
            { input: "A man, a plan, a canal: Panama", output: "true", isSample: true, category: 'BASIC', points: 10 },
            { input: "race a car", output: "false", isSample: true, category: 'BASIC', points: 10 },
            { input: " ", output: "true", isSample: false, category: 'EDGE', points: 15 },
            { input: "ab_a", output: "true", isSample: false, isHidden: true, category: 'SPECIAL', points: 20 }
        ]
    },

    // 5. Matrix - Spiral Order
    {
        title: "Spiral Matrix",
        slug: "spiral-matrix",
        description: `Given an m x n matrix, return all elements of the matrix in spiral order.`,
        sampleInput: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        sampleOutput: "[1,2,3,6,9,8,7,4,5]",
        difficulty: "MEDIUM",
        points: 150,
        functionName: "spiralOrder",
        inputType: JSON.stringify("array<array<int>>"),
        outputType: JSON.stringify("array<int>"),
        functionSignature: JSON.stringify({
            returnType: "vector<int>",
            params: [{ name: "matrix", type: "vector<vector<int>>" }]
        }),
        hints: [
            "Use four boundaries: top, bottom, left, right",
            "Move in spiral order and update boundaries"
        ],
        constraints: [
            "m == matrix.length",
            "n == matrix[i].length",
            "1 <= m, n <= 10"
        ],
        testCases: [
            { input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[[1]]", output: "[1]", isSample: false, category: 'EDGE', points: 10 },
            { input: "[[1,2],[3,4]]", output: "[1,2,4,3]", isSample: false, isHidden: true, category: 'BASIC', points: 20 }
        ]
    },

    // 6. Binary Search
    {
        title: "Binary Search",
        slug: "binary-search",
        description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
        sampleInput: "nums = [-1,0,3,5,9,12], target = 9",
        sampleOutput: "4",
        difficulty: "EASY",
        points: 100,
        functionName: "search",
        inputType: JSON.stringify(["array<int>", "int"]),
        outputType: JSON.stringify("int"),
        functionSignature: JSON.stringify({
            returnType: "int",
            params: [
                { name: "nums", type: "vector<int>" },
                { name: "target", type: "int" }
            ]
        }),
        hints: [
            "Use two pointers: left and right",
            "Compare middle element with target"
        ],
        constraints: [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All the integers in nums are unique",
            "nums is sorted in ascending order"
        ],
        testCases: [
            { input: "[-1,0,3,5,9,12]\n9", output: "4", isSample: true, category: 'BASIC', points: 10 },
            { input: "[-1,0,3,5,9,12]\n2", output: "-1", isSample: true, category: 'BASIC', points: 10 },
            { input: "[5]\n5", output: "0", isSample: false, category: 'EDGE', points: 15 },
            { input: "[1,2,3,4,5,6,7,8,9,10]\n1", output: "0", isSample: false, isHidden: true, category: 'EDGE', points: 20 }
        ]
    },

    // 7. Dynamic Programming - Climbing Stairs
    {
        title: "Climbing Stairs",
        slug: "climbing-stairs",
        description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
        sampleInput: "n = 3",
        sampleOutput: "3",
        difficulty: "EASY",
        points: 100,
        functionName: "climbStairs",
        inputType: JSON.stringify("int"),
        outputType: JSON.stringify("int"),
        functionSignature: JSON.stringify({
            returnType: "int",
            params: [{ name: "n", type: "int" }]
        }),
        hints: [
            "This is a Fibonacci sequence problem",
            "Use dynamic programming or recursion with memoization"
        ],
        constraints: [
            "1 <= n <= 45"
        ],
        testCases: [
            { input: "2", output: "2", isSample: true, category: 'BASIC', points: 10 },
            { input: "3", output: "3", isSample: true, category: 'BASIC', points: 10 },
            { input: "1", output: "1", isSample: false, category: 'EDGE', points: 10 },
            { input: "5", output: "8", isSample: false, isHidden: true, category: 'BASIC', points: 20 }
        ]
    },

    // 8. Graph - Number of Islands
    {
        title: "Number of Islands",
        slug: "number-of-islands",
        description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
        sampleInput: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        sampleOutput: "3",
        difficulty: "MEDIUM",
        points: 150,
        functionName: "numIslands",
        inputType: JSON.stringify("array<array<char>>"),
        outputType: JSON.stringify("int"),
        functionSignature: JSON.stringify({
            returnType: "int",
            params: [{ name: "grid", type: "vector<vector<char>>" }]
        }),
        hints: [
            "Use DFS or BFS to explore each island",
            "Mark visited cells to avoid counting them again"
        ],
        constraints: [
            "m == grid.length",
            "n == grid[i].length",
            "1 <= m, n <= 300"
        ],
        testCases: [
            { input: "[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]", output: "3", isSample: true, category: 'BASIC', points: 15 },
            { input: "[[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]", output: "1", isSample: true, category: 'BASIC', points: 15 },
            { input: "[[1]]", output: "1", isSample: false, category: 'EDGE', points: 10 },
            { input: "[[0]]", output: "0", isSample: false, isHidden: true, category: 'EDGE', points: 15 }
        ]
    },

    // 9. Stack - Valid Parentheses
    {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.`,
        sampleInput: "s = \"()[]{}\"",
        sampleOutput: "true",
        difficulty: "EASY",
        points: 100,
        functionName: "isValid",
        inputType: JSON.stringify("string"),
        outputType: JSON.stringify("bool"),
        functionSignature: JSON.stringify({
            returnType: "bool",
            params: [{ name: "s", type: "string" }]
        }),
        hints: [
            "Use a stack to track opening brackets",
            "When you encounter a closing bracket, check if it matches the top of the stack"
        ],
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        testCases: [
            { input: "()", output: "true", isSample: true, category: 'BASIC', points: 10 },
            { input: "()[]{}", output: "true", isSample: true, category: 'BASIC', points: 10 },
            { input: "(]", output: "false", isSample: false, category: 'BASIC', points: 15 },
            { input: "([)]", output: "false", isSample: false, isHidden: true, category: 'SPECIAL', points: 20 }
        ]
    },

    // 10. Hash Map - Contains Duplicate
    {
        title: "Contains Duplicate",
        slug: "contains-duplicate",
        description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
        sampleInput: "nums = [1,2,3,1]",
        sampleOutput: "true",
        difficulty: "EASY",
        points: 80,
        functionName: "containsDuplicate",
        inputType: JSON.stringify("array<int>"),
        outputType: JSON.stringify("bool"),
        functionSignature: JSON.stringify({
            returnType: "bool",
            params: [{ name: "nums", type: "vector<int>" }]
        }),
        hints: [
            "Use a hash set to track seen numbers",
            "If you encounter a number already in the set, return true"
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9"
        ],
        testCases: [
            { input: "[1,2,3,1]", output: "true", isSample: true, category: 'BASIC', points: 10 },
            { input: "[1,2,3,4]", output: "false", isSample: true, category: 'BASIC', points: 10 },
            { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true", isSample: false, category: 'BASIC', points: 15 },
            { input: "[1]", output: "false", isSample: false, isHidden: true, category: 'EDGE', points: 15 }
        ]
    },

    // 11. Sorting - Merge Intervals
    {
        title: "Merge Intervals",
        slug: "merge-intervals",
        description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
        sampleInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        sampleOutput: "[[1,6],[8,10],[15,18]]",
        difficulty: "MEDIUM",
        points: 150,
        functionName: "merge",
        inputType: JSON.stringify("array<array<int>>"),
        outputType: JSON.stringify("array<array<int>>"),
        functionSignature: JSON.stringify({
            returnType: "vector<vector<int>>",
            params: [{ name: "intervals", type: "vector<vector<int>>" }]
        }),
        hints: [
            "Sort intervals by start time",
            "Merge overlapping intervals as you iterate"
        ],
        constraints: [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= starti <= endi <= 10^4"
        ],
        testCases: [
            { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[[1,4],[4,5]]", output: "[[1,5]]", isSample: true, category: 'EDGE', points: 15 },
            { input: "[[1,4],[0,4]]", output: "[[0,4]]", isSample: false, category: 'EDGE', points: 15 },
            { input: "[[1,4],[2,3]]", output: "[[1,4]]", isSample: false, isHidden: true, category: 'SPECIAL', points: 20 }
        ]
    },

    // 12. Backtracking - Generate Parentheses
    {
        title: "Generate Parentheses",
        slug: "generate-parentheses",
        description: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.`,
        sampleInput: "n = 3",
        sampleOutput: "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
        difficulty: "MEDIUM",
        points: 150,
        functionName: "generateParenthesis",
        inputType: JSON.stringify("int"),
        outputType: JSON.stringify("array<string>"),
        functionSignature: JSON.stringify({
            returnType: "vector<string>",
            params: [{ name: "n", type: "int" }]
        }),
        hints: [
            "Use backtracking to build valid combinations",
            "Track the count of open and close parentheses"
        ],
        constraints: [
            "1 <= n <= 8"
        ],
        testCases: [
            { input: "3", output: "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", isSample: true, category: 'BASIC', points: 15 },
            { input: "1", output: "[\"()\"]", isSample: true, category: 'EDGE', points: 10 },
            { input: "2", output: "[\"(())\",\"()()\"]", isSample: false, category: 'BASIC', points: 15 },
            { input: "4", output: "[\"(((())))\",\"((()()))\",\"((())())\",\"((()))()\",\"(()(()))\",\"(()()())\",\"(()())()\",\"(())(())\",\"(())()()\",\"()((()))\",\"()(()())\",\"()(())()\",\"()()(())\",\"()()()()\"]", isSample: false, isHidden: true, category: 'LARGE', points: 25 }
        ]
    },

    // 13. Greedy - Best Time to Buy and Sell Stock
    {
        title: "Best Time to Buy and Sell Stock",
        slug: "best-time-to-buy-sell-stock",
        description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
        sampleInput: "prices = [7,1,5,3,6,4]",
        sampleOutput: "5",
        difficulty: "EASY",
        points: 100,
        functionName: "maxProfit",
        inputType: JSON.stringify("array<int>"),
        outputType: JSON.stringify("int"),
        functionSignature: JSON.stringify({
            returnType: "int",
            params: [{ name: "prices", type: "vector<int>" }]
        }),
        hints: [
            "Track the minimum price seen so far",
            "Calculate profit for each day and keep track of maximum"
        ],
        constraints: [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ],
        testCases: [
            { input: "[7,1,5,3,6,4]", output: "5", isSample: true, category: 'BASIC', points: 10 },
            { input: "[7,6,4,3,1]", output: "0", isSample: true, category: 'EDGE', points: 10 },
            { input: "[1,2]", output: "1", isSample: false, category: 'EDGE', points: 15 },
            { input: "[2,4,1]", output: "2", isSample: false, isHidden: true, category: 'SPECIAL', points: 20 }
        ]
    },

    // 14. Binary Tree - Maximum Depth
    {
        title: "Maximum Depth of Binary Tree",
        slug: "max-depth-binary-tree",
        description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
        sampleInput: "root = [3,9,20,null,null,15,7]",
        sampleOutput: "3",
        difficulty: "EASY",
        points: 100,
        functionName: "maxDepth",
        inputType: JSON.stringify("tree"),
        outputType: JSON.stringify("int"),
        functionSignature: JSON.stringify({
            returnType: "int",
            params: [{ name: "root", type: "TreeNode*" }]
        }),
        hints: [
            "Use recursion to calculate depth of left and right subtrees",
            "Return 1 + max(left_depth, right_depth)"
        ],
        constraints: [
            "The number of nodes in the tree is in the range [0, 10^4]",
            "-100 <= Node.val <= 100"
        ],
        testCases: [
            { input: "[3,9,20,null,null,15,7]", output: "3", isSample: true, category: 'BASIC', points: 10 },
            { input: "[1,null,2]", output: "2", isSample: true, category: 'BASIC', points: 10 },
            { input: "[]", output: "0", isSample: false, category: 'EDGE', points: 15 },
            { input: "[1]", output: "1", isSample: false, isHidden: true, category: 'EDGE', points: 15 }
        ]
    },

    // 15. Linked List - Merge Two Sorted Lists
    {
        title: "Merge Two Sorted Lists",
        slug: "merge-two-sorted-lists",
        description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
        sampleInput: "list1 = [1,2,4], list2 = [1,3,4]",
        sampleOutput: "[1,1,2,3,4,4]",
        difficulty: "EASY",
        points: 100,
        functionName: "mergeTwoLists",
        inputType: JSON.stringify(["linked_list", "linked_list"]),
        outputType: JSON.stringify("linked_list"),
        functionSignature: JSON.stringify({
            returnType: "ListNode*",
            params: [
                { name: "list1", type: "ListNode*" },
                { name: "list2", type: "ListNode*" }
            ]
        }),
        hints: [
            "Use a dummy node to simplify the merge process",
            "Compare values from both lists and append the smaller one"
        ],
        constraints: [
            "The number of nodes in both lists is in the range [0, 50]",
            "-100 <= Node.val <= 100",
            "Both list1 and list2 are sorted in non-decreasing order"
        ],
        testCases: [
            { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", isSample: true, category: 'BASIC', points: 15 },
            { input: "[]\n[]", output: "[]", isSample: true, category: 'EDGE', points: 10 },
            { input: "[]\n[0]", output: "[0]", isSample: false, category: 'EDGE', points: 15 },
            { input: "[1,2,3]\n[4,5,6]", output: "[1,2,3,4,5,6]", isSample: false, isHidden: true, category: 'BASIC', points: 20 }
        ]
    }
];

async function seed15Questions() {
    try {
        console.log('🌱 Seeding 15 Question Types with 4 Language Support...\\n');

        // Find or create a room
        let room = await prisma.room.findFirst({
            where: { status: 'ACTIVE' }
        });

        if (!room) {
            // Create a default room
            const admin = await prisma.user.findFirst();
            if (!admin) {
                console.error('❌ No users found. Please create a user first.');
                return;
            }

            room = await prisma.room.create({
                data: {
                    name: 'DSA Practice Room',
                    code: 'DSA-' + Math.random().toString(36).substring(7).toUpperCase(),
                    inviteLink: 'https://clash.dev/join/' + Math.random().toString(36).substring(7),
                    adminId: admin.id,
                    visibility: 'PUBLIC',
                    status: 'ACTIVE',
                    listed: true
                }
            });
            console.log(`✅ Created room: ${room.name} (${room.id})\\n`);
        } else {
            console.log(`📦 Using existing room: ${room.name} (${room.id})\\n`);
        }

        // Seed each question
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            console.log(`\\n[${i + 1}/15] 📝 Creating: ${q.title}`);

            // Check if question already exists
            const existing = await prisma.question.findUnique({
                where: { slug: q.slug }
            });

            if (existing) {
                console.log(`   ⚠️  Question already exists, skipping...`);
                continue;
            }

            // Create question with all related data
            const question = await prisma.question.create({
                data: {
                    roomId: room.id,
                    title: q.title,
                    slug: q.slug,
                    description: q.description,
                    sampleInput: q.sampleInput,
                    sampleOutput: q.sampleOutput,
                    points: q.points,
                    difficulty: q.difficulty,
                    timeLimit: 2000,
                    memoryLimit: 256,
                    functionName: q.functionName,
                    inputType: q.inputType,
                    outputType: q.outputType,
                    functionSignature: q.functionSignature,

                    // Create hints
                    hints: {
                        create: q.hints.map((hint, idx) => ({
                            content: hint,
                            order: idx
                        }))
                    },

                    // Create constraints
                    constraints: {
                        create: q.constraints.map((constraint, idx) => ({
                            content: constraint,
                            order: idx
                        }))
                    },

                    // Create test cases
                    testCases: {
                        create: q.testCases.map((tc, idx) => ({
                            input: tc.input,
                            output: tc.output,
                            explanation: tc.explanation || '',
                            isSample: tc.isSample,
                            isHidden: tc.isHidden || false,
                            category: tc.category,
                            order: idx,
                            points: tc.points,
                            timeLimit: 2000,
                            memoryLimit: 256
                        }))
                    }
                },
                include: {
                    hints: true,
                    constraints: true,
                    testCases: true
                }
            });

            console.log(`   ✅ Created successfully!`);
            console.log(`      - Hints: ${question.hints.length}`);
            console.log(`      - Constraints: ${question.constraints.length}`);
            console.log(`      - Test Cases: ${question.testCases.length}`);
        }

        console.log('\\n\\n✅ All 15 questions seeded successfully!');
        console.log('\\n📊 Summary:');
        console.log('   - Total Questions: 15');
        console.log('   - Data Structures Covered:');
        console.log('     • Arrays (Two Sum, Binary Search, etc.)');
        console.log('     • Binary Trees (Level Order, Max Depth)');
        console.log('     • Linked Lists (Reverse, Merge)');
        console.log('     • Strings (Palindrome, Parentheses)');
        console.log('     • Matrix (Spiral Order)');
        console.log('     • Graphs (Number of Islands)');
        console.log('     • Hash Maps (Contains Duplicate)');
        console.log('     • Stack (Valid Parentheses)');
        console.log('   - Algorithm Types:');
        console.log('     • Two Pointers, Binary Search, DFS/BFS');
        console.log('     • Dynamic Programming, Greedy, Backtracking');
        console.log('     • Sorting, Hash Maps, Stack');
        console.log('\\n🚀 Next Step: Run "node scripts/generateTemplatesFor15.js" to generate templates for all 4 languages!\\n');

    } catch (error) {
        console.error('❌ Error seeding questions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed15Questions();

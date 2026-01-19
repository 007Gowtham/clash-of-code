/**
 * Comprehensive Problem Set for Coding Platform
 * 5 Problems with Examples and Test Cases
 */

module.exports = {
    problems: [
        // ============================================================================
        // PROBLEM 1: Two Sum (Easy)
        // ============================================================================
        {
            id: 'two-sum',
            slug: 'two-sum',
            title: 'Two Sum',
            difficulty: 'EASY',
            points: 50,
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',

            functionName: 'twoSum',
            functionSignature: JSON.stringify({
                returnType: 'vector<int>',
                params: [
                    { type: 'vector<int>&', name: 'nums' },
                    { type: 'int', name: 'target' }
                ]
            }),

            inputType: JSON.stringify(['array', 'int']),
            outputType: 'array',

            examples: [
                {
                    input: { nums: [2, 7, 11, 15], target: 9 },
                    output: [0, 1],
                    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                    input: { nums: [3, 2, 4], target: 6 },
                    output: [1, 2],
                    explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
                },
                {
                    input: { nums: [3, 3], target: 6 },
                    output: [0, 1],
                    explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
                }
            ],

            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists'
            ],

            hints: [
                'Use a hash map to store complements',
                'For each number, check if target - number exists in the map'
            ],

            testCases: [
                { input: [[2, 7, 11, 15], 9], output: [0, 1], isSample: true },
                { input: [[3, 2, 4], 6], output: [1, 2], isSample: true },
                { input: [[3, 3], 6], output: [0, 1], isSample: true },
                { input: [[1, 2, 3, 4, 5], 9], output: [3, 4], isHidden: true },
                { input: [[5, 75, 25], 100], output: [1, 2], isHidden: true },
                { input: [[-1, -2, -3, -4, -5], -8], output: [2, 4], isHidden: true },
                { input: [[0, 4, 3, 0], 0], output: [0, 3], isHidden: true },
                { input: [[1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 2], 6], output: [5, 11], isHidden: true },
                { input: [[230, 863, 916, 585, 981, 404, 316, 785, 88, 12, 70, 435, 384, 778, 887, 755, 740, 337, 86, 92], 542], output: [4, 8], isHidden: true },
                { input: [[2, 5, 5, 11], 10], output: [1, 2], isHidden: true }
            ]
        },

        // ============================================================================
        // PROBLEM 2: Valid Parentheses (Easy)
        // ============================================================================
        {
            id: 'valid-parentheses',
            slug: 'valid-parentheses',
            title: 'Valid Parentheses',
            difficulty: 'EASY',
            points: 50,
            description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',

            functionName: 'isValid',
            functionSignature: JSON.stringify({
                returnType: 'bool',
                params: [{ type: 'string', name: 's' }]
            }),

            inputType: 'string',
            outputType: 'boolean',

            examples: [
                { input: '()', output: true, explanation: 'The string is valid.' },
                { input: '()[]{}', output: true, explanation: 'All brackets are properly closed.' },
                { input: '(]', output: false, explanation: 'Mismatched brackets.' }
            ],

            constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\''],
            hints: ['Use a stack to track opening brackets', 'Pop from stack when you find a closing bracket'],

            testCases: [
                { input: ['()'], output: true, isSample: true },
                { input: ['()[]{}'], output: true, isSample: true },
                { input: ['(]'], output: false, isSample: true },
                { input: ['([)]'], output: false, isHidden: true },
                { input: ['{[]}'], output: true, isHidden: true },
                { input: ['(((('], output: false, isHidden: true },
                { input: ['))))'], output: false, isHidden: true },
                { input: ['()()()()'], output: true, isHidden: true },
                { input: ['(([]){})'], output: true, isHidden: true },
                { input: ['([{}])'], output: true, isHidden: true },
                { input: ['(((((((((())))))))))'], output: true, isHidden: true },
                { input: ['{{{{{{{{{{}}}}}}}}}}}'], output: false, isHidden: true }
            ]
        },

        // ============================================================================
        // PROBLEM 3: Merge Two Sorted Lists (Easy)
        // ============================================================================
        {
            id: 'merge-two-sorted-lists',
            slug: 'merge-two-sorted-lists',
            title: 'Merge Two Sorted Lists',
            difficulty: 'EASY',
            points: 50,
            description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.',

            functionName: 'mergeTwoLists',
            functionSignature: JSON.stringify({
                returnType: 'ListNode*',
                params: [
                    { type: 'ListNode*', name: 'list1' },
                    { type: 'ListNode*', name: 'list2' }
                ]
            }),

            inputType: JSON.stringify(['linked_list', 'linked_list']),
            outputType: 'linked_list',

            examples: [
                { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, output: [1, 1, 2, 3, 4, 4] },
                { input: { list1: [], list2: [] }, output: [] },
                { input: { list1: [], list2: [0] }, output: [0] }
            ],

            constraints: ['The number of nodes in both lists is in the range [0, 50]', '-100 <= Node.val <= 100'],
            hints: ['Use a dummy node to simplify the merge process', 'Compare values and link nodes accordingly'],

            testCases: [
                { input: [[1, 2, 4], [1, 3, 4]], output: [1, 1, 2, 3, 4, 4], isSample: true },
                { input: [[], []], output: [], isSample: true },
                { input: [[], [0]], output: [0], isSample: true },
                { input: [[1], [2]], output: [1, 2], isHidden: true },
                { input: [[2], [1]], output: [1, 2], isHidden: true },
                { input: [[1, 3, 5], [2, 4, 6]], output: [1, 2, 3, 4, 5, 6], isHidden: true },
                { input: [[1, 2, 3], [4, 5, 6]], output: [1, 2, 3, 4, 5, 6], isHidden: true },
                { input: [[5, 10, 15], [2, 3, 20]], output: [2, 3, 5, 10, 15, 20], isHidden: true }
            ]
        },

        // ============================================================================
        // PROBLEM 4: Binary Tree Level Order Traversal (Medium)
        // ============================================================================
        {
            id: 'binary-tree-level-order',
            slug: 'binary-tree-level-order-traversal',
            title: 'Binary Tree Level Order Traversal',
            difficulty: 'MEDIUM',
            points: 100,
            description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',

            functionName: 'levelOrder',
            functionSignature: JSON.stringify({
                returnType: 'vector<vector<int>>',
                params: [{ type: 'TreeNode*', name: 'root' }]
            }),

            inputType: 'tree',
            outputType: 'array',

            examples: [
                { input: [3, 9, 20, null, null, 15, 7], output: [[3], [9, 20], [15, 7]] },
                { input: [1], output: [[1]] },
                { input: [], output: [] }
            ],

            constraints: ['The number of nodes in the tree is in the range [0, 2000]', '-1000 <= Node.val <= 1000'],
            hints: ['Use BFS with a queue', 'Track level size before processing each level'],

            testCases: [
                { input: [[3, 9, 20, null, null, 15, 7]], output: [[3], [9, 20], [15, 7]], isSample: true },
                { input: [[1]], output: [[1]], isSample: true },
                { input: [[]], output: [], isSample: true },
                { input: [[1, 2, 3, 4, 5]], output: [[1], [2, 3], [4, 5]], isHidden: true },
                { input: [[1, 2, 2, 3, 4, 4, 3]], output: [[1], [2, 2], [3, 4, 4, 3]], isHidden: true },
                { input: [[1, 2, 3, 4, null, null, 5]], output: [[1], [2, 3], [4, 5]], isHidden: true },
                { input: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], output: [[5], [4, 8], [11, 13, 4], [7, 2, 1]], isHidden: true }
            ]
        },

        // ============================================================================
        // PROBLEM 5: Longest Substring Without Repeating Characters (Medium)
        // ============================================================================
        {
            id: 'longest-substring',
            slug: 'longest-substring-without-repeating-characters',
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'MEDIUM',
            points: 100,
            description: 'Given a string s, find the length of the longest substring without repeating characters.',

            functionName: 'lengthOfLongestSubstring',
            functionSignature: JSON.stringify({
                returnType: 'int',
                params: [{ type: 'string', name: 's' }]
            }),

            inputType: 'string',
            outputType: 'int',

            examples: [
                { input: 'abcabcbb', output: 3, explanation: 'The answer is "abc", with the length of 3.' },
                { input: 'bbbbb', output: 1, explanation: 'The answer is "b", with the length of 1.' },
                { input: 'pwwkew', output: 3, explanation: 'The answer is "wke", with the length of 3.' }
            ],

            constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
            hints: ['Use sliding window technique', 'Track characters with a hash map'],

            testCases: [
                { input: ['abcabcbb'], output: 3, isSample: true },
                { input: ['bbbbb'], output: 1, isSample: true },
                { input: ['pwwkew'], output: 3, isSample: true },
                { input: [''], output: 0, isHidden: true },
                { input: [' '], output: 1, isHidden: true },
                { input: ['au'], output: 2, isHidden: true },
                { input: ['dvdf'], output: 3, isHidden: true },
                { input: ['anviaj'], output: 5, isHidden: true },
                { input: ['abcdefghijklmnopqrstuvwxyz'], output: 26, isHidden: true },
                { input: ['aab'], output: 2, isHidden: true },
                { input: ['cdd'], output: 2, isHidden: true },
                { input: ['abba'], output: 2, isHidden: true }
            ]
        },
        // ============================================================================
        // PROBLEM 6: Binary Tree Inorder Traversal (Easy)
        // ============================================================================
        {
            id: 'binary-tree-inorder-traversal',
            slug: 'binary-tree-inorder-traversal',
            title: 'Binary Tree Inorder Traversal',
            difficulty: 'EASY',
            points: 50,
            description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',

            functionName: 'inorderTraversal',
            functionSignature: JSON.stringify({
                returnType: 'vector<int>',
                params: [{ type: 'TreeNode*', name: 'root' }]
            }),

            inputType: 'tree',
            outputType: 'array',

            examples: [
                { input: [1, null, 2, 3], output: [1, 3, 2] },
                { input: [], output: [] },
                { input: [1], output: [1] }
            ],

            constraints: ['The number of nodes in the tree is in the range [0, 100]', '-100 <= Node.val <= 100'],
            hints: ['Inorder traversal visits nodes in the order: Left, Root, Right', 'Use recursion or a stack'],

            testCases: [
                { input: [[1, null, 2, 3]], output: [1, 3, 2], isSample: true },
                { input: [[]], output: [], isSample: true },
                { input: [[1]], output: [1], isSample: true },
                { input: [[1, 2]], output: [2, 1], isHidden: true },
                { input: [[1, null, 2]], output: [1, 2], isHidden: true }
            ]
        }
    ]
};

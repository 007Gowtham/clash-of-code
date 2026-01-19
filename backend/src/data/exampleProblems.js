/**
 * Example Problem Definitions
 * Industrial-grade coding problems with semantic validation
 */

module.exports = {
    /**
     * Problem 1: Binary Tree Level Order Traversal
     * Classic tree problem demonstrating semantic validation
     */
    binaryTreeLevelOrder: {
        id: 1,
        slug: 'binary-tree-level-order-traversal',
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'MEDIUM',
        points: 100,
        category: 'Trees',

        description: `
Given the root of a binary tree, return the level order traversal of its nodes' values. 
(i.e., from left to right, level by level).

**Example 1:**
\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
\`\`\`

**Example 2:**
\`\`\`
Input: root = [1]
Output: [[1]]
\`\`\`

**Example 3:**
\`\`\`
Input: root = []
Output: []
\`\`\`

**Constraints:**
- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000
`,

        functionName: 'levelOrder',
        functionSignature: {
            params: [
                { name: 'root', type: 'Optional[TreeNode]' }
            ],
            returnType: 'List[List[int]]'
        },

        inputType: 'tree',
        outputType: 'nested_array',

        templates: {
            python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        # Write your code here
        pass
`,
            javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    // Write your code here
};
`
        },

        testCases: [
            {
                id: 1,
                input: [],
                output: [],
                isSample: true,
                isHidden: false,
                category: 'edge_case',
                explanation: 'Empty tree should return empty array',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 2,
                input: [3, 9, 20, null, null, 15, 7],
                output: [[3], [9, 20], [15, 7]],
                isSample: true,
                isHidden: false,
                category: 'basic',
                explanation: 'Standard level order traversal',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 3,
                input: [1],
                output: [[1]],
                isSample: true,
                isHidden: false,
                category: 'edge_case',
                explanation: 'Single node tree',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 4,
                input: [1, 2, 3, 4, 5, 6, 7],
                output: [[1], [2, 3], [4, 5, 6, 7]],
                isSample: false,
                isHidden: true,
                category: 'complete_tree',
                explanation: 'Complete binary tree',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 5,
                input: [1, 2, null, 3, null, 4, null, 5],
                output: [[1], [2], [3], [4], [5]],
                isSample: false,
                isHidden: true,
                category: 'skewed_tree',
                explanation: 'Left-skewed tree',
                timeoutMs: 1000,
                memoryLimitMb: 128
            }
        ],

        hints: [
            'Use a queue to perform breadth-first search',
            'Track the level size before processing each level',
            'Process nodes level by level using the queue'
        ],

        constraints: [
            'The number of nodes in the tree is in the range [0, 2000]',
            '-1000 <= Node.val <= 1000'
        ]
    },

    /**
     * Problem 2: Reverse Linked List
     * Demonstrates linked list parsing and validation
     */
    reverseLinkedList: {
        id: 2,
        slug: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'EASY',
        points: 50,
        category: 'Linked Lists',

        description: `
Given the head of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

**Example 3:**
\`\`\`
Input: head = []
Output: []
\`\`\`

**Constraints:**
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000
`,

        functionName: 'reverseList',
        functionSignature: {
            params: [
                { name: 'head', type: 'Optional[ListNode]' }
            ],
            returnType: 'Optional[ListNode]'
        },

        inputType: 'linked_list',
        outputType: 'linked_list',

        templates: {
            python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        pass
`
        },

        testCases: [
            {
                id: 1,
                input: [1, 2, 3, 4, 5],
                output: [5, 4, 3, 2, 1],
                isSample: true,
                isHidden: false,
                category: 'basic',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 2,
                input: [1, 2],
                output: [2, 1],
                isSample: true,
                isHidden: false,
                category: 'basic',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 3,
                input: [],
                output: [],
                isSample: true,
                isHidden: false,
                category: 'edge_case',
                timeoutMs: 1000,
                memoryLimitMb: 128
            }
        ]
    },

    /**
     * Problem 3: Two Sum
     * Classic array problem with multiple valid solutions
     */
    twoSum: {
        id: 3,
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'EASY',
        points: 50,
        category: 'Arrays',

        description: `
Given an array of integers nums and an integer target, return indices of the two numbers 
such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the 
same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.
`,

        functionName: 'twoSum',
        functionSignature: {
            params: [
                { name: 'nums', type: 'List[int]' },
                { name: 'target', type: 'int' }
            ],
            returnType: 'List[int]'
        },

        inputType: ['int_array', 'int'],
        outputType: 'int_array',

        templates: {
            python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass
`
        },

        testCases: [
            {
                id: 1,
                input: [[2, 7, 11, 15], 9],
                output: [0, 1],
                isSample: true,
                isHidden: false,
                category: 'basic',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 2,
                input: [[3, 2, 4], 6],
                output: [1, 2],
                isSample: true,
                isHidden: false,
                category: 'basic',
                timeoutMs: 1000,
                memoryLimitMb: 128
            },
            {
                id: 3,
                input: [[3, 3], 6],
                output: [0, 1],
                isSample: true,
                isHidden: false,
                category: 'duplicates',
                timeoutMs: 1000,
                memoryLimitMb: 128
            }
        ]
    },

    /**
     * Problem 4: Clone Graph
     * Advanced graph problem with complex data structures
     */
    cloneGraph: {
        id: 4,
        slug: 'clone-graph',
        title: 'Clone Graph',
        difficulty: 'MEDIUM',
        points: 120,
        category: 'Graphs',

        description: `
Given a reference of a node in a connected undirected graph, return a deep copy (clone) 
of the graph.

Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

**Test case format:**
For simplicity, each node's value is the same as the node's index (1-indexed). 
For example, the first node with val == 1, the second node with val == 2, and so on. 
The graph is represented in the test case using an adjacency list.

**Example 1:**
\`\`\`
Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]
\`\`\`

**Constraints:**
- The number of nodes in the graph is in the range [0, 100].
- 1 <= Node.val <= 100
- Node.val is unique for each node.
`,

        functionName: 'cloneGraph',
        functionSignature: {
            params: [
                { name: 'node', type: 'Node' }
            ],
            returnType: 'Node'
        },

        inputType: 'graph_adj_list',
        outputType: 'graph_adj_list',

        testCases: [
            {
                id: 1,
                input: [[2, 4], [1, 3], [2, 4], [1, 3]],
                output: [[2, 4], [1, 3], [2, 4], [1, 3]],
                isSample: true,
                isHidden: false,
                category: 'basic',
                timeoutMs: 2000,
                memoryLimitMb: 256
            },
            {
                id: 2,
                input: [[]],
                output: [[]],
                isSample: true,
                isHidden: false,
                category: 'edge_case',
                timeoutMs: 1000,
                memoryLimitMb: 128
            }
        ]
    }
};

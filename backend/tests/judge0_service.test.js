const Judge0Service = require('../src/services/judge0Service');

// ============================================================================
// PROBLEM 1: TWO SUM
// ============================================================================
const TWO_SUM_PROBLEM = {
  title: "Two Sum",
  difficulty: "EASY",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,

  diagram: `
Array: [2, 7, 11, 15]  Target: 9
        ↓   ↓
      Index 0 + Index 1 = 2 + 7 = 9 ✓
Return: [0, 1]`,

  // JavaScript version
  javascript: {
    headerCode: `// Two Sum - Find indices of two numbers that add up to target`,
    userFunction: `function twoSum(nums, target) {
    // Your code here
}`,
    definition: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */`,
    mainFunction: `
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
});`,
    solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`
  },

  // C++ version
  cpp: {
    headerCode: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
using namespace std;`,
    userFunction: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
}`,
    definition: `// Find two indices that sum to target
// @param nums: vector of integers
// @param target: target sum
// @return: vector containing two indices`,
    mainFunction: `
int main() {
    string line;
    vector<int> nums;
    int target;
    
    // Read array
    getline(cin, line);
    line = line.substr(1, line.length() - 2); // Remove [ ]
    stringstream ss(line);
    string num;
    while (getline(ss, num, ',')) {
        nums.push_back(stoi(num));
    }
    
    // Read target
    cin >> target;
    
    // Get result
    vector<int> result = twoSum(nums, target);
    
    // Output
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    
    return 0;
}`,
    solution: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`
  },

  // Python version
  python: {
    headerCode: `# Two Sum - Find indices of two numbers that add up to target
import json
import sys`,
    userFunction: `def twoSum(nums, target):
    # Your code here
    pass`,
    definition: `"""
Find two indices that sum to target
Args:
    nums: List[int] - array of integers
    target: int - target sum
Returns:
    List[int] - two indices
"""`,
    mainFunction: `
# Read input
lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0])
target = int(lines[1])

# Get result
result = twoSum(nums, target)

# Output
print(json.dumps(result))`,
    solution: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
  },

  testCases: [
    { name: "Example 1", nums: [2, 7, 11, 15], target: 9, expectedOutput: "[0,1]", input: "[2,7,11,15]\n9" },
    { name: "Example 2", nums: [3, 2, 4], target: 6, expectedOutput: "[1,2]", input: "[3,2,4]\n6" },
    { name: "Example 3", nums: [3, 3], target: 6, expectedOutput: "[0,1]", input: "[3,3]\n6" }
  ]
};

// ============================================================================
// PROBLEM 2: LINKED LIST CYCLE
// ============================================================================
const LINKED_LIST_CYCLE_PROBLEM = {
  title: "Linked List Cycle",
  difficulty: "EASY",
  description: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.

Return true if there is a cycle in the linked list. Otherwise, return false.

Example 1:
Input: head = [3,2,0,-4], pos = 1
Output: true
Explanation: There is a cycle where the tail connects to the 1st node (0-indexed).

Example 2:
Input: head = [1,2], pos = 0
Output: true

Example 3:
Input: head = [1], pos = -1
Output: false`,

  diagram: `
With Cycle:     No Cycle:
  3→2→0→-4       1→2→3→NULL
    ↑_____|`,

  javascript: {
    headerCode: `// Linked List Cycle Detection`,
    userFunction: `function hasCycle(head) {
    // Your code here
}`,
    definition: `/**
 * @param {ListNode} head
 * @return {boolean}
 */`,
    mainFunction: `
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const values = JSON.parse(lines[0]);
    const pos = parseInt(lines[1]);
    
    if (values.length === 0) {
        console.log('false');
        return;
    }
    
    const nodes = values.map(v => new ListNode(v));
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
    }
    
    if (pos >= 0 && pos < nodes.length) {
        nodes[nodes.length - 1].next = nodes[pos];
    }
    
    const result = hasCycle(nodes[0]);
    console.log(result.toString());
});`,
    solution: `function hasCycle(head) {
    let slow = head;
    let fast = head;
    
    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            return true;
        }
    }
    
    return false;
}`
  },

  cpp: {
    headerCode: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};`,
    userFunction: `bool hasCycle(ListNode *head) {
    // Your code here
}`,
    definition: `// Detect if linked list has a cycle
// @param head: pointer to list head
// @return: true if cycle exists, false otherwise`,
    mainFunction: `
int main() {
    string line;
    vector<int> values;
    int pos;
    
    // Read values
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    stringstream ss(line);
    string num;
    while (getline(ss, num, ',')) {
        values.push_back(stoi(num));
    }
    
    // Read position
    cin >> pos;
    
    if (values.empty()) {
        cout << "false" << endl;
        return 0;
    }
    
    // Build list
    vector<ListNode*> nodes;
    for (int val : values) {
        nodes.push_back(new ListNode(val));
    }
    for (int i = 0; i < nodes.size() - 1; i++) {
        nodes[i]->next = nodes[i + 1];
    }
    
    // Create cycle
    if (pos >= 0 && pos < nodes.size()) {
        nodes[nodes.size() - 1]->next = nodes[pos];
    }
    
    bool result = hasCycle(nodes[0]);
    cout << (result ? "true" : "false") << endl;
    
    return 0;
}`,
    solution: `bool hasCycle(ListNode *head) {
    ListNode *slow = head;
    ListNode *fast = head;
    
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        
        if (slow == fast) {
            return true;
        }
    }
    
    return false;
}`
  },

  python: {
    headerCode: `# Linked List Cycle Detection
import json
import sys

class ListNode:
    def __init__(self, val):
        self.val = val
        self.next = None`,
    userFunction: `def hasCycle(head):
    # Your code here
    pass`,
    definition: `"""
Detect if linked list has a cycle
Args:
    head: ListNode - head of the linked list
Returns:
    bool - True if cycle exists, False otherwise
"""`,
    mainFunction: `
# Read input
lines = sys.stdin.read().strip().split('\\n')
values = json.loads(lines[0])
pos = int(lines[1])

if not values:
    print('false')
    sys.exit(0)

# Build list
nodes = [ListNode(val) for val in values]
for i in range(len(nodes) - 1):
    nodes[i].next = nodes[i + 1]

# Create cycle
if 0 <= pos < len(nodes):
    nodes[-1].next = nodes[pos]

result = hasCycle(nodes[0])
print(str(result).lower())`,
    solution: `def hasCycle(head):
    slow = head
    fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True
    
    return False`
  },

  testCases: [
    { name: "Cycle at position 1", values: [3,2,0,-4], pos: 1, expectedOutput: "true", input: "[3,2,0,-4]\n1" },
    { name: "Cycle at position 0", values: [1,2], pos: 0, expectedOutput: "true", input: "[1,2]\n0" },
    { name: "No cycle", values: [1], pos: -1, expectedOutput: "false", input: "[1]\n-1" }
  ]
};

// ============================================================================
// PROBLEM 3: BINARY TREE INORDER TRAVERSAL
// ============================================================================
const BINARY_TREE_INORDER_PROBLEM = {
  title: "Binary Tree Inorder Traversal",
  difficulty: "EASY",
  description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in the order: Left → Root → Right

Example 1:
Input: root = [1,null,2,3]
Output: [1,3,2]

Example 2:
Input: root = []
Output: []

Example 3:
Input: root = [1]
Output: [1]`,

  diagram: `
Tree:      1
            \\
             2
            /
           3
           
Inorder: Left→Root→Right = [1,3,2]`,

  javascript: {
    headerCode: `// Binary Tree Inorder Traversal`,
    userFunction: `function inorderTraversal(root) {
    // Your code here
}`,
    definition: `/**
 * @param {TreeNode} root
 * @return {number[]}
 */`,
    mainFunction: `
class TreeNode {
    constructor(val, left, right) {
        this.val = (val===undefined ? 0 : val);
        this.left = (left===undefined ? null : left);
        this.right = (right===undefined ? null : right);
    }
}

function buildTree(values) {
    if (!values || values.length === 0) return null;
    
    const root = new TreeNode(values[0]);
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < values.length) {
        const node = queue.shift();
        
        if (i < values.length && values[i] !== null) {
            node.left = new TreeNode(values[i]);
            queue.push(node.left);
        }
        i++;
        
        if (i < values.length && values[i] !== null) {
            node.right = new TreeNode(values[i]);
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const values = JSON.parse(lines[0]);
    const root = buildTree(values);
    const result = inorderTraversal(root);
    console.log(JSON.stringify(result));
});`,
    solution: `function inorderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node === null) return;
        traverse(node.left);
        result.push(node.val);
        traverse(node.right);
    }
    
    traverse(root);
    return result;
}`
  },

  cpp: {
    headerCode: `#include <iostream>
#include <vector>
#include <queue>
#include <sstream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};`,
    userFunction: `vector<int> inorderTraversal(TreeNode* root) {
    // Your code here
}`,
    definition: `// Perform inorder traversal of binary tree
// @param root: pointer to tree root
// @return: vector of node values in inorder`,
    mainFunction: `
TreeNode* buildTree(vector<string>& values) {
    if (values.empty() || values[0] == "null") return NULL;
    
    TreeNode* root = new TreeNode(stoi(values[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    
    while (!q.empty() && i < values.size()) {
        TreeNode* node = q.front();
        q.pop();
        
        if (i < values.size() && values[i] != "null") {
            node->left = new TreeNode(stoi(values[i]));
            q.push(node->left);
        }
        i++;
        
        if (i < values.size() && values[i] != "null") {
            node->right = new TreeNode(stoi(values[i]));
            q.push(node->right);
        }
        i++;
    }
    
    return root;
}

int main() {
    string line;
    getline(cin, line);
    
    line = line.substr(1, line.length() - 2);
    vector<string> values;
    stringstream ss(line);
    string val;
    
    while (getline(ss, val, ',')) {
        values.push_back(val);
    }
    
    TreeNode* root = buildTree(values);
    vector<int> result = inorderTraversal(root);
    
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}`,
    solution: `void traverse(TreeNode* node, vector<int>& result) {
    if (node == NULL) return;
    traverse(node->left, result);
    result.push_back(node->val);
    traverse(node->right, result);
}

vector<int> inorderTraversal(TreeNode* root) {
    vector<int> result;
    traverse(root, result);
    return result;
}`
  },

  python: {
    headerCode: `# Binary Tree Inorder Traversal
import json
import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right`,
    userFunction: `def inorderTraversal(root):
    # Your code here
    pass`,
    definition: `"""
Perform inorder traversal of binary tree
Args:
    root: TreeNode - root of the binary tree
Returns:
    List[int] - node values in inorder
"""`,
    mainFunction: `
def build_tree(values):
    if not values or values[0] is None:
        return None
    
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    
    while queue and i < len(values):
        node = queue.popleft()
        
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    
    return root

# Read input
line = sys.stdin.read().strip()
values = json.loads(line)

root = build_tree(values)
result = inorderTraversal(root)

print(json.dumps(result))`,
    solution: `def inorderTraversal(root):
    result = []
    
    def traverse(node):
        if not node:
            return
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)
    
    traverse(root)
    return result`
  },

  testCases: [
    { name: "Example 1", values: [1,null,2,3], expectedOutput: "[1,3,2]", input: "[1,null,2,3]" },
    { name: "Empty tree", values: [], expectedOutput: "[]", input: "[]" },
    { name: "Single node", values: [1], expectedOutput: "[1]", input: "[1]" }
  ]
};

// ============================================================================
// TEST RUNNER
// ============================================================================

const PROBLEMS = {
  'two-sum': TWO_SUM_PROBLEM,
  'linked-list-cycle': LINKED_LIST_CYCLE_PROBLEM,
  'binary-tree-inorder': BINARY_TREE_INORDER_PROBLEM
};

const LANGUAGE_IDS = {
  javascript: 63,
  cpp: 54,
  python: 71
};

function buildCompleteCode(problem, language) {
  const lang = problem[language];
  return `${lang.headerCode}

${lang.definition}
${lang.solution}

${lang.mainFunction}`;
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   JUDGE0 SERVICE - MULTI-LANGUAGE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════\n');

  const service = new Judge0Service();

  // Verify service
  console.log('🔍 Verifying service methods...');
  if (typeof service.submitCode !== 'function') throw new Error('submitCode method missing');
  if (typeof service.getSubmissionResult !== 'function') throw new Error('getSubmissionResult method missing');
  if (typeof service.pollUntilComplete !== 'function') throw new Error('pollUntilComplete method missing');
  console.log('✅ All service methods verified\n');

  // Mock API
  console.log('🔧 Setting up Mock Judge0 API...\n');
  let currentTestCase = null;
  let pollCount = 0;

  service.client.post = async (url, payload) => {
    if (url === '/submissions') {
      return { data: { token: `token-${Date.now()}` } };
    }
    throw new Error(`Unexpected POST to ${url}`);
  };

  service.client.get = async (url) => {
    if (url.includes('/submissions/')) {
      pollCount++;
      
      if (pollCount === 1) {
        return {
          data: {
            status: { id: 2, description: 'Processing' },
            token: url.split('/').pop()
          }
        };
      } else {
        pollCount = 0;
        return {
          data: {
            status: { id: 3, description: 'Accepted' },
            stdout: currentTestCase.expectedOutput + '\n',
            stderr: null,
            time: '0.042',
            memory: 2048,
            token: url.split('/').pop()
          }
        };
      }
    }
    throw new Error(`Unexpected GET to ${url}`);
  };

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  // Test each problem
  for (const [problemKey, problem] of Object.entries(PROBLEMS)) {
    console.log('\n' + '═'.repeat(60));
    console.log(`   PROBLEM: ${problem.title} (${problem.difficulty})`);
    console.log('═'.repeat(60));
    console.log(problem.diagram);

    // Test each language
    for (const language of ['javascript', 'cpp', 'python']) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Language: ${language.toUpperCase()}`);
      console.log('─'.repeat(60));

      const completeCode = buildCompleteCode(problem, language);
      
      // Test each test case
      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        currentTestCase = testCase;
        totalTests++;

        console.log(`\nTest ${i + 1}: ${testCase.name}`);
        console.log(`Expected: ${testCase.expectedOutput}`);

        try {
          const result = await service.execute(
            completeCode,
            language,
            testCase.input,
            testCase.expectedOutput
          );

          const normalizedOutput = result.output.trim();
          const normalizedExpected = testCase.expectedOutput.trim();

          if (result.verdict !== 'ACCEPTED' || normalizedOutput !== normalizedExpected) {
            throw new Error(`Mismatch: got ${normalizedOutput}`);
          }

          console.log(`✅ PASSED (${result.time}ms)`);
          totalPassed++;

        } catch (error) {
          console.error(`❌ FAILED: ${error.message}`);
          totalFailed++;
        }
      }
    }
  }

  // Final summary
  console.log('\n\n' + '═'.repeat(60));
  console.log('   FINAL TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));

  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED ⚠️\n');
    process.exit(1);
  }
}

// Export
module.exports = {
  PROBLEMS,
  buildCompleteCode,
  runTests
};

// Run if main
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  });
}
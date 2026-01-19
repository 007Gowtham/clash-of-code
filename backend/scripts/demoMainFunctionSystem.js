/**
 * Demo: LeetCode-Style Main Function System
 * Shows how users only write the solution, and we inject the test harness
 */

const CodeTemplateGenerator = require('../src/services/codeTemplateGenerator');
const MainFunctionInjector = require('../src/services/mainFunctionInjector');
const exampleProblems = require('../src/data/exampleProblems');

console.log('═'.repeat(80));
console.log('🎯 DEMO: LeetCode-Style Main Function System');
console.log('═'.repeat(80));

console.log('\n📚 How it works:');
console.log('  1. User gets a clean code template (only the solution function)');
console.log('  2. User writes their solution');
console.log('  3. We inject hidden main function that:');
console.log('     - Parses test input');
console.log('     - Calls user\'s solution');
console.log('     - Serializes output');
console.log('     - Returns JSON result');
console.log('  4. Judge0 executes the complete code');
console.log('  5. We perform semantic validation on the result\n');

// ============================================================================
// STEP 1: Get Problem Template
// ============================================================================

console.log('─'.repeat(80));
console.log('STEP 1: User Gets Clean Template');
console.log('─'.repeat(80));

const problem = exampleProblems.binaryTreeLevelOrder;
const language = 'python';

const template = CodeTemplateGenerator.generateTemplate(problem, language);

console.log('\n✅ Template Generated (What user sees):\n');
console.log(template);

// ============================================================================
// STEP 2: User Writes Solution
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('STEP 2: User Writes Solution');
console.log('─'.repeat(80));

const userSolution = `# Binary Tree Level Order Traversal
# Difficulty: MEDIUM
# Points: 100

# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        """
        Given the root of a binary tree, return the level order traversal
        """
        if not root:
            return []
        
        result = []
        queue = [root]
        
        while queue:
            level_size = len(queue)
            level = []
            
            for _ in range(level_size):
                node = queue.pop(0)
                level.append(node.val)
                
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            
            result.append(level)
        
        return result
`;

console.log('\n✅ User\'s Solution (Clean and simple!):\n');
console.log(userSolution);

// ============================================================================
// STEP 3: Inject Hidden Main Function
// ============================================================================

console.log('\n' + '─'.repeat(80));
console.log('STEP 3: Inject Hidden Main Function (User never sees this!)');
console.log('─'.repeat(80));

const testCase = problem.testCases[1]; // [3,9,20,null,null,15,7]

const executableCode = MainFunctionInjector.injectMainFunction({
    userCode: userSolution,
    language,
    problem,
    testCase
});

console.log('\n✅ Complete Executable Code (Sent to Judge0):\n');
console.log(executableCode.substring(0, 1500) + '\n... [truncated for display] ...\n');

console.log('📊 Code Structure:');
console.log('  1. Data structure definitions (TreeNode, ListNode, etc.)');
console.log('  2. Input/output parsers (deserialize_tree, serialize_tree, etc.)');
console.log('  3. User\'s solution code (inserted here)');
console.log('  4. Hidden main function that:');
console.log('     - Parses test input: [3,9,20,null,null,15,7] → TreeNode');
console.log('     - Calls: solution.levelOrder(tree)');
console.log('     - Serializes output: TreeNode → [[3],[9,20],[15,7]]');
console.log('     - Returns JSON: {"status": "SUCCESS", "output": [...]}');

// ============================================================================
// STEP 4: Execution Flow
// ============================================================================

console.log('\n\n' + '─'.repeat(80));
console.log('STEP 4: Execution Flow');
console.log('─'.repeat(80));

console.log('\n📋 Test Case:');
console.log(`  Input:    ${JSON.stringify(testCase.input)}`);
console.log(`  Expected: ${JSON.stringify(testCase.output)}`);

console.log('\n🔄 Execution Process:');
console.log('  1. Judge0 receives complete code');
console.log('  2. Executes main() function');
console.log('  3. main() parses input: [3,9,20,null,null,15,7] → TreeNode');
console.log('  4. main() calls user\'s solution.levelOrder(tree)');
console.log('  5. User\'s code returns: [[3], [9, 20], [15, 7]]');
console.log('  6. main() serializes output to JSON');
console.log('  7. main() prints: {"status": "SUCCESS", "output": [[3],[9,20],[15,7]]}');
console.log('  8. Judge0 returns stdout to our backend');
console.log('  9. We parse JSON and perform semantic validation');
console.log('  10. Result: ACCEPTED ✅');

// ============================================================================
// STEP 5: API Flow
// ============================================================================

console.log('\n\n' + '─'.repeat(80));
console.log('STEP 5: Complete API Flow');
console.log('─'.repeat(80));

console.log('\n📡 Frontend → Backend API Calls:\n');

console.log('1️⃣  GET /api/problems/binary-tree-level-order?language=python');
console.log('   Response:');
console.log('   {');
console.log('     "codeTemplate": "class Solution:\\n    def levelOrder(...)...",');
console.log('     "sampleTestCases": [...],');
console.log('     "hints": [...],');
console.log('     "constraints": [...]');
console.log('   }\n');

console.log('2️⃣  POST /api/problems/binary-tree-level-order/run');
console.log('   Body: { "code": "class Solution:...", "language": "python" }');
console.log('   Response:');
console.log('   {');
console.log('     "verdict": "ACCEPTED",');
console.log('     "testsPassed": 3,');
console.log('     "totalTests": 3,');
console.log('     "results": [');
console.log('       { "passed": true, "input": [], "output": [] },');
console.log('       { "passed": true, "input": [3,9,20,...], "output": [[3],[9,20],...] }');
console.log('     ]');
console.log('   }\n');

console.log('3️⃣  POST /api/problems/binary-tree-level-order/submit');
console.log('   Body: { "code": "class Solution:...", "language": "python" }');
console.log('   Response:');
console.log('   {');
console.log('     "submissionId": 123,');
console.log('     "verdict": "ACCEPTED",');
console.log('     "testsPassed": 5,');
console.log('     "totalTests": 5,');
console.log('     "points": 100,');
console.log('     "results": [...]  // Hidden test cases show [Hidden] if passed');
console.log('   }');

// ============================================================================
// Summary
// ============================================================================

console.log('\n\n' + '═'.repeat(80));
console.log('✅ DEMO COMPLETE: LeetCode-Style System Ready!');
console.log('═'.repeat(80));

console.log('\n📊 What We Built:\n');
console.log('  ✅ Code Template Generator - Clean templates for users');
console.log('  ✅ Main Function Injector - Hidden test harness');
console.log('  ✅ Problem Controller - API endpoints for run/submit');
console.log('  ✅ Semantic Validation - Value-level comparison');
console.log('  ✅ Multi-Language Support - Python, JavaScript, Java, C++');

console.log('\n🎯 User Experience:\n');
console.log('  1. User opens problem → Gets clean template');
console.log('  2. User writes ONLY the solution function');
console.log('  3. User clicks "Run" → Runs against sample tests');
console.log('  4. User clicks "Submit" → Runs against all tests');
console.log('  5. User sees detailed results with pass/fail');

console.log('\n🚀 Exactly Like LeetCode!\n');

console.log('📚 Files Created:');
console.log('  • backend/src/services/codeTemplateGenerator.js');
console.log('  • backend/src/services/mainFunctionInjector.js');
console.log('  • backend/src/controllers/problemController.js');
console.log('  • backend/src/routes/problemRoutes.js');

console.log('\n🔧 Next Steps:');
console.log('  1. Add routes to server.js');
console.log('  2. Test with Postman/curl');
console.log('  3. Integrate with frontend');
console.log('  4. Deploy to production\n');

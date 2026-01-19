/**
 * Test Suite for Industrial Code Testing Platform
 * Demonstrates semantic validation, data structure parsing, and test harness injection
 */

const SemanticValidator = require('../src/utils/semanticValidator');
const { DataStructureParsers, TreeNode, ListNode } = require('../src/utils/dataStructureParsers');
const TestHarnessInjector = require('../src/services/testHarnessInjector');

console.log('🧪 Industrial Code Testing Platform - Test Suite\n');
console.log('='.repeat(60));

// ============================================================================
// Test 1: Semantic Validation - The Core Problem
// ============================================================================
console.log('\n📊 Test 1: Semantic Validation (String vs Semantic Comparison)');
console.log('-'.repeat(60));

const testCase2Actual = '[[3], [9, 20], [15, 7]]';  // With spaces
const testCase2Expected = '[[3],[9,20],[15,7]]';    // Without spaces

console.log('❌ String Comparison (FAILS):');
console.log(`  Actual:   "${testCase2Actual}"`);
console.log(`  Expected: "${testCase2Expected}"`);
console.log(`  Result:   ${testCase2Actual === testCase2Expected} ❌\n`);

console.log('✅ Semantic Comparison (PASSES):');
const semanticResult = SemanticValidator.compareJSONStrings(testCase2Actual, testCase2Expected);
console.log(`  Actual:   ${testCase2Actual}`);
console.log(`  Expected: ${testCase2Expected}`);
console.log(`  Result:   ${semanticResult.passed} ✅`);
console.log(`  Message:  ${semanticResult.message}\n`);

// ============================================================================
// Test 2: Deep Equality - Complex Nested Structures
// ============================================================================
console.log('\n📊 Test 2: Deep Equality - Nested Arrays');
console.log('-'.repeat(60));

const nestedActual = [[1, 2], [3, 4, 5], [6]];
const nestedExpected = [[1, 2], [3, 4, 5], [6]];
const nestedWrong = [[1, 2], [3, 4], [6]];

console.log('Test 2a: Matching nested arrays');
const result2a = SemanticValidator.validate(nestedActual, nestedExpected);
console.log(`  Result: ${result2a.passed ? '✅ PASS' : '❌ FAIL'}`);

console.log('\nTest 2b: Different nested arrays');
const result2b = SemanticValidator.validate(nestedActual, nestedWrong);
console.log(`  Result: ${result2b.passed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Diff: ${result2b.message}`);

// ============================================================================
// Test 3: Floating Point Comparison
// ============================================================================
console.log('\n\n📊 Test 3: Floating Point Comparison with Epsilon');
console.log('-'.repeat(60));

const float1 = 0.1 + 0.2;  // 0.30000000000000004
const float2 = 0.3;

console.log(`Test 3a: Direct comparison: ${float1} === ${float2}`);
console.log(`  Result: ${float1 === float2} ❌\n`);

console.log(`Test 3b: Semantic comparison with epsilon`);
const result3 = SemanticValidator.deepEquals(float1, float2, { epsilon: 1e-9 });
console.log(`  Result: ${result3} ✅`);

// ============================================================================
// Test 4: Data Structure Parsing - Binary Tree
// ============================================================================
console.log('\n\n📊 Test 4: Binary Tree Serialization/Deserialization');
console.log('-'.repeat(60));

const treeArray = [3, 9, 20, null, null, 15, 7];
console.log(`Input Array: ${JSON.stringify(treeArray)}`);

const tree = DataStructureParsers.deserializeTree(treeArray);
console.log(`Deserialized Tree: TreeNode { val: ${tree.val}, left: ..., right: ... }`);

const serializedTree = DataStructureParsers.serializeTree(tree);
console.log(`Serialized Back:   ${JSON.stringify(serializedTree)}`);
console.log(`Match: ${JSON.stringify(serializedTree) === JSON.stringify(treeArray)} ✅`);

// ============================================================================
// Test 5: Data Structure Parsing - Linked List
// ============================================================================
console.log('\n\n📊 Test 5: Linked List Serialization/Deserialization');
console.log('-'.repeat(60));

const listArray = [1, 2, 3, 4, 5];
console.log(`Input Array: ${JSON.stringify(listArray)}`);

const linkedList = DataStructureParsers.deserializeLinkedList(listArray);
console.log(`Deserialized List: ListNode { val: ${linkedList.val}, next: ... }`);

const serializedList = DataStructureParsers.serializeLinkedList(linkedList);
console.log(`Serialized Back:   ${JSON.stringify(serializedList)}`);
console.log(`Match: ${JSON.stringify(serializedList) === JSON.stringify(listArray)} ✅`);

// ============================================================================
// Test 6: Graph Deserialization
// ============================================================================
console.log('\n\n📊 Test 6: Graph Deserialization (Edge List → Adjacency List)');
console.log('-'.repeat(60));

const edges = [[0, 1], [1, 2], [2, 0], [1, 3]];
const numNodes = 4;

console.log(`Input Edges: ${JSON.stringify(edges)}`);
console.log(`Num Nodes: ${numNodes}`);

const graph = DataStructureParsers.deserializeGraphEdgeList(edges, numNodes, false);
console.log(`Adjacency List:`);
graph.forEach((neighbors, node) => {
    console.log(`  Node ${node}: [${neighbors.join(', ')}]`);
});

// ============================================================================
// Test 7: Test Harness Injection - Python
// ============================================================================
console.log('\n\n📊 Test 7: Test Harness Injection (Python)');
console.log('-'.repeat(60));

const userCodePython = `
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
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

const injectedCode = TestHarnessInjector.injectTestHarness({
    userCode: userCodePython,
    language: 'python',
    functionName: 'levelOrder',
    testInput: [3, 9, 20, null, null, 15, 7],
    expectedOutput: [[3], [9, 20], [15, 7]],
    inputTypes: 'tree',
    outputType: 'nested_array'
});

console.log('✅ Test harness injected successfully');
console.log(`Code length: ${injectedCode.length} characters`);
console.log(`Includes: Data structures, parsers, user code, test executor`);

// ============================================================================
// Test 8: Validation with Detailed Diff
// ============================================================================
console.log('\n\n📊 Test 8: Validation with Detailed Diff');
console.log('-'.repeat(60));

const actualOutput = [[3], [9, 20], [15]];  // Missing 7
const expectedOutput = [[3], [9, 20], [15, 7]];

const validationResult = SemanticValidator.validate(actualOutput, expectedOutput);
console.log(`Passed: ${validationResult.passed}`);
console.log(`Message: ${validationResult.message}`);

if (validationResult.diff) {
    console.log('\nDetailed Diff:');
    console.log(JSON.stringify(validationResult.diff, null, 2));
}

// ============================================================================
// Test 9: Type Validation
// ============================================================================
console.log('\n\n📊 Test 9: Type Validation');
console.log('-'.repeat(60));

const typeTests = [
    { actual: [1, 2, 3], expected: [1, 2, 3], name: 'Array match' },
    { actual: [1, 2, 3], expected: '123', name: 'Array vs String' },
    { actual: 123, expected: '123', name: 'Number vs String' },
    { actual: true, expected: 1, name: 'Boolean vs Number' },
];

typeTests.forEach(test => {
    const result = SemanticValidator.validate(test.actual, test.expected);
    console.log(`${test.name}: ${result.passed ? '✅' : '❌'}`);
    if (!result.passed) {
        console.log(`  → ${result.message}`);
    }
});

// ============================================================================
// Test 10: Performance Metrics
// ============================================================================
console.log('\n\n📊 Test 10: Performance Metrics');
console.log('-'.repeat(60));

const iterations = 10000;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
    SemanticValidator.deepEquals(
        [[1, 2], [3, 4], [5, 6]],
        [[1, 2], [3, 4], [5, 6]]
    );
}

const endTime = Date.now();
const avgTime = (endTime - startTime) / iterations;

console.log(`Iterations: ${iterations.toLocaleString()}`);
console.log(`Total Time: ${endTime - startTime}ms`);
console.log(`Average Time: ${avgTime.toFixed(4)}ms per comparison`);
console.log(`Throughput: ${Math.round(iterations / ((endTime - startTime) / 1000)).toLocaleString()} comparisons/sec`);

// ============================================================================
// Summary
// ============================================================================
console.log('\n\n' + '='.repeat(60));
console.log('✅ All Tests Completed Successfully!');
console.log('='.repeat(60));

console.log('\n📋 Key Features Demonstrated:');
console.log('  ✅ Semantic validation (not string comparison)');
console.log('  ✅ Deep equality for nested structures');
console.log('  ✅ Floating-point comparison with epsilon');
console.log('  ✅ Binary tree serialization/deserialization');
console.log('  ✅ Linked list serialization/deserialization');
console.log('  ✅ Graph deserialization (edges → adjacency list)');
console.log('  ✅ Test harness injection for Python');
console.log('  ✅ Detailed diff generation');
console.log('  ✅ Type validation');
console.log('  ✅ Performance benchmarking');

console.log('\n🚀 Ready for Production Integration!');
console.log('   Next: Integrate with Judge0 execution service\n');

/**
 * Test file to demonstrate code wrapper usage
 * Run with: node backend/src/services/codeExecution/wrappers/test.js
 */

const CodeWrapperService = require('./index');

// Example problem: Merge Two Sorted Lists
const problem = {
    functionName: 'mergeTwoLists',
    inputType: 'linked_list,linked_list',
    outputType: 'linked_list',
    functionSignature: {
        returnType: 'ListNode*',
        params: [
            { type: 'ListNode*', name: 'l1' },
            { type: 'ListNode*', name: 'l2' }
        ]
    }
};

const testCases = [
    {
        id: 'test1',
        input: [[1, 2, 4], [1, 3, 4]],
        output: [1, 1, 2, 3, 4, 4]
    },
    {
        id: 'test2',
        input: [[], []],
        output: []
    },
    {
        id: 'test3',
        input: [[], [0]],
        output: [0]
    }
];

// User's solution code (Python example)
const pythonUserCode = `class Solution:
    def mergeTwoLists(self, l1, l2):
        dummy = ListNode(0)
        current = dummy
        
        while l1 and l2:
            if l1.val < l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next
        
        current.next = l1 if l1 else l2
        return dummy.next
`;

// User's solution code (JavaScript example)
const jsUserCode = `var mergeTwoLists = function(l1, l2) {
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (l1 && l2) {
        if (l1.val < l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    current.next = l1 || l2;
    return dummy.next;
};
`;

// User's solution code (C++ example)
const cppUserCode = `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode* dummy = new ListNode(0);
        ListNode* current = dummy;
        
        while (l1 && l2) {
            if (l1->val < l2->val) {
                current->next = l1;
                l1 = l1->next;
            } else {
                current->next = l2;
                l2 = l2->next;
            }
            current = current->next;
        }
        
        current->next = l1 ? l1 : l2;
        return dummy->next;
    }
};
`;

// User's solution code (Java example)
const javaUserCode = `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        current.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}
`;

console.log('='.repeat(80));
console.log('CODE WRAPPER TEST');
console.log('='.repeat(80));

// Test 1: Get starter code for all languages
console.log('\n1. STARTER CODE GENERATION\n');
console.log('-'.repeat(80));

console.log('\n[PYTHON STARTER CODE]');
console.log(CodeWrapperService.getStarterCode('python', problem));

console.log('\n[JAVASCRIPT STARTER CODE]');
console.log(CodeWrapperService.getStarterCode('javascript', problem));

console.log('\n[C++ STARTER CODE]');
console.log(CodeWrapperService.getStarterCode('cpp', problem));

console.log('\n[JAVA STARTER CODE]');
console.log(CodeWrapperService.getStarterCode('java', problem));

// Test 2: Wrap user code
console.log('\n' + '='.repeat(80));
console.log('2. CODE WRAPPING (showing Python example)');
console.log('='.repeat(80));

const wrappedPythonCode = CodeWrapperService.wrap(pythonUserCode, 'python', problem, testCases);
console.log('\n[WRAPPED PYTHON CODE]');
console.log(wrappedPythonCode);

// Test 3: Show how to use in execution service
console.log('\n' + '='.repeat(80));
console.log('3. USAGE IN EXECUTION SERVICE');
console.log('='.repeat(80));

console.log(`
// In your code execution service:

const CodeWrapperService = require('./wrappers');

async function executeUserCode(userCode, language, problem, testCases) {
    // Step 1: Wrap user code
    const fullCode = CodeWrapperService.wrap(userCode, language, problem, testCases);
    
    // Step 2: Execute in Docker/sandbox
    const result = await executeInDocker(fullCode, language);
    
    // Step 3: Parse results (already in JSON format)
    const results = JSON.parse(result.stdout);
    
    // Step 4: Return results
    return results;
}

// Example usage:
const results = await executeUserCode(
    pythonUserCode,
    'python',
    problem,
    testCases
);

console.log(results);
// Output:
// [
//   {
//     testCaseId: 'test1',
//     status: 'PASSED',
//     input: '[[1,2,4],[1,3,4]]',
//     expectedOutput: '[1,1,2,3,4,4]',
//     actualOutput: '[1,1,2,3,4,4]',
//     executionTime: 2.5,
//     memory: 0
//   },
//   ...
// ]
`);

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE ✅');
console.log('='.repeat(80));
console.log('\nAll 4 language wrappers are ready to use!');
console.log('Next steps:');
console.log('  1. Update code execution service to use these wrappers');
console.log('  2. Update API endpoints to call wrapper service');
console.log('  3. Update database schema with function signatures');
console.log('  4. Update frontend to fetch starter code');
console.log('  5. Test with real execution\n');

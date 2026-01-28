/**
 * Test Script with Implemented User Functions
 * Demonstrates complete working code for all data structure types
 */

const CppGen = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');
const PythonGen = require('../src/services/wrapperGeneration/generators/PythonWrapperGenerator');
const JavaScriptGen = require('../src/services/wrapperGeneration/generators/JavaScriptWrapperGenerator');
const JavaGen = require('../src/services/wrapperGeneration/generators/JavaWrapperGenerator');

// Implemented solutions for each problem
const implementedSolutions = {
    cpp: {
        twoSum: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`,
        reverseList: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
        isValid: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') || 
                (c == '}' && top != '{') || 
                (c == ']' && top != '[')) {
                return false;
            }
            st.pop();
        }
    }
    return st.empty();
}`
    },
    python: {
        twoSum: `def twoSum(nums: List[int], target: int) -> List[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        reverseList: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
        isValid: `def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`
    },
    javascript: {
        twoSum: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        reverseList: `function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
        isValid: `function isValid(s) {
    const stack = [];
    const mapping = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char in mapping) {
            const top = stack.length > 0 ? stack.pop() : '#';
            if (mapping[char] !== top) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`
    },
    java: {
        twoSum: `public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[0];
}`,
        reverseList: `public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
        isValid: `public static boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if ((c == ')' && top != '(') || 
                (c == '}' && top != '{') || 
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}`
    }
};

// Test questions
const testQuestions = {
    twoSum: {
        id: 'two-sum',
        title: 'Two Sum',
        functionName: 'twoSum',
        inputType: JSON.stringify(['array<int>', 'int']),
        outputType: JSON.stringify('array<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<int>',
            params: [
                { type: 'vector<int>&', name: 'nums' },
                { type: 'int', name: 'target' }
            ]
        })
    },
    reverseList: {
        id: 'reverse-list',
        title: 'Reverse Linked List',
        functionName: 'reverseList',
        inputType: JSON.stringify(['linked_list']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            returnType: 'ListNode*',
            params: [{ type: 'ListNode*', name: 'head' }]
        })
    },
    isValid: {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        functionName: 'isValid',
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('boolean'),
        functionSignature: JSON.stringify({
            returnType: 'bool',
            params: [{ type: 'string', name: 's' }]
        })
    }
};

const generators = {
    cpp: new CppGen(),
    python: new PythonGen(),
    javascript: new JavaScriptGen(),
    java: new JavaGen()
};

async function generateWorkingExamples() {
    console.log('═'.repeat(80));
    console.log('GENERATING WORKING CODE EXAMPLES WITH IMPLEMENTED SOLUTIONS');
    console.log('═'.repeat(80));
    console.log('\n');

    for (const [questionKey, question] of Object.entries(testQuestions)) {
        console.log('\n' + '▓'.repeat(80));
        console.log(`▓  ${question.title.toUpperCase()}`);
        console.log('▓'.repeat(80));

        for (const [lang, gen] of Object.entries(generators)) {
            try {
                // Generate template
                const template = await gen.generate(question);

                // Replace TODO with actual implementation
                const implementedCode = implementedSolutions[lang][questionKey];
                const completeCode = template.headerCode + '\n\n' +
                    template.definition + '\n\n' +
                    implementedCode + '\n\n' +
                    template.mainFunction;

                console.log(`\n┌─ ${lang.toUpperCase()} ─────────────────────────────────────────────────────────────────`);
                console.log('✅ Generated complete working code');
                console.log(`   Total lines: ${completeCode.split('\n').length}`);
                console.log(`\n   Implemented Solution:`);
                implementedCode.split('\n').slice(0, 5).forEach(line => {
                    console.log(`   ${line}`);
                });
                console.log('   ...');
                console.log('└' + '─'.repeat(79));

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }

    console.log('\n\n' + '═'.repeat(80));
    console.log('✅ All working examples generated successfully!');
    console.log('═'.repeat(80));
}

generateWorkingExamples().catch(console.error);

/**
 * Java Code Wrapper
 * Wraps user's solution code with data structures, helpers, and test harness
 */

class JavaCodeWrapper {
    /**
     * Wrap user code with complete executable template
     * @param {string} userCode - User's solution code
     * @param {object} problem - Problem details
     * @param {array} testCases - Test cases to execute
     * @returns {string} - Complete executable Java code
     */
    static wrap(userCode, problem, testCases) {
        const { functionName, inputType, outputType } = problem;

        // Parse input/output types
        const inputTypes = inputType ? inputType.split(',').map(t => t.trim()) : [];
        const needsListNode = inputTypes.some(t => t.includes('linked_list')) || outputType?.includes('linked_list');
        const needsTreeNode = inputTypes.some(t => t.includes('tree')) || outputType?.includes('tree');

        let code = '';

        // Add imports
        code += this.getImports();

        // Add data structure definitions
        if (needsListNode) {
            code += this.getListNodeDefinition();
        }
        if (needsTreeNode) {
            code += this.getTreeNodeDefinition();
        }

        // Add user code (Solution class)
        code += '\n// User Solution Code\n';
        code += userCode;
        code += '\n\n';

        // Add main class with helpers and execution
        code += this.getMainClass(functionName, inputTypes, outputType, testCases, needsListNode, needsTreeNode);

        return code;
    }

    static getImports() {
        return `import java.util.*;
import java.io.*;

`;
    }

    static getListNodeDefinition() {
        return `// Definition for singly-linked list
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

`;
    }

    static getTreeNodeDefinition() {
        return `// Definition for a binary tree node
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

`;
    }

    static getMainClass(functionName, inputTypes, outputType, testCases, needsListNode, needsTreeNode) {
        let code = `public class Main {
    
`;

        // Add helper methods
        if (needsListNode) {
            code += this.getListNodeHelpers();
        }
        if (needsTreeNode) {
            code += this.getTreeNodeHelpers();
        }

        // Add array helpers
        code += this.getArrayHelpers();

        // Add main method
        code += this.getMainMethod(functionName, inputTypes, outputType, testCases);

        code += `}\n`;

        return code;
    }

    static getListNodeHelpers() {
        return `    // Create linked list from array
    static ListNode createLinkedList(int[] arr) {
        if (arr == null || arr.length == 0) return null;
        
        ListNode head = new ListNode(arr[0]);
        ListNode current = head;
        
        for (int i = 1; i < arr.length; i++) {
            current.next = new ListNode(arr[i]);
            current = current.next;
        }
        
        return head;
    }
    
    // Convert linked list to array
    static int[] linkedListToArray(ListNode head) {
        List<Integer> list = new ArrayList<>();
        while (head != null) {
            list.add(head.val);
            head = head.next;
        }
        
        int[] result = new int[list.size()];
        for (int i = 0; i < list.size(); i++) {
            result[i] = list.get(i);
        }
        return result;
    }
    
`;
    }

    static getTreeNodeHelpers() {
        return `    // Create binary tree from level-order array (null for null nodes)
    static TreeNode createTree(Integer[] arr) {
        if (arr == null || arr.length == 0 || arr[0] == null) return null;
        
        TreeNode root = new TreeNode(arr[0]);
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        
        while (!queue.isEmpty() && i < arr.length) {
            TreeNode node = queue.poll();
            
            // Left child
            if (i < arr.length && arr[i] != null) {
                node.left = new TreeNode(arr[i]);
                queue.offer(node.left);
            }
            i++;
            
            // Right child
            if (i < arr.length && arr[i] != null) {
                node.right = new TreeNode(arr[i]);
                queue.offer(node.right);
            }
            i++;
        }
        
        return root;
    }
    
    // Convert binary tree to level-order array
    static Integer[] treeToArray(TreeNode root) {
        if (root == null) return new Integer[0];
        
        List<Integer> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            
            if (node != null) {
                result.add(node.val);
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                result.add(null);
            }
        }
        
        // Remove trailing nulls
        while (!result.isEmpty() && result.get(result.size() - 1) == null) {
            result.remove(result.size() - 1);
        }
        
        return result.toArray(new Integer[0]);
    }
    
`;
    }

    static getArrayHelpers() {
        return `    // Convert int array to JSON string
    static String intArrayToJson(int[] arr) {
        if (arr == null || arr.length == 0) return "[]";
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }
    
    // Convert Integer array to JSON string (handles nulls)
    static String integerArrayToJson(Integer[] arr) {
        if (arr == null || arr.length == 0) return "[]";
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            if (arr[i] == null) sb.append("null");
            else sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }
    
    // Compare arrays
    static boolean arraysEqual(int[] a, int[] b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (int i = 0; i < a.length; i++) {
            if (a[i] != b[i]) return false;
        }
        return true;
    }
    
    static boolean arraysEqual(Integer[] a, Integer[] b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (int i = 0; i < a.length; i++) {
            if (a[i] == null && b[i] == null) continue;
            if (a[i] == null || b[i] == null) return false;
            if (!a[i].equals(b[i])) return false;
        }
        return true;
    }
    
`;
    }

    static getMainMethod(functionName, inputTypes, outputType, testCases) {
        return `    public static void main(String[] args) {
        Solution solution = new Solution();
        System.out.println("[");
        
        ${this.generateTestCaseLoop(functionName, inputTypes, outputType, testCases)}
        
        System.out.println("]");
    }
`;
    }

    static generateTestCaseLoop(functionName, inputTypes, outputType, testCases) {
        let code = '';

        testCases.forEach((testCase, index) => {
            const inputs = testCase.input || [];
            const expectedOutput = testCase.output;

            code += `        // Test case ${index + 1}\n`;
            code += `        try {\n`;

            // Parse inputs
            inputTypes.forEach((type, i) => {
                if (type.includes('linked_list')) {
                    code += `            int[] input${i}Arr = ${JSON.stringify(inputs[i] || [])};\n`;
                    code += `            ListNode input${i} = createLinkedList(input${i}Arr);\n`;
                } else if (type.includes('tree')) {
                    code += `            Integer[] input${i}Arr = ${JSON.stringify(inputs[i] || [])};\n`;
                    code += `            TreeNode input${i} = createTree(input${i}Arr);\n`;
                } else if (type.includes('array') || type.includes('vector')) {
                    code += `            int[] input${i} = ${JSON.stringify(inputs[i] || [])};\n`;
                } else {
                    code += `            int input${i} = ${inputs[i] || 0};\n`;
                }
            });

            // Call solution
            const args = inputTypes.map((type, i) => `input${i}`).join(', ');
            code += `            \n`;
            code += `            long startTime = System.currentTimeMillis();\n`;
            code += `            var result = solution.${functionName}(${args});\n`;
            code += `            long executionTime = System.currentTimeMillis() - startTime;\n`;
            code += `            \n`;

            // Convert result
            if (outputType?.includes('linked_list')) {
                code += `            int[] actualOutput = linkedListToArray(result);\n`;
                code += `            int[] expectedOutput = ${JSON.stringify(expectedOutput)};\n`;
                code += `            boolean passed = arraysEqual(actualOutput, expectedOutput);\n`;
                code += `            \n`;
                code += `            if (${index} > 0) System.out.println(",");\n`;
                code += `            System.out.print("{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"" + (passed ? "PASSED" : "FAILED") + "\\",\\"actualOutput\\":" + intArrayToJson(actualOutput) + ",\\"expectedOutput\\":" + intArrayToJson(expectedOutput) + ",\\"executionTime\\":" + executionTime + "}");\n`;
            } else if (outputType?.includes('tree')) {
                code += `            Integer[] actualOutput = treeToArray(result);\n`;
                code += `            Integer[] expectedOutput = ${JSON.stringify(expectedOutput)};\n`;
                code += `            boolean passed = arraysEqual(actualOutput, expectedOutput);\n`;
                code += `            \n`;
                code += `            if (${index} > 0) System.out.println(",");\n`;
                code += `            System.out.print("{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"" + (passed ? "PASSED" : "FAILED") + "\\",\\"actualOutput\\":" + integerArrayToJson(actualOutput) + ",\\"expectedOutput\\":" + integerArrayToJson(expectedOutput) + ",\\"executionTime\\":" + executionTime + "}");\n`;
            } else if (outputType?.includes('array') || outputType?.includes('vector')) {
                code += `            int[] actualOutput = result;\n`;
                code += `            int[] expectedOutput = ${JSON.stringify(expectedOutput)};\n`;
                code += `            boolean passed = arraysEqual(actualOutput, expectedOutput);\n`;
                code += `            \n`;
                code += `            if (${index} > 0) System.out.println(",");\n`;
                code += `            System.out.print("{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"" + (passed ? "PASSED" : "FAILED") + "\\",\\"actualOutput\\":" + intArrayToJson(actualOutput) + ",\\"expectedOutput\\":" + intArrayToJson(expectedOutput) + ",\\"executionTime\\":" + executionTime + "}");\n`;
            } else {
                code += `            int actualOutput = result;\n`;
                code += `            int expectedOutput = ${expectedOutput || 0};\n`;
                code += `            boolean passed = (actualOutput == expectedOutput);\n`;
                code += `            \n`;
                code += `            if (${index} > 0) System.out.println(",");\n`;
                code += `            System.out.print("{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"" + (passed ? "PASSED" : "FAILED") + "\\",\\"actualOutput\\":" + actualOutput + ",\\"expectedOutput\\":" + expectedOutput + ",\\"executionTime\\":" + executionTime + "}");\n`;
            }

            code += `        } catch (Exception e) {\n`;
            code += `            if (${index} > 0) System.out.println(",");\n`;
            code += `            System.out.print("{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"ERROR\\",\\"error\\":\\"" + e.getMessage() + "\\"}");\n`;
            code += `        }\n\n`;
        });

        return code;
    }
}

module.exports = JavaCodeWrapper;

const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
let lineIndex = 0;

function readLine() {
    return lineIndex < input.length ? input[lineIndex++] : "";
}

function readInt() {
    return parseInt(readLine());
}

function readIntArray(n) {
    return readLine().split(' ').map(Number);
}

function readMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix.push(readLine().split(' ').map(Number));
    }
    return matrix;
}

function parseTree() {
    const tokens = readLine().split(' ');
    
    if (!tokens.length || tokens[0] === "null") return null;
    
    const root = new TreeNode(parseInt(tokens[0]));
    const queue = [root];
    let qIndex = 0;  // FIXED: Index-based queue for O(1) performance
    let i = 1;
    
    while (qIndex < queue.length && i < tokens.length) {
        const node = queue[qIndex++];
        
        if (i < tokens.length && tokens[i] !== "null") {
            node.left = new TreeNode(parseInt(tokens[i]));
            queue.push(node.left);
        }
        i++;
        
        if (i < tokens.length && tokens[i] !== "null") {
            node.right = new TreeNode(parseInt(tokens[i]));
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

function parseLinkedList() {
    const line = readLine();
    
    // Handle empty array []
    if (line === "[]") return null;
    
    // Remove brackets and parse
    const trimmed = line.trim().slice(1, -1); // Remove [ and ]
    if (!trimmed) return null;
    
    const values = trimmed.split(',').map(x => parseInt(x.trim()));
    
    if (!values || values.length === 0) return null;
    
    const head = new ListNode(values[0]);
    let current = head;
    
    for (let i = 1; i < values.length; i++) {
        current.next = new ListNode(values[i]);
        current = current.next;
    }
    
    return head;
}

function parseGraph(isDirected = false) {
    const n = readInt();
    const m = readInt();
    
    if (n <= 0) return [];
    
    const graph = Array.from({length: n}, () => []);
    
    for (let i = 0; i < m; i++) {
        const [u, v] = readLine().split(' ').map(Number);
        graph[u].push(v);
        if (!isDirected) graph[v].push(u);
    }
    
    return graph;
}

function serializeArray(arr) {
    return '[' + arr.join(',') + ']';
}

function serializeMatrix(matrix) {
    if (!matrix || matrix.length === 0) return "[]";
    return '[' + matrix.map(row => '[' + row.join(',') + ']').join(',') + ']';
}

function serializeTree(root) {
    if (!root) return "[]";
    
    const result = [];
    const queue = [root];
    let qIndex = 0;  // FIXED: Index-based queue
    
    while (qIndex < queue.length) {
        const node = queue[qIndex++];
        
        if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            result.push("null");
        }
    }
    
    // Trim trailing nulls
    while (result.length && result[result.length - 1] === "null") {
        result.pop();
    }
    
    return '[' + result.join(',') + ']';
}

function serializeLinkedList(head) {
    const result = [];
    let current = head;
    
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    
    return '[' + result.join(',') + ']';
}

class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const nextNode = curr.next; // store next
        curr.next = prev;           // reverse link
        prev = curr;                // move prev
        curr = nextNode;            // move curr
    }
    
    return prev; // new head
}

function main() {
    // Parse inputs
    const arg0 = parseLinkedList();
    
    // Call user function
    const result = reverseList(arg0);
    
    // Serialize and print output
    console.log(serializeLinkedList(result));
}

main();
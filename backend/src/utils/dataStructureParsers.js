/**
 * Data Structure Parsers
 * Convert string/array representations to actual data structures
 * Supports: Trees, Graphs, Linked Lists, Custom Objects
 * 
 * Format follows LeetCode conventions for compatibility
 */

/**
 * TreeNode definition for binary trees
 */
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

/**
 * ListNode definition for linked lists
 */
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

/**
 * GraphNode definition for graph problems
 */
class GraphNode {
    constructor(val = 0, neighbors = []) {
        this.val = val;
        this.neighbors = neighbors;
    }
}

class DataStructureParsers {
    /**
     * Deserialize binary tree from array (LeetCode format)
     * Example: [3,9,20,null,null,15,7] → TreeNode structure
     * 
     * @param {Array} arr - Array representation of tree (level-order with nulls)
     * @returns {TreeNode|null} Root of the tree
     */
    static deserializeTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) {
            return null;
        }

        const root = new TreeNode(arr[0]);
        const queue = [root];
        let i = 1;

        while (queue.length > 0 && i < arr.length) {
            const node = queue.shift();

            // Process left child
            if (i < arr.length && arr[i] !== null) {
                node.left = new TreeNode(arr[i]);
                queue.push(node.left);
            }
            i++;

            // Process right child
            if (i < arr.length && arr[i] !== null) {
                node.right = new TreeNode(arr[i]);
                queue.push(node.right);
            }
            i++;
        }

        return root;
    }

    /**
     * Serialize binary tree to array (for output comparison)
     * TreeNode → [3,9,20,null,null,15,7]
     * 
     * @param {TreeNode} root - Root of the tree
     * @returns {Array} Array representation
     */
    static serializeTree(root) {
        if (!root) return [];

        const result = [];
        const queue = [root];

        while (queue.length > 0) {
            const node = queue.shift();

            if (node === null) {
                result.push(null);
            } else {
                result.push(node.val);
                queue.push(node.left);
                queue.push(node.right);
            }
        }

        // Remove trailing nulls
        while (result.length > 0 && result[result.length - 1] === null) {
            result.pop();
        }

        return result;
    }

    /**
     * Deserialize linked list from array
     * Example: [1,2,3,4,5] → ListNode chain
     * 
     * @param {Array} arr - Array of values
     * @returns {ListNode|null} Head of the linked list
     */
    static deserializeLinkedList(arr) {
        if (!arr || arr.length === 0) {
            return null;
        }

        const dummy = new ListNode(0);
        let current = dummy;

        for (const val of arr) {
            current.next = new ListNode(val);
            current = current.next;
        }

        return dummy.next;
    }

    /**
     * Serialize linked list to array
     * ListNode → [1,2,3,4,5]
     * 
     * @param {ListNode} head - Head of the linked list
     * @returns {Array} Array representation
     */
    static serializeLinkedList(head) {
        const result = [];
        let current = head;

        while (current !== null) {
            result.push(current.val);
            current = current.next;
        }

        return result;
    }

    /**
     * Deserialize graph from edge list
     * Example: [[1,2],[2,3],[3,1]] with n=3 → Adjacency list
     * 
     * @param {Array} edges - Array of [from, to] edges
     * @param {number} n - Number of nodes (0 to n-1)
     * @param {boolean} directed - Whether graph is directed
     * @returns {Array} Adjacency list representation
     */
    static deserializeGraphEdgeList(edges, n, directed = false) {
        const graph = Array.from({ length: n }, () => []);

        for (const [from, to] of edges) {
            graph[from].push(to);
            if (!directed) {
                graph[to].push(from);
            }
        }

        return graph;
    }

    /**
     * Deserialize graph from adjacency list
     * Example: [[2,4],[1,3],[2,4],[1,3]] → Graph structure
     * 
     * @param {Array} adjList - Adjacency list
     * @returns {Array} Graph as adjacency list
     */
    static deserializeGraphAdjList(adjList) {
        return adjList.map(neighbors => [...neighbors]);
    }

    /**
     * Deserialize graph with GraphNode objects (LeetCode format)
     * Example: [[2,4],[1,3],[2,4],[1,3]] → GraphNode with neighbors
     * 
     * @param {Array} adjList - Adjacency list (1-indexed)
     * @returns {GraphNode|null} First node of the graph
     */
    static deserializeGraphNodes(adjList) {
        if (!adjList || adjList.length === 0) {
            return null;
        }

        const nodes = adjList.map((_, idx) => new GraphNode(idx + 1));

        adjList.forEach((neighbors, idx) => {
            nodes[idx].neighbors = neighbors.map(n => nodes[n - 1]);
        });

        return nodes[0];
    }

    /**
     * Deserialize N-ary tree from array
     * Example: [1,null,3,2,4,null,5,6] → N-ary tree
     * 
     * @param {Array} arr - Array representation
     * @returns {Object|null} Root of N-ary tree
     */
    static deserializeNaryTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) {
            return null;
        }

        class NaryNode {
            constructor(val, children = []) {
                this.val = val;
                this.children = children;
            }
        }

        const root = new NaryNode(arr[0]);
        const queue = [root];
        let i = 2; // Skip root and first null

        while (queue.length > 0 && i < arr.length) {
            const node = queue.shift();

            while (i < arr.length && arr[i] !== null) {
                const child = new NaryNode(arr[i]);
                node.children.push(child);
                queue.push(child);
                i++;
            }
            i++; // Skip null separator
        }

        return root;
    }

    /**
     * Parse input based on type specification
     * 
     * @param {string} input - Input string
     * @param {string} type - Input type (tree, graph, linked_list, etc.)
     * @param {Object} options - Additional parsing options
     * @returns {*} Parsed data structure
     */
    static parseInput(input, type, options = {}) {
        // Parse JSON string to array/object
        let data;
        try {
            data = typeof input === 'string' ? JSON.parse(input) : input;
        } catch (error) {
            throw new Error(`Failed to parse input: ${error.message}`);
        }

        switch (type) {
            case 'tree':
            case 'binary_tree':
                return this.deserializeTree(data);

            case 'linked_list':
                return this.deserializeLinkedList(data);

            case 'graph_edges':
                return this.deserializeGraphEdgeList(
                    data,
                    options.numNodes || data.length,
                    options.directed || false
                );

            case 'graph_adj_list':
                return this.deserializeGraphAdjList(data);

            case 'graph_nodes':
                return this.deserializeGraphNodes(data);

            case 'nary_tree':
                return this.deserializeNaryTree(data);

            case 'array':
            case 'int_array':
            case 'string_array':
                return Array.isArray(data) ? data : [data];

            case 'matrix':
            case '2d_array':
                return data;

            case 'string':
                return String(data);

            case 'int':
            case 'number':
                return Number(data);

            case 'boolean':
                return Boolean(data);

            default:
                return data;
        }
    }

    /**
     * Serialize output based on type specification
     * 
     * @param {*} output - Output data structure
     * @param {string} type - Output type
     * @returns {*} Serialized output
     */
    static serializeOutput(output, type) {
        switch (type) {
            case 'tree':
            case 'binary_tree':
                return this.serializeTree(output);

            case 'linked_list':
                return this.serializeLinkedList(output);

            case 'array':
            case 'int_array':
            case 'string_array':
            case 'matrix':
            case '2d_array':
            case 'nested_array':
                return output;

            case 'string':
            case 'int':
            case 'number':
            case 'boolean':
                return output;

            default:
                return output;
        }
    }

    /**
     * Validate data structure integrity
     * 
     * @param {*} structure - Data structure to validate
     * @param {string} type - Expected type
     * @returns {Object} Validation result
     */
    static validate(structure, type) {
        try {
            switch (type) {
                case 'tree':
                case 'binary_tree':
                    return this.validateTree(structure);

                case 'linked_list':
                    return this.validateLinkedList(structure);

                case 'graph_adj_list':
                    return this.validateGraph(structure);

                default:
                    return { valid: true };
            }
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Validate binary tree structure
     */
    static validateTree(root) {
        if (root === null) return { valid: true };

        const visited = new Set();
        const queue = [root];

        while (queue.length > 0) {
            const node = queue.shift();

            if (visited.has(node)) {
                return {
                    valid: false,
                    error: 'Cycle detected in tree'
                };
            }

            visited.add(node);

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        return { valid: true, nodeCount: visited.size };
    }

    /**
     * Validate linked list structure
     */
    static validateLinkedList(head) {
        if (head === null) return { valid: true };

        const visited = new Set();
        let current = head;
        let length = 0;

        while (current !== null) {
            if (visited.has(current)) {
                return {
                    valid: false,
                    error: 'Cycle detected in linked list',
                    cycleStart: current.val
                };
            }

            visited.add(current);
            length++;
            current = current.next;

            // Safety check for infinite loops
            if (length > 100000) {
                return {
                    valid: false,
                    error: 'Linked list too long or has cycle'
                };
            }
        }

        return { valid: true, length };
    }

    /**
     * Validate graph structure
     */
    static validateGraph(graph) {
        if (!Array.isArray(graph)) {
            return {
                valid: false,
                error: 'Graph must be an array'
            };
        }

        const n = graph.length;

        for (let i = 0; i < n; i++) {
            if (!Array.isArray(graph[i])) {
                return {
                    valid: false,
                    error: `Node ${i} neighbors must be an array`
                };
            }

            for (const neighbor of graph[i]) {
                if (neighbor < 0 || neighbor >= n) {
                    return {
                        valid: false,
                        error: `Invalid neighbor ${neighbor} at node ${i}`
                    };
                }
            }
        }

        return { valid: true, nodeCount: n };
    }
}

// Export classes and parser
module.exports = {
    DataStructureParsers,
    TreeNode,
    ListNode,
    GraphNode
};

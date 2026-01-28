import sys
from collections import deque, defaultdict
from typing import List, Optional

# Read all input upfront
data = sys.stdin.read().strip().split('\n')
idx = [0]

def read_line():
    # FIXED: Bounds checking to prevent IndexError
    if idx[0] >= len(data):
        return ""
    line = data[idx[0]]
    idx[0] += 1
    return line

def read_int():
    line = read_line()
    return int(line) if line else 0

def read_int_array(n):
    return list(map(int, read_line().split()))

def read_matrix(rows, cols):
    matrix = []
    for _ in range(rows):
        matrix.append(list(map(int, read_line().split())))
    return matrix

def parse_tree():
    tokens = read_line().split()
    
    if not tokens or tokens[0] == "null":
        return None
    
    root = TreeNode(int(tokens[0]))
    queue = deque([root])
    i = 1
    
    while queue and i < len(tokens):
        node = queue.popleft()
        
        if i < len(tokens) and tokens[i] != "null":
            node.left = TreeNode(int(tokens[i]))
            queue.append(node.left)
        i += 1
        
        if i < len(tokens) and tokens[i] != "null":
            node.right = TreeNode(int(tokens[i]))
            queue.append(node.right)
        i += 1
    
    return root

def parse_linked_list():
    line = read_line()
    
    # Handle empty array []
    if line == "[]":
        return None
    
    # Remove brackets and parse
    line = line.strip()[1:-1]  # Remove [ and ]
    if not line:
        return None
    
    values = [int(x.strip()) for x in line.split(',')]
    
    if not values:
        return None
    
    head = ListNode(values[0])
    current = head
    
    for i in range(1, len(values)):
        current.next = ListNode(values[i])
        current = current.next
    
    return head

def parse_graph(is_directed=False):
    n = read_int()
    m = read_int()
    
    if n <= 0:
        return []
    
    graph = [[] for _ in range(n)]
    
    for _ in range(m):
        u, v = map(int, read_line().split())
        graph[u].append(v)
        if not is_directed:
            graph[v].append(u)
    
    return graph

def serialize_array(arr):
    return '[' + ','.join(map(str, arr)) + ']'

def serialize_matrix(matrix):
    # FIXED: Handle empty matrix
    if not matrix:
        return "[]"
    return '[' + ','.join('[' + ','.join(map(str, row)) + ']' for row in matrix) + ']'

def serialize_tree(root):
    if not root:
        return "[]"
    
    result = []
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        if node:
            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append("null")
    
    # Trim trailing nulls
    while result and result[-1] == "null":
        result.pop()
    
    return '[' + ','.join(result) + ']'

def serialize_linked_list(head):
    result = []
    current = head
    
    while current:
        result.append(str(current.val))
        current = current.next
    
    return '[' + ','.join(result) + ']'

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev = None
    curr = head
    
    while curr:
        next_node = curr.next  # store next
        curr.next = prev       # reverse link
        prev = curr            # move prev
        curr = next_node       # move curr
    
    return prev  # new head

def main():
    # Parse inputs
    arg0 = parse_linked_list()
    
    # Call user function
    result = reverseList(arg0)
    
    # Serialize and print output
    print(serialize_linked_list(result))

if __name__ == "__main__":
    main()
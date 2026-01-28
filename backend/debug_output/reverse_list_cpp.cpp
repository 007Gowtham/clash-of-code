#include <bits/stdc++.h>
using namespace std;

// Data Structures (MUST be defined first)
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// Helper Functions (use structs defined above)
TreeNode* parseTree(vector<string>& tokens) {
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    
    while (!q.empty() && i < tokens.size()) {
        TreeNode* node = q.front();
        q.pop();
        
        if (i < tokens.size() && tokens[i] != "null") {
            node->left = new TreeNode(stoi(tokens[i]));
            q.push(node->left);
        }
        i++;
        
        if (i < tokens.size() && tokens[i] != "null") {
            node->right = new TreeNode(stoi(tokens[i]));
            q.push(node->right);
        }
        i++;
    }
    
    return root;
}

ListNode* parseLinkedList() {
    string line;
    getline(cin >> ws, line);
    
    // Handle empty array []
    if (line == "[]") return nullptr;
    
    // Remove brackets and parse
    line = line.substr(1, line.length() - 2); // Remove [ and ]
    if (line.empty()) return nullptr;
    
    vector<int> vals;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        vals.push_back(stoi(token));
    }
    
    if (vals.empty()) return nullptr;
    
    ListNode* head = new ListNode(vals[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < vals.size(); i++) {
        curr->next = new ListNode(vals[i]);
        curr = curr->next;
    }
    return head;
}

vector<vector<int>> parseGraph(bool isDirected = false) {
    int n, m;
    cin >> n >> m;
    
    if (n <= 0) return {};
    
    vector<vector<int>> graph(n);
    
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        graph[u].push_back(v);
        if (!isDirected) graph[v].push_back(u);
    }
    
    return graph;
}

string serializeArray(vector<int>& arr) {
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i > 0) oss << ",";
        oss << arr[i];
    }
    oss << "]";
    return oss.str();
}

string serializeMatrix(vector<vector<int>>& matrix) {
    if (matrix.empty()) return "[]";
    
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < matrix.size(); i++) {
        if (i > 0) oss << ",";
        oss << "[";
        for (size_t j = 0; j < matrix[i].size(); j++) {
            if (j > 0) oss << ",";
            oss << matrix[i][j];
        }
        oss << "]";
    }
    oss << "]";
    return oss.str();
}

string serializeTree(TreeNode* root) {
    if (!root) return "[]";
    
    ostringstream oss;
    vector<string> result;
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        
        if (node) {
            result.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            result.push_back("null");
        }
    }
    
    // Trim trailing nulls
    while (!result.empty() && result.back() == "null") {
        result.pop_back();
    }
    
    oss << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) oss << ",";
        oss << result[i];
    }
    oss << "]";
    return oss.str();
}

string serializeLinkedList(ListNode* head) {
    vector<int> result;
    ListNode* curr = head;
    
    while (curr) {
        result.push_back(curr->val);
        curr = curr->next;
    }
    
    return serializeArray(result);
}

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr != nullptr) {
        ListNode* nextNode = curr->next; // store next
        curr->next = prev;              // reverse link
        prev = curr;                    // move prev
        curr = nextNode;                // move curr
    }

    return prev; // new head
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Parse inputs
    ListNode* arg0 = parseLinkedList();
    
    // Call user function
    auto result = reverseList(arg0);
    
    // Serialize and print output
    cout << serializeLinkedList(result) << endl;
    
    return 0;
}
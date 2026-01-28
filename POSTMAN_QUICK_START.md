# 📮 Postman Collection - Ready to Use!

## ✅ Collection with Actual Question IDs

**File:** `Clash_of_Code_Complete_Tests.postman_collection.json`

This collection has **all question IDs pre-configured** - no need to run "Get Questions" first!

---

## 🎯 Question IDs (Pre-configured)

| Question | ID | Variable |
|----------|-----|----------|
| **Two Sum** | `0f8905fc-6b4e-45ab-8445-118a7685d2ac` | `questionId_twoSum` |
| **Reverse Linked List** | `457b28fd-a545-4b3a-949b-b28b15cff5fb` | `questionId_reverseList` |
| **Maximum Depth of Binary Tree** | `aa770d22-ed8e-4fbd-8352-8783ef36f78e` | `questionId_maxDepth` |
| **Search a 2D Matrix** | `7a2a8d44-f278-4c1d-8b5a-b919880dd60d` | `questionId_searchMatrix` |
| **Valid Parentheses** | `a64b4696-b5a1-4361-8777-e3b4e37ec116` | `questionId_isValid` |

---

## 🚀 Quick Start (3 Steps)

### 1. Import Collection
```
1. Open Postman
2. Click "Import"
3. Select: Clash_of_Code_Complete_Tests.postman_collection.json
4. Done!
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

### 3. Test Immediately!
```
1. Run "1. Authentication → Login"
2. Run ANY question test (IDs already set!)
   - Example: "3. Two Sum → Run Two Sum - C++"
```

---

## 📋 Collection Structure

### 0. Health Check
- **Server Health** - Check if backend is running

### 1. Authentication
- **Login** - Get auth token (required first)

### 2. Get All Questions
- **Get Questions from Room** - View all questions with metadata

### 3. Two Sum (Array + Primitive)
- Get Question
- Run C++, Java, Python
- Submit C++

### 4. Reverse Linked List (Linked List)
- Get Question
- Run C++
- Submit C++

### 5. Maximum Depth of Binary Tree (Tree)
- Get Question
- Run C++
- Submit C++

### 6. Search a 2D Matrix (Matrix)
- Get Question
- Run C++
- Submit C++

### 7. Valid Parentheses (String)
- Get Question
- Run C++
- Submit C++

---

## 🎯 Example Usage

### Test Two Sum in C++

1. **Login First:**
   ```
   POST /api/auth/login
   Body: { "email": "sample@example.com", "password": "password123" }
   ```

2. **Run Code:**
   ```
   POST /api/submissions/run
   Body: {
     "questionId": "0f8905fc-6b4e-45ab-8445-118a7685d2ac",
     "language": "cpp",
     "code": "vector<int> twoSum(...) { ... }"
   }
   ```

3. **Submit Code:**
   ```
   POST /api/submissions/submit
   (Same body as run)
   ```

---

## 📊 Pre-configured Variables

All these are **already set** in the collection:

```json
{
  "baseUrl": "http://localhost:3001",
  "roomCode": "SAMPLE001",
  "questionId_twoSum": "0f8905fc-6b4e-45ab-8445-118a7685d2ac",
  "questionId_reverseList": "457b28fd-a545-4b3a-949b-b28b15cff5fb",
  "questionId_maxDepth": "aa770d22-ed8e-4fbd-8352-8783ef36f78e",
  "questionId_searchMatrix": "7a2a8d44-f278-4c1d-8b5a-b919880dd60d",
  "questionId_isValid": "a64b4696-b5a1-4361-8777-e3b4e37ec116"
}
```

**Auto-set after login:**
- `authToken` - JWT token
- `userId` - User ID

---

## ✅ Working Solutions Included

All requests include **correct, working solutions**:

### Two Sum (C++)
```cpp
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}
```

### Reverse Linked List (C++)
```cpp
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

### Maximum Depth (C++)
```cpp
int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}
```

### Search Matrix (C++)
```cpp
bool searchMatrix(vector<vector<int>>& matrix, int target) {
    if (matrix.empty() || matrix[0].empty()) return false;
    int m = matrix.size(), n = matrix[0].size();
    int left = 0, right = m * n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int midVal = matrix[mid / n][mid % n];
        if (midVal == target) return true;
        else if (midVal < target) left = mid + 1;
        else right = mid - 1;
    }
    return false;
}
```

### Valid Parentheses (C++)
```cpp
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top == '(') || 
                (c == '}' && top == '{') || 
                (c == ']' && top == '[')) {
                st.pop();
            } else {
                return false;
            }
        }
    }
    return st.empty();
}
```

---

## 🧪 Test Scripts Included

Each request has **automatic test scripts** that:
- ✅ Check response status
- ✅ Parse and display results
- ✅ Show test case results
- ✅ Display pass/fail counts

Example output in Postman Console:
```
✅ Run completed
Status: success
Passed: 3/3
Test 1: ✅ PASS
Test 2: ✅ PASS
Test 3: ✅ PASS
```

---

## 🔍 Testing All Questions

### Option 1: Manual Testing
1. Login
2. Test each question individually

### Option 2: Collection Runner
1. Click collection name
2. Click "Run"
3. Select all requests
4. Click "Run Clash of Code..."
5. Watch all tests execute!

---

## 📈 Expected Results

### Successful Run Response
```json
{
  "status": "success",
  "testResults": [
    {
      "passed": true,
      "input": "[2,7,11,15]\n9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[0,1]",
      "executionTime": 45,
      "memoryUsed": 2048
    }
  ],
  "passedCount": 3,
  "totalCount": 3
}
```

### Successful Submit Response
```json
{
  "submissionId": "...",
  "status": "ACCEPTED",
  "passedTestCases": 3,
  "totalTestCases": 3,
  "score": 100
}
```

---

## 🎓 What You Can Test

### Data Structures (Metadata-Driven)
- ✅ **Arrays** - json_array strategy (Two Sum)
- ✅ **Linked Lists** - linked_list_array strategy (Reverse List)
- ✅ **Binary Trees** - tree_array strategy (Max Depth)
- ✅ **Matrices** - nested_array strategy (Search Matrix)
- ✅ **Strings** - primitive strategy (Valid Parentheses)

### Languages
- ✅ **C++** - All questions
- ✅ **Java** - Two Sum example
- ✅ **Python** - Two Sum example
- ⏳ **JavaScript** - Ready to add

### Operations
- ✅ **Get Question** - View metadata
- ✅ **Run Code** - Test with sample cases
- ✅ **Submit Code** - Test with all cases

---

## 🚨 Troubleshooting

### "Connection refused"
```bash
# Start backend server
cd backend
npm run dev
```

### "Unauthorized"
```
Run "1. Authentication → Login" first
```

### "Question not found"
```bash
# Reset database
cd backend
node scripts/resetAndSeedQuestions.js
```

---

## 📚 Files

- **Collection:** `Clash_of_Code_Complete_Tests.postman_collection.json`
- **This Guide:** `POSTMAN_QUICK_START.md`
- **Testing Guide:** `POSTMAN_TESTING_GUIDE.md`
- **Database Summary:** `DATABASE_RESET_SUMMARY.md`

---

## 🎉 Ready to Test!

**Everything is pre-configured. Just:**
1. ✅ Import collection
2. ✅ Start server (`npm run dev`)
3. ✅ Login
4. ✅ Test any question!

**All question IDs are already set - no manual configuration needed!**

---

**Happy Testing! 🚀**

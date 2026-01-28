# 📮 Postman API Testing Guide

## Overview

This Postman collection allows you to test all 5 metadata-driven questions with the new wrapper generation system on **port 3001**.

---

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import**
3. Select file: `Clash_of_Code_API_Tests.postman_collection.json`
4. Collection will be imported with all requests

### 2. Configure Variables

The collection uses these variables (auto-configured):

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | `http://localhost:3001` |
| `roomCode` | Sample room code | `SAMPLE001` |
| `authToken` | JWT token | ✅ After login |
| `userId` | User ID | ✅ After login |
| `questionId_*` | Question IDs | ✅ After getting questions |

### 3. Run the Collection

**Option A: Manual Testing**
1. Run "1. Setup → Login" first
2. Run "1. Setup → Get Questions from Room"
3. Test any question folder

**Option B: Collection Runner**
1. Click on collection name
2. Click "Run"
3. Select all requests
4. Click "Run Clash of Code..."

---

## 📋 Collection Structure

### 1. Setup (Required First)
- **Login** - Authenticates and gets token
- **Get Questions from Room** - Fetches all 5 questions and sets IDs

### 2. Two Sum (Array + Primitive)
- Get Question Details
- Run - C++
- Submit - C++
- Run - Java
- Run - Python

### 3. Reverse Linked List (Linked List)
- Get Question Details
- Run - C++
- Submit - C++

### 4. Maximum Depth of Binary Tree (Tree)
- Get Question Details
- Run - C++
- Submit - C++

### 5. Search a 2D Matrix (Matrix)
- Get Question Details
- Run - C++
- Submit - C++

### 6. Valid Parentheses (String)
- Get Question Details
- Run - C++
- Submit - C++

---

## 🧪 Test Scenarios

### Scenario 1: Test All Questions (C++)

1. **Setup**
   ```
   POST /api/auth/login
   GET /api/rooms/SAMPLE001/questions
   ```

2. **Test Each Question**
   ```
   POST /api/submissions/run (Two Sum - C++)
   POST /api/submissions/run (Reverse Linked List - C++)
   POST /api/submissions/run (Max Depth - C++)
   POST /api/submissions/run (Search Matrix - C++)
   POST /api/submissions/run (Valid Parentheses - C++)
   ```

3. **Submit Solutions**
   ```
   POST /api/submissions/submit (for each question)
   ```

### Scenario 2: Test Multi-Language Support

Test Two Sum in all languages:
```
POST /api/submissions/run (C++)
POST /api/submissions/run (Java)
POST /api/submissions/run (Python)
```

### Scenario 3: Test Different Data Structures

- **Arrays:** Two Sum
- **Linked Lists:** Reverse Linked List
- **Trees:** Maximum Depth
- **Matrices:** Search Matrix
- **Strings:** Valid Parentheses

---

## 📝 Sample Request Bodies

### Run Code Request
```json
{
  "questionId": "{{questionId_twoSum}}",
  "language": "cpp",
  "code": "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n}"
}
```

### Submit Code Request
```json
{
  "questionId": "{{questionId_twoSum}}",
  "language": "cpp",
  "code": "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n}"
}
```

---

## ✅ Expected Responses

### Successful Run
```json
{
  "status": "success",
  "testResults": [
    {
      "testCaseId": "...",
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

### Successful Submit
```json
{
  "submissionId": "...",
  "status": "ACCEPTED",
  "passedTestCases": 3,
  "totalTestCases": 3,
  "score": 100,
  "executionTime": 45,
  "memoryUsed": 2048
}
```

---

## 🎯 Solution Code Examples

### 1. Two Sum (C++)
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

### 2. Reverse Linked List (C++)
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

### 3. Maximum Depth (C++)
```cpp
int maxDepth(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}
```

### 4. Search Matrix (C++)
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

### 5. Valid Parentheses (C++)
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

## 🔍 Debugging Tips

### Check Server is Running
```bash
curl http://localhost:3001/health
```

### View Server Logs
```bash
cd backend
npm run dev
# Watch for wrapper generation logs
```

### Verify Questions Exist
```bash
cd backend
npx prisma studio
# Navigate to Question table
```

### Test Individual Endpoint
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sample@example.com","password":"password123"}'

# Get Questions
curl http://localhost:3001/api/rooms/SAMPLE001/questions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Testing Checklist

### Basic Tests
- [ ] Login successful
- [ ] Get all 5 questions
- [ ] Each question has metadata format
- [ ] Run code works for each question
- [ ] Submit code works for each question

### Language Tests
- [ ] C++ wrapper generation works
- [ ] Java wrapper generation works
- [ ] Python wrapper generation works
- [ ] JavaScript wrapper generation works

### Data Structure Tests
- [ ] Array parsing (Two Sum)
- [ ] Linked List parsing (Reverse List)
- [ ] Tree parsing (Max Depth)
- [ ] Matrix parsing (Search Matrix)
- [ ] String parsing (Valid Parentheses)

### Edge Cases
- [ ] Empty inputs
- [ ] Null values in trees
- [ ] Single element arrays
- [ ] Large inputs

---

## 🚨 Common Issues

### Issue: "authToken is empty"
**Solution:** Run "1. Setup → Login" first

### Issue: "questionId_* is empty"
**Solution:** Run "1. Setup → Get Questions from Room" after login

### Issue: "Connection refused"
**Solution:** Ensure backend server is running on port 3001
```bash
cd backend
npm run dev
```

### Issue: "Question not found"
**Solution:** Run the seed script
```bash
cd backend
node scripts/resetAndSeedQuestions.js
```

### Issue: "Compilation error"
**Solution:** Check code syntax matches the language

---

## 📈 Performance Testing

### Test Response Times
1. Run Collection Runner
2. Check "Response Time" column
3. Expected: < 2000ms for run, < 3000ms for submit

### Test Concurrent Requests
1. Use Postman Collection Runner
2. Set iterations: 10
3. Set delay: 100ms
4. Monitor server performance

---

## 🎓 Learning Resources

### API Endpoints
- `POST /api/auth/login` - Authenticate user
- `GET /api/rooms/:code/questions` - Get room questions
- `GET /api/questions/:id` - Get question details
- `POST /api/submissions/run` - Run code (sample tests)
- `POST /api/submissions/submit` - Submit code (all tests)

### Metadata Format
Each question includes:
- `inputFormats[]` - Array of input format specs
- `outputFormat` - Output format spec
- `parseStrategy` - How to parse input
- `serializeStrategy` - How to serialize output

---

## ✨ Next Steps

1. **Import Collection** into Postman
2. **Run Setup** requests
3. **Test Each Question** with provided solutions
4. **Try Different Languages** (C++, Java, Python)
5. **Modify Solutions** to test edge cases
6. **Check Server Logs** to see wrapper generation

---

**Happy Testing! 🚀**

The metadata-driven wrapper generation system is ready to handle all these questions across all languages!

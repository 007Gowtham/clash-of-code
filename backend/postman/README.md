# User Function Submission API - Postman Testing Guide

## Setup Instructions

### 1. Import the Postman Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `postman/User_Function_Submission_API.postman_collection.json`
4. The collection will appear in your Collections sidebar

### 2. Configure Environment Variables

The collection uses these variables (already configured):

- `base_url`: `http://localhost:3004` (default)
- `auth_token`: Auto-populated after login
- `question_id`: **YOU MUST SET THIS** - Get a valid question ID from your database

**To set the question_id:**
1. Click on the collection name
2. Go to **Variables** tab
3. Update `question_id` with a valid UUID from your database
4. Click **Save**

### 3. Get Authentication Token

**Before testing the submission endpoints, you must login:**

1. Expand the **Authentication** folder
2. Run the **Login** request
3. The `auth_token` will be automatically saved to the environment
4. All subsequent requests will use this token

---

## Available Endpoints

### 1. Run User Function (Sample Tests Only)

**Endpoint**: `POST /api/submissions/run-function/:questionId`

**Purpose**: Test your function against sample test cases without saving to database

**Request Body**:
```json
{
  "userFunctionCode": "def twoSum(nums, target):\n    # Your solution here\n    return []",
  "language": "python"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "verdict": "ACCEPTED",
    "testsPassed": 2,
    "totalTests": 2,
    "executionTime": 0.05,
    "memory": 512,
    "results": [
      {
        "status": "PASSED",
        "input": "...",
        "expectedOutput": "...",
        "actualOutput": "...",
        "executionTime": 0.02,
        "memory": 256
      }
    ]
  }
}
```

---

### 2. Submit User Function (All Tests)

**Endpoint**: `POST /api/submissions/submit-function/:questionId`

**Purpose**: Submit your function against ALL test cases and save to database

**Request Body**:
```json
{
  "userFunctionCode": "function twoSum(nums, target) {\n    // Your solution\n    return [];\n}",
  "language": "javascript"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "verdict": "ACCEPTED",
    "testsPassed": 10,
    "totalTests": 10,
    "points": 100,
    "executionTime": 0.12,
    "memory": 1024,
    "results": [...]
  }
}
```

---

## Testing Examples by Language

The collection includes pre-configured examples for all 4 languages:

### Python
```python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```

### JavaScript
```javascript
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
```

### C++
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

### Java
```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[0];
}
```

---

## Testing Workflow

1. **Login** → Get auth token
2. **Set question_id** → Use a valid question from your database
3. **Run Function** → Test with sample cases first
4. **Submit Function** → Submit for full evaluation when ready

---

## Common Issues

### 401 Unauthorized
- **Solution**: Run the Login request first to get a valid token

### 404 Question Not Found
- **Solution**: Update the `question_id` variable with a valid UUID from your database

### 400 Missing Metadata
- **Solution**: Ensure the question has `functionSignature`, `inputType`, and `outputType` fields

### 500 Template Not Found
- **Solution**: Run the template generation script for the question:
  ```bash
  node backend/scripts/generateTemplatesFor15.js
  ```

---

## Tips

- Use **Run Function** for quick testing during development
- Use **Submit Function** only when you're confident in your solution
- Check the `results` array for detailed test case feedback
- The `verdict` field shows overall pass/fail status
- `points` are only awarded on **Submit Function** with all tests passing

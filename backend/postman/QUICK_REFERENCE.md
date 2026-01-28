# Quick Reference: User Function Submission API

## 🚀 Quick Start

### 1. Import Postman Collection
```
File: backend/postman/User_Function_Submission_API.postman_collection.json
```

### 2. Set Variables
- `question_id`: Get from database (required)
- `base_url`: http://localhost:3004 (default)

### 3. Login First
Run the **Login** request to get auth token (auto-saved)

---

## 📡 Endpoints

### Run Function (Sample Tests)
```
POST /api/submissions/run-function/:questionId
```
- Tests against sample test cases only
- Does NOT save to database
- Quick feedback for development

### Submit Function (All Tests)
```
POST /api/submissions/submit-function/:questionId
```
- Tests against ALL test cases
- Saves submission to database
- Calculates and awards points

---

## 📝 Request Format

```json
{
  "userFunctionCode": "YOUR_FUNCTION_CODE_HERE",
  "language": "python|javascript|cpp|java"
}
```

**Important**: Only send the function implementation, NOT the complete file!

---

## ✅ Example: Python Two Sum

```json
{
  "userFunctionCode": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
  "language": "python"
}
```

---

## 📊 Response Format

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

## 🔧 Supported Languages

| Language | Code |
|----------|------|
| Python 3.10 | `python` |
| JavaScript (Node.js) | `javascript` |
| C++17 | `cpp` |
| Java 11 | `java` |

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Login first to get token |
| 404 Not Found | Check `question_id` is valid |
| 400 Bad Request | Ensure question has metadata |
| 500 Server Error | Generate templates first |

---

## 📚 Full Documentation

See: `backend/postman/README.md`

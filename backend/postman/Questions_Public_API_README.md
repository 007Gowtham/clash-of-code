# Public Questions API - Testing Guide

## 📚 Overview

This endpoint allows you to fetch all questions from the database **without authentication**. Perfect for displaying questions on a public page or for users who haven't logged in yet.

---

## 🚀 Quick Start

### Import Postman Collection
```
File: backend/postman/Questions_Public_API.postman_collection.json
```

### No Authentication Required!
This endpoint is completely public - no login needed.

---

## 📡 Endpoint

### Get All Questions

```
GET /api/questions
```

**Features:**
- ✅ No authentication required
- ✅ Returns all questions in database
- ✅ Includes sample test cases only (hidden test cases excluded)
- ✅ Includes templates for all 4 languages
- ✅ Includes hints and constraints
- ✅ No room or team filtering

---

## 📝 Request Example

### Using cURL
```bash
curl -X GET http://localhost:3004/api/questions
```

### Using Postman
1. Import the collection
2. Run "Get All Questions" request
3. No setup needed!

### Using JavaScript (Fetch)
```javascript
fetch('http://localhost:3004/api/questions')
  .then(response => response.json())
  .then(data => {
    console.log('Total questions:', data.data.total);
    console.log('Questions:', data.data.questions);
  });
```

---

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "0ab9b722-71cc-49a4-bf6c-6ccfb2aaf3ea",
        "title": "Two Sum",
        "slug": "two-sum",
        "description": "Given an array of integers nums and an integer target...",
        "difficulty": "EASY",
        "points": 100,
        "sampleInput": "[2,7,11,15]\n9",
        "sampleOutput": "[0,1]",
        "functionName": "twoSum",
        "functionSignature": {
          "params": [
            {"name": "nums", "type": "vector<int>&"},
            {"name": "target", "type": "int"}
          ],
          "returnType": "vector<int>"
        },
        "inputType": "[\"array<int>\", \"int\"]",
        "outputType": "array<int>",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "hints": [
          {
            "id": "hint-uuid",
            "content": "Try using a hash map to store complements",
            "order": 1
          }
        ],
        "constraints": [
          {
            "id": "constraint-uuid",
            "content": "2 <= nums.length <= 10^4",
            "order": 1
          }
        ],
        "sampleTestCases": [
          {
            "id": "test-uuid",
            "input": "[2,7,11,15]\n9",
            "output": "[0,1]",
            "explanation": "Because nums[0] + nums[1] == 9"
          }
        ],
        "templates": {
          "python": {
            "userFunction": "def twoSum(nums: List[int], target: int) -> List[int]:\n    # TODO: Implement\n    return []",
            "boilerplate": "import sys\nfrom typing import List\n\nclass ListNode:...",
            "headerCode": "import sys\nfrom typing import List",
            "definition": "class ListNode:..."
          },
          "javascript": {
            "userFunction": "function twoSum(nums, target) {\n    // TODO: Implement\n    return [];\n}",
            "boilerplate": "...",
            "headerCode": "...",
            "definition": "..."
          },
          "cpp": {...},
          "java": {...}
        },
        "createdAt": "2026-01-25T07:30:00.000Z"
      }
    ],
    "total": 15
  }
}
```

---

## 🎯 Use Cases

### 1. Display Questions List
```javascript
// Fetch all questions for display
const response = await fetch('/api/questions');
const { data } = await response.json();

data.questions.forEach(q => {
  console.log(`${q.title} (${q.difficulty}) - ${q.points} points`);
});
```

### 2. Filter by Difficulty
```javascript
// Client-side filtering
const easyQuestions = data.questions.filter(q => q.difficulty === 'EASY');
const mediumQuestions = data.questions.filter(q => q.difficulty === 'MEDIUM');
const hardQuestions = data.questions.filter(q => q.difficulty === 'HARD');
```

### 3. Get Template for Editor
```javascript
// Get Python template for a specific question
const question = data.questions.find(q => q.slug === 'two-sum');
const pythonTemplate = question.templates.python.userFunction;

// Display in code editor
editor.setValue(pythonTemplate);
```

---

## 🔍 Response Fields Explained

| Field | Description |
|-------|-------------|
| `id` | Unique question identifier (UUID) |
| `title` | Question title |
| `slug` | URL-friendly identifier |
| `description` | Full problem description |
| `difficulty` | EASY, MEDIUM, or HARD |
| `points` | Points awarded for solving |
| `sampleInput` | Example input |
| `sampleOutput` | Example output |
| `functionName` | Name of the function to implement |
| `functionSignature` | Function signature details |
| `inputType` | Input parameter types |
| `outputType` | Return type |
| `timeLimit` | Time limit in milliseconds |
| `memoryLimit` | Memory limit in MB |
| `hints` | Array of hints |
| `constraints` | Array of constraints |
| `sampleTestCases` | Public test cases (hidden ones excluded) |
| `templates` | Code templates for all languages |
| `createdAt` | Question creation timestamp |

---

## 🛡️ Security Notes

- ✅ **Safe for public access** - Only returns sample test cases
- ✅ **Hidden test cases excluded** - Full test suite is protected
- ✅ **No user data exposed** - No room or team information
- ✅ **Read-only** - Cannot modify questions via this endpoint

---

## 💡 Tips

1. **Cache the response** - Questions don't change frequently
2. **Filter client-side** - More efficient than multiple API calls
3. **Use templates** - Pre-populate code editors with starter code
4. **Display hints progressively** - Show hints one at a time
5. **Group by difficulty** - Organize questions for better UX

---

## 🔗 Related Endpoints

After getting questions, users can:
- Submit solutions: `POST /api/submissions/run-function/:questionId`
- Get full details: `GET /api/questions/:questionId` (may require auth)

---

## ✅ Testing Checklist

- [ ] Import Postman collection
- [ ] Run "Get All Questions" request
- [ ] Verify response contains questions array
- [ ] Check that templates are included
- [ ] Confirm sample test cases are present
- [ ] Verify no authentication errors

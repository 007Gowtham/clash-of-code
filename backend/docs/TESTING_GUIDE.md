# 🧪 Complete Testing Guide for All Questions

## 📊 Validation Summary

**Total Questions in Database**: 62
- ✅ **Valid & Ready**: 18 questions
- 🔨 **Needs Templates**: 0 questions  
- ❌ **Invalid/Missing Metadata**: 44 questions

## ✅ Valid Questions (Ready for Testing)

All 18 questions below have complete metadata and templates for all 4 languages (C++, Python, JavaScript, Java):

### 1. **Two Sum** (2 instances)
- ID: `5ac2e1dc-ebe2-4237-beb2-eaff156cbc61`
- ID: `0ab9b722-71cc-49a4-bf6c-6ccfb2aaf3ea`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 2. **Longest Palindromic Substring**
- ID: `1161a352-670b-40e7-98fb-4cc1cdc521dc`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 3. **Binary Tree Level Order Traversal** (2 instances)
- ID: `419f4347-7a30-4ec0-817e-c9e0900ce5aa`
- ID: `d4f8ab9c-392c-48c4-8070-10f823e69d84`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 4. **Reverse Linked List**
- ID: `32685719-edac-4e84-a7f7-d228ae7b2196`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 5. **Valid Palindrome**
- ID: `42ca5d59-f1d2-457f-a687-66ef18d26ee4`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 6. **Spiral Matrix**
- ID: `f653ccc8-a678-4817-a053-2ec9cf814668`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 7. **Binary Search**
- ID: `809e3955-e547-4945-adc0-b68033b03d1f`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 8. **Climbing Stairs**
- ID: `c9c72d95-4631-459f-8b0e-ca952b40f212`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 9. **Number of Islands**
- ID: `3a5809a7-df85-419d-a975-50036faf03c9`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 10. **Valid Parentheses**
- ID: `cac8a2f4-6251-40d1-ae59-4a4aca6cc38f`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 11. **Contains Duplicate**
- ID: `cd412cf0-786a-4c0e-a09a-3199536e96af`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 12. **Merge Intervals**
- ID: `ee3c80e9-0dd3-40fb-8e82-9d81cf7d832a`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 13. **Generate Parentheses**
- ID: `5cb0504f-a15e-43a8-b89e-cbe2aed7798b`
- Difficulty: Medium
- Languages: ✅ C++, Python, JavaScript, Java

### 14. **Best Time to Buy and Sell Stock**
- ID: `0e9ee7cc-485f-4666-a884-9c897d21477e`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 15. **Maximum Depth of Binary Tree**
- ID: `f09888f6-dcec-46d6-8be2-ba6a286c822d`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

### 16. **Merge Two Sorted Lists**
- ID: `19a0fabd-ec7c-4f24-aa4d-ca749c0773a5`
- Difficulty: Easy
- Languages: ✅ C++, Python, JavaScript, Java

---

## 📦 Postman Collections

### Collection 1: Run Function (Sample Test Cases)
**File**: `postman/Run_Function_All_Questions.postman_collection.json`

- **Purpose**: Test with sample test cases only
- **Endpoint**: `POST /api/submissions/run-function/:questionId`
- **Total Requests**: 64 (16 questions × 4 languages)
- **Use Case**: Quick validation, debugging

### Collection 2: Submit Function (All Test Cases)
**File**: `postman/Submit_Function_All_Questions.postman_collection.json`

- **Purpose**: Full submission with all test cases (including hidden)
- **Endpoint**: `POST /api/submissions/submit-function/:questionId`
- **Total Requests**: 64 (16 questions × 4 languages)
- **Use Case**: Final validation, scoring

---

## 🚀 How to Use Postman Collections

### Step 1: Import Collections
1. Open Postman
2. Click **Import**
3. Select both collection files:
   - `Run_Function_All_Questions.postman_collection.json`
   - `Submit_Function_All_Questions.postman_collection.json`

### Step 2: Set Environment (Optional)
Create a Postman environment with:
```json
{
  "baseUrl": "http://localhost:3004"
}
```

### Step 3: Test Individual Questions
1. Expand a question folder (e.g., "Two Sum")
2. Click on a language request (e.g., "Two Sum - PYTHON")
3. Click **Send**
4. Review response

### Step 4: Run All Tests (Collection Runner)
1. Click on collection name
2. Click **Run**
3. Select all requests or specific folders
4. Click **Run [Collection Name]**
5. View results summary

---

## 📋 Request Format

### Run Function Request
```json
{
  "userFunctionCode": "def twoSum(nums, target):\n    # Your solution here\n    return []",
  "language": "python"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "verdict": "ACCEPTED",
    "testsPassed": 2,
    "totalTests": 2,
    "executionTime": 0.05,
    "memory": 8172,
    "results": [...]
  }
}
```

---

## 🧪 Manual Testing Examples

### Test Two Sum (Python)
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{
    "userFunctionCode": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
    "language": "python"
  }'
```

### Test Two Sum (Java)
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{
    "userFunctionCode": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[]{map.get(complement), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[0];\n}",
    "language": "java"
  }'
```

---

## 🔍 Validation Scripts

### Validate All Questions
```bash
node scripts/validateAllQuestions.js
```

### Regenerate Postman Collections
```bash
node scripts/generatePostmanCollections.js
```

### Check Specific Question
```bash
node -e "
const { prisma } = require('./src/config/database');
async function check() {
  const q = await prisma.question.findUnique({
    where: { id: '5ac2e1dc-ebe2-4237-beb2-eaff156cbc61' },
    include: { templates: true, testCases: { take: 1 } }
  });
  console.log(JSON.stringify(q, null, 2));
  await prisma.\$disconnect();
}
check();
"
```

---

## ✅ Testing Checklist

For each question, verify:

- [ ] **Python** - Run Function works
- [ ] **Python** - Submit Function works
- [ ] **JavaScript** - Run Function works
- [ ] **JavaScript** - Submit Function works
- [ ] **Java** - Run Function works
- [ ] **Java** - Submit Function works
- [ ] **C++** - Run Function works
- [ ] **C++** - Submit Function works

---

## 📊 Expected Test Results

### Success Criteria
- ✅ `success: true`
- ✅ `verdict: "ACCEPTED"`
- ✅ `testsPassed === totalTests`
- ✅ No compilation errors
- ✅ No runtime errors

### Common Issues
- ❌ `COMPILATION_ERROR` - Check syntax
- ❌ `RUNTIME_ERROR` - Check logic/edge cases
- ❌ `WRONG_ANSWER` - Output doesn't match expected
- ❌ `TIME_LIMIT_EXCEEDED` - Solution too slow

---

## 🔧 Troubleshooting

### Issue: Template Not Found
**Solution**: Regenerate templates
```bash
node -e "
const templateService = require('./src/services/wrapperGeneration/TemplateGenerationService');
templateService.generateTemplatesForQuestion('QUESTION_ID_HERE');
"
```

### Issue: Judge0 Not Running
**Solution**: Check Judge0 status
```bash
curl http://localhost:2358/about
docker ps | grep judge0
```

### Issue: Wrong Test Case Format
**Solution**: Check test case input format matches inputType

---

## 📝 Notes

- All valid questions have been tested with the validation script
- Templates are automatically generated for all 4 languages
- Test cases have been verified for correct format
- Judge0 self-hosted instance is configured and working

---

## 🎯 Next Steps

1. Import Postman collections
2. Run collection tests to verify all questions work
3. Fix any failing questions
4. Add more questions by ensuring proper metadata
5. Expand test coverage

---

**Generated**: 2026-01-25
**Total Valid Questions**: 18
**Total Test Requests**: 128 (64 run + 64 submit)

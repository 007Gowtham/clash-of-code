# 🎯 Question Validation & Testing - Complete Package

## 📦 What's Included

This package contains everything you need to test all valid questions across all 4 programming languages.

---

## 🚀 Quick Start

### 1. Import Postman Collections

**Location**: `postman/` directory

Import these two files into Postman:
- ✅ `Run_Function_All_Questions.postman_collection.json` (64 requests)
- ✅ `Submit_Function_All_Questions.postman_collection.json` (64 requests)

### 2. Start Testing

**Option A - Postman UI**:
1. Open collection
2. Expand question folder
3. Click on any language request
4. Click "Send"

**Option B - Collection Runner**:
1. Click collection name
2. Click "Run"
3. Select all requests
4. Click "Run Collection"

**Option C - Command Line**:
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{"userFunctionCode": "def twoSum(nums, target):\n    return []", "language": "python"}'
```

---

## 📊 Validation Results

### Summary
- **Total Questions**: 62
- **✅ Valid**: 18 questions (all 4 languages)
- **❌ Invalid**: 44 questions (missing metadata)

### Valid Questions
All 18 questions have complete:
- Metadata (functionName, inputType, outputType, functionSignature)
- Templates (C++, Python, JavaScript, Java)
- Test cases (sample and hidden)

**See**: `docs/TESTING_GUIDE.md` for complete list

---

## 📁 Files & Documentation

### Postman Collections
```
postman/
├── Run_Function_All_Questions.postman_collection.json
└── Submit_Function_All_Questions.postman_collection.json
```

### Documentation
```
docs/
├── VALIDATION_SUMMARY.md    ← Start here!
├── TESTING_GUIDE.md          ← Complete testing guide
├── QUESTION_IDS.md           ← Quick reference
├── JUDGE0_SUCCESS.md         ← Judge0 setup
└── WORKING_QUESTIONS.md      ← Valid questions
```

### Scripts
```
scripts/
├── validateAllQuestions.js          ← Run validation
└── generatePostmanCollections.js    ← Generate collections
```

### Results
```
validation-results.json    ← Detailed validation report
```

---

## 🧪 Testing Coverage

### Per Question
- 4 languages (Python, JavaScript, Java, C++)
- 2 endpoints (run-function, submit-function)
- **= 8 tests per question**

### Total Coverage
- 18 valid questions
- 8 tests each
- **= 144 total test cases**

---

## 📋 Quick Reference

### Most Common Question IDs

**Two Sum**:
```
5ac2e1dc-ebe2-4237-beb2-eaff156cbc61
```

**Reverse Linked List**:
```
32685719-edac-4e84-a7f7-d228ae7b2196
```

**Valid Palindrome**:
```
42ca5d59-f1d2-457f-a687-66ef18d26ee4
```

**See**: `docs/QUESTION_IDS.md` for all IDs

---

## 🔧 Validation Scripts

### Run Full Validation
```bash
node scripts/validateAllQuestions.js
```

**Output**:
- Console report with all questions
- `validation-results.json` file

### Regenerate Postman Collections
```bash
node scripts/generatePostmanCollections.js
```

**Output**:
- Updated Postman collection files
- Based on current validation results

---

## ✅ System Requirements

### Backend Server
- ✅ Running on port 3004
- ✅ All endpoints operational

### Judge0 Self-Hosted
- ✅ Running on `http://127.0.0.1:2358`
- ✅ No API key needed
- ✅ All languages configured

### Database
- ✅ 18 questions with complete metadata
- ✅ All templates generated
- ✅ Test cases validated

---

## 📖 Documentation Guide

### For Quick Testing
→ `docs/QUESTION_IDS.md`

### For Comprehensive Testing
→ `docs/TESTING_GUIDE.md`

### For System Overview
→ `docs/VALIDATION_SUMMARY.md`

### For Judge0 Setup
→ `docs/JUDGE0_SUCCESS.md`

---

## 🎯 Expected Results

### Success
```json
{
  "success": true,
  "data": {
    "verdict": "ACCEPTED",
    "testsPassed": 2,
    "totalTests": 2
  }
}
```

### Failure
```json
{
  "success": true,
  "data": {
    "verdict": "WRONG_ANSWER",
    "testsPassed": 0,
    "totalTests": 2,
    "results": [...]
  }
}
```

---

## 🔍 Troubleshooting

### Template Not Found
```bash
node -e "require('./src/services/wrapperGeneration/TemplateGenerationService').generateTemplatesForQuestion('QUESTION_ID')"
```

### Judge0 Not Responding
```bash
curl http://localhost:2358/about
docker ps | grep judge0
```

### Invalid Question
Check `validation-results.json` for specific issues

---

## 📞 Support Resources

### Files
- `validation-results.json` - Detailed validation report
- `docs/TESTING_GUIDE.md` - Complete testing guide
- `docs/VALIDATION_SUMMARY.md` - System overview

### Scripts
- `scripts/validateAllQuestions.js` - Validate questions
- `scripts/generatePostmanCollections.js` - Generate collections

---

## 🎉 You're Ready!

**Everything is set up and ready for testing:**

1. ✅ 18 questions validated
2. ✅ 128 Postman requests generated
3. ✅ All 4 languages supported
4. ✅ Complete documentation provided
5. ✅ Judge0 configured and working

**Import the Postman collections and start testing!** 🚀

---

**Last Updated**: 2026-01-25
**Total Valid Questions**: 18
**Total Test Requests**: 128
**Languages Supported**: C++, Python, JavaScript, Java

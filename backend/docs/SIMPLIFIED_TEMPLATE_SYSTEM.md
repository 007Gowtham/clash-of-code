# Simplified Code Template System

## Overview

This document explains the simplified code template system that replaces the complex automatic wrapper generation.

## What Changed?

### Before (Complex System ❌)
- Automatic wrapper generation from question metadata
- Complex parsing strategies for different data structures
- Format specification resolvers
- Strategy registries
- Often failed for edge cases

### After (Simplified System ✅)
- Pre-written wrapper code stored directly in database
- Simple concatenation of wrapper parts with user code
- More reliable and predictable
- Easier to debug and maintain

## How It Works

### 1. Database Storage

Each question has templates stored in the `QuestionTemplate` table with these fields:

```javascript
{
  questionId: "uuid",
  language: "cpp" | "python" | "javascript" | "java",
  
  // Template components:
  headerCode: "// Imports, includes, helper functions",
  definition: "// Data structure definitions (ListNode, TreeNode, etc.)",
  userFunction: "// User's function signature (shown in editor)",
  mainFunction: "// Wrapper code that reads input, calls user function, prints output",
  boilerplate: "// Any additional boilerplate code"
}
```

### 2. Code Execution Flow

When a user runs or submits code:

1. **Frontend** sends `userFunctionCode` and `language` to backend
2. **Backend** fetches the template from database
3. **Backend** concatenates parts in order:
   ```
   headerCode
   + definition
   + userFunctionCode (from user)
   + mainFunction
   + boilerplate
   ```
4. **Backend** sends complete code to Judge0 for execution
5. **Backend** returns results to frontend

### 3. Example Template Structure

#### C++ Template for Two Sum:

```cpp
// headerCode:
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// definition:
// (empty for this problem, but would contain ListNode/TreeNode if needed)

// userFunction (shown in editor):
vector<int> twoSum(vector<int>& nums, int target) {
    // User writes code here
}

// mainFunction (wrapper):
int main() {
    string line;
    getline(cin, line);
    
    // Parse input array
    vector<int> nums;
    stringstream ss(line);
    int num;
    while (ss >> num) nums.push_back(num);
    
    // Parse target
    int target;
    cin >> target;
    
    // Call user function
    vector<int> result = twoSum(nums, target);
    
    // Print output
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
```

## Services

### codeTemplateService.js

The new simplified service provides these methods:

- **`getTemplate(questionId, language)`** - Fetch template from database
- **`generateExecutableCode(questionId, language, userFunctionCode)`** - Combine template with user code
- **`getUserFunctionTemplate(questionId, language)`** - Get just the user function signature
- **`saveTemplate(questionId, language, templateData)`** - Save/update template
- **`getAllTemplatesForQuestion(questionId)`** - Get all language templates for a question

## Migration Guide

### For Adding New Questions

1. **Create the question** in the database with basic info
2. **Write wrapper code** for each language manually
3. **Save templates** using `codeTemplateService.saveTemplate()`:

```javascript
await codeTemplateService.saveTemplate(questionId, 'cpp', {
  headerCode: '...',
  definition: '...',
  userFunction: '...',
  mainFunction: '...',
  boilerplate: '...'
});
```

### For Existing Questions

Existing questions that already have templates in the database will continue to work without changes.

## Benefits

✅ **Reliability** - No more generation failures  
✅ **Simplicity** - Easy to understand and debug  
✅ **Control** - Full control over wrapper code  
✅ **Maintainability** - Easy to fix issues or optimize  
✅ **Predictability** - Same wrapper every time  

## Files Modified

- ✅ Created: `src/services/codeTemplateService.js`
- ✅ Updated: `src/controllers/submissionController.js`
- ⚠️ Deprecated: `src/services/wrapperGeneration/*` (can be removed)

## Testing

The system is backward compatible. All existing questions with templates will work immediately.

To test:
1. Run code with existing question
2. Submit code with existing question
3. Verify execution works correctly

## Future Improvements

- Create admin UI for managing templates
- Add template validation
- Create template library for common patterns
- Add template versioning

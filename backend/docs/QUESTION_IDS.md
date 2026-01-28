# 📋 Quick Reference - All Valid Question IDs

## Copy-Paste Ready Question IDs

### Two Sum
```
5ac2e1dc-ebe2-4237-beb2-eaff156cbc61
0ab9b722-71cc-49a4-bf6c-6ccfb2aaf3ea
```

### Longest Palindromic Substring
```
1161a352-670b-40e7-98fb-4cc1cdc521dc
```

### Binary Tree Level Order Traversal
```
419f4347-7a30-4ec0-817e-c9e0900ce5aa
d4f8ab9c-392c-48c4-8070-10f823e69d84
```

### Reverse Linked List
```
32685719-edac-4e84-a7f7-d228ae7b2196
```

### Valid Palindrome
```
42ca5d59-f1d2-457f-a687-66ef18d26ee4
```

### Spiral Matrix
```
f653ccc8-a678-4817-a053-2ec9cf814668
```

### Binary Search
```
809e3955-e547-4945-adc0-b68033b03d1f
```

### Climbing Stairs
```
c9c72d95-4631-459f-8b0e-ca952b40f212
```

### Number of Islands
```
3a5809a7-df85-419d-a975-50036faf03c9
```

### Valid Parentheses
```
cac8a2f4-6251-40d1-ae59-4a4aca6cc38f
```

### Contains Duplicate
```
cd412cf0-786a-4c0e-a09a-3199536e96af
```

### Merge Intervals
```
ee3c80e9-0dd3-40fb-8e82-9d81cf7d832a
```

### Generate Parentheses
```
5cb0504f-a15e-43a8-b89e-cbe2aed7798b
```

### Best Time to Buy and Sell Stock
```
0e9ee7cc-485f-4666-a884-9c897d21477e
```

### Maximum Depth of Binary Tree
```
f09888f6-dcec-46d6-8be2-ba6a286c822d
```

### Merge Two Sorted Lists
```
19a0fabd-ec7c-4f24-aa4d-ca749c0773a5
```

---

## Quick Test Commands

### Test Two Sum (All Languages)

**Python**:
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{"userFunctionCode": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []", "language": "python"}'
```

**JavaScript**:
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{"userFunctionCode": "function twoSum(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) return [i, j];\n        }\n    }\n    return [];\n}", "language": "javascript"}'
```

**Java**:
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{"userFunctionCode": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[]{map.get(complement), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[0];\n}", "language": "java"}'
```

**C++**:
```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{"userFunctionCode": "vector<int> twoSum(vector<int>& nums, int target) {\n    for (int i = 0; i < nums.size(); i++) {\n        for (int j = i + 1; j < nums.size(); j++) {\n            if (nums[i] + nums[j] == target) return {i, j};\n        }\n    }\n    return {};\n}", "language": "cpp"}'
```

---

## All Question IDs (Array Format)

```javascript
const validQuestionIds = [
  "1161a352-670b-40e7-98fb-4cc1cdc521dc", // Longest Palindromic Substring
  "5ac2e1dc-ebe2-4237-beb2-eaff156cbc61", // Two Sum
  "419f4347-7a30-4ec0-817e-c9e0900ce5aa", // Binary Tree Level Order Traversal
  "32685719-edac-4e84-a7f7-d228ae7b2196", // Reverse Linked List
  "0ab9b722-71cc-49a4-bf6c-6ccfb2aaf3ea", // Two Sum
  "d4f8ab9c-392c-48c4-8070-10f823e69d84", // Binary Tree Level Order Traversal
  "42ca5d59-f1d2-457f-a687-66ef18d26ee4", // Valid Palindrome
  "f653ccc8-a678-4817-a053-2ec9cf814668", // Spiral Matrix
  "809e3955-e547-4945-adc0-b68033b03d1f", // Binary Search
  "c9c72d95-4631-459f-8b0e-ca952b40f212", // Climbing Stairs
  "3a5809a7-df85-419d-a975-50036faf03c9", // Number of Islands
  "cac8a2f4-6251-40d1-ae59-4a4aca6cc38f", // Valid Parentheses
  "cd412cf0-786a-4c0e-a09a-3199536e96af", // Contains Duplicate
  "ee3c80e9-0dd3-40fb-8e82-9d81cf7d832a", // Merge Intervals
  "5cb0504f-a15e-43a8-b89e-cbe2aed7798b", // Generate Parentheses
  "0e9ee7cc-485f-4666-a884-9c897d21477e", // Best Time to Buy and Sell Stock
  "f09888f6-dcec-46d6-8be2-ba6a286c822d", // Maximum Depth of Binary Tree
  "19a0fabd-ec7c-4f24-aa4d-ca749c0773a5"  // Merge Two Sorted Lists
];
```

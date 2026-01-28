# ✅ WORKING QUESTION IDS

After fixing the database, here are the question IDs that now work:

## Two Sum Questions (All Working)
- `5ac2e1dc-ebe2-4237-beb2-eaff156cbc61` (slug: two-sum) ✅ **RECOMMENDED**
- `7daf0f33-a205-46b8-97ca-8c8ffc87d43f` (slug: two-sum-1) ✅
- `80e275da-592e-4aeb-9e0f-dd8a2dd5b71d` (slug: two-sum-2) ✅
- `883ef697-d864-4129-b6c1-37ae3b46faf3` (slug: two-sum-3) ✅
- `8f29f4f7-def0-4ed0-a955-c424e9d47bc8` (slug: two-sum-4) ✅
- `b4c870cd-ddad-4ff0-abec-579948b1745d` (slug: two-sum-5) ✅
- `bb12f7e9-94c4-4f41-ae7b-4e669e55a3d7` (slug: two-sum-6) ✅
- `c27e4e27-4930-4b15-8e0e-052b15747f48` (slug: two-sum-7) ✅
- `df8b8b1d-8e68-4498-8a8a-1ca4a84f1387` (slug: two-sum-8) ✅
- `fd2963b1-a252-414a-9460-3bebe580b470` (slug: two-sum-9) ✅

## Other Fixed Questions
- `19a0fabd-ec7c-4f24-aa4d-ca749c0773a5` - Merge Two Sorted Lists ✅
- `32685719-edac-4e84-a7f7-d228ae7b2196` - Reverse Linked List ✅
- `42ca5d59-f1d2-457f-a687-66ef18d26ee4` - Valid Palindrome ✅
- `0e9ee7cc-485f-4666-a884-9c897d21477e` - Best Time to Buy and Sell Stock ✅
- `1161a352-670b-40e7-98fb-4cc1cdc521dc` - Longest Palindromic Substring ✅
- `419f4347-7a30-4ec0-817e-c9e0900ce5aa` - Binary Tree Level Order Traversal ✅
- `3a5809a7-df85-419d-a975-50036faf03c9` - Number of Islands ✅

---

## Test Command

```bash
curl -X POST http://localhost:3004/api/submissions/run-function/5ac2e1dc-ebe2-4237-beb2-eaff156cbc61 \
  -H 'Content-Type: application/json' \
  -d '{
    "userFunctionCode": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
    "language": "python"
  }'
```

---

## Summary

✅ **8 questions fixed** with full templates (C++, Python, JavaScript, Java)
⚠️ **54 questions skipped** (need metadata definitions)

All fixed questions now have:
- ✅ Function signatures
- ✅ Input/output types
- ✅ Templates for all 4 languages
- ✅ Ready for code submission

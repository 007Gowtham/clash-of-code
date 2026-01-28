# Testing Page - Language Switching Guide

## Language Dropdown Location

The language dropdown **IS PRESENT** in the testing page header.

### Location
```
Testing Page Header (Top Right)
├── "Code Testing" Title (Left)
├── Difficulty Badge (if question selected)
└── Controls (Right Side)
    ├── Language Dropdown ← HERE
    ├── Run Button
    └── Submit Button
```

### Available Languages
The dropdown includes:
- ✅ Python
- ✅ JavaScript  
- ✅ C++
- ✅ Java
- ✅ C

### Code Location
File: [page.jsx](file:///home/aswin/Music/frontend/app/testing/page.jsx#L195-L214)

```javascript
<select
    value={language}
    onChange={(e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        // Load template for new language
        if (question) {
            loadTemplateCode(question, newLang);
        } else {
            setCode(getDefaultCode(newLang));
        }
    }}
    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
>
    <option value="python">Python</option>
    <option value="javascript">JavaScript</option>
    <option value="cpp">C++</option>
    <option value="java">Java</option>
    <option value="c">C</option>
</select>
```

## How to Use

1. **Navigate to Testing Page**
   ```
   http://localhost:3000/testing
   ```

2. **Select a Question**
   - Click any question in the left sidebar

3. **Find Language Dropdown**
   - Look at the top-right of the page
   - It's between the difficulty badge and the "Run" button

4. **Switch Language**
   - Click the dropdown
   - Select: Python, JavaScript, C++, Java, or C
   - Code editor updates immediately with the template for that language

## What Happens When You Switch

```
User selects "C++" from dropdown
  ↓
Frontend: loadTemplateCode(question, 'cpp')
  ↓
Extract: template = question.templates['cpp']
  ↓
Code Editor: Shows C++ starter code
```

### Example: Two Sum

**Python:**
```python
class Solution:
    def twoSum(self, nums, target):
        pass
```

**C++:**
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};
```

**Java:**
```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}
```

**JavaScript:**
```javascript
var twoSum = function(nums, target) {
    
};
```

## Troubleshooting

### If you don't see the dropdown:

1. **Refresh the browser**
   - Press `Ctrl+Shift+R` (hard refresh)
   - This ensures latest code is loaded

2. **Check frontend is running**
   ```bash
   # Should show "ready" or "compiled"
   # Check terminal running: npm run dev (in frontend folder)
   ```

3. **Check browser console**
   - Press `F12`
   - Look for any errors in Console tab

4. **Verify you're on the testing page**
   - URL should be: `http://localhost:3000/testing`
   - Not: `/room/[id]/[teamId]/code-editor`

### If dropdown doesn't change code:

1. **Select a question first**
   - Click a question in the left sidebar
   - Then try changing language

2. **Check browser console for errors**
   - Press `F12` → Console tab
   - Look for API errors

3. **Verify templates are loaded**
   - Open browser DevTools → Network tab
   - Select a question
   - Check the API response includes `templates` object

## Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│ Code Testing    [EASY]    [Python ▼] [Run] [Submit]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Questions]  [Description Panel]  [Code Editor]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↑
                    Language Dropdown Here
```

---

**Status:** ✅ Language dropdown is implemented and functional

The dropdown is in the code at lines 195-214 of `page.jsx`. If you're not seeing it in the browser, try a hard refresh (`Ctrl+Shift+R`).

# Quick Test: Public Questions API

## Test the endpoint is working

### Using cURL
```bash
curl http://localhost:3004/api/questions
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "total": 15
  }
}
```

### Using Browser
Simply open: http://localhost:3004/api/questions

---

## Quick Postman Test

1. **Import Collection**
   - File: `backend/postman/Questions_Public_API.postman_collection.json`

2. **Run Request**
   - Open "Get All Questions"
   - Click "Send"
   - No authentication needed!

3. **Check Response**
   - Status: 200 OK
   - Body contains `questions` array
   - Each question has `templates` object

---

## What You Get

Each question includes:
- ✅ Title, description, difficulty
- ✅ Sample test cases (hidden ones excluded)
- ✅ Hints and constraints
- ✅ Templates for Python, JavaScript, C++, Java
- ✅ Function signature and metadata

---

## Integration Example

```javascript
// Fetch questions for your frontend
async function loadQuestions() {
  const response = await fetch('http://localhost:3004/api/questions');
  const { data } = await response.json();
  
  console.log(`Loaded ${data.total} questions`);
  
  // Display in UI
  data.questions.forEach(q => {
    displayQuestion(q);
  });
}
```

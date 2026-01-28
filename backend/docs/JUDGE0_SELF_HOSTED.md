# Judge0 Self-Hosted Configuration Guide

## ✅ Environment Variables

Add this to your `.env` file:

```env
# Self-Hosted Judge0 Configuration
JUDGE0_API_URL=http://127.0.0.1:2358

# Optional: Polling configuration
JUDGE0_MAX_RETRIES=3
JUDGE0_POLL_INTERVAL=500
JUDGE0_POLL_MAX_ATTEMPTS=20
```

## ❌ Remove These (RapidAPI - NOT NEEDED)

Delete these lines from your `.env`:

```env
# ❌ DELETE THESE - Only for RapidAPI
JUDGE0_API_KEY=...
JUDGE0_HOST=...
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
```

---

## 🔧 What Changed

### Before (RapidAPI)
```javascript
this.client = axios.create({
    baseURL: 'https://judge0-ce.p.rapidapi.com',
    headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'your-api-key',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
});
```

### After (Self-Hosted)
```javascript
this.client = axios.create({
    baseURL: 'http://127.0.0.1:2358',
    headers: {
        'Content-Type': 'application/json'
    }
});
```

---

## 🧪 Test Your Configuration

### 1. Check Judge0 is Running

```bash
curl http://127.0.0.1:2358/about
```

Expected response:
```json
{
  "version": "1.13.0",
  ...
}
```

### 2. Test Submission

```bash
curl -X POST http://127.0.0.1:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "print(\"Hello World\")",
    "language_id": 71,
    "stdin": ""
  }'
```

### 3. Test from Your Backend

Restart your server and try submitting code via your API:

```bash
POST http://localhost:3001/api/submissions/run-function/:questionId
```

---

## 🐳 Docker Configuration

If Judge0 is in Docker Compose, use the service name:

```env
JUDGE0_API_URL=http://server:2358
```

(Replace `server` with your Judge0 service name from `docker-compose.yml`)

---

## 📊 Language IDs

Your self-hosted Judge0 uses these language IDs:

| Language   | ID |
|------------|-----|
| C++        | 54  |
| Java       | 62  |
| JavaScript | 63  |
| Python     | 71  |
| C          | 50  |
| C#         | 51  |
| Ruby       | 72  |
| Go         | 60  |

---

## 🔒 Security Notes

### ✅ Production Setup

1. **Don't expose Judge0 publicly** - Keep port 2358 internal
2. **Use your backend as proxy** - All requests go through your API
3. **Add rate limiting** - Prevent abuse
4. **Monitor resources** - Judge0 can be CPU/memory intensive

### ✅ Docker Network

```yaml
services:
  server:
    # Judge0 service
    ports:
      - "2358:2358"  # ❌ Remove this in production
    networks:
      - internal

  backend:
    # Your Node.js backend
    environment:
      - JUDGE0_API_URL=http://server:2358
    networks:
      - internal
```

---

## ✅ Verification Checklist

- [ ] Updated `.env` with `JUDGE0_API_URL=http://127.0.0.1:2358`
- [ ] Removed `JUDGE0_API_KEY` from `.env`
- [ ] Removed `JUDGE0_HOST` from `.env`
- [ ] Restarted backend server
- [ ] Tested Judge0 is accessible (`curl http://127.0.0.1:2358/about`)
- [ ] Tested code submission through your API
- [ ] Verified no RapidAPI errors in logs

---

## 🆘 Troubleshooting

### Error: ECONNREFUSED

**Problem**: Can't connect to Judge0

**Solutions**:
1. Check Judge0 is running: `docker ps | grep judge0`
2. Verify port: `curl http://127.0.0.1:2358/about`
3. Check firewall settings

### Error: 404 Not Found

**Problem**: Wrong endpoint

**Solution**: Ensure using `/submissions` not `/submissions/`

### Slow Response

**Problem**: Judge0 taking too long

**Solutions**:
1. Increase `JUDGE0_POLL_MAX_ATTEMPTS`
2. Check Judge0 container resources
3. Review Judge0 logs: `docker logs judge0-server`

---

## 📝 Summary

✅ **Self-hosted Judge0 is simpler**:
- No API key
- No rate limits
- No cost
- Full control
- Local/fast

❌ **RapidAPI is NOT needed**:
- Removed all auth headers
- Removed subscription error handling
- Simplified configuration

Your backend now communicates directly with your local Judge0 instance! 🎉

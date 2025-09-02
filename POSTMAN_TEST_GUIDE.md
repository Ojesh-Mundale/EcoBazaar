# Postman Guide for Testing EcoBazaar Product Addition

## Step 1: Get JWT Token (Login)

1. **Create a new POST request**
   - URL: `http://localhost:5000/api/auth/login`
   - Method: POST

2. **Headers:**
   - `Content-Type: application/json`

3. **Body (raw JSON):**
```json
{
  "email": "seller@gmail.com",
  "password": "your_password"
}
```


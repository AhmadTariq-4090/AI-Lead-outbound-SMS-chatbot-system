# SMS Chatbot Backend — Milestone 1

A clean, production-ready backend for outbound SMS messaging using **Node.js**, **Express**, **MongoDB**, and **Twilio**.

---

## 📁 Project Structure

```
project/
├── src/
│   ├── controllers/
│   │   └── smsController.js   # Request handlers
│   ├── models/
│   │   └── Lead.js            # Mongoose Lead schema
│   ├── routes/
│   │   └── smsRoutes.js       # Route definitions
│   ├── services/
│   │   └── twilioService.js   # Twilio SMS client
│   ├── utils/
│   │   └── logger.js          # Console logger
│   └── app.js                 # Express app + middleware
├── server.js                  # Entry point
├── .env.example               # Environment variable template
└── package.json
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your real values:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sms_chatbot
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

You should see:
```
[INFO] MongoDB connected
[INFO] Server running on port 3000
```

---

## 📡 API Reference

### Health Check

```
GET /health
```
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

### Send Outbound SMS

```
POST /api/send-sms
Content-Type: application/json
```

**Request:**
```json
{
  "phoneNumber": "+923001234567",
  "message": "Hello! This is a test message."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "SMS sent successfully.",
  "data": {
    "leadId": "64f1a...",
    "phoneNumber": "+923001234567",
    "smsSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "sentAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "phoneNumber and message are required."
}
```

---

### Twilio Inbound Webhook

Twilio calls this automatically when a user replies to your SMS.

```
POST /api/webhook/sms
```

Twilio sends a form-encoded body. The endpoint:
1. Finds or creates the Lead record
2. Marks status as `"engaged"`
3. Stores `lastMessage` and `lastMessageAt`
4. Returns `<Response></Response>` (empty TwiML — no auto-reply)

---

## 🧪 Testing with Postman

1. Import this request into Postman:
   - **Method:** `POST`
   - **URL:** `http://localhost:3000/api/send-sms`
   - **Header:** `Content-Type: application/json`
   - **Body (raw JSON):**
     ```json
     {
       "phoneNumber": "+923001234567",
       "message": "Hello from the chatbot!"
     }
     ```
2. Click **Send** — you should receive an SMS on the target phone.

---

## 🌐 Connecting the Twilio Webhook (ngrok)

To test inbound replies locally:

### Step 1 — Expose your local server

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL, e.g.:
```
https://a1b2c3d4.ngrok-free.app
```

### Step 2 — Configure Twilio

1. Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click your SMS-capable number
3. Under **Messaging → A message comes in**, set:
   - **Webhook URL:** `https://a1b2c3d4.ngrok-free.app/api/webhook/sms`
   - **HTTP Method:** `POST`
4. Click **Save**

### Step 3 — Test

Send an SMS from your phone to your Twilio number. Watch your terminal logs:

```
[INFO] Inbound SMS received | {"from":"+923001234567","body":"Hi there!","leadId":"64f1a..."}
```

---

## 🗄️ Lead Status Values

| Status        | Meaning                          |
|---------------|----------------------------------|
| `cold`        | No interaction yet               |
| `engaged`     | Has replied to a message         |
| `converted`   | (Future) Completed desired action|
| `unsubscribed`| (Future) Opted out               |

---

## 🔧 Environment Variables

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `PORT`                | HTTP port (default: 3000)          |
| `MONGO_URI`           | MongoDB connection string          |
| `TWILIO_ACCOUNT_SID`  | Twilio Account SID                 |
| `TWILIO_AUTH_TOKEN`   | Twilio Auth Token                  |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (E.164)   |

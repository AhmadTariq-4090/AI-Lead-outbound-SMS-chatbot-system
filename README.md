# SMS Chatbot Backend — Milestone 1

A clean, production-ready backend for outbound SMS messaging using **Node.js**, **Express**, **Supabase (Postgres)**, and **Twilio**.

---

## ✅ Status

| Component | Status |
|-----------|--------|
| Express server | ✅ Working |
| Supabase (Postgres) | ⏳ Configure env + table |
| Twilio SMS sending | ⏳ Add credentials to `.env` |
| Inbound SMS webhook | ✅ Ready (needs ngrok + Twilio config) |

---

## 📁 Project Structure

```
project/
├── src/
│   ├── controllers/smsController.js   # Request handlers
│   ├── repositories/leadRepository.js # Supabase lead upsert logic
│   ├── routes/smsRoutes.js            # Route definitions
│   ├── services/twilioService.js      # Twilio SMS client (lazy-init)
│   ├── db/supabaseClient.js            # Supabase client (lazy-init)
│   ├── utils/logger.js                # Timestamped console logger
│   └── app.js                         # Express + middleware + error handler
├── server.js                          # Entry point
├── .env                               # Your secrets (not committed)
├── .env.example                       # Template
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
copy .env.example .env
```

Edit `.env`:

```env
PORT=3000

# Supabase (Postgres)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Twilio (add when ready to test SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Run the server

```bash
npm run dev      # Development with auto-reload
npm start        # Production
```

Expected output:
```
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

### POST /api/send-sms

Sends an outbound SMS and creates/updates the Lead record.

**Request:**
```json
{
  "phoneNumber": "+923001234567",
  "message": "Hello! This is a test message."
}
```

**Success (200):**
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

**Error (400):**
```json
{ "success": false, "error": "phoneNumber and message are required." }
```

---

### POST /api/webhook/sms

Twilio calls this automatically when a user replies to your SMS.

- Finds or creates the Lead
- Sets status → `"engaged"`
- Stores `lastMessage` and `lastMessageAt`
- Returns empty TwiML (no auto-reply)

> Twilio POSTs **form-encoded** bodies — the `express.urlencoded()` middleware in `app.js` handles this.

---

## 🧪 Testing with Postman

1. Start the server: `npm run dev`
2. `POST http://localhost:3000/api/send-sms`
   - Header: `Content-Type: application/json`
   - Body:
     ```json
     { "phoneNumber": "+923001234567", "message": "Hello from the chatbot!" }
     ```
3. Check your phone for the SMS ✅

---

## 🌐 Twilio Webhook Setup (ngrok)

To receive inbound SMS replies locally:

**Step 1 — Expose your server:**
```bash
ngrok http 3000
```
Copy the HTTPS URL: `https://xxxx.ngrok-free.app`

**Step 2 — Configure Twilio Console:**
1. [Phone Numbers → Manage → Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click your number → **Messaging → A message comes in**
3. Set webhook: `https://xxxx.ngrok-free.app/api/webhook/sms` — `POST`
4. Save

**Step 3 — Test:**
Send an SMS from your phone to the Twilio number. You'll see the log:
```
[INFO] Inbound SMS received | {"from":"+923...","body":"Hi!","leadId":"..."}
```

---

## 🗄️ Lead Model
Create a `leads` table in Supabase with the following columns (matching the backend’s upsert logic):

```sql
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  name text,
  status text not null default 'cold'
    check (status in ('cold', 'engaged', 'converted', 'unsubscribed')),
  last_message text,
  last_message_at timestamptz
);
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `phone_number` | text | — | E.164 format, unique |
| `name` | text | null | Optional |
| `status` | text | `cold` | `cold` → `engaged` → `converted` / `unsubscribed` |
| `last_message` | text | null | Most recent message body |
| `last_message_at` | timestamptz | null | Timestamp of last message |

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default: `3000`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side writes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (starts with `AC`) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number in E.164 format |

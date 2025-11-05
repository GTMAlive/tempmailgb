# 🚀 BallonMail Production Deployment Guide

## Complete production setup with Cloudflare Workers + Resend

---

## 📋 **What You Get:**

✅ **FREE** - 3,000 emails/month (100/day)
✅ **Serverless** - No backend to manage
✅ **Fast** - Runs on Cloudflare's edge network
✅ **Reliable** - 99.9% uptime
✅ **Scalable** - Easy to upgrade for more emails

---

## 🎯 **Step 1: Sign Up for Resend (FREE)**

1. **Go to:** https://resend.com/signup
2. **Create account** (free, no credit card)
3. **Verify your email**

**You get FREE:**
- 3,000 emails/month
- 100 emails/day
- Great deliverability

---

## 📧 **Step 2: Add Your Domain to Resend**

### **Option A: Use Your Own Domain (Recommended)**

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter: `tempmailgb.com`
4. Add these DNS records to your domain:

```
Type: TXT
Name: @
Value: resend._domainkey.tempmailgb.com (provided by Resend)

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

5. Wait for verification (5-10 minutes)

### **Option B: Use Resend's Test Domain (Quick Start)**

- Use `onboarding@resend.dev` (limited to verified emails only)
- Good for testing, not production

---

## 🔑 **Step 3: Get Your API Key**

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name: `BallonMail Production`
4. Copy the key (starts with `re_...`)
5. **Save it securely!** (you won't see it again)

---

## ☁️ **Step 4: Deploy Cloudflare Worker**

### **Install Wrangler (if not already installed):**

```bash
npm install -g wrangler
```

### **Login to Cloudflare:**

```bash
wrangler login
```

### **Deploy the Worker:**

```bash
cd cloudflare
wrangler deploy --config wrangler-ballonmail.toml
```

### **Set Environment Variables:**

```bash
# Set Resend API Key (SECRET)
wrangler secret put RESEND_API_KEY --name ballonmail-api

# When prompted, paste your Resend API key

# Set From Email
wrangler secret put FROM_EMAIL --name ballonmail-api

# Enter: noreply@tempmailgb.com (or your verified email)
```

---

## 🌐 **Step 5: Configure Frontend**

Your frontend needs to know the production API URL.

### **Create `.env.production` in frontend folder:**

```bash
# Production API URL
VITE_API_URL=https://tempmailgb.com
```

**The worker will handle:** `https://tempmailgb.com/api/send-bulk`

---

## 🚀 **Step 6: Build & Deploy Frontend**

```bash
cd frontend
npm run build
```

Deploy to Cloudflare Pages:

```bash
wrangler pages deploy dist --project-name tempmailgb
```

---

## ✅ **Step 7: Test Your Setup**

1. Go to: `https://tempmailgb.com/ballonmail`
2. Add a test recipient (your email)
3. Fill in subject and message
4. Click "Send to All Recipients"
5. Check your inbox! 📧

---

## 🔧 **Production Configuration**

### **Update Frontend for Production:**

Edit `frontend/src/BallonMail.jsx`:

```javascript
// Change this line:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// To work in production:
const API_URL = import.meta.env.VITE_API_URL || '';
// Empty string means same domain
```

This way:
- **Local:** Uses `http://localhost:5000`
- **Production:** Uses `https://tempmailgb.com/api/send-bulk`

---

## 📊 **Monitoring & Limits**

### **Resend Free Tier:**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Unlimited API calls
- ✅ Email tracking & analytics

### **Check Usage:**
- Dashboard: https://resend.com/overview
- Monitor sends, opens, clicks

### **Upgrade Options:**
When you need more:
- **Pro:** $20/month - 50,000 emails
- **Business:** $85/month - 100,000 emails
- **Enterprise:** Custom pricing

---

## 🔒 **Security Best Practices**

### **1. Rate Limiting (Recommended)**

Add to Cloudflare Worker:

```javascript
// Add at the top of fetch function
const ip = request.headers.get('CF-Connecting-IP');
// Implement rate limiting per IP
// Limit to 10 requests per minute
```

### **2. API Authentication**

Add authentication header:

```javascript
// In worker
const authToken = request.headers.get('X-API-Key');
if (authToken !== env.API_SECRET) {
  return new Response('Unauthorized', { status: 401 });
}
```

### **3. Domain Restriction**

Only allow from your domain:

```javascript
const origin = request.headers.get('Origin');
if (!origin?.includes('tempmailgb.com')) {
  return new Response('Forbidden', { status: 403 });
}
```

---

## 🐛 **Troubleshooting**

### **"Failed to send emails"**

**Check:**
1. Resend API key is set correctly
2. Domain is verified in Resend
3. FROM_EMAIL matches verified domain
4. Daily/monthly limits not exceeded

### **"CORS Error"**

Worker already has CORS headers. If still seeing errors:
- Check browser console
- Verify worker is deployed
- Check route is configured

### **"Domain not verified"**

1. Go to Resend dashboard
2. Check DNS records are added
3. Wait 10 minutes for propagation
4. Click "Verify" again

---

## 📈 **Scaling for High Volume**

### **Option 1: Upgrade Resend** (Easiest)
- **Pro Plan:** $20/month = 50,000 emails
- **Business Plan:** $85/month = 100,000 emails

### **Option 2: Switch to AWS SES** (Cheapest)
- $0.10 per 1,000 emails
- Unlimited sending
- Requires more setup

### **Option 3: Multiple Providers** (Most Reliable)
- Use Resend + SendGrid + Mailgun
- Load balance between them
- Better redundancy

---

## 🎯 **Production Checklist**

Before going live:

- [ ] Resend account created
- [ ] Domain verified in Resend
- [ ] API key generated and saved
- [ ] Cloudflare Worker deployed
- [ ] Environment variables set
- [ ] Frontend built and deployed
- [ ] Test email sent successfully
- [ ] Monitor setup (optional)
- [ ] Rate limiting enabled (recommended)
- [ ] Error logging configured

---

## 📞 **Support**

### **Resend Support:**
- Docs: https://resend.com/docs
- Email: support@resend.com
- Discord: https://resend.com/discord

### **Cloudflare Support:**
- Docs: https://developers.cloudflare.com/workers/
- Community: https://community.cloudflare.com/

---

## 💰 **Cost Breakdown**

### **FREE Tier:**
- Resend: 3,000 emails/month - **$0**
- Cloudflare Workers: 100,000 requests/day - **$0**
- Cloudflare Pages: Unlimited - **$0**
- **Total: $0/month** ✅

### **Paid (When Needed):**
- Resend Pro: 50,000 emails/month - **$20/month**
- Cloudflare Workers Paid: Unlimited - **$5/month**
- **Total: $25/month** for 50,000 emails

---

## 🚀 **You're Ready for Production!**

Your BallonMail is now:
- ✅ Deployed globally on Cloudflare
- ✅ Sending real emails via Resend
- ✅ Scalable to millions of emails
- ✅ Free for 3,000 emails/month
- ✅ Professional and reliable

**Go live and start sending emails!** 🎉📧

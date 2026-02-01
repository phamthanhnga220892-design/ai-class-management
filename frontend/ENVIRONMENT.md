# Environment Configuration Guide

## 📋 Overview

This project uses different environment configurations for different scenarios:
- **Local Development (PC only)**: `.env.local` with `localhost`
- **Mobile Testing (Local Network)**: `.env.local` with local IP
- **Production Deployment**: `.env.production` with production domain

---

## 🖥️ Local Development (PC Only)

**File:** `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Use when:**
- Testing on your computer only
- Backend running on `localhost:3001`

---

## 📱 Mobile Testing (Local Network)

**File:** `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://192.168.1.220:3001
```

**Use when:**
- Testing on mobile devices
- Mobile and PC on the same WiFi network
- Replace `192.168.1.220` with your computer's actual IP

**How to find your IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

**Backend Configuration:**
Make sure backend is listening on `0.0.0.0`:
```typescript
// backend/src/main.ts
await app.listen(port, '0.0.0.0');
```

---

## 🚀 Production Deployment

**File:** `.env.production`
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Use when:**
- Deploying to production (Vercel, Netlify, etc.)
- Backend deployed to production (Render, Railway, etc.)

**Important:**
- ✅ Use HTTPS (not HTTP)
- ✅ Use actual domain name (not IP address)
- ✅ Configure CORS on backend to allow your frontend domain

---

## 🔒 Security Notes

1. **Never commit `.env.local` or `.env.production`** - they are in `.gitignore`
2. **Use `.env.example`** as a template for other developers
3. **In production:**
   - Always use HTTPS
   - Configure proper CORS settings
   - Use environment variables from hosting platform (Vercel, etc.)

---

## 📝 Quick Setup

### For New Developers:
```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Edit .env.local with your settings
# For PC only: NEXT_PUBLIC_API_URL=http://localhost:3001
# For mobile: NEXT_PUBLIC_API_URL=http://YOUR_IP:3001

# 3. Start development server
npm run dev
```

### For Production:
```bash
# 1. Create .env.production
echo "NEXT_PUBLIC_API_URL=https://your-api.com" > .env.production

# 2. Build for production
npm run build

# 3. Or deploy to Vercel and set environment variable there
```

---

## 🐛 Troubleshooting

### Mobile can't connect:
1. Check if PC and mobile are on same WiFi
2. Verify IP address is correct (`ipconfig`)
3. Check backend is listening on `0.0.0.0`
4. Check firewall settings

### Production API not working:
1. Verify `.env.production` has correct URL
2. Check CORS settings on backend
3. Ensure backend is deployed and accessible
4. Use HTTPS, not HTTP

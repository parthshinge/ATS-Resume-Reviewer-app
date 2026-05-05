# ResumeX Deployment Guide

Complete guide for deploying ResumeX to production.

## 📋 Pre-Deployment Checklist

- [ ] OpenAI API key with GPT-4 access
- [ ] b402 SDK API key
- [ ] Base wallet address for receiving payments
- [ ] Domain name (optional but recommended)
- [ ] SSL certificates (for production)

## 🚀 Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   cd backend
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=sk-...
   railway variables set B402_API_KEY=...
   railway variables set PAYMENT_RECIPIENT_ADDRESS=0x...
   railway variables set NODE_ENV=production
   railway variables set ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in dashboard
6. Deploy

### Option 3: VPS (DigitalOcean/AWS/Azure)

```bash
# SSH into server
git clone https://github.com/yourusername/resumex.git
cd resumex/backend
npm install
npm run build

# Using PM2 for process management
npm install -g pm2
pm2 start src/server.js --name resumex-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/resumex
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   cd frontend
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

### Option 2: Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

## 🔐 SSL/HTTPS Setup

### Using Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d yourdomain.com
sudo certbot renew --dry-run
```

## 📊 Monitoring

### Backend Health Check

Monitor the `/health` endpoint:
```bash
curl https://api.yourdomain.com/health
```

### PM2 Monitoring

```bash
pm2 monit
pm2 logs resumex-api
```

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 💰 Payment Configuration

### Setting Up b402 SDK

1. Sign up at https://b402.dev
2. Create API key
3. Add webhook URL: `https://api.yourdomain.com/api/payment/webhook`
4. Set webhook secret in environment variables

### Base Wallet Setup

1. Create wallet on Base (Coinbase Wallet, MetaMask)
2. Fund with small amount of ETH for gas
3. Copy wallet address to `PAYMENT_RECIPIENT_ADDRESS`

## 📧 Post-Deployment Testing

1. **Upload Test**
   ```bash
   curl -X POST https://api.yourdomain.com/api/upload \
     -F "resume=@test-resume.pdf"
   ```

2. **Payment Test**
   ```bash
   curl -X POST https://api.yourdomain.com/api/payment/create \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "test-session"}'
   ```

3. **Full Flow Test**
   - Visit frontend URL
   - Upload test resume
   - Complete payment flow
   - Verify analysis results

## 🛡️ Security Checklist

- [ ] API keys in environment variables (not code)
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] HTTPS enforced
- [ ] File upload size limits set
- [ ] No sensitive data in logs
- [ ] Webhook signature verification enabled

## 📈 Scaling Considerations

### Horizontal Scaling

- Use Redis for session storage (instead of in-memory)
- Deploy multiple backend instances behind load balancer
- Use CDN for static assets (Cloudflare)

### Database Alternative (Optional)

If you need persistence:

```javascript
// Redis session store
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
```

## 🆘 Troubleshooting

### Common Issues

1. **File upload fails**
   - Check `MAX_FILE_SIZE` environment variable
   - Verify temp directory permissions

2. **Payment not verifying**
   - Check B402_API_KEY is correct
   - Verify webhook URL is accessible
   - Check webhook secret matches

3. **AI analysis timeout**
   - OpenAI API may be slow
   - Increase axios timeout
   - Consider implementing async queues

4. **CORS errors**
   - Update `ALLOWED_ORIGINS` with frontend URL
   - Include `https://` in origin URLs

## 📞 Support

For deployment issues:
- Backend logs: Check Railway/Render dashboard or `pm2 logs`
- Frontend errors: Check browser console
- Payment issues: Contact b402 support

---

**Production URL Structure:**
- Frontend: `https://resumex.yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Health: `https://api.yourdomain.com/health`

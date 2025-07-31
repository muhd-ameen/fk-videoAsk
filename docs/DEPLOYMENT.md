# Deployment Guide

This guide covers deploying fk videoask to various platforms and environments.

## 🚀 Quick Deploy Options

### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/fk-videoask)

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Netlify will automatically detect the build settings

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Netlify will automatically build and deploy
   - Your app will be available at `https://your-app-name.netlify.app`

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/fk-videoask)

1. **Import Project**
   - Connect your GitHub repository
   - Vercel will auto-detect the framework

2. **Configure Environment Variables**
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**
   - Vercel will build and deploy automatically
   - Available at `https://your-app-name.vercel.app`

## 🏗️ Manual Deployment

### Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Domain name (optional)

### Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   export VITE_SUPABASE_URL=your_supabase_project_url
   export VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Test Build Locally**
   ```bash
   npm run preview
   ```

### Static Hosting Platforms

#### AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-app-bucket-name
   ```

2. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://your-app-bucket-name \
     --index-document index.html \
     --error-document index.html
   ```

3. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://your-app-bucket-name --delete
   ```

4. **Set Up CloudFront Distribution**
   - Create distribution pointing to S3 bucket
   - Configure custom error pages for SPA routing
   - Set up SSL certificate

#### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy redirects for SPA
COPY public/_redirects /usr/share/nginx/html/_redirects

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t fk-videoask .

# Run container
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  fk-videoask

# Or use docker-compose
docker-compose up -d
```

## ☸️ Kubernetes Deployment

### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fk-videoask
  labels:
    app: fk-videoask
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fk-videoask
  template:
    metadata:
      labels:
        app: fk-videoask
    spec:
      containers:
      - name: fk-videoask
        image: your-registry/fk-videoask:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-url
        - name: VITE_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: supabase-anon-key
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: fk-videoask-service
spec:
  selector:
    app: fk-videoask
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fk-videoask-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: fk-videoask-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fk-videoask-service
            port:
              number: 80
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional Production Settings
VITE_APP_NAME="Your Company Video Interviews"
VITE_MAX_VIDEO_SIZE_MB=100
VITE_MAX_QUESTION_DURATION=120
VITE_MAX_RESPONSE_DURATION=60
VITE_ENABLE_ANALYTICS=true
```

### Environment-Specific Configurations

#### Development
```bash
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

#### Staging
```bash
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

#### Production
```bash
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## 🔒 Security Configuration

### HTTPS Setup

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Content Security Policy

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    media-src 'self' blob: https:;
    connect-src 'self' https:;
    font-src 'self' https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
";
```

## 📊 Monitoring & Analytics

### Health Check Endpoint

Create a simple health check:

```javascript
// public/health.json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0"
}
```

### Monitoring Setup

#### Uptime Monitoring
- **Pingdom**: Website uptime monitoring
- **UptimeRobot**: Free uptime monitoring
- **StatusPage**: Status page for users

#### Error Tracking
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **Bugsnag**: Error monitoring and reporting

#### Analytics
- **Google Analytics**: User behavior tracking
- **Mixpanel**: Event tracking and user analytics
- **Plausible**: Privacy-friendly analytics

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔍 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
echo $VITE_SUPABASE_URL
```

#### Runtime Errors
- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Ensure Supabase project is accessible
- Check network connectivity

#### Performance Issues
- Enable gzip compression
- Set up CDN for static assets
- Optimize images and videos
- Monitor Core Web Vitals

### Rollback Strategy

#### Netlify
```bash
# Rollback to previous deployment
netlify sites:list
netlify api listSiteDeploys --site-id=your-site-id
netlify api restoreSiteDeploy --site-id=your-site-id --deploy-id=previous-deploy-id
```

#### Manual Rollback
```bash
# Keep previous build
mv dist dist-new
mv dist-backup dist

# Or use git tags
git tag v1.0.1
git checkout v1.0.0
npm run build
```

## 📋 Post-Deployment Checklist

- [ ] **Functionality Testing**
  - [ ] User registration and login
  - [ ] Video recording works
  - [ ] Interview creation and sharing
  - [ ] Candidate response submission
  - [ ] Dashboard functionality

- [ ] **Performance Testing**
  - [ ] Page load times < 3 seconds
  - [ ] Video upload performance
  - [ ] Mobile responsiveness
  - [ ] Core Web Vitals scores

- [ ] **Security Testing**
  - [ ] HTTPS enabled
  - [ ] Security headers configured
  - [ ] Input validation working
  - [ ] File upload restrictions

- [ ] **Monitoring Setup**
  - [ ] Uptime monitoring configured
  - [ ] Error tracking enabled
  - [ ] Analytics implemented
  - [ ] Backup strategy in place

---

For additional help with deployment, please check our [troubleshooting guide](./TROUBLESHOOTING.md) or create an issue on GitHub.
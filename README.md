# CUR8tr - Social Recommendation Platform

A production-ready social recommendation platform built with React, Express, and Supabase, optimized for Vercel deployment.

## ✨ Features

- 🔐 **User Authentication** - Secure registration, login, and email verification
- 📍 **Location-based Recommendations** - Share and discover places with interactive maps
- ⭐ **Rating & Reviews** - Star ratings and detailed comments
- 👥 **Social Features** - Follow curators, view activity feeds, and public profiles
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and Radix UI
- 📱 **Mobile-Friendly** - Optimized for all screen sizes
- 🚀 **Production-Ready** - Deployed on Vercel with Supabase backend

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web framework
- **Drizzle ORM** - Type-safe database queries
- **Passport.js** - Authentication middleware
- **Supabase** - PostgreSQL database and storage

### Deployment
- **Vercel** - Serverless hosting and edge network
- **Supabase** - Managed PostgreSQL with connection pooling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)
- Vercel account (free tier)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cur8tr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   - Get `SUPABASE_URL` and `SUPABASE_KEY` from Supabase Dashboard → Settings → API
   - Get `DATABASE_URL` from Supabase Dashboard → Settings → Database (use pooler URL, port 6543)
   - Generate `SESSION_SECRET`: `openssl rand -base64 32`

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5000

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

1. **Check production readiness**
   ```bash
   npm run check:production
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables (see `.env.production.example`)
   - Deploy!

📖 **Detailed Guide**: See [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md)

📋 **Step-by-Step**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run check:production` | Validate production readiness |
| `npm run db:push` | Push database schema |
| `npm run db:generate` | Generate migrations |
| `npm run preview` | Build and preview locally |

## 🌍 Environment Variables

### Required
```env
DATABASE_URL=postgresql://...         # Supabase pooler URL (port 6543)
SUPABASE_URL=https://xxx.supabase.co  # Supabase project URL
SUPABASE_KEY=eyJhbG...                # Supabase service_role key
SUPABASE_DB_PASSWORD=xxx              # Database password
SESSION_SECRET=xxx                     # Random 32+ character string
NODE_ENV=production                    # Environment
```

### Optional
- Email service credentials (Resend, SendGrid, or SMTP)
- Google Cloud Storage (if not using Supabase Storage)
- Monitoring/analytics keys

See `.env.production.example` for complete list.

## 📁 Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Backend Express application
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication logic
│   ├── db.ts            # Database connection
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema & Zod validators
├── api/                 # Vercel serverless functions
│   └── index.js         # API entry point
├── scripts/             # Utility scripts
│   └── check-production.js  # Production validation
└── migrations/          # Database migrations
```

## 🔒 Security

- ✅ HTTPS enforced (automatic via Vercel)
- ✅ Security headers configured (X-Frame-Options, CSP, etc.)
- ✅ Environment variables protected
- ✅ Password hashing with bcrypt
- ✅ Session management with secure cookies
- ✅ Database connection pooling for serverless
- ✅ SQL injection protection via Drizzle ORM

## 📊 Performance

- ✅ Code splitting and lazy loading
- ✅ Optimized bundle with tree shaking
- ✅ Static asset caching (1 year)
- ✅ Gzip/Brotli compression
- ✅ Edge network delivery via Vercel
- ✅ Database connection pooling

## 🧪 Testing

```bash
# Run type checking
npm run check

# Test production build locally
npm run preview
```

## 🐛 Troubleshooting

### Database Connection Issues
Use the **Transaction Pooler** URL (port 6543) for serverless:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Build Errors
1. Clear build cache: `rm -rf dist node_modules`
2. Reinstall: `npm install`
3. Check types: `npm run check`

### API 404 Errors
Verify `api/index.js` exists and `dist/index.js` is built.

## 📚 Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOY.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Full Deployment Guide](./DEPLOYMENT.md)
- [Migration Summary](./MIGRATION_SUMMARY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

## 🆘 Support

- Check `/api/health` endpoint for system status
- Review Vercel function logs for errors
- Check Supabase logs for database issues

## 🎉 Acknowledgments

Built with modern tools and best practices for production deployment.

---

**Made with ❤️ for the community**

Deploy your own: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

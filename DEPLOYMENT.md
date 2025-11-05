# CUR8tr - Vercel Deployment Guide

This project has been migrated from Replit to **Vercel + Supabase** for production deployment.

## 🏗️ Architecture

- **Frontend**: React + Vite (SSR/SPA)
- **Backend**: Express.js (Serverless on Vercel)
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Storage**: Supabase Storage or Google Cloud Storage
- **Auth**: Passport.js with local strategy

## 📋 Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Vercel Account**: Sign up at https://vercel.com
3. **Node.js**: v18 or higher
4. **Git**: For version control

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration (from https://app.supabase.com/project/_/settings/api)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your_service_role_key_here
SUPABASE_DB_PASSWORD=your_database_password_here

# Database Connection (use Transaction Pooler, port 6543)
DATABASE_URL=postgresql://postgres.your_project_ref:your_password@aws-0-your_region.pooler.supabase.com:6543/postgres

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_random_32_char_string_here

# Environment
NODE_ENV=development
```

### 3. Set Up Supabase Database

#### Get Supabase Credentials:

1. Go to https://app.supabase.com
2. Create a new project (or use existing)
3. Navigate to **Settings** → **API**
   - Copy `Project URL` → This is your `SUPABASE_URL`
   - Copy `service_role` key → This is your `SUPABASE_KEY`
4. Navigate to **Settings** → **Database**
   - Copy the password you set during project creation → This is `SUPABASE_DB_PASSWORD`
   - Copy the **Connection Pooler** string (Transaction mode, port 6543) → This is `DATABASE_URL`

#### Run Database Migrations:

```bash
npm run db:push
```

This will create all necessary tables using Drizzle ORM.

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Building for Production

### Build the project:

```bash
npm run build
```

This will:
1. Build the client (`dist/public/`)
2. Build the server (`dist/index.js`)

### Test production build locally:

```bash
npm start
```

## 🌐 Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables in Vercel**:
   
   Go to **Project Settings** → **Environment Variables** and add:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `SUPABASE_URL` | `https://xxx.supabase.co` | From Supabase Dashboard |
   | `SUPABASE_KEY` | `eyJhbG...` | Service role key |
   | `SUPABASE_DB_PASSWORD` | `your_password` | Database password |
   | `DATABASE_URL` | `postgresql://postgres...` | Pooler connection string (port 6543) |
   | `SESSION_SECRET` | `random_32_chars` | Generate: `openssl rand -base64 32` |
   | `NODE_ENV` | `production` | Set to production |

4. **Deploy**:
   - Click **Deploy**
   - Vercel will build and deploy your app

## 🗄️ Database Migrations

To update the database schema:

1. Modify `shared/schema.ts`
2. Run migrations:
   ```bash
   npm run db:push
   ```

For production, you can run this locally pointing to your production DATABASE_URL, or set up a migration workflow.

## 🔒 Important Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use service_role key only on the server** - Never expose it to the client
3. **Rotate SESSION_SECRET regularly** in production
4. **Use Transaction Pooler (port 6543)** for serverless environments
5. **Enable RLS (Row Level Security)** on Supabase tables for additional protection

## 📁 Project Structure

```
Cur8trRebuild/
├── api/
│   └── index.js              # Vercel serverless function entry point
├── client/
│   ├── src/                  # React application
│   └── index.html
├── server/
│   ├── index.ts              # Express server entry point
│   ├── db.ts                 # Supabase + Drizzle connection
│   ├── auth.ts               # Passport.js authentication
│   ├── routes.ts             # API routes
│   └── storage.ts            # Database operations
├── shared/
│   └── schema.ts             # Drizzle ORM schema
├── dist/                     # Built files (gitignored)
│   ├── public/               # Client build
│   └── index.js              # Server build
├── .env                      # Local environment variables (gitignored)
├── .env.example              # Environment template
├── vercel.json               # Vercel configuration
├── package.json
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only
- `npm start` - Run production build locally
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Connection refused` or `timeout`
- **Solution**: Make sure you're using the **Transaction Pooler** URL with port `6543`, not the direct connection
- Check that `DATABASE_URL` includes `pooler.supabase.com:6543`

### Build Errors

**Error**: `Cannot find module '@supabase/supabase-js'`
- **Solution**: Run `npm install` to install all dependencies

### Vercel Deployment Issues

**Error**: API routes returning 404
- **Solution**: Check that `vercel.json` is present and properly configured
- Ensure `api/index.js` exists and exports the Express app

### Session Issues

**Error**: Sessions not persisting
- **Solution**: Make sure `SESSION_SECRET` is set and consistent across deployments
- Check that the `sessions` table exists in your database

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Express.js Documentation](https://expressjs.com/)

## 🔄 Migration from Replit

This project has been migrated from Replit. Key changes:

- ✅ Removed Replit-specific plugins and dependencies
- ✅ Replaced Neon database with Supabase PostgreSQL
- ✅ Added Vercel serverless configuration
- ✅ Updated database connection to use connection pooler
- ✅ Made server conditionally start (not on Vercel)
- ✅ Added proper environment variable handling

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

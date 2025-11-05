# Git Setup Script for Windows PowerShell
# Run this script to initialize your git repository and prepare for first push

Write-Host "🚀 CUR8tr Git Setup" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "⚠️  This directory is already a git repository" -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Exiting..." -ForegroundColor Gray
        exit 0
    }
} else {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Checking git configuration..." -ForegroundColor Cyan

# Check if user.name is set
$userName = git config user.name 2>$null
if (-not $userName) {
    Write-Host "⚠️  Git user.name not set" -ForegroundColor Yellow
    $name = Read-Host "Enter your name for git commits"
    git config user.name "$name"
    Write-Host "✅ User name set to: $name" -ForegroundColor Green
} else {
    Write-Host "✅ Git user.name: $userName" -ForegroundColor Green
}

# Check if user.email is set
$userEmail = git config user.email 2>$null
if (-not $userEmail) {
    Write-Host "⚠️  Git user.email not set" -ForegroundColor Yellow
    $email = Read-Host "Enter your email for git commits"
    git config user.email "$email"
    Write-Host "✅ User email set to: $email" -ForegroundColor Green
} else {
    Write-Host "✅ Git user.email: $userEmail" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Checking for sensitive files..." -ForegroundColor Cyan

# Verify .env is in gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "✅ .env is in .gitignore" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env not found in .gitignore" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .gitignore file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "📦 Staging files..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "📊 Files to be committed:" -ForegroundColor Cyan
git status --short

Write-Host ""
$proceed = Read-Host "Proceed with commit? (y/n)"

if ($proceed -eq "y") {
    Write-Host ""
    Write-Host "💬 Creating commit..." -ForegroundColor Cyan
    git commit -m "feat: production-ready CUR8tr app with authentication and logout

- Implemented production-ready authentication with bcrypt
- Added logout functionality across all pages
- Configured for Vercel deployment
- Set up Supabase database integration
- Added comprehensive documentation"
    
    Write-Host "✅ Commit created successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔗 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "   2. Add the remote:" -ForegroundColor White
    Write-Host "      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Gray
    Write-Host "   3. Push to GitHub:" -ForegroundColor White
    Write-Host "      git push -u origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Or if the repository already exists:" -ForegroundColor White
    $repoUrl = Read-Host "   Enter your GitHub repository URL (or press Enter to skip)"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "🔗 Adding remote..." -ForegroundColor Cyan
        try {
            git remote add origin $repoUrl 2>$null
            Write-Host "✅ Remote added successfully!" -ForegroundColor Green
            Write-Host ""
            $push = Read-Host "Push to GitHub now? (y/n)"
            
            if ($push -eq "y") {
                Write-Host ""
                Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
                
                # Check if main branch exists, otherwise use master
                $branch = git branch --show-current
                if (-not $branch) {
                    $branch = "main"
                    git branch -M main
                }
                
                git push -u origin $branch
                
                Write-Host ""
                Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎉 All done! Your code is now on GitHub!" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "📋 Next: Deploy to Vercel" -ForegroundColor Yellow
                Write-Host "   1. Go to https://vercel.com/dashboard" -ForegroundColor White
                Write-Host "   2. Click 'Add New' → 'Project'" -ForegroundColor White
                Write-Host "   3. Import your GitHub repository" -ForegroundColor White
                Write-Host "   4. Add environment variables from .env.example" -ForegroundColor White
                Write-Host "   5. Deploy!" -ForegroundColor White
                Write-Host ""
                Write-Host "📖 See DEPLOYMENT_CHECKLIST.md for detailed instructions" -ForegroundColor Gray
            }
        } catch {
            Write-Host "⚠️  Remote might already exist or invalid URL" -ForegroundColor Yellow
            Write-Host "   Use: git remote set-url origin $repoUrl" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Commit cancelled" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Git setup complete!" -ForegroundColor Cyan

import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { z } from "zod";

const SALT_ROUNDS = 10;

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  // Use DATABASE_URL directly for session storage
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { 
      claims: { sub: req.session.userId },
      id: req.session.userId 
    };
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Setup authentication
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: validation.error.errors 
        });
      }
      
      const { email, password, firstName, lastName } = validation.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Generate username from email
      let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      let username = baseUsername;
      let counter = 1;
      
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Create user
      const user = await storage.upsertUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        username,
        firstName,
        lastName: lastName || '',
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        success: true, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: validation.error.errors 
        });
      }
      
      const { email, password } = validation.data;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if user has a password (for backward compatibility)
      if (!user.password) {
        return res.status(401).json({ 
          message: "Please register with a password" 
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  
  // Login/Register page
  app.get('/api/login', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login - CUR8tr</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 450px;
              width: 100%;
              overflow: hidden;
            }
            .tabs {
              display: flex;
              background: #f8f9fa;
            }
            .tab {
              flex: 1;
              padding: 16px;
              text-align: center;
              cursor: pointer;
              font-weight: 600;
              border-bottom: 3px solid transparent;
              transition: all 0.3s;
            }
            .tab:hover {
              background: #e9ecef;
            }
            .tab.active {
              background: white;
              border-bottom-color: #667eea;
              color: #667eea;
            }
            .content {
              padding: 32px;
            }
            .form-section {
              display: none;
            }
            .form-section.active {
              display: block;
            }
            h2 {
              color: #333;
              margin-bottom: 24px;
              font-size: 28px;
            }
            .input-group {
              margin-bottom: 20px;
            }
            label {
              display: block;
              margin-bottom: 8px;
              color: #555;
              font-weight: 500;
              font-size: 14px;
            }
            input {
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 15px;
              transition: border-color 0.3s;
            }
            input:focus {
              outline: none;
              border-color: #667eea;
            }
            button {
              width: 100%;
              padding: 14px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            button:active {
              transform: translateY(0);
            }
            .error {
              background: #fee;
              border: 1px solid #fcc;
              color: #c33;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 16px;
              font-size: 14px;
            }
            .success {
              background: #efe;
              border: 1px solid #cfc;
              color: #3c3;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 16px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="tabs">
              <div class="tab active" onclick="showTab('login')">Login</div>
              <div class="tab" onclick="showTab('register')">Register</div>
            </div>
            
            <div class="content">
              <!-- Login Form -->
              <div id="login" class="form-section active">
                <h2>Welcome Back</h2>
                <div id="loginMessage"></div>
                <form id="loginForm">
                  <div class="input-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required autocomplete="email" />
                  </div>
                  <div class="input-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required autocomplete="current-password" />
                  </div>
                  <button type="submit">Sign In</button>
                </form>
              </div>
              
              <!-- Register Form -->
              <div id="register" class="form-section">
                <h2>Create Account</h2>
                <div id="registerMessage"></div>
                <form id="registerForm">
                  <div class="input-group">
                    <label for="registerEmail">Email</label>
                    <input type="email" id="registerEmail" required autocomplete="email" />
                  </div>
                  <div class="input-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" required minlength="8" autocomplete="new-password" />
                  </div>
                  <div class="input-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" required autocomplete="given-name" />
                  </div>
                  <div class="input-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" autocomplete="family-name" />
                  </div>
                  <button type="submit">Create Account</button>
                </form>
              </div>
            </div>
          </div>
          
          <script>
            function showTab(tab) {
              document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
              event.target.classList.add('active');
              document.getElementById(tab).classList.add('active');
            }
            
            function showMessage(elementId, message, isError = false) {
              const el = document.getElementById(elementId);
              el.innerHTML = \`<div class="\${isError ? 'error' : 'success'}">\${message}</div>\`;
              setTimeout(() => el.innerHTML = '', 5000);
            }
            
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('loginEmail').value;
              const password = document.getElementById('loginPassword').value;
              
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                  showMessage('loginMessage', 'Login successful! Redirecting...');
                  setTimeout(() => window.location.href = '/', 1000);
                } else {
                  showMessage('loginMessage', data.message || 'Login failed', true);
                }
              } catch (error) {
                showMessage('loginMessage', 'Login error: ' + error.message, true);
              }
            });
            
            document.getElementById('registerForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('registerEmail').value;
              const password = document.getElementById('registerPassword').value;
              const firstName = document.getElementById('firstName').value;
              const lastName = document.getElementById('lastName').value;
              
              if (password.length < 8) {
                showMessage('registerMessage', 'Password must be at least 8 characters', true);
                return;
              }
              
              try {
                const res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password, firstName, lastName })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                  showMessage('registerMessage', 'Account created! Redirecting...');
                  setTimeout(() => window.location.href = '/', 1000);
                } else {
                  showMessage('registerMessage', data.message || 'Registration failed', true);
                }
              } catch (error) {
                showMessage('registerMessage', 'Registration error: ' + error.message, true);
              }
            });
          </script>
        </body>
      </html>
    `);
  });
}

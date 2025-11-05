// Load environment variables from .env file
import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite, log } = await import("./vite");
    await setupVite(app, server);
    
    // Only start the server if not running in Vercel serverless environment
    if (process.env.VERCEL !== '1') {
      const port = parseInt(process.env.PORT || '5000', 10);
      const host = process.env.HOST || "0.0.0.0";
      
      server.listen(port, host, () => {
        log(`serving on port ${port}`);
      });
    }
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
    
    // Only start the server if not running in Vercel serverless environment
    if (process.env.VERCEL !== '1') {
      const port = parseInt(process.env.PORT || '5000', 10);
      const host = process.env.HOST || "0.0.0.0";
      
      server.listen(port, host, () => {
        console.log(`serving on port ${port}`);
      });
    }
  }
})();

// Export the Express app for Vercel serverless functions
export default app;

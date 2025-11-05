import nodemailer from 'nodemailer';

interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string = '';

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    // Check for email service configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;

    if (resendApiKey) {
      // Resend API
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: resendApiKey,
        },
      });
      this.from = 'support@cur8tr.space';
    } else if (sendgridApiKey) {
      // SendGrid API
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: sendgridApiKey,
        },
      });
      this.from = 'support@cur8tr.space';
    } else if (emailUser && emailPassword) {
      // Gmail or custom SMTP
      if (emailUser.includes('@gmail.com')) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      } else if (smtpHost && smtpPort) {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpPort === '465',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      }
      this.from = 'support@cur8tr.space';
    }

    // Log configuration status
    if (this.transporter) {
      console.log('[email] Email service configured successfully');
    } else {
      console.warn('[email] No email service configured. Email features will not work.');
      console.warn('[email] Please set one of: RESEND_API_KEY, SENDGRID_API_KEY, or EMAIL_USER + EMAIL_PASSWORD');
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[email] Cannot send verification code - no email service configured');
      // In development, log the code instead
      console.log(`[email] VERIFICATION CODE for ${email}: ${code}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'CUR8tr - Verify Your Email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  border: 4px solid #000;
                  padding: 40px;
                  background: #fff;
                }
                .code-box {
                  background: #f5f5f5;
                  border: 4px solid #000;
                  padding: 30px;
                  text-align: center;
                  margin: 30px 0;
                }
                .code {
                  font-size: 48px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #000;
                  font-family: 'Courier New', monospace;
                }
                h1 {
                  font-family: 'Space Grotesk', sans-serif;
                  font-size: 32px;
                  font-weight: bold;
                  margin-bottom: 20px;
                }
                p {
                  margin: 15px 0;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #e5e5e5;
                  font-size: 14px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to CUR8tr!</h1>
                <p>Thanks for signing up. Please verify your email address by entering the code below:</p>
                
                <div class="code-box">
                  <div class="code">${code}</div>
                </div>
                
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account with CUR8tr, you can safely ignore this email.</p>
                
                <div class="footer">
                  <p>Best regards,<br>The CUR8tr Team</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to CUR8tr!\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account with CUR8tr, you can safely ignore this email.`,
      });

      console.log(`[email] Verification code sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[email] Failed to send verification code:', error);
      // In development, log the code as fallback
      console.log(`[email] VERIFICATION CODE for ${email}: ${code}`);
      return false;
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const emailService = new EmailService();

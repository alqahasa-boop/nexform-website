/**
 * Provider-agnostic email service. No provider is chosen yet — that's a
 * Phase 2 decision (Resend, SES, SMTP, ...). Everything that needs to send
 * mail (password reset, email verification, design-request notifications)
 * calls `sendEmail()` below; swapping the driver means editing this one file.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDriver {
  send(message: EmailMessage): Promise<void>;
}

/** Default driver for local development — logs instead of sending. Never used in production. */
class ConsoleEmailDriver implements EmailDriver {
  async send(message: EmailMessage): Promise<void> {
    console.log("[email:dev]", { to: message.to, subject: message.subject });
  }
}

let driver: EmailDriver = new ConsoleEmailDriver();

/** Phase 2: call this once at startup with a real driver (e.g. a Resend-backed implementation). */
export function setEmailDriver(nextDriver: EmailDriver) {
  driver = nextDriver;
}

export function sendEmail(message: EmailMessage): Promise<void> {
  return driver.send(message);
}

export function renderPasswordResetEmail(resetUrl: string): EmailMessage["html"] {
  return `<p>Reset your NEXFORM password by visiting: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`;
}

export function renderEmailVerificationEmail(verifyUrl: string): EmailMessage["html"] {
  return `<p>Verify your email by visiting: <a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`;
}

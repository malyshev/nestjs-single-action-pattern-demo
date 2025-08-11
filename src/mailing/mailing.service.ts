import { Injectable } from '@nestjs/common';

export interface EmailTemplate {
  subject: string;
  body: string;
}

@Injectable()
export class MailingService {
  async sendWelcomeEmail(
    userId: string,
    email: string,
    firstName: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send actual email via SMTP/email service
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[MAIL] Welcome email sent to ${email} for user ${userId} (${firstName})`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async sendEmailConfirmation(
    userId: string,
    email: string,
    confirmationToken: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send confirmation email with token
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[MAIL] Confirmation email sent to ${email} for user ${userId} with token: ${confirmationToken}`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async sendPasswordReset(
    userId: string,
    email: string,
    resetToken: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send password reset email with token
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[MAIL] Password reset email sent to ${email} for user ${userId} with token: ${resetToken}`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async sendUserDeactivated(
    userId: string,
    email: string,
    reason?: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send deactivation notification email
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[MAIL] Deactivation notification sent to ${email} for user ${userId}${reason ? ` (reason: ${reason})` : ''}`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async sendUserActivated(userId: string, email: string): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send activation notification email
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[MAIL] Activation notification sent to ${email} for user ${userId}`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }
}

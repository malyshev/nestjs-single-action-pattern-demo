import { Injectable } from '@nestjs/common';

export interface Notification {
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  async sendInAppNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would save notification to database and push to user's device
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[NOTIFICATION] ${type.toUpperCase()} notification sent to user ${userId}: ${title} - ${message}${data ? ` (data: ${JSON.stringify(data)})` : ''}`,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async sendWelcomeNotification(
    userId: string,
    firstName: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.sendInAppNotification(
      userId,
      'success',
      'Welcome!',
      `Welcome to our platform, ${firstName}!`,
      { type: 'welcome' },
    );
  }

  async sendEmailConfirmedNotification(userId: string): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.sendInAppNotification(
      userId,
      'success',
      'Email Confirmed',
      'Your email has been successfully confirmed.',
      { type: 'email_confirmed' },
    );
  }

  async sendAccountDeactivatedNotification(
    userId: string,
    reason?: string,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.sendInAppNotification(
      userId,
      'warning',
      'Account Deactivated',
      `Your account has been deactivated.${reason ? ` Reason: ${reason}` : ''}`,
      { type: 'account_deactivated', reason },
    );
  }

  async sendAccountActivatedNotification(userId: string): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.sendInAppNotification(
      userId,
      'success',
      'Account Activated',
      'Your account has been activated successfully.',
      { type: 'account_activated' },
    );
  }
}

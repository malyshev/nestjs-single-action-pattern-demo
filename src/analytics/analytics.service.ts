import { Injectable } from '@nestjs/common';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: any;
  timestamp: Date;
}

@Injectable()
export class AnalyticsService {
  async trackUserRegistration(userId: string, properties?: any): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would send data to analytics service (Google Analytics, Mixpanel, etc.)
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] User registration tracked for user ${userId}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackUserLogin(userId: string, properties?: any): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track login events for user behavior analysis
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] User login tracked for user ${userId}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackEmailConfirmation(
    userId: string,
    properties?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track email confirmation conversion rates
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] Email confirmation tracked for user ${userId}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackUserDeactivation(
    userId: string,
    reason?: string,
    properties?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track user churn and deactivation reasons
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] User deactivation tracked for user ${userId}, reason: ${reason}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackUserActivation(userId: string, properties?: any): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track user reactivation patterns
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] User activation tracked for user ${userId}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackUserSearch(
    query: string,
    userId?: string,
    properties?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track search patterns and popular queries
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] User search tracked: "${query}" by user ${userId || 'anonymous'}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async trackUserProfileUpdate(
    userId: string,
    updatedFields: string[],
    properties?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would track user engagement and profile completion rates
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[ANALYTICS] Profile update tracked for user ${userId}, fields: ${updatedFields.join(', ')}`,
      properties,
    );
    await Promise.resolve(); // Satisfy async requirement
  }
}

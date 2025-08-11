import { Injectable } from '@nestjs/common';

export interface AuditLog {
  action: string;
  userId?: string;
  targetId?: string;
  details?: any;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  async logAction(
    action: string,
    userId?: string,
    targetId?: string,
    details?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // In real implementation, this would save to database or send to external audit service
    // DO NOT implement this - it's intentionally left empty for demonstration
    console.log(
      `[AUDIT] ${action} - User: ${userId}, Target: ${targetId}, Details:`,
      details,
    );
    await Promise.resolve(); // Satisfy async requirement
  }

  async logUserAction(
    action: string,
    userId: string,
    details?: any,
  ): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.logAction(action, userId, userId, details);
  }

  async logSystemAction(action: string, details?: any): Promise<void> {
    // DUMMY METHOD - This is a black hole for demo purposes
    // DO NOT implement this - it's intentionally left empty for demonstration
    await this.logAction(action, undefined, undefined, details);
  }
}

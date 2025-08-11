import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { MailingService } from '../mailing/mailing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
    private mailingService: MailingService,
    private notificationsService: NotificationsService,
    private analyticsService: AnalyticsService,
  ) {}

  async findAll(): Promise<User[]> {
    await this.auditService.logSystemAction('users.list_all');
    await this.analyticsService.trackUserSearch('all_users');

    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User | null> {
    await this.auditService.logSystemAction('users.get_by_id', { userId: id });

    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.auditService.logSystemAction('users.get_by_email', { email });

    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Audit logging
    await this.auditService.logSystemAction('users.create', {
      userId: savedUser.id,
      email: savedUser.email,
    });

    // Analytics tracking
    await this.analyticsService.trackUserRegistration(savedUser.id, {
      email: savedUser.email,
    });

    // Send welcome email
    await this.mailingService.sendWelcomeEmail(
      savedUser.id,
      savedUser.email,
      savedUser.firstName,
    );

    // Send welcome notification
    await this.notificationsService.sendWelcomeNotification(
      savedUser.id,
      savedUser.firstName,
    );

    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    const updatedFields = Object.keys(updateUserDto);
    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Audit logging
    await this.auditService.logUserAction('users.update', id, {
      updatedFields,
    });

    // Analytics tracking
    await this.analyticsService.trackUserProfileUpdate(id, updatedFields);

    return savedUser;
  }

  async delete(id: string): Promise<void> {
    await this.auditService.logSystemAction('users.delete', { userId: id });

    await this.usersRepository.delete(id);
  }

  async confirmEmail(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.emailConfirmed = true;
    const savedUser = await this.usersRepository.save(user);

    // Audit logging
    await this.auditService.logUserAction('users.confirm_email', id);

    // Analytics tracking
    await this.analyticsService.trackEmailConfirmation(id);

    // Send confirmation notification
    await this.notificationsService.sendEmailConfirmedNotification(id);

    return savedUser;
  }

  async deactivate(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isActive = false;
    const savedUser = await this.usersRepository.save(user);

    // Audit logging
    await this.auditService.logSystemAction('users.deactivate', { userId: id });

    // Analytics tracking
    await this.analyticsService.trackUserDeactivation(id);

    // Send deactivation email
    await this.mailingService.sendUserDeactivated(id, user.email);

    // Send deactivation notification
    await this.notificationsService.sendAccountDeactivatedNotification(id);

    return savedUser;
  }

  async activate(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isActive = true;
    const savedUser = await this.usersRepository.save(user);

    // Audit logging
    await this.auditService.logSystemAction('users.activate', { userId: id });

    // Analytics tracking
    await this.analyticsService.trackUserActivation(id);

    // Send activation email
    await this.mailingService.sendUserActivated(id, user.email);

    // Send activation notification
    await this.notificationsService.sendAccountActivatedNotification(id);

    return savedUser;
  }

  async searchUsers(query: string): Promise<User[]> {
    await this.auditService.logSystemAction('users.search', { query });
    await this.analyticsService.trackUserSearch(query);

    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        'user.firstName LIKE :query OR user.lastName LIKE :query OR user.email LIKE :query',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}

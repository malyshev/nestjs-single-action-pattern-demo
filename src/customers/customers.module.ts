import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';

// Import all controllers
import { ListCustomersController } from './controllers/list-customers.controller';
import { GetCustomerController } from './controllers/get-customer.controller';
import { GetCustomerByEmailController } from './controllers/get-customer-by-email.controller';
import { CreateCustomerController } from './controllers/create-customer.controller';
import { UpdateCustomerController } from './controllers/update-customer.controller';
import { DeleteCustomerController } from './controllers/delete-customer.controller';
import { ConfirmCustomerEmailController } from './controllers/confirm-customer-email.controller';
import { DeactivateCustomerController } from './controllers/deactivate-customer.controller';
import { ActivateCustomerController } from './controllers/activate-customer.controller';
import { SearchCustomersController } from './controllers/search-customers.controller';

// Import all services
import { ListCustomersService } from './services/list-customers.service';
import { GetCustomerService } from './services/get-customer.service';
import { GetCustomerByEmailService } from './services/get-customer-by-email.service';
import { CreateCustomerService } from './services/create-customer.service';
import { UpdateCustomerService } from './services/update-customer.service';
import { DeleteCustomerService } from './services/delete-customer.service';
import { ConfirmCustomerEmailService } from './services/confirm-customer-email.service';
import { DeactivateCustomerService } from './services/deactivate-customer.service';
import { ActivateCustomerService } from './services/activate-customer.service';
import { SearchCustomersService } from './services/search-customers.service';

// Import dummy modules for cross-cutting concerns
import { AuditModule } from '../audit/audit.module';
import { MailingModule } from '../mailing/mailing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    AuditModule,
    MailingModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  controllers: [
    ListCustomersController,
    GetCustomerController,
    GetCustomerByEmailController,
    CreateCustomerController,
    UpdateCustomerController,
    DeleteCustomerController,
    ConfirmCustomerEmailController,
    DeactivateCustomerController,
    ActivateCustomerController,
    SearchCustomersController,
  ],
  providers: [
    ListCustomersService,
    GetCustomerService,
    GetCustomerByEmailService,
    CreateCustomerService,
    UpdateCustomerService,
    DeleteCustomerService,
    ConfirmCustomerEmailService,
    DeactivateCustomerService,
    ActivateCustomerService,
    SearchCustomersService,
  ],
})
export class CustomersModule {}

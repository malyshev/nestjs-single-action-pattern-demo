import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { AnalyticsService } from '../analytics/analytics.service';

interface AuthenticatedRequest extends Request {
  ip: string;
  user?: { id: string };
}

// Dummy guard for demonstration
class DummyAuthGuard {
  canActivate() {
    return true;
  }
}

@Controller('users')
@UseGuards(DummyAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    // Log the request
    await this.auditService.logSystemAction('users.list_all_request', {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    // Track analytics
    await this.analyticsService.trackUserSearch('all_users', req.user?.id);

    const users = await this.usersService.findAll();

    // Log the response
    await this.auditService.logSystemAction('users.list_all_response', {
      count: users.length,
    });

    return users;
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!query || query.trim().length < 2) {
      throw new HttpException(
        'Search query must be at least 2 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Log the search request
    await this.auditService.logSystemAction('users.search_request', {
      query,
      ip: req.ip,
    });

    // Track search analytics
    await this.analyticsService.trackUserSearch(query, req.user?.id);

    const users = await this.usersService.searchUsers(query);

    // Log the search response
    await this.auditService.logSystemAction('users.search_response', {
      query,
      count: users.length,
    });

    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Log the request
    await this.auditService.logSystemAction('users.get_by_id_request', {
      userId: id,
      ip: req.ip,
    });

    const user = await this.usersService.findOne(id);

    if (!user) {
      await this.auditService.logSystemAction('users.get_by_id_not_found', {
        userId: id,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the response
    await this.auditService.logSystemAction('users.get_by_id_response', {
      userId: id,
      found: true,
    });

    return user;
  }

  @Get('email/:email')
  async findByEmail(
    @Param('email') email: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Log the request
    await this.auditService.logSystemAction('users.get_by_email_request', {
      email,
      ip: req.ip,
    });

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      await this.auditService.logSystemAction('users.get_by_email_not_found', {
        email,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the response
    await this.auditService.logSystemAction('users.get_by_email_response', {
      email,
      found: true,
    });

    return user;
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Log the creation request
    await this.auditService.logSystemAction('users.create_request', {
      email: createUserDto.email,
      ip: req.ip,
    });

    const user = await this.usersService.create(createUserDto);

    // Log the creation success
    await this.auditService.logSystemAction('users.create_success', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Log the update request
    await this.auditService.logSystemAction('users.update_request', {
      userId: id,
      updates: Object.keys(updateUserDto),
      ip: req.ip,
    });

    const user = await this.usersService.update(id, updateUserDto);

    if (!user) {
      await this.auditService.logSystemAction('users.update_not_found', {
        userId: id,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the update success
    await this.auditService.logSystemAction('users.update_success', {
      userId: id,
      updates: Object.keys(updateUserDto),
    });

    return user;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Log the deletion request
    await this.auditService.logSystemAction('users.delete_request', {
      userId: id,
      ip: req.ip,
    });

    await this.usersService.delete(id);

    // Log the deletion success
    await this.auditService.logSystemAction('users.delete_success', {
      userId: id,
    });

    return { message: 'User deleted successfully' };
  }

  @Post(':id/confirm-email')
  async confirmEmail(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Log the confirmation request
    await this.auditService.logSystemAction('users.confirm_email_request', {
      userId: id,
      ip: req.ip,
    });

    const user = await this.usersService.confirmEmail(id);

    if (!user) {
      await this.auditService.logSystemAction('users.confirm_email_not_found', {
        userId: id,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the confirmation success
    await this.auditService.logSystemAction('users.confirm_email_success', {
      userId: id,
    });

    return user;
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Log the deactivation request
    await this.auditService.logSystemAction('users.deactivate_request', {
      userId: id,
      ip: req.ip,
    });

    const user = await this.usersService.deactivate(id);

    if (!user) {
      await this.auditService.logSystemAction('users.deactivate_not_found', {
        userId: id,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the deactivation success
    await this.auditService.logSystemAction('users.deactivate_success', {
      userId: id,
      email: user.email,
    });

    return user;
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Log the activation request
    await this.auditService.logSystemAction('users.activate_request', {
      userId: id,
      ip: req.ip,
    });

    const user = await this.usersService.activate(id);

    if (!user) {
      await this.auditService.logSystemAction('users.activate_not_found', {
        userId: id,
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Log the activation success
    await this.auditService.logSystemAction('users.activate_success', {
      userId: id,
      email: user.email,
    });

    return user;
  }
}

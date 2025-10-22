import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { NotificationService } from './notification.service';
import {
  NotificationListDto,
  NotificationDto,
  NotificationPaginatedDto,
} from 'shared/dtos/notification-dtos';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @ApiOperation({ summary: 'Get all notifications with pagination and filtering' })
  @ApiQuery({ type: NotificationListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of notifications',
    type: NotificationPaginatedDto,
  })
  async findAll(@Query() queryDto: NotificationListDto) {
    return await this.notificationService.get(queryDto, NotificationListDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ type: NotificationListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of user notifications',
    type: NotificationPaginatedDto,
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.notificationService.getSingle({ entityId: userId, entityType: 'user' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: NotificationDto
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.notificationService.getSingle({ id });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: NotificationDto
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    return await this.notificationService.update(id, { isRead: true });
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of notifications marked as read' }
      }
    }
  })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user?.id;
    return await this.notificationService.update({ entityId: userId, entityType: 'user' }, { isRead: true });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    await this.notificationService.delete(id);
    return { message: 'Notification deleted successfully' };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications deleted successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of notifications deleted' }
      }
    }
  })
  async deleteAll(@Request() req: any) {
    const userId = req.user?.id;
    return await this.notificationService.delete({ entityId: userId, entityType: 'user' });
  }
}

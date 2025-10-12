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
    return await this.notificationService.findAll(queryDto);
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
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return await this.notificationService.findOne({ userId });
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
    return await this.notificationService.findOne({ id });
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
    return await this.notificationService.markAsRead(id, userId);
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
    return await this.notificationService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of unread notifications' }
      }
    }
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.id;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
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
    const userId = req.user?.id;
    await this.notificationService.delete(id, userId);
    return { message: 'Notification deleted successfully' };
  }

  @Delete('all')
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
  async deleteAllForUser(@Request() req: any) {
    const userId = req.user?.id;
    return await this.notificationService.deleteAllForUser(userId);
  }
}

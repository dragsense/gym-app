import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Version,
  Patch,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { AuthUser } from '@/decorators/user.decorator';

import { UsersService } from './users.service';


import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto, UserListDto, UserPaginatedDto, UserWithProfileSafeDto } from 'shared';
import { EUserLevels, EUserRole } from 'shared/enums';


@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService
  ) { }

  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ type: UserListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users',
    type: UserPaginatedDto,
  })
  @Get()
  findAll(
    @Query() query: UserListDto,
    @AuthUser() user: any
  ) {
    return this.usersService.findAll(query, user);
  }

  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns authenticated user',
    type: UserWithProfileSafeDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('me')
  findMe(@AuthUser() user: any) {
    const userId = user.id;
    return this.usersService.findOne(
      { id: userId },
      { select: ['id', 'email'], relations: ['profile'] }
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user by ID',
    type: UserWithProfileSafeDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(
      { id },
      { relations: ['profile'] }
    );
  }

  @ApiOperation({ summary: 'Add a new user (Admin: add Customer/client, Customer: add client)' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Create a new user with profile information',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email is already taken' })
  @Post()
  create(@AuthUser() user: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update user and profile information',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: any
  ) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Reset authenticated user password' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset user password',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put('me/reset-password')
  async resetPassword(
    @AuthUser() user: any,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    const id = user.id;

    await this.usersService.resetPassword(id, resetPasswordDto);


    return { message: 'Password reset successfully' };
  }

}

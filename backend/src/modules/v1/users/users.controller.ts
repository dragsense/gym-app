import {
  Controller,
  Get,
  Body,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Patch,
  Req,
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

import {
  CreateUserDto,
  ResetPasswordDto,
  SingleQueryDto,
  UpdateUserDto,
  UserListDto,
  UserPaginatedDto,
  UserWithProfileSafeDto,
} from '@shared/dtos';
import { User } from '@/common/base-user/entities/user.entity';
import { CacheService } from '@/common/cache/cache.service';
import { EUserLevels } from '@shared/enums';
import { MinUserLevel } from '@/common/decorators/level.decorator';
import { Profile } from './profiles/entities/profile.entity';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@MinUserLevel(EUserLevels.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ type: UserListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users',
    type: UserPaginatedDto,
  })
  @Get()
  findAll(@Query() query: UserListDto, @AuthUser() currentUser: User) {
    return this.usersService.getUsers(query, currentUser);
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
  findOne(@Param('id') id: string, @Query() query: SingleQueryDto<User>) {
    return this.usersService.getUser(id, query);
  }

  @ApiOperation({
    summary:
      'Add a new user (Admin: add Customer/client, Customer: add client)',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Create a new user with profile information',
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email is already taken' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update user and profile information',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }

  @MinUserLevel(EUserLevels.CLIENT)
  @ApiOperation({ summary: 'Reset authenticated user password' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset user password',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put('me/reset-password')
  async resetPassword(
    @AuthUser() currentUser: User,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.usersService.resetPassword(currentUser.id, resetPasswordDto);

    return { message: 'Password reset successfully' };
  }
}

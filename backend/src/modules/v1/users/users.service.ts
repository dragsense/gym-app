import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '@/common/base-user/entities/user.entity';
import {
  CreateUserDto,
  SingleQueryDto,
  UpdateUserDto,
  UserListDto,
} from '@shared/dtos';
import { IMessageResponse, IPaginatedResponse } from '@shared/interfaces';
import { ResetPasswordDto } from '@shared/dtos/user-dtos/reset-password.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from '../auth/services/tokens.service';
import { UserEmailService } from './services/user-email.service';
import { LoggerService } from '@/common/logger/logger.service';
import { ProfilesService } from './profiles/profiles.service';
import { BaseUsersService } from '@/common/base-user/base-users.service';
import { EUserLevels } from '@shared/enums/user.enum';

@Injectable()
export class UsersService {
  private readonly customLogger = new LoggerService(UsersService.name);

  constructor(
    private readonly baseUsersService: BaseUsersService,
    private readonly profielService: ProfilesService,
    private readonly passwordService: PasswordService,
    private readonly userEmailService: UserEmailService,
    private tokenService: TokenService,
  ) {}

  private generateStrongPassword(length: number): string {
    const chars = {
      alpha: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
      numeric: '23456789',
      special: '!@#$%^&*',
    };

    let password = '';
    // Ensure at least one of each type
    password += chars.alpha.charAt(
      Math.floor(Math.random() * chars.alpha.length),
    );
    password += chars.numeric.charAt(
      Math.floor(Math.random() * chars.numeric.length),
    );
    password += chars.special.charAt(
      Math.floor(Math.random() * chars.special.length),
    );

    // Fill remaining with random characters
    const allChars = chars.alpha + chars.numeric + chars.special;
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  async getSuperAdmin(): Promise<User> {
    return this.baseUsersService.getSingle({
      level: EUserLevels.SUPER_ADMIN,
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.baseUsersService.getUserByEmailWithPassword(email);
  }

  async getUser(id: string, query?: SingleQueryDto<User>): Promise<User> {
    return this.baseUsersService.getSingle(id, query);
  }

  async getUsers(
    query: UserListDto,
    currentUser: User,
  ): Promise<IPaginatedResponse<User>> {
    return this.baseUsersService.get(query, UserListDto, {
      beforeQuery: (query: SelectQueryBuilder<User>) => {
        if (currentUser.level !== EUserLevels.SUPER_ADMIN) {
          query.andWhere('entity.createdByUserId = :createdByUserId', {
            createdByUserId: currentUser.id,
          });
        }
      },
    });
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<IMessageResponse & { user: User }> {
    // Check if email exists

    let tempPassword: string | undefined;

    if (!createUserDto.password) {
      tempPassword = this.generateStrongPassword(12);
      createUserDto.password = tempPassword;
    }

    // Use CRUD service create method
    const user = await this.baseUsersService.create(createUserDto, {
      beforeCreate: async (
        processedData: CreateUserDto,
        manager: EntityManager,
      ) => {
        const existingUser = await manager.findOne(User, {
          where: {
            email: processedData.email,
          },
        });

        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        return {
          ...processedData,
          tempPassword,
        };
      },
    });

    user.password = tempPassword as string;
    user.passwordHistory = [];

    return { message: 'User created successfully.', user };
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IMessageResponse> {
    // Update user data with callbacks

    await this.baseUsersService.update(id, updateUserDto, {
      beforeUpdate: async (existingEntity: User, manager: EntityManager) => {
        // Check if email is being changed and if it already exists
        if (
          updateUserDto.email &&
          updateUserDto.email !== existingEntity.email
        ) {
          const emailExists = await this.baseUsersService.getSingle({
            where: { email: updateUserDto.email },
          });

          if (emailExists) {
            throw new ConflictException('Email already exists');
          }
        }
      },
    });

    return {
      message: 'User updated successfully',
    };
  }

  async deleteUser(id: string): Promise<IMessageResponse> {
    await this.baseUsersService.delete(id, {
      afterDelete: async (entity: User, manager: EntityManager) => {
        const profile = await this.profielService.getSingle({
          userId: entity.id,
        });
        if (profile) {
          await this.profielService.delete(profile.id);
        }
      },
    });
    return {
      message: 'User deleted successfully',
    };
  }

  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
    force: boolean = false,
  ): Promise<IMessageResponse & { success: true }> {
    const { currentPassword, password } = resetPasswordDto;

    const user = await this.baseUsersService.getSingle({
      id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.passwordService.validatePasswordChange(user, password);

    if (!force) {
      if (!currentPassword) {
        throw new ConflictException('Current password is required');
      }

      const isOldPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new ConflictException('Old password is incorrect');
      }
    }

    if (user.password) {
      const isSameAsOld = await bcrypt.compare(password, user.password);
      if (isSameAsOld) {
        throw new ConflictException(
          'New password must be different from the old password',
        );
      }
    }

    user.password = password;

    const savedUser = await this.baseUsersService.update(user.id, user);

    await this.tokenService.invalidateAllTokens(user.id);

    // Emit password reset event for email sending
    this.baseUsersService.eventService.emit('user.password.reset', {
      entity: savedUser,
      entityId: user.id,
      operation: 'resetPassword',
      source: 'user',
      tableName: 'users',
      timestamp: new Date(),
      data: {
        type: 'confirmation',
      },
    });

    return {
      message: 'Password reset successfully',
      success: true,
    };
  }
}

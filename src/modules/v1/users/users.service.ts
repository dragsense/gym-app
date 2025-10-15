import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, FindOptionsWhere, DeepPartial, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User } from '@/modules/v1/users/entities/user.entity';
import { Profile } from '@/modules/v1/users/profiles/entities/profile.entity';
import { CreateUserDto, UpdateUserDto, UserListDto } from 'shared/dtos';
import { IMessageResponse, IPaginatedResponse } from 'shared/interfaces';
import { ResetPasswordDto } from 'shared/dtos/user-dtos/reset-password.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from '../auth/services/tokens.service';
import { UserEmailService } from './services/user-email.service';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/events/event.service';
import { ProfilesService } from './profiles/profiles.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';

@Injectable()
export class UsersService extends CrudService<User> {
  private readonly customLogger = new LoggerService(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly profielService: ProfilesService,
    private readonly passwordService: PasswordService,
    private readonly userEmailService: UserEmailService,
    private tokenService: TokenService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
      searchableFields: ['email'],
      restrictedFields: ['password', 'refreshToken', 'resetPasswordToken', 'resetPasswordExpires'],
      selectableFields: ['id', 'email', 'isActive', 'createdAt', 'updatedAt', 'profile.firstName', 'profile.lastName', 'profile.phoneNumber'],
      pagination: {
        defaultLimit: 10,
        maxLimit: 100
      },
      defaultSort: {
        field: 'createdAt',
        order: 'DESC'
      }
    };
    super(userRepo, dataSource, eventService, crudOptions);
  }



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

  async createUser(createUserDto: CreateUserDto): Promise<IMessageResponse & { user: User }> {
    const { profile, ...userData } = createUserDto;

    // Check if email exists
    const existingUser = await this.userRepo.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let tempPassword: string | undefined;

    if (!userData.password) {
      tempPassword = this.generateStrongPassword(12);
      userData.password = tempPassword;
    }

    // Use CRUD service create method
    const user = await this.create({
      ...userData,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      }
    });

    // Send onboarding email if temp password was generated
    if (tempPassword) {
      this.userEmailService.sendOnboardingEmail({
        user,
        tempPassword,
      }).catch((error) =>
        this.customLogger.error('Onboarding email failed', error.stack),
      );
    }

    return { message: 'User created successfully.', user };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<IMessageResponse> {
    const { profile, ...userData } = updateUserDto;

    // Update user data with callbacks
    if (Object.keys(userData).length > 0) {
      await this.update(id, userData, {
        beforeUpdate: async (existingEntity: User, manager: EntityManager) => {
          // Check if email is being changed and if it already exists
          if (userData.email && userData.email !== existingEntity.email) {
            const emailExists = await manager.findOne(this.repository.target, {
              where: { email: userData.email },
            });

            if (emailExists) {
              throw new ConflictException('Email already exists');
            }
          }
        },
        afterUpdate: async (updatedEntity: User, manager: EntityManager) => {
          // Update profile within the same transaction if provided
          await this.updateUserProfile(updatedEntity.id, profile);
        }
      });
    } else if (profile && Object.keys(profile).length > 0) {
      // Only profile update, no user data changes
      await this.updateUserProfile(id, profile);
    }

    return {
      message: 'User updated successfully',
    };
  }

  /**
   * Helper method to update user profile
   */
  private async updateUserProfile(userId: number, profile: any): Promise<void> {
    if (profile && Object.keys(profile).length > 0) {
      const userWithProfile = await this.getSingle({ id: userId }, { __relations: 'profile' });
      if (userWithProfile.profile) {
        await this.profielService.update(userWithProfile.profile.id, profile);
      }
    }
  }


  async resetPassword(
    id: number,
    resetPasswordDto: ResetPasswordDto,
    force: boolean = false
  ): Promise<IMessageResponse & { success: true }> {
    const { currentPassword, password } = resetPasswordDto;


    const user = await this.getSingle({ id }, { select: ['id', 'password', 'passwordHistory'] });

    await this.passwordService.validatePasswordChange(user, password);


    if (!force) {
      if (!currentPassword) {
        throw new ConflictException('Current password is required');
      }

      const isOldPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isOldPasswordValid) {
        throw new ConflictException('Old password is incorrect');
      }
    }

    const isSameAsOld = await bcrypt.compare(password, user.password);
    if (isSameAsOld) {
      throw new ConflictException('New password must be different from the old password');
    }

    user.password = password;

    await this.userRepo.save(user);

    await this.tokenService.invalidateAllTokens(user.id);

    // Emit password reset event for email sending
    this.eventService.emit('user.password.reset', {
      email: user.email,
      user,
      type: 'confirmation'
    });

    return {
      message: 'Password reset successfully',
      success: true
    };
  }

}

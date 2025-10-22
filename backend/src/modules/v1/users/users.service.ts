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
import { EventService } from '@/common/helper/services/event.service';
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
      restrictedFields: ['password'],
      searchableFields: ['email', 'profile.firstName', 'profile.lastName'],
    };
    super(userRepo, dataSource, eventService, crudOptions);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isActive', 'level'],
      relations: ['profile'],
    });
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
      },
      tempPassword
    });


    return { message: 'User created successfully.', user };
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<IMessageResponse> {
    const { profile, ...userData } = updateUserDto;

    // Update user data with callbacks

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
        try {
          const existingUser = await this.getSingle({ id: updatedEntity.id }, { __relations: 'profile' });

          if (profile && existingUser.profile)
            await manager.update(Profile, existingUser.profile.id, profile);
        } catch (error) {
          throw new Error('Failed to update user', error);
        }
      }
    });


    return {
      message: 'User updated successfully',
    };
  }



  async resetPassword(
    id: number,
    resetPasswordDto: ResetPasswordDto,
    force: boolean = false
  ): Promise<IMessageResponse & { success: true }> {
    const { currentPassword, password } = resetPasswordDto;


    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'passwordHistory'],
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

    if (user.password) {
      const isSameAsOld = await bcrypt.compare(password, user.password);
      if (isSameAsOld) {
        throw new ConflictException('New password must be different from the old password');
      }
    }

    user.password = password;

    const savedUser = await this.userRepo.save(user);

    await this.tokenService.invalidateAllTokens(user.id);

    // Emit password reset event for email sending
    this.eventService.emit('user.password.reset', {
      entity: savedUser,
      entityId: user.id,
      operation: 'resetPassword',
      source: 'user',
      tableName: 'users',
      timestamp: new Date(),
      data: {
        type: 'confirmation'
      }
    });

    return {
      message: 'Password reset successfully',
      success: true
    };
  }

}

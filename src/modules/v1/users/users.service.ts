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
import { EUserRole, EUserLevels } from 'shared/enums';
import { IMessageResponse, IPaginatedResponse, IListQueryParams } from 'shared/interfaces';
import { ResetPasswordDto } from 'shared/dtos/user-dtos/reset-password.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from '../auth/services/tokens.service';
import { UserEmailService } from './services/user-email.service';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class UsersService {
  private readonly logger = new LoggerService(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly userEmailService: UserEmailService,
    private tokenService: TokenService,
  ) {}

  async findOne(
    where: FindOptionsWhere<User>,
    options?: {
      select?: (keyof User)[];
      relations?: string[];
    }
  ): Promise<User> {
    const { select = ['email', 'id', 'isActive'], relations = ['profile'] } = options || {};

    const user = await this.userRepo.findOne({
      where,
      select,
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }


  async findAll(
    queryDto: UserListDto,
    currentUser: User
  ): Promise<IPaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.image', 'image')

    // Apply filters
    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR profile.firstName ILIKE :search OR profile.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }


    // (Optional) Apply extra filters dynamically if needed
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`user.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`user.${sortColumn}`, sortDirection);

    if (createdAfter) query.andWhere('user.createdAt >= :createdAfter', { createdAfter });
    if (createdBefore) query.andWhere('user.createdAt <= :createdBefore', { createdBefore });
    if (updatedAfter) query.andWhere('user.updatedAt >= :updatedAfter', { updatedAfter });
    if (updatedBefore) query.andWhere('user.updatedAt <= :updatedBefore', { updatedBefore });

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };

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

  async create(createUserDto: CreateUserDto): Promise<IMessageResponse & { user: User }> {


    const { profile, ...userData } = createUserDto;

    // Check if email exists
    const existingUser = await this.userRepo.findOne({
      where: { email: userData.email },
    });


    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let tempPassword: string;

  
    if (!userData.password) {
      tempPassword = this.generateStrongPassword(12);
      userData.password = tempPassword;
    }

    return await this.dataSource.transaction(async (manager: EntityManager) => {

      // Create profile
      const profileData: DeepPartial<Profile> = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      };

      // Create user (use userData.password which has the temp password if generated)
      const userDataToSave: DeepPartial<User> = {
        email: createUserDto.email,
        password: userData.password, // Use the modified password (could be temp password)
        isActive: true,
        profile: profileData,
      };

      // Track created by is handled through audit columns
      const user = manager.create(User, userDataToSave);
      await manager.save(user);

      if (tempPassword) {
        this.userEmailService.sendOnboardingEmail({
          user,
          tempPassword,
        }).catch((error) =>
          this.logger.error('Onboarding email failed', error.stack),
        );
        user.password = tempPassword;
      }

      return { message: 'User created successfully.', user };
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<IMessageResponse> {
    const user = await this.findOne({ id }, { relations: ['profile'] });

    const { profile, ...userData } = updateUserDto;

    // Check email uniqueness if changed
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Update user
      if (userData.email) {
        user.email = userData.email;
      }

      if (userData.isActive !== undefined) {
        user.isActive = userData.isActive;
      }

      if (user.profile) {
        Object.assign(user.profile, updateUserDto);

      }

      await manager.save(user);


      return user;
    });

    return {
      message: 'User updated successfully',
    };
  }

  async remove(id: number): Promise<IMessageResponse> {
    const user = await this.findOne({ id });
    await this.userRepo.remove(user);
    return {
      message: 'User deleted successfully',
    };
  }

  async resetPassword(
    id: number,
    resetPasswordDto: ResetPasswordDto,
    force: boolean = false
  ): Promise<IMessageResponse & { success: true }> {
    const { currentPassword, password } = resetPasswordDto;


    const user = await this.findOne({ id }, { select: ['id', 'password', 'passwordHistory'] });

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


    // Send password reset confirmation email
    this.userEmailService.sendPasswordResetConfirmation(user).catch((error) =>
      this.logger.error('Password reset confirmation email failed', error.stack),
    );

    return {
      message: 'Password reset successfully',
      success: true
    };
  }

}

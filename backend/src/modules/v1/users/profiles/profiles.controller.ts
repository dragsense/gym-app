import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ProfilesService } from './profiles.service';

import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from '@shared/dtos';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { OmitType } from '@shared/lib/type-utils';
import { LoggerService } from '@/common/logger/logger.service';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/base-user/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('Profiles')
@Controller('users/profiles')
export class ProfilesController {
  private readonly logger = new LoggerService(ProfilesController.name);
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('profile/me')
  @ApiOperation({ summary: 'Get profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findMe(@Req() req: any) {
    return this.profilesService.getSingle(
      { userId: req.user.id },
      { _relations: ['user'] },
    );
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'documents', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Patch('profile/me')
  @ApiOperation({ summary: 'Update profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateMe(
    @AuthUser() currentUser: User,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; documents?: Express.Multer.File[] },
    @Body() updateProfileDto: OmitType<UpdateProfileDto, 'image' | 'documents'>,
  ) {
    let profile: Profile | null = null;
    try {
      profile = await this.profilesService.getSingle({
        userId: currentUser.id,
      });
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : String(error));

      profile = await this.profilesService.create({
        userId: currentUser.id,
        ...updateProfileDto,
      });
    }

    const image = files?.image?.[0];
    const documents = files?.documents;

    return this.profilesService.updateProfile(
      profile.id,
      updateProfileDto,
      image,
      documents,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profilesService.getSingle({ userId: id });
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'documents', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; documents?: Express.Multer.File[] },
    @Body() updateProfileDto: OmitType<UpdateProfileDto, 'image' | 'documents'>,
  ) {
    const image = files?.image?.[0];
    const documents = files?.documents;

    return this.profilesService.updateProfile(
      id,
      updateProfileDto,
      image,
      documents,
    );
  }
}

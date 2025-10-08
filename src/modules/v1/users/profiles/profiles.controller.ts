import { Controller, Get, Body, Patch, Param, ParseIntPipe, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';

import { ProfilesService } from './profiles.service';

import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from 'shared/dtos';

import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '@/pipes/image-validation';


@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Profiles')
@Controller('users/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findMe(@Req() req: any) {
    return this.profilesService.findOneByUser({ id: req.user.id });
  }


  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @Patch('profile/me')
  @ApiOperation({ summary: 'Update profile of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateMe(@Req() req: any,
    @UploadedFiles(new ImageValidationPipe()) files: { image?: Express.Multer.File[];},
    @Body() updateProfileDto: UpdateProfileDto) {
    const profile = await this.profilesService.findOneByUser({ id: req.user.id });

    const image = files.image?.[0];

    if (updateProfileDto.image) {
      updateProfileDto.image = null;
    }



    return this.profilesService.update(profile.id, updateProfileDto, image);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get profile by user ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile found', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOneByUser({ id });
  }

  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto) {

    if (updateProfileDto.image) {
      updateProfileDto.image = null;
    }

    return this.profilesService.update(id, updateProfileDto, image);
  }

}

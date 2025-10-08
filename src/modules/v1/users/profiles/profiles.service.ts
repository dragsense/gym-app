import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IMessageResponse } from 'shared/interfaces';


import { Profile } from './entities/profile.entity';
import { User } from '@/modules/v1/users/entities/user.entity';


import { UpdateProfileDto } from 'shared/dtos/user-dtos/profile.dto';
import { FileUploadService } from '../../file-upload/file-upload.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private fileUploadService: FileUploadService,

  ) { }

  async findOneByUser(user: Pick<User, "id">): Promise<Profile> {

    const userId = user.id;

    const profile = await this.profileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['image']
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto, profileImage?: Express.Multer.File): Promise<IMessageResponse> {


    const {
      image,
      ...profileData
    } = updateProfileDto;


    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['image'],
    });


    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    Object.assign(profile, profileData);



    if (profileImage) {
      const uploaded = await this.fileUploadService.updateFile(
        profileImage,
        profile.image,
        'profile',
      );

      profile.image = uploaded;
    }

    if (profileImage) {
      const uploaded = await this.fileUploadService.updateFile(
        profileImage,
        profile.image,
        'profile',
      );

      profile.image = uploaded;
    }


    await this.profileRepo.save(profile);

    return { message: 'Profile updated successfully' };
  }

}

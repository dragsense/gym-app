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
import { FileUploadService } from '@/common/file-upload/file-upload.service';
import { FileUpload } from '@/common/file-upload/entities/file-upload.entity';
import { EFileType } from 'shared';

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
      relations: ['image', 'documents']
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user with ID ${userId} not found`);
    }

    return profile;
  }

  async update(
    id: number, 
    updateProfileDto: UpdateProfileDto, 
    profileImage?: Express.Multer.File,
    documents?: Express.Multer.File[]
  ): Promise<IMessageResponse> {


    console.log(updateProfileDto);

    const {
      image,
      documents: _,
      ...profileData
    } = updateProfileDto;


    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['image', 'documents'],
    });


    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    Object.assign(profile, profileData);



    if (profileImage) {
      let uploaded: FileUpload;
      if (profile.image) {
        uploaded = await this.fileUploadService.updateFile(
          profile.image.id,
          {
            name: profileImage.originalname,
            type: EFileType.IMAGE,
          },
          profileImage
        );

      } else {
        uploaded = await this.fileUploadService.createFile(
          {
            name: profileImage.originalname,
            type: EFileType.IMAGE,
          },
          profileImage
        );
      }

      profile.image = uploaded;
    }

    // Handle documents upload (up to 10 files)
    if (documents && documents.length > 0) {
      // Limit to 10 documents
      const filesToUpload = documents.slice(0, 10);
      
      const uploadedDocuments: FileUpload[] = [];
      
      for (const doc of filesToUpload) {
        const uploaded = await this.fileUploadService.createFile(
          {
            name: doc.originalname,
            type: EFileType.DOCUMENT,
          },
          doc
        );
        uploadedDocuments.push(uploaded);
      }

      // Append new documents to existing ones (if any)
      if (profile.documents) {
        profile.documents = [...profile.documents, ...uploadedDocuments];
      } else {
        profile.documents = uploadedDocuments;
      }

      // Ensure we don't exceed 10 documents total
      if (profile.documents.length > 10) {
        profile.documents = profile.documents.slice(-10);
      }
    }


    await this.profileRepo.save(profile);

    return { message: 'Profile updated successfully' };
  }

}

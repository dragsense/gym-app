import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { IMessageResponse } from 'shared/interfaces';
import { CrudService } from '@/common/crud/crud.service';
import { CrudEventService } from '@/common/crud/services/crud-event.service';
import { CrudOptions } from 'shared/decorators';


import { Profile } from './entities/profile.entity';


import { UpdateProfileDto } from 'shared/dtos/user-dtos/profile.dto';
import { FileUploadService } from '@/common/file-upload/file-upload.service';
import { FileUpload } from '@/common/file-upload/entities/file-upload.entity';
import { EFileType } from 'shared';

@Injectable()
export class ProfilesService extends CrudService<Profile> {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly fileUploadService: FileUploadService,
    dataSource: DataSource,
    crudEventService: CrudEventService,
  ) {

    const crudOptions: CrudOptions = {
      relations: [],
      searchableFields: ['firstName', 'lastName'],
      pagination: { defaultLimit: 10, maxLimit: 100 },
      defaultSort: { field: 'createdAt', order: 'DESC' },
    };

    super(profileRepo, dataSource, crudEventService, crudOptions);
    
  }

  async updateProfile(
    id: number, 
    updateProfileDto: UpdateProfileDto, 
    profileImage?: Express.Multer.File,
    documents?: Express.Multer.File[]
  ): Promise<IMessageResponse> {


    const {
      image,
      documents: _,
      ...profileData
    } = updateProfileDto;


    const profile = await this.getSingle({
      where: { id },
      relations: ['image', 'documents'],
    });


    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

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


    await this.update(id, profileData);

    return { message: 'Profile updated successfully' };
  }

}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { IMessageResponse } from '@shared/interfaces';
import { CrudService } from '@/common/crud/crud.service';

import { Profile } from './entities/profile.entity';

import { UpdateProfileDto } from '@shared/dtos/user-dtos/profile.dto';
import { FileUploadService } from '@/common/file-upload/file-upload.service';
import { FileUpload } from '@/common/file-upload/entities/file-upload.entity';
import { EFileType } from '@shared/enums';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';

@Injectable()
export class ProfilesService extends CrudService<Profile> {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly fileUploadService: FileUploadService,
    dataSource: DataSource,
    crudEventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
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
    documents?: Express.Multer.File[],
  ): Promise<IMessageResponse> {
    const { image, documents: _, ...profileData } = updateProfileDto;

    // Use callbacks to handle file uploads during update
    await this.update(id, profileData, {
      afterUpdate: async (entity, manager) => {
        // Handle profile image upload
        let uploaded: FileUpload | null = null;
        let oldImage: FileUpload | null = null;

        let oldDocuments: FileUpload[] = [];
        const uploadedDocuments: {
          fileUpload: FileUpload;
          file: Express.Multer.File;
        }[] = [];

        if (profileImage) {
          if (entity.image) {
            oldImage = entity.image;
            uploaded = await this.fileUploadService.updateFile(
              entity.image.id,
              {
                name: profileImage.originalname,
                type: EFileType.IMAGE,
              },
              profileImage,
              false,
              manager,
            );
          } else {
            uploaded = await this.fileUploadService.createFile(
              {
                name: profileImage.originalname,
                type: EFileType.IMAGE,
              },
              profileImage,
              true,
              manager,
            );
          }
          entity.image = uploaded;
        }

        if (entity.documents) {
          oldDocuments = entity.documents;
        }

        // Handle documents upload (up to 10 files)
        if (documents && documents.length > 0) {
          // Limit to 10 documents
          const filesToUpload = documents.slice(0, 10);

          for (const doc of filesToUpload) {
            const uploaded = await this.fileUploadService.createFile(
              {
                name: doc.originalname,
                type: EFileType.DOCUMENT,
              },
              doc,
              false,
              manager,
            );
            uploadedDocuments.push({ fileUpload: uploaded, file: doc });
          }

          // Append new documents to existing ones (if any)
          if (entity.documents) {
            entity.documents = [
              ...entity.documents,
              ...uploadedDocuments.map((doc) => doc.fileUpload),
            ];
          } else {
            entity.documents = uploadedDocuments.map((doc) => doc.fileUpload);
          }

          // Ensure we don't exceed 10 documents total
          if (entity.documents.length > 10) {
            entity.documents = entity.documents.slice(-10);
          }
        }

        // Save files to database using the manager
        if (entity.image) {
          await manager.save(entity.image);
        }
        if (entity.documents && entity.documents.length > 0) {
          await manager.save(entity.documents);
        }

        if (uploaded && profileImage) {
          await this.fileUploadService.saveFiles([
            { file: profileImage, fileUpload: uploaded },
          ]);
          if (oldImage) {
            await this.fileUploadService.deleteFiles([oldImage]);
          }
        }
        if (uploadedDocuments.length > 0) {
          await this.fileUploadService.saveFiles(
            uploadedDocuments.map((doc) => ({
              file: doc.file,
              fileUpload: doc.fileUpload,
            })),
          );
          /*   if (entity.documents) {
            await this.fileUploadService.deleteFiles(entity.documents);
          } */
        }
      },
    });

    return { message: 'Profile updated successfully' };
  }
}

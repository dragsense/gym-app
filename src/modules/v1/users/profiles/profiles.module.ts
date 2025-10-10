import { Controller, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Profile } from './entities/profile.entity';
import { FileUploadService } from '@/common/file-upload/file-upload.service';
import { FileUpload } from '@/common/file-upload/entities/file-upload.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Profile, FileUpload])],
  controllers: [ProfilesController],
  providers: [ProfilesService, FileUploadService],
})
export class ProfilesModule { }

import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {  createPartialType } from '../../lib/type-utils';
import { Type } from 'class-transformer';
import { EFileType } from '../../enums/file-upload.enum';
import { ListQueryDto } from '../common/list-query.dto';
import { PaginationMetaDto } from '../common/pagination.dto';
import { IFileUpload } from '../../interfaces';

export class CreateFileUploadDto {
  @ApiProperty({ example: 'profile-picture.jpg' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mimetype: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  size: number;

  @ApiProperty({ example: '/uploads/profile/123.jpg' })
  @IsString()
  path: string;

  @ApiProperty({ enum: EFileType, example: EFileType.IMAGE })
  @IsEnum(EFileType)
  type: EFileType;

  @ApiProperty({ example: 1 })
  @IsOptional()
  userId?: number;
}

export class UpdateFileUploadDto extends createPartialType(CreateFileUploadDto) {}


export class FilePaginationDto extends PaginationMetaDto{
  @ApiProperty({ type: () => [FileUploadDto] })
  @Type(() => FileUploadDto)
  data: FileUploadDto[]
}

export class FileListDto extends ListQueryDto<IFileUpload> {
  @ApiPropertyOptional({ enum: EFileType })
  @IsOptional()
  @IsEnum(EFileType)
  type?: EFileType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}


export class FileUploadDto {
    
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'profile-picture.jpg' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 1024000 })
  size: number;
}


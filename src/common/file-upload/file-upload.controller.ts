import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
  Delete,
  Post,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { FileListDto, CreateFileUploadDto, UpdateFileUploadDto } from 'shared/dtos/file-upload-dtos/file-upload.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { AuthUser } from '@/decorators/user.decorator';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { User } from '@/modules/v1/users/entities/user.entity';
import { FileValidationPipe } from '@/pipes/file-validation.pipe';
import { OmitType } from 'shared/lib/type-utils';

@ApiTags('File Upload')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileUploadController {

  constructor(private readonly fileUploadService: FileUploadService) { }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of File' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  findAll(@Query() queryDto: FileListDto) {
    return this.fileUploadService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File found' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'File ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileUploadService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or upload a file' })
  @ApiResponse({ status: 201, description: 'File created successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: CreateFileUploadDto})
  @UseInterceptors(FileInterceptor('file'))
  async createFile(
    @Body() createDto: OmitType<CreateFileUploadDto, 'file'>,
    @UploadedFile(new FileValidationPipe({
      maxSize: 50 * 1024 * 1024,
      minSize: 1024,
      required: false,
      validateImageDimensions: true,
      minWidth: 100,
      maxWidth: 4000,
      minHeight: 100,
      maxHeight: 4000,
    })) file?: Express.Multer.File,
  ) {
    const createdFile = await this.fileUploadService.createFile(createDto, file);
    return { message: 'File created successfully', data: createdFile };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata or upload new file' })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'File ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: UpdateFileUploadDto})
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: OmitType<UpdateFileUploadDto, 'file'>,
    @UploadedFile(new FileValidationPipe({
      maxSize: 50 * 1024 * 1024,
      minSize: 1024,
      required: false,
      validateImageDimensions: true,
      minWidth: 100,
      maxWidth: 4000,
      minHeight: 100,
      maxHeight: 4000,
    })) file?: Express.Multer.File,
  ) {
    const updatedFile = await this.fileUploadService.updateFile(id, updateData, file);
    return { message: 'File updated successfully', data: updatedFile };
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'File ID' })
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    const file = await this.fileUploadService.findOne(id);
    await this.fileUploadService.deleteFile(file);
    return { message: 'File deleted successfully' };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file by ID (with access check)' })
  @ApiParam({ name: 'id', type: 'number', description: 'File ID' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
    @Res() res: Response,
  ) {
    const file = await this.fileUploadService.findOne(id);
    if (!file) throw new NotFoundException('File not found');

    const filePath = join(process.cwd(), 'private', file.path);
    if (!existsSync(filePath)) throw new NotFoundException('File missing on server');

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    createReadStream(filePath).pipe(res);
  }
}

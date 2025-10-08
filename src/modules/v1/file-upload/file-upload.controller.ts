import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { FileListDto } from 'shared/dtos/file-upload-dtos/file-upload.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { AuthUser } from '@/decorators/user.decorator';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { User } from '@/modules/v1/users/entities/user.entity';


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

import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { FileListDto, CreateFileUploadDto, UpdateFileUploadDto } from 'shared/dtos/file-upload-dtos/file-upload.dto';
import { IPaginatedResponse } from 'shared/interfaces';
import { EFileType } from 'shared/enums';
import { ConfigService } from '@nestjs/config';
import { detectFileType } from '@/lib/utils/detect-file-type.util';
import { OmitType } from 'shared/lib/type-utils';

@Injectable()
export class FileUploadService {
  private readonly appUrl: string;

  constructor(
    @InjectRepository(FileUpload)
    private fileRepo: Repository<FileUpload>,
    private configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
  }
  private ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }



  /**
   * Create file: If file is provided, upload it (ignore URL). Otherwise, use URL.
   * Auto-corrects type based on file mimetype
   */
  async createFile(
    createDto: OmitType<CreateFileUploadDto, 'file'>,
    file?: Express.Multer.File,
    manager?: EntityManager,
  ): Promise<FileUpload> {

    const folder = createDto.folder || 'general';

    // If physical file is provided, upload it (ignore URL)
    if (file) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      this.ensureDirectoryExists(uploadDir);

      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const fileName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const physicalPath = path.join(uploadDir, fileName);
      fs.writeFileSync(physicalPath, file.buffer);

      const relativePath = `uploads/${folder}/${fileName}`;
      const url = `${this.appUrl}/${relativePath}`;
      
      // Auto-detect and correct type from mimetype
      const detectedType = detectFileType(file.mimetype);
      
      const saved = this.fileRepo.create({
        name: createDto.name || file.originalname,
        type: detectedType, // Use detected type, ignore user-provided type
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath,
        folder: folder,
        url,
      });

      return manager ? await manager.save(saved) : await this.fileRepo.save(saved);
    }

    // If no file but URL is provided
    if (createDto.url) {
      const saved = this.fileRepo.create({
        name: createDto.name,
        type: createDto.type,
        path: createDto.url,
        folder: folder,
        url: createDto.url,
      });

      return manager ? await manager.save(saved) : await this.fileRepo.save(saved);
    }

    throw new NotFoundException('Either file or url must be provided');
  }

  /**
   * Delete physical file from disk and DB record
   */
  async deleteFile(file: FileUpload): Promise<void> {
    // Delete physical file
    const filePath = path.join(process.cwd(), 'public', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete DB record
    await this.fileRepo.remove(file);
  }

  async findAll(queryDto: FileListDto): Promise<IPaginatedResponse<FileUpload>> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.fileRepo.createQueryBuilder('file');

    // Apply search
    if (search) {
      query.andWhere('(file.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Apply type filter
    if (type) {
      query.andWhere('file.type = :type', { type });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`file.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`file.${sortColumn}`, sortDirection);

    if (createdAfter) query.andWhere('file.createdAt >= :createdAfter', { createdAfter });
    if (createdBefore) query.andWhere('file.createdAt <= :createdBefore', { createdBefore });
    if (updatedAfter) query.andWhere('file.updatedAt >= :updatedAfter', { updatedAfter });
    if (updatedBefore) query.andWhere('file.updatedAt <= :updatedBefore', { updatedBefore });

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: number): Promise<FileUpload> {
    const item = await this.fileRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return item;
  }

  /**
   * Update file: If file is provided, delete old and upload new (ignore URL). Otherwise, update metadata only.
   * Auto-corrects type based on file mimetype if file is provided
   */
  async updateFile(
    id: number,
    updateData: OmitType<UpdateFileUploadDto, 'file'>,
    file?: Express.Multer.File,
  ): Promise<FileUpload> {

   
    const existingFile = await this.findOne(id);
    
    // If physical file is provided, delete old and upload new (ignore URL)
    if (file) {
      // Delete old physical file
      const oldFilePath = path.join(process.cwd(), 'public', existingFile.path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      // Upload new file
      const uploadFolder = updateData.folder || existingFile.folder;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadFolder);
      this.ensureDirectoryExists(uploadDir);

      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const fileName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const physicalPath = path.join(uploadDir, fileName);
      fs.writeFileSync(physicalPath, file.buffer);

      const relativePath = `uploads/${uploadFolder}/${fileName}`;
      const url = `${this.appUrl}/${relativePath}`;
      
      // Auto-detect and correct type from mimetype
      const detectedType = detectFileType(file.mimetype);
      
      existingFile.name = updateData.name || file.originalname;
      existingFile.type = detectedType; // Use detected type, ignore user-provided
      existingFile.mimeType = file.mimetype;
      existingFile.size = file.size;
      existingFile.path = relativePath;
      existingFile.folder = uploadFolder;
      existingFile.url = url;
    } else {
      // Just update metadata (no file upload)
      if (updateData.name) existingFile.name = updateData.name;
      if (updateData.type) existingFile.type = updateData.type;
    }

    return await this.fileRepo.save(existingFile);
  }
}
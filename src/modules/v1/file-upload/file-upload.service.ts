import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FileUpload } from '@/modules/v1/file-upload/entities/file-upload.entity';
import { validateImageFile } from '@/lib/utils/validate-image-file.util';
import { FileListDto } from 'shared/dtos/file-upload-dtos/file-upload.dto';
import { IPaginatedResponse } from 'shared/interfaces';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload)
    private fileRepo: Repository<FileUpload>,
  ) { }
  private ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
    rootPath: string = 'public',
    manager?: EntityManager,
  ): Promise<FileUpload> {
    validateImageFile(file);

    const uploadDir = path.join(process.cwd(), rootPath, 'uploads', folder);
    this.ensureDirectoryExists(uploadDir);

    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const fileName = `${timestamp}${ext}`;
    const fullPath = path.join(uploadDir, fileName);
    fs.writeFileSync(fullPath, file.buffer);

    const saved = this.fileRepo.create({
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: `uploads/${folder}/${fileName}`,
    });

    if (manager) {
      return await manager.save(saved);
    }

    return await this.fileRepo.save(saved);
  }

  async updateFile(
    newFile: Express.Multer.File,
    oldFile?: FileUpload | null,
    folder = 'general',
    manager?: EntityManager,
  ): Promise<FileUpload> {
    validateImageFile(newFile);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    this.ensureDirectoryExists(uploadDir);

    if (oldFile) {
      await this.deleteFile(oldFile);
    }

    const timestamp = Date.now();
    const ext = path.extname(newFile.originalname);
    const newFileName = `${timestamp}${ext}`;
    const newPath = path.join(uploadDir, newFileName);
    fs.writeFileSync(newPath, newFile.buffer);

    const relativePath = `uploads/${folder}/${newFileName}`;

    const newRecord = this.fileRepo.create({
      name: newFile.originalname,
      mimeType: newFile.mimetype,
      size: newFile.size,
      path: relativePath,
    });

    if (manager) {
      return await manager.save(newRecord);
    }

    return await this.fileRepo.save(newRecord);

  }

  async deleteFile(file: FileUpload): Promise<void> {
    const filePath = path.join(process.cwd(), 'public', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.fileRepo.remove(file);
  }

  async findAll(queryDto: FileListDto): Promise<IPaginatedResponse<FileUpload>> {
    const {
      page = 1,
      limit = 10,
      search,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const query = this.fileRepo.createQueryBuilder('FileUpload');

    query
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('FileUpload.createdAt', 'DESC');

    if (search) {
      query.andWhere('(FileUpload.title ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        const coercedValue = !isNaN(value as any) ? Number(value) : value;
        if (coercedValue) {
          query.andWhere(`FileUpload.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (createdAfter) {
      query.andWhere('FileUpload.createdAt >= :createdAfter', { createdAfter });
    }

    if (createdBefore) {
      query.andWhere('FileUpload.createdAt <= :createdBefore', { createdBefore });
    }

    if (updatedAfter) {
      query.andWhere('FileUpload.updatedAt >= :updatedAfter', { updatedAfter });
    }

    if (updatedBefore) {
      query.andWhere('FileUpload.updatedAt <= :updatedBefore', { updatedBefore });
    }

    const [results, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data: results,
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
}
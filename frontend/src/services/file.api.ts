// Utils
import { apiFileRequest, apiRequest, downloadFile } from "@/utils/fetcher";
import { BaseService } from "./base.service";

// Types
import type { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";
import { CreateFileUploadDto, UpdateFileUploadDto } from "@shared/dtos";

// Constants
const FILES_API_PATH = "/files";

// Create base service instance
const fileService = new BaseService<IFileUpload, CreateFileUploadDto, UpdateFileUploadDto>(FILES_API_PATH);

// Re-export common CRUD operations
export const fetchFiles = (params: IListQueryParams) => fileService.get(params);
export const fetchFile = (id: number) => fileService.getSingle(id);
export const deleteFile = (id: number) => fileService.delete(id);

// File-specific methods using BaseService FormData methods
export const createFile = (data: CreateFileUploadDto) => fileService.postFormData(data);
export const updateFile = (id: number) => fileService.patchFormData(id);

export const downloadLocalFile = (id: number) => fileService.downloadFile(`/${id}/download`);
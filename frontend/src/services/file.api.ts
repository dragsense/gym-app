// Utils
import { apiFileRequest, apiRequest, downloadFile } from "@/utils/fetcher";

// Types
import type { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";
import { CreateFileUploadDto, UpdateFileUploadDto } from "@shared/dtos";
import { generateQueryParams } from "@/utils";

// Constants
const FILES_API_PATH = "/files";

export const fetchFiles = (params: IListQueryParams) => {
    const queryParams = new URLSearchParams();
    generateQueryParams(queryParams, params);

    return apiRequest<IPaginatedResponse<IFileUpload>>(
        `${FILES_API_PATH}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchFile = (id: number) =>
    apiRequest<IFileUpload>(`${FILES_API_PATH}/${id}`, "GET");

/**
 * Create file with custom URL or upload file
 * If file is provided: uploads it
 * If only URL: creates record with custom URL
 */
export const createFile = (data: CreateFileUploadDto) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    if (data.folder) formData.append('folder', data.folder);
    if (data.url) formData.append('url', data.url);
    if (data.file) formData.append('file', data.file);

    return apiFileRequest<IMessageResponse>(
        `${FILES_API_PATH}`,
        "POST",
        formData
    );
};

/**
 * Update file metadata or upload new file
 * If file is provided: deletes old and uploads new
 * If no file: just updates metadata
 */
export const updateFile = (id: number) => (data: UpdateFileUploadDto & { file?: File }) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.type) formData.append('type', data.type);
    if (data.folder) formData.append('folder', data.folder);
    if (data.file) formData.append('file', data.file);

    return apiFileRequest<IMessageResponse>(
        `${FILES_API_PATH}/${id}`,
        "PATCH",
        formData
    );
};

export const deleteFile = (id: number) =>
    apiRequest<void>(`${FILES_API_PATH}/${id}`, "DELETE");

export const downloadLocalFile = (id: number) =>
    downloadFile(`${FILES_API_PATH}/${id}/download`, "GET");


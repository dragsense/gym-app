import { useState, useCallback } from "react";
import { X, FileImage, FileVideo, FileAudio, FileText, File as FileIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";

interface MultiFileUploadProps {
    onChange?: (files: File[]) => void;
    maxSizeInMB?: number;
    maxFiles?: number;
    acceptedTypes?: string[];
    value?: (File | IFileUpload)[];
    disabled?: boolean;
}

export default function MultiFileUpload({
    onChange,
    maxSizeInMB = 10,
    maxFiles = 10,
    acceptedTypes,
    value = [],
    disabled,
}: MultiFileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (acceptedTypes && !acceptedTypes.includes(file.type)) {
            setError(`Please upload: ${acceptedTypes.join(", ")}`);
            return false;
        }

        // Check file size
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            setError(`File size must be less than ${maxSizeInMB}MB`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleFileUpload = (newFiles: File[]) => {
        const validFiles = newFiles.filter(validateFile);
        if (validFiles.length > 0) {
            const currentFiles = value.filter((f): f is File => f instanceof File);
            const totalFiles = [...currentFiles, ...validFiles];
            
            // Limit to maxFiles
            const limitedFiles = totalFiles.slice(0, maxFiles);
            onChange?.(limitedFiles);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    }, [value, maxFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleFileUpload(Array.from(files));
        }
    };

    const removeFile = (index: number) => {
        const currentFiles = value.filter((f): f is File => f instanceof File);
        const newFiles = currentFiles.filter((_, i) => i !== index);
        setError(null);
        onChange?.(newFiles);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <FileImage className="w-6 h-6 text-blue-500" />;
        if (type.startsWith("video/")) return <FileVideo className="w-6 h-6 text-purple-500" />;
        if (type.startsWith("audio/")) return <FileAudio className="w-6 h-6 text-green-500" />;
        if (type.includes("pdf") || type.includes("document")) return <FileText className="w-6 h-6 text-red-500" />;
        return <FileIcon className="w-6 h-6 text-gray-500" />;
    };

    const getFileName = (file: File | IFileUpload): string => {
        return file instanceof File ? file.name : file.name;
    };

    const getFileType = (file: File | IFileUpload): string => {
        return file instanceof File ? file.type : file.mimeType;
    };

    const getFileSize = (file: File | IFileUpload): string => {
        const size = file instanceof File ? file.size : file.size;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderUploadZone = () => {
        return (
            <div
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={acceptedTypes?.join(",")}
                    onChange={handleFileSelect}
                    disabled={disabled || (value.length >= maxFiles)}
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-lg"
                />
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center px-4">
                    Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                    Max {maxFiles} files, {maxSizeInMB}MB each
                </p>
            </div>
        );
    };

    const renderFileList = () => {
        if (value.length === 0) return null;

        return (
            <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-gray-700">
                    Uploaded Files ({value.length}/{maxFiles})
                </p>
                <div className="space-y-2">
                    {value.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                        >
                            {getFileIcon(getFileType(file))}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{getFileName(file)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {getFileSize(file)}
                                </p>
                            </div>
                            {!disabled && file instanceof File && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(index)}
                                    className="flex-shrink-0"
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-2">
            {value.length < maxFiles && renderUploadZone()}
            {renderFileList()}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}


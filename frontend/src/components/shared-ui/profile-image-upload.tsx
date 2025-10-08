import { useState, useCallback, useEffect } from "react"
import { X, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";

// Utilities
const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";

interface ProfileImageUploadProps {
    onChange?: (file: any) => void
    maxSizeInMB?: number
    acceptedTypes?: string[]
    value: File | IFileUpload | null
    disabled?: boolean
}

export default function ProfileImageUpload({
    onChange,
    maxSizeInMB = 3,
    acceptedTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"],
    value,
    disabled,
}: ProfileImageUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)

    // Convert `value` to preview if available
    useEffect(() => {
        if (value && value instanceof File) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string)
            }
            reader.readAsDataURL(value)
        } else if (value && typeof value === "object" && "path" in value) {
            setUploadedImage(`${API_URL}/${value.path}`);
        } else {
            setUploadedImage(null)
        }
    }, [value])


    const validateFile = (file: File): boolean => {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            setError("Please upload SVG, PNG, JPG or GIF files only")
            return false
        }

        // Check file size
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024
        if (file.size > maxSizeInBytes) {
            setError(`File size must be less than ${maxSizeInMB}MB`)
            return false
        }

        setError(null)
        return true
    }

    const handleFileUpload = (file: File) => {
        if (validateFile(file)) {
            onChange?.(file)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileUpload(files[0])
        }
    }

    const removeImage = () => {
        setUploadedImage(null)
        setError(null)
        onChange?.(null)
    }

    return (
        <div className="w-full flex flex-col items-center gap-2">
            {!uploadedImage ? (
                <div
                    className={`relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer transition-colors ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept={acceptedTypes.join(",")}
                        onChange={handleFileSelect}
                        disabled={disabled}
                        
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                    />
                    <FileImage className="w-6 h-6 text-gray-400" />
                </div>
            ) : (
                <div className="relative w-32 h-32">
                    <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded"
                        className="w-full h-full object-cover rounded-full border"
                        crossOrigin="anonymous"
                    />
                    {!disabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 bg-white/80 hover:bg-white rounded-full shadow-sm"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4 text-red-600" />
                        </Button>
                    )}
                </div>
            )}

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <p className="text-sm text-gray-500 text-center">
                {uploadedImage ? "Change photo" : "Upload a profile picture"}
            </p>
        </div>
    )

}

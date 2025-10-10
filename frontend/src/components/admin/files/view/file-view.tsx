// External Libraries
import { useShallow } from 'zustand/shallow';

// Components
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { File, Calendar, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types
import { type IFileUpload } from "@shared/interfaces/file-upload.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

export type TFileViewExtraProps = {}

interface IFileViewProps extends THandlerComponentProps<TSingleHandlerStore<IFileUpload, TFileViewExtraProps>> {
}

export default function FileView({ storeKey, store }: IFileViewProps) {
    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: file, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!file) {
        return null;
    }

    const handleCloseView = () => {
        reset();
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="File Details"
                    description="View detailed information about this file"
                >
                    <FileDetailContent file={file} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IFileDetailContentProps {
    file: IFileUpload;
}

function FileDetailContent({ file }: IFileDetailContentProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }
        return `${(bytes / 1024).toFixed(2)} KB`;
    };

    return (
        <div className="space-y-6">
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <File className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {file.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{file.mimeType}</Badge>
                            <span className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                            </span>
                        </div>
                        {file.url && (
                            <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                View File
                            </a>
                        )}
                    </div>
                </div>
            </AppCard>

            <div className="">
                {/* File Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">File Information</span>
                                <p className="text-sm text-muted-foreground">Basic file details</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><File className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">File Name:</span>
                                <p className="font-medium">{file.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><HardDrive className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Size:</span>
                                <p className="font-medium">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><File className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <p className="font-medium">{file.mimeType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><File className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Folder:</span>
                                <p className="font-medium">{file.folder || 'general'}</p>
                            </div>
                        </div>
                  
                        {file.url && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><File className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">File URL:</span>
                                    <p className="font-medium text-xs break-all">{file.url}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Uploaded:</span>
                                <p className="font-medium">{new Date(file.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Last Modified:</span>
                                <p className="font-medium">{new Date(file.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>
        </div>
    );
}


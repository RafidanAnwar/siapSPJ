import React, { useRef, useState, useCallback, DragEvent } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils'; // corrected relative path

interface FileUploadProps {
    label: string;
    accept?: string;
    onFileChange: (file: File | null) => void;
    className?: string;
}

export default function FileUpload({ label, accept, onFileChange, className }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            handleFile(file);
        }
    }, []);

    const handleFile = (file: File) => {
        // Optional: Add size or type validation here if needed
        setSelectedFile(file);
        onFileChange(file);
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("flex flex-col gap-1 w-full", className)}>
            <span className="text-sm font-bold text-slate-700">{label}</span>

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group overflow-hidden bg-slate-50",
                    isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-100",
                    selectedFile ? "border-emerald-500 bg-emerald-50 hover:bg-emerald-100/50 hover:border-emerald-600" : ""
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                {!selectedFile ? (
                    <>
                        <div className={cn(
                            "p-3 rounded-full mb-3 transition-colors",
                            isDragging ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                        )}>
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                            <span className="text-indigo-600 font-bold hover:underline">Pilih file</span> atau seret dan lepas di sini
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PDF, JPG, PNG {accept ? `(${accept})` : ''} hingga 10MB
                        </p>
                    </>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-200">
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                onClick={removeFile}
                                className="p-1.5 bg-white/50 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-lg backdrop-blur-sm transition-colors"
                                title="Hapus File"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-3 bg-emerald-100/80 rounded-full mb-2 text-emerald-600 ring-4 ring-emerald-50 relative">
                            <CheckCircle2 className="w-6 h-6 absolute -bottom-1 -right-1 bg-white rounded-full text-emerald-500 border-2 border-white" />
                            <File className="w-8 h-8 opacity-80" />
                        </div>
                        <div className="truncate w-full max-w-[200px] text-sm font-semibold text-emerald-900 mt-2">
                            {selectedFile.name}
                        </div>
                        <div className="text-xs font-medium text-emerald-600/70 mt-0.5">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  maxSizeMB?: number;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Simple image uploader that converts images to base64 and stores them in the database
 * No external storage needed - completely self-contained
 */
export function ImageUploader({
  onImageSelect,
  currentImage,
  onRemove,
  maxSizeMB = 5,
  buttonText = "Upload Image",
  variant = "outline",
  size = "default",
  className = "",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, WebP)",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Image must be smaller than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });
      return;
    }

    try {
      // Compress the image before converting to base64
      const options = {
        maxSizeMB: 0.5, // Compress to max 0.5MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: file.type,
      };
      
      toast({
        title: "Processing...",
        description: "Compressing image, please wait...",
      });

      const compressedFile = await imageCompression(file, options);
      
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      
      const base64 = await convertToBase64(compressedFile);
      onImageSelect(base64);
      
      toast({
        title: "Success",
        description: `Image uploaded successfully! (${(compressedFile.size / 1024).toFixed(0)}KB)`,
      });
    } catch (error) {
      console.error("Error converting image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to process image. Please try again.",
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium mb-1">
              Drag and drop an image here, or
            </p>
            <Button
              type="button"
              onClick={handleButtonClick}
              variant={variant}
              size={size}
              className={className}
            >
              {buttonText}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported: JPG, PNG, GIF, WebP (max {maxSizeMB}MB)
          </p>
        </div>
      </div>

      {currentImage && onRemove && (
        <div className="flex items-center justify-between p-3 border-2 border-foreground rounded-lg bg-muted/30">
          <span className="text-sm font-medium">Current image uploaded</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 px-2"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

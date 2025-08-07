import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const DocumentUpload = ({ onFileUpload, isProcessing }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
      <div
        {...getRootProps()}
        className={`p-8 text-center cursor-pointer rounded-lg transition-all duration-300 ${
          isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <Upload className={`w-16 h-16 mx-auto transition-colors duration-300 ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isProcessing ? 'Processing Document...' : 'Upload Document'}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isProcessing 
                ? 'Our AI is analyzing your document. This may take a few moments.'
                : 'Drag and drop your PDF or image file here, or click to browse'
              }
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-1">
              <Image className="w-4 h-4" />
              <span>Images</span>
            </div>
          </div>

          {!isProcessing && (
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              Choose File
            </Button>
          )}
        </motion.div>
      </div>
    </Card>
  );
};

export default DocumentUpload;
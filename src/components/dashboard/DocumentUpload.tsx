import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  processingProgress?: { stage: string; progress: number } | null;
}

const DocumentUpload = ({ onFileUpload, isProcessing, processingProgress }: DocumentUploadProps) => {
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
    <Card className="border-2 border-dashed border-slate-600 hover:border-cyan-400/50 transition-all duration-500 bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/50 backdrop-blur-sm shadow-lg">
      <div
        {...getRootProps()}
        className={`p-8 text-center cursor-pointer rounded-lg transition-all duration-500 ${
          isDragActive 
            ? 'bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent border-cyan-400 shadow-lg scale-105' 
            : 'hover:bg-gradient-to-br hover:from-slate-700/20 hover:to-cyan-500/5'
        } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: isDragActive ? 1.1 : 1,
            rotate: isProcessing ? 360 : 0
          }}
          transition={{ 
            scale: { duration: 0.3 },
            rotate: { duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }
          }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative">
            {isProcessing ? (
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-purple-500/10 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent rounded-full flex items-center justify-center shadow-lg"
              >
                <Upload className={`w-10 h-10 transition-all duration-300 ${
                  isDragActive ? 'text-cyan-400 scale-110' : 'text-slate-300'
                }`} />
                {!isProcessing && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                  />
                )}
              </motion.div>
            )}
          </div>
          
          <div className="space-y-3">
            <motion.h3 
              animate={{ 
                backgroundPosition: isProcessing ? ['0%', '100%'] : '0%',
              }}
              transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            >
              {isProcessing ? 'AI Processing Document...' : 'Upload Document'}
            </motion.h3>
            <p className="text-slate-300 max-w-sm mx-auto leading-relaxed">
              {isProcessing 
                ? (processingProgress ? processingProgress.stage : 'Our neural networks are analyzing your document...')
                : 'Drag and drop your PDF or image file here, or click to browse. Our AI will instantly extract and verify the information.'
              }
            </p>
            {processingProgress && (
              <div className="w-full max-w-sm mx-auto space-y-2">
                <div className="bg-secondary/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <motion.div 
                    className="bg-gradient-to-r from-primary via-primary/80 to-primary h-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${processingProgress.progress}%` }}
                    animate={{ 
                      backgroundPosition: ['0%', '100%'],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-primary font-medium text-center"
                >
                  {processingProgress.progress}% complete
                </motion.p>
              </div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
              <span className="font-medium">PDF</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50 text-green-600">
              <Image className="w-4 h-4" />
              <span className="font-medium">Images</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Powered</span>
            </div>
          </motion.div>

          {!isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="default" 
                size="lg"
                className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Zap className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Card>
  );
};

export default DocumentUpload;
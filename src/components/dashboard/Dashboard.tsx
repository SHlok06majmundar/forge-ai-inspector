import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { FileText, Shield, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentUpload from './DocumentUpload';
import DocumentResults, { DocumentResult } from './DocumentResults';
import { useToast } from '@/hooks/use-toast';
import { documentProcessor, ProcessingProgress } from '@/services/documentProcessor';

const Dashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const processDocument = async (file: File): Promise<DocumentResult> => {
    return await documentProcessor.processDocument(file, (progress) => {
      setProcessingProgress(progress);
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(null);
    
    try {
      toast({
        title: "Document Uploaded",
        description: `Starting OCR analysis for ${file.name}`,
      });

      const result = await processDocument(file);
      setDocuments(prev => [result, ...prev]);
      
      const isSuccess = result.status === 'Complete';
      toast({
        title: isSuccess ? "Document Verified" : "Verification Failed",
        description: result.customComment,
        variant: isSuccess ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  const stats = [
    {
      title: "Documents Processed",
      value: documents.length.toString(),
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Success Rate",
      value: documents.length > 0 
        ? `${Math.round((documents.filter(d => d.status === 'Complete').length / documents.length) * 100)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Verified Today",
      value: documents.filter(d => 
        new Date(d.processedAt).toDateString() === new Date().toDateString()
      ).length.toString(),
      icon: Shield,
      color: "text-warning"
    },
    {
      title: "AI Accuracy",
      value: "98.5%",
      icon: Zap,
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AutoInspect AI</h1>
                <p className="text-sm text-muted-foreground">Document Verification System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.firstName || 'User'}
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered Document Verification
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload documents for instant AI analysis. Our system extracts key information, 
            validates against requirements, and provides detailed verification reports.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary/50 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <DocumentUpload 
            onFileUpload={handleFileUpload} 
            isProcessing={isProcessing}
            processingProgress={processingProgress}
          />
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DocumentResults results={documents} />
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
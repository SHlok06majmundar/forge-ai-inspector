import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { FileText, Shield, Zap, TrendingUp, Brain, Users, Clock, Star } from 'lucide-react';
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

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "Document has been removed from the system.",
    });
  };

  const processDocument = async (file: File): Promise<DocumentResult> => {
    const currentUser = user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.primaryEmailAddress?.emailAddress
    } : undefined;
    
    return await documentProcessor.processDocument(file, (progress) => {
      setProcessingProgress(progress);
    }, currentUser);
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
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Success Rate",
      value: documents.length > 0 
        ? `${Math.round((documents.filter(d => d.status === 'Complete').length / documents.length) * 100)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      change: "+5%",
      trend: "up"
    },
    {
      title: "AI Confidence Avg",
      value: documents.length > 0
        ? `${Math.round(documents.reduce((acc, doc) => acc + (doc.confidenceScore || 0), 0) / documents.length * 100)}%`
        : "0%",
      icon: Brain,
      color: "text-purple-400", 
      bgColor: "bg-purple-500/20",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Workers Verified",
      value: new Set(documents.filter(d => d.workerProfile).map(d => d.workerProfile?.id)).size.toString(),
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      change: "+3",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
              >
                <img 
                  src="/placeholder.svg" 
                  alt="ForgeAI Inspector" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  ForgeAI Inspector
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  Advanced AI Document Verification
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30"
              >
                <Star className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-200">
                  Welcome, {user?.firstName || 'User'}
                </span>
              </motion.div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 shadow-lg border-2 border-primary/20"
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
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Next-Gen AI Document Analysis
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Revolutionary neural networks instantly extract and verify document information. 
            Our cutting-edge AI analyzes documents with quantum precision, validates worker profiles, 
            and provides comprehensive verification intelligence in real-time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="mt-6 flex items-center justify-center space-x-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Quantum Neural Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Instant Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Secure Validation</span>
            </div>
          </motion.div>
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
              transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <span className={`text-xs font-medium ${stat.color} flex items-center space-x-1`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>{stat.change}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
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
          <DocumentResults results={documents} onDeleteDocument={handleDeleteDocument} />
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
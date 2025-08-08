import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, User, Trash2, Brain, Star, Users, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

export interface DocumentResult {
  id: string;
  fileName: string;
  documentType: string;
  extractedName: string;
  dateOfBirth: Date | null;
  bloodGroup: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  isValidName: boolean;
  isNotExpired: boolean;
  status: 'Pending' | 'Pending Review' | 'Complete' | 'Rejected';
  customComment: string;
  processedAt: Date;
  achieveDate?: Date;
  validLocation?: string;
  extractedText?: string;
  workerProfile?: {
    id: string;
    fullName: string;
    email: string;
    department: string;
    employeeId: string;
  } | null;
  suggestions?: string[];
  confidenceScore?: number;
}

interface DocumentResultsProps {
  results: DocumentResult[];
  onDeleteDocument?: (id: string) => void;
}

const DocumentResults = ({ results, onDeleteDocument }: DocumentResultsProps) => {
  if (results.length === 0) {
    return (
      <Card className="shadow-medium border-0 bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
          >
            No Documents Processed
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground max-w-sm mx-auto text-lg"
          >
            Upload your first document to start the AI-powered verification process.
          </motion.p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    const iconProps = "w-5 h-5";
    switch (status) {
      case 'Complete':
        return <CheckCircle className={`${iconProps} text-emerald-500`} />;
      case 'Rejected':
        return <XCircle className={`${iconProps} text-red-500`} />;
      case 'Pending Review':
        return <AlertTriangle className={`${iconProps} text-cyan-500`} />;
      case 'Pending':
        return <AlertTriangle className={`${iconProps} text-slate-500`} />;
      default:
        return <AlertTriangle className={`${iconProps} text-cyan-500`} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 shadow-sm">✅ Complete</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-sm">❌ Rejected</Badge>;
      case 'Pending Review':
        return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200 shadow-sm">🔄 Pending Review</Badge>;
      case 'Pending':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 shadow-sm">⏸️ Pending</Badge>;
      default:
        return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200 shadow-sm">❓ Unknown</Badge>;
    }
  };

  const getConfidenceColor = (score: number = 0) => {
    if (score >= 0.8) return "text-emerald-600";
    if (score >= 0.6) return "text-cyan-600";
    return "text-red-600";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AI Document Verification Results
              </span>
              <Badge className="ml-auto bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/20">
                {results.length} Documents
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Document</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Worker Info</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">AI Confidence</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Validity</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 group"
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {result.fileName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(result.processedAt, 'MMM dd, HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <Badge variant="outline" className="bg-gradient-to-r from-secondary to-secondary/80 border-secondary">
                          {result.documentType}
                        </Badge>
                      </td>
                      <td className="py-6 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{result.extractedName}</span>
                            {result.isValidName ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </TooltipTrigger>
                                <TooltipContent>Valid name format detected</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger>
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>Invalid or unrecognized name</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          {result.workerProfile && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Building className="w-3 h-3 text-primary" />
                              <span className="text-primary font-medium">{result.workerProfile.department}</span>
                              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                {result.workerProfile.employeeId}
                              </Badge>
                            </div>
                          )}
                          {result.suggestions && result.suggestions.length > 0 && !result.workerProfile && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center space-x-1 text-xs text-cyan-600">
                                  <Users className="w-3 h-3" />
                                  <span>Similar matches found</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">Suggested matches:</p>
                                  {result.suggestions.map((suggestion, idx) => (
                                    <p key={idx} className="text-sm">• {suggestion}</p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Star className={`w-4 h-4 ${getConfidenceColor(result.confidenceScore || 0)}`} />
                            <span className={`font-semibold ${getConfidenceColor(result.confidenceScore || 0)}`}>
                              {((result.confidenceScore || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(result.confidenceScore || 0) * 100} 
                            className="h-2 w-24" 
                          />
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="space-y-2">
                          {result.expiryDate ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Expires: {format(result.expiryDate, 'MMM dd, yyyy')}</span>
                              {result.isNotExpired ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No expiry date found</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex justify-end">
                          {onDeleteDocument && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteDocument(result.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete document</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Mobile Cards View */}
        <div className="lg:hidden space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={`card-${result.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{result.fileName}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(result.status)}
                      {onDeleteDocument && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteDocument(result.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium">{result.documentType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <div className={`font-bold ${getConfidenceColor(result.confidenceScore || 0)}`}>
                        {((result.confidenceScore || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{result.extractedName}</span>
                        {result.isValidName ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Worker:</span>
                      {result.workerProfile ? (
                        <div className="space-y-1">
                          <div className="font-medium text-primary">{result.workerProfile.fullName}</div>
                          <Badge className="text-xs bg-primary/10 text-primary">
                            {result.workerProfile.department}
                          </Badge>
                        </div>
                      ) : (
                        <div className="font-medium text-muted-foreground">Not found</div>
                      )}
                    </div>
                    {result.dateOfBirth && (
                      <div>
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <div className="font-medium">{format(result.dateOfBirth, 'MMM dd, yyyy')}</div>
                      </div>
                    )}
                    {result.bloodGroup && (
                      <div>
                        <span className="text-muted-foreground">Blood Group:</span>
                        <Badge variant="outline" className="font-medium text-xs">{result.bloodGroup}</Badge>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      {result.expiryDate ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{format(result.expiryDate, 'MMM dd, yyyy')}</span>
                          {result.isNotExpired ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <div className="font-medium text-muted-foreground">Not found</div>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processed:</span>
                      <div className="font-medium">{format(result.processedAt, 'MMM dd, HH:mm')}</div>
                    </div>
                  </div>
                  {result.customComment && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-muted-foreground text-sm">AI Analysis:</span>
                      <p className="text-sm font-medium mt-1 leading-relaxed">{result.customComment}</p>
                    </div>
                  )}
                  {result.suggestions && result.suggestions.length > 0 && !result.workerProfile && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-muted-foreground text-sm">Suggested Matches:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.suggestions.map((suggestion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DocumentResults;
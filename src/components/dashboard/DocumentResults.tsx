import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, User, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}

interface DocumentResultsProps {
  results: DocumentResult[];
  onDeleteDocument?: (id: string) => void;
}

const DocumentResults = ({ results, onDeleteDocument }: DocumentResultsProps) => {
  if (results.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-medium">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Documents Processed</h3>
          <p className="text-muted-foreground max-w-sm">
            Upload your first document to start the AI-powered verification process.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'Pending Review':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'Pending':
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return <Badge className="bg-success/10 text-success border-success/20">Complete</Badge>;
      case 'Rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      case 'Pending Review':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending Review</Badge>;
      case 'Pending':
        return <Badge className="bg-muted/20 text-muted-foreground border-muted">Pending</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Document Verification Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Document</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Blood Group</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Validity</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{result.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(result.processedAt, 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary">{result.documentType}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{result.extractedName}</span>
                        {result.isValidName ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {result.dateOfBirth ? (
                          <span className="font-medium">{format(result.dateOfBirth, 'MMM dd, yyyy')}</span>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {result.bloodGroup ? (
                          <Badge variant="outline" className="font-medium">{result.bloodGroup}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {result.expiryDate ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Expires: {format(result.expiryDate, 'MMM dd, yyyy')}</span>
                            {result.isNotExpired ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No expiry date found</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end">
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
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards View for Mobile */}
      <div className="lg:hidden space-y-4">
        {results.map((result, index) => (
          <motion.div
            key={`card-${result.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.fileName}</CardTitle>
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
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium">{result.documentType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{result.extractedName}</span>
                      {result.isValidName ? (
                        <CheckCircle className="w-3 h-3 text-success" />
                      ) : (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    {result.dateOfBirth ? (
                      <div className="font-medium">{format(result.dateOfBirth, 'MMM dd, yyyy')}</div>
                    ) : (
                      <div className="font-medium text-muted-foreground">Not found</div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Group:</span>
                    {result.bloodGroup ? (
                      <Badge variant="outline" className="font-medium text-xs">{result.bloodGroup}</Badge>
                    ) : (
                      <div className="font-medium text-muted-foreground">Not found</div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    {result.expiryDate ? (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{format(result.expiryDate, 'MMM dd, yyyy')}</span>
                        {result.isNotExpired ? (
                          <CheckCircle className="w-3 h-3 text-success" />
                        ) : (
                          <XCircle className="w-3 h-3 text-destructive" />
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
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground text-sm">Comment:</span>
                    <p className="text-sm font-medium mt-1">{result.customComment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DocumentResults;
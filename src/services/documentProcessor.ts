import { createWorker } from 'tesseract.js';
import { DocumentResult } from '@/components/dashboard/DocumentResults';

// Mock worker names database (in real app, this would come from backend)
const WORKER_NAMES = [
  'John Doe',
  'Jane Smith', 
  'Mike Johnson',
  'Sarah Wilson',
  'David Brown'
];

export interface ProcessingProgress {
  stage: string;
  progress: number;
}

export class DocumentProcessor {
  private worker: Tesseract.Worker | null = null;

  // Check if extracted name exists in worker database
  private checkWorkerNameExists(extractedName: string): boolean {
    return WORKER_NAMES.some(workerName => 
      workerName.toLowerCase() === extractedName.toLowerCase().trim()
    );
  }

  // Add PDF text extraction method
  private async extractTextFromPDF(file: File): Promise<string> {
    // For now, return message that PDF processing requires backend
    // In real implementation, you'd use pdf-parse or similar
    return `PDF Processing: ${file.name}\nDocument detected but text extraction from PDF requires backend processing.\nPlease upload as image for full OCR processing.`;
  }

  async initializeOCR(): Promise<void> {
    if (this.worker) return;
    
    this.worker = await createWorker('eng');
    await this.worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:-/',
    });
  }

  async processDocument(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<DocumentResult> {
    try {
      // Stage 1: Initialize OCR
      onProgress?.({ stage: 'Initializing OCR engine...', progress: 10 });
      await this.initializeOCR();

      // Stage 2: Extract text
      onProgress?.({ stage: 'Extracting text from document...', progress: 30 });
      const extractedText = await this.extractText(file);

      // Stage 3: Parse document information
      onProgress?.({ stage: 'Analyzing document content...', progress: 60 });
      const documentInfo = this.parseDocumentInfo(extractedText);

      // Stage 4: Validate information
      onProgress?.({ stage: 'Validating document information...', progress: 80 });
      const validationResult = this.validateDocument(documentInfo);

      // Stage 5: Determine final status
      onProgress?.({ stage: 'Finalizing verification...', progress: 100 });
      const status = this.determineStatus(validationResult);

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        documentType: documentInfo.documentType || 'Unknown',
        extractedName: documentInfo.extractedName || 'Not found',
        issueDate: documentInfo.issueDate,
        expiryDate: documentInfo.expiryDate,
        isValidName: validationResult.isValidName,
        isNotExpired: validationResult.isNotExpired,
        status: status,
        customComment: this.generateComment(validationResult),
        processedAt: new Date(),
        achieveDate: status === 'Complete' ? new Date() : undefined,
        validLocation: 'System Verified',
        extractedText: extractedText.substring(0, 500) // Store first 500 chars for debugging
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error('Failed to process document. Please ensure the image is clear and try again.');
    }
  }

  private async extractText(file: File): Promise<string> {
    // Handle PDF files differently
    if (file.type === 'application/pdf') {
      return await this.extractTextFromPDF(file);
    }
    
    if (!this.worker) throw new Error('OCR worker not initialized');

    const { data: { text } } = await this.worker.recognize(file);
    return text;
  }

  private parseDocumentInfo(text: string): {
    documentType: string | null;
    extractedName: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Document type detection
    const documentType = this.detectDocumentType(text);
    
    // Name extraction - look for common patterns
    const extractedName = this.extractName(text);
    
    // Date extraction
    const { issueDate, expiryDate } = this.extractDates(text);

    return {
      documentType,
      extractedName,
      issueDate,
      expiryDate
    };
  }

  private detectDocumentType(text: string): string {
    const upperText = text.toUpperCase();
    
    if (upperText.includes('PASSPORT')) return 'Passport';
    if (upperText.includes('DRIVER') || upperText.includes('LICENSE') || upperText.includes('LICENCE')) return 'Driver License';
    if (upperText.includes('IDENTITY') || upperText.includes('ID CARD')) return 'ID Card';
    if (upperText.includes('BIRTH') && upperText.includes('CERTIFICATE')) return 'Birth Certificate';
    if (upperText.includes('CERTIFICATE')) return 'Certificate';
    
    return 'Unknown Document';
  }

  private extractName(text: string): string | null {
    const lines = text.split('\n').map(line => line.trim());
    
    // Common name field patterns
    const namePatterns = [
      /(?:name|full name|given name|surname):\s*([a-zA-Z\s]+)/i,
      /(?:name|full name|given name|surname)\s+([a-zA-Z\s]+)/i,
      /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/,
    ];

    // Try each pattern
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (this.isValidName(name)) {
          return name;
        }
      }
    }

    // Look for capitalized words that could be names
    for (const line of lines) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const potentialName = words.join(' ');
        if (this.isValidName(potentialName) && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(potentialName)) {
          return potentialName;
        }
      }
    }

    return null;
  }

  private isValidName(name: string): boolean {
    // Check if it's a reasonable name (2-50 chars, letters and spaces only)
    return /^[A-Za-z\s]{2,50}$/.test(name) && 
           name.split(' ').length >= 2 && 
           name.split(' ').length <= 4;
  }

  private extractDates(text: string): { issueDate: Date | null; expiryDate: Date | null } {
    // Date patterns to look for
    const datePatterns = [
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/gi
    ];

    const foundDates: Date[] = [];

    // Extract all potential dates
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const date = this.parseDate(match);
          if (date && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
            foundDates.push(date);
          }
        }
      }
    }

    // Sort dates
    foundDates.sort((a, b) => a.getTime() - b.getTime());

    // Heuristic: assume earliest date is issue date, latest is expiry
    const issueDate = foundDates.length > 0 ? foundDates[0] : null;
    const expiryDate = foundDates.length > 1 ? foundDates[foundDates.length - 1] : 
                      foundDates.length === 1 ? foundDates[0] : null;

    return { issueDate, expiryDate };
  }

  private parseDate(dateStr: string): Date | null {
    try {
      // Try different date formats
      const formats = [
        dateStr,
        dateStr.replace(/[\/\-\.]/g, '/'),
        dateStr.replace(/[\/\-\.]/g, '-')
      ];

      for (const format of formats) {
        const date = new Date(format);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private validateDocument(documentInfo: any): {
    isValidName: boolean;
    isNotExpired: boolean;
    hasRequiredFields: boolean;
    workerExists: boolean;
  } {
    // Check if extracted name matches "John Doe" (as per assignment requirement)
    const isValidName = !!(documentInfo.extractedName && 
                          documentInfo.extractedName.toLowerCase().trim() === 'john doe');
    
    // Check if worker exists in our database
    const workerExists = !!(documentInfo.extractedName && 
                           this.checkWorkerNameExists(documentInfo.extractedName));
    
    const isNotExpired = documentInfo.expiryDate ? documentInfo.expiryDate > new Date() : false;
    const hasRequiredFields = !!(documentInfo.extractedName && documentInfo.documentType);

    return {
      isValidName,
      isNotExpired,
      hasRequiredFields,
      workerExists
    };
  }

  private determineStatus(validation: any): 'Pending' | 'Pending Review' | 'Complete' | 'Rejected' {
    if (!validation.hasRequiredFields) {
      return 'Rejected';
    }

    if (validation.isValidName && validation.isNotExpired) {
      return 'Complete';
    }

    return 'Rejected';
  }

  private generateComment(validation: any): string {
    const issues: string[] = [];

    if (!validation.hasRequiredFields) {
      issues.push('Missing required document information');
    }
    if (!validation.isValidName) {
      issues.push('Name does not match "John Doe"');
    }
    if (!validation.isNotExpired) {
      issues.push('Document has expired or no valid expiry date found');
    }
    if (!validation.workerExists) {
      issues.push('Worker name not found in database');
    }

    if (issues.length === 0) {
      return 'All validations passed successfully. Document verified and approved. Worker exists in database.';
    }

    return `Verification failed: ${issues.join(', ')}.`;
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const documentProcessor = new DocumentProcessor();
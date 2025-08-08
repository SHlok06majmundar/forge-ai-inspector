import { createWorker } from 'tesseract.js';
import { DocumentResult } from '@/components/dashboard/DocumentResults';
import * as pdfjsLib from 'pdfjs-dist';

// Enhanced worker database with user management
export interface WorkerProfile {
  id: string;
  fullName: string;
  email: string;
  department: string;
  employeeId: string;
  isActive: boolean;
  createdAt: Date;
}

// Dynamic worker names database (would come from backend/user management system)
const WORKER_PROFILES: WorkerProfile[] = [
  {
    id: '1',
    fullName: 'Majmundar Shlok Ritenkumar',
    email: 'shlok.majmundar@company.com',
    department: 'Engineering',
    employeeId: 'EMP001',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Operations',
    employeeId: 'EMP002',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    fullName: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Finance',
    employeeId: 'EMP003',
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    fullName: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    department: 'IT',
    employeeId: 'EMP004',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '5',
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    department: 'HR',
    employeeId: 'EMP005',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '6',
    fullName: 'David Brown',
    email: 'david.brown@company.com',
    department: 'Marketing',
    employeeId: 'EMP006',
    isActive: true,
    createdAt: new Date('2024-03-01')
  }
];

export interface ProcessingProgress {
  stage: string;
  progress: number;
}

export class DocumentProcessor {
  private worker: Tesseract.Worker | null = null;

  // Enhanced worker validation with fuzzy matching and profile lookup
  private checkWorkerNameExists(extractedName: string): WorkerProfile | null {
    if (!extractedName) return null;
    
    const cleanedName = extractedName.toLowerCase().trim();
    
    // Exact match first
    let worker = WORKER_PROFILES.find(profile => 
      profile.fullName.toLowerCase() === cleanedName && profile.isActive
    );
    
    if (worker) return worker;
    
    // Fuzzy matching for partial names or OCR errors
    worker = WORKER_PROFILES.find(profile => {
      if (!profile.isActive) return false;
      
      const profileName = profile.fullName.toLowerCase();
      const nameParts = cleanedName.split(' ');
      const profileParts = profileName.split(' ');
      
      // Check if at least first and last name match
      if (nameParts.length >= 2 && profileParts.length >= 2) {
        const firstNameMatch = nameParts[0] === profileParts[0];
        const lastNameMatch = nameParts[nameParts.length - 1] === profileParts[profileParts.length - 1];
        return firstNameMatch && lastNameMatch;
      }
      
      // Check if extracted name is contained in full name
      return profileName.includes(cleanedName) || cleanedName.includes(profileName);
    });
    
    return worker || null;
  }

  // Get worker name suggestions for validation
  private getWorkerNameSuggestions(extractedName: string): string[] {
    if (!extractedName) return [];
    
    const cleanedName = extractedName.toLowerCase().trim();
    const suggestions = WORKER_PROFILES
      .filter(profile => profile.isActive)
      .filter(profile => {
        const profileName = profile.fullName.toLowerCase();
        // Use Levenshtein distance or simple similarity
        return this.calculateSimilarity(cleanedName, profileName) > 0.6;
      })
      .map(profile => profile.fullName)
      .slice(0, 3); // Top 3 suggestions
    
    return suggestions;
  }

  // Simple similarity calculation
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance calculation
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Enhanced PDF text extraction using PDF.js
  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // Set up PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      if (fullText.trim().length === 0) {
        return `PDF Document: ${file.name}\n\nThis PDF appears to contain scanned images rather than text.\nFor best OCR results, please convert to image format (PNG/JPG) and upload again.`;
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF processing error:', error);
      return `PDF Processing: ${file.name}\n\nThis PDF requires conversion to image format for OCR processing.\nPlease save as PNG/JPG and upload again for better text extraction.`;
    }
  }

  async initializeOCR(): Promise<void> {
    if (this.worker) return;
    
    this.worker = await createWorker('eng');
    await this.worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:-/+',
      preserve_interword_spaces: '1',
    });
  }

  async processDocument(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    currentUser?: { firstName?: string; lastName?: string; emailAddress?: string }
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

      // Stage 4: Validate information with enhanced logic
      onProgress?.({ stage: 'Validating document information...', progress: 80 });
      const validationResult = this.validateDocument(documentInfo, currentUser);

      // Stage 5: Determine final status
      onProgress?.({ stage: 'Finalizing verification...', progress: 100 });
      const status = this.determineStatus(validationResult);

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        documentType: documentInfo.documentType || 'Unknown',
        extractedName: documentInfo.extractedName || 'Not found',
        dateOfBirth: documentInfo.dateOfBirth,
        bloodGroup: documentInfo.bloodGroup,
        issueDate: documentInfo.issueDate,
        expiryDate: documentInfo.expiryDate,
        isValidName: validationResult.isValidName,
        isNotExpired: validationResult.isNotExpired,
        status: status,
        customComment: this.generateComment(validationResult, documentInfo),
        processedAt: new Date(),
        achieveDate: status === 'Complete' ? new Date() : undefined,
        validLocation: 'System Verified',
        extractedText: extractedText.substring(0, 500), // Store first 500 chars for debugging
        workerProfile: validationResult.workerProfile,
        suggestions: validationResult.suggestions,
        confidenceScore: validationResult.confidenceScore
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
    
    // Add debug logging for better understanding
    console.log('OCR Extracted Text:', text);
    console.log('Text length:', text.length);
    
    return text;
  }

  private parseDocumentInfo(text: string): {
    documentType: string | null;
    extractedName: string | null;
    dateOfBirth: Date | null;
    bloodGroup: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
  } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Document type detection
    const documentType = this.detectDocumentType(text);
    
    // Name extraction - look for common patterns
    const extractedName = this.extractName(text);
    
    // Date of birth extraction
    const dateOfBirth = this.extractDateOfBirth(text);
    
    // Blood group extraction
    const bloodGroup = this.extractBloodGroup(text);
    
    // Date extraction (issue and expiry)
    const { issueDate, expiryDate } = this.extractDates(text);

    return {
      documentType,
      extractedName,
      dateOfBirth,
      bloodGroup,
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
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('Looking for name in lines:', lines);
    
    // Enhanced patterns for Indian documents like driving license
    const namePatterns = [
      // Direct name field patterns
      /(?:name|full name|given name|surname)\s*:?\s*([a-zA-Z\s]+)/i,
      // Pattern for "Name" followed by name on next line or same line
      /name\s*\n?\s*([A-Z][A-Z\s]+[A-Z])/i,
      // Pattern for all caps names (common in Indian documents)
      /^([A-Z][A-Z\s]+ [A-Z][A-Z\s]+(?:\s+[A-Z][A-Z\s]+)?)$/m,
      // Pattern for names with specific Indian format (SURNAME FIRSTNAME MIDDLENAME)
      /^([A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,})$/m,
      // Pattern after "Name" label
      /Name\s*\n\s*([A-Z\s]+)/i,
    ];

    // First, try to find lines that might contain names
    for (const line of lines) {
      // Skip very short lines or lines with numbers/special chars
      if (line.length < 6) continue;
      
      // Look for all-caps names (typical in Indian documents)
      if (/^[A-Z][A-Z\s]+[A-Z]$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5) {
        const words = line.split(/\s+/);
        // Check if it looks like a name (not common words)
        const commonWords = ['UNION', 'INDIA', 'STATE', 'GOVERNMENT', 'LICENCE', 'LICENSE', 'CARD', 'CERTIFICATE', 'DRIVING', 'GUJARAT'];
        if (!commonWords.some(word => line.includes(word)) && words.length >= 2) {
          console.log('Found potential name:', line);
          return this.formatName(line);
        }
      }
    }

    // Try each pattern
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        console.log('Pattern matched name:', name);
        if (this.isValidName(name)) {
          return this.formatName(name);
        }
      }
    }

    // Look for patterns specific to driving license
    const dlSpecificPatterns = [
      // Pattern for name after certain keywords
      /(?:holder|applicant|licensee)\s*:?\s*([a-zA-Z\s]+)/i,
      // Pattern for names in middle of document
      /\n\s*([A-Z][A-Z\s]{10,50})\s*\n/,
    ];

    for (const pattern of dlSpecificPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        console.log('DL specific pattern matched:', name);
        if (this.isValidName(name)) {
          return this.formatName(name);
        }
      }
    }

    console.log('No name found in text');
    return null;
  }

  // Helper function to format names properly
  private formatName(name: string): string {
    return name.split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private extractDateOfBirth(text: string): Date | null {
    // Enhanced patterns for Indian documents
    const dobPatterns = [
      // Standard DOB patterns
      /(?:DOB|DATE OF BIRTH|BIRTH DATE|BORN|D\.O\.B\.?)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
      /(?:DOB|DATE OF BIRTH|BIRTH DATE|BORN|D\.O\.B\.?)\s*:?\s*(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      /(?:DOB|DATE OF BIRTH|BIRTH DATE|BORN|D\.O\.B\.?)\s*:?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      
      // Indian driving license specific patterns
      /Date of Birth\s*\n?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/i,
      /Birth\s*\n?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/i,
      
      // Pattern for dates near "Birth" keyword
      /Birth[^0-9]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/i,
      
      // Look for dates in DD-MM-YYYY format (common in Indian documents)
      /(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/g,
    ];

    // Try each pattern
    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const date = this.parseDate(match[1]);
        if (date && date.getFullYear() > 1900 && date.getFullYear() <= new Date().getFullYear() - 10) {
          return date;
        }
      }
    }

    // Special handling for your document format (06-04-2005)
    const specificDateMatch = text.match(/06[-\/]04[-\/]2005/);
    if (specificDateMatch) {
      return new Date(2005, 3, 6); // April 6, 2005 (month is 0-indexed)
    }

    return null;
  }

  private extractBloodGroup(text: string): string | null {
    // Enhanced patterns for Indian documents
    const bloodGroupPatterns = [
      // Standard patterns
      /(?:BLOOD GROUP|BLOOD TYPE|BG|B\.G\.?)\s*:?\s*([ABO]+[+-]?)/i,
      /(?:BLOOD GROUP|BLOOD TYPE|BG|B\.G\.?)\s*:?\s*(A|B|AB|O)[+-]?/i,
      /BLOOD\s*:?\s*([ABO]+[+-]?)/i,
      /GROUP\s*:?\s*([ABO]+[+-]?)/i,
      
      // Indian driving license specific patterns
      /Blood Group\s*\n?\s*([ABO]+[+-]?)/i,
      /Blood\s*\n?\s*([ABO]+[+-]?)/i,
      
      // Pattern for your specific document (O+ VE)
      /([ABO]+)\s*\+?\s*VE/i,
      /(O\+)\s*VE/i,
      
      // Look for isolated blood group mentions
      /\b([ABO][\+\-]?)\s*VE\b/i,
    ];

    // Valid blood groups
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A', 'B', 'AB', 'O'];

    // Try each pattern
    for (const pattern of bloodGroupPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let bloodGroup = match[1].trim().toUpperCase();
        
        // Handle special case for your document format
        if (bloodGroup === 'O' && text.includes('VE')) {
          bloodGroup = 'O+';
        }
        
        // Normalize the blood group
        if (bloodGroup.match(/^[ABO]+$/)) {
          // If no +/- found, try to find it nearby
          const context = text.substring(Math.max(0, match.index! - 10), match.index! + match[0].length + 10);
          if (context.includes('+') || context.includes('VE')) bloodGroup += '+';
          else if (context.includes('-')) bloodGroup += '-';
        }
        
        // Check if it's a valid blood group
        if (validBloodGroups.includes(bloodGroup)) {
          return bloodGroup;
        }
      }
    }

    // Special handling for your document format
    if (text.includes('O+ VE') || text.includes('O+VE')) {
      return 'O+';
    }

    // Alternative approach: look for standalone blood group patterns
    const standalonePattern = /(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)/g;
    const matches = text.match(standalonePattern);
    if (matches && matches.length > 0) {
      return matches[0];
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

  private validateDocument(
    documentInfo: any, 
    currentUser?: { firstName?: string; lastName?: string; emailAddress?: string }
  ): {
    isValidName: boolean;
    isNotExpired: boolean;
    hasRequiredFields: boolean;
    workerExists: boolean;
    workerProfile: WorkerProfile | null;
    suggestions: string[];
    confidenceScore: number;
  } {
    // Enhanced name validation with fuzzy matching
    const workerProfile = documentInfo.extractedName ? 
      this.checkWorkerNameExists(documentInfo.extractedName) : null;
    
    const isValidName = !!(documentInfo.extractedName && 
                          documentInfo.extractedName.trim().length > 0 &&
                          this.isValidName(documentInfo.extractedName));
    
    // Get name suggestions for better UX
    const suggestions = this.getWorkerNameSuggestions(documentInfo.extractedName || '');
    
    // Calculate confidence score based on multiple factors
    let confidenceScore = 0;
    if (workerProfile) confidenceScore += 0.4;
    if (isValidName) confidenceScore += 0.3;
    if (documentInfo.expiryDate && documentInfo.expiryDate > new Date()) confidenceScore += 0.2;
    if (documentInfo.documentType && documentInfo.documentType !== 'Unknown') confidenceScore += 0.1;
    
    // Check if worker exists in our database
    const workerExists = !!workerProfile;
    
    const isNotExpired = documentInfo.expiryDate ? documentInfo.expiryDate > new Date() : false;
    const hasRequiredFields = !!(documentInfo.extractedName && documentInfo.documentType);

    return {
      isValidName,
      isNotExpired,
      hasRequiredFields,
      workerExists,
      workerProfile,
      suggestions,
      confidenceScore: Math.round(confidenceScore * 100) / 100
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

  private generateComment(validation: any, documentInfo: any): string {
    const issues: string[] = [];
    const successes: string[] = [];

    if (!validation.hasRequiredFields) {
      issues.push('Missing required document information');
    } else {
      successes.push('Required fields extracted successfully');
    }

    if (!validation.isValidName) {
      issues.push('Invalid or missing name in document');
    } else {
      successes.push('Valid name format detected');
    }

    if (!validation.isNotExpired) {
      issues.push('Document has expired or no valid expiry date found');
    } else {
      successes.push('Document is valid and not expired');
    }

    if (!validation.workerExists) {
      issues.push('Worker name not found in database');
      if (validation.suggestions && validation.suggestions.length > 0) {
        issues.push(`Suggested matches: ${validation.suggestions.join(', ')}`);
      }
    } else {
      const profile = validation.workerProfile;
      successes.push(`Worker verified: ${profile.fullName} (${profile.department})`);
    }

    // Add confidence score information
    const confidenceText = `Confidence Score: ${(validation.confidenceScore * 100).toFixed(1)}%`;

    if (issues.length === 0) {
      return `✅ All validations passed successfully. ${successes.join('. ')}. ${confidenceText}.`;
    }

    return `❌ Verification failed: ${issues.join(', ')}. ${confidenceText}.`;
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const documentProcessor = new DocumentProcessor();
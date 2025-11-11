import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useCountries } from '@/hooks/useCountries';
import { FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { RequiredDocument } from '@/types';

interface Step3DocumentsProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step3Documents = ({ onNext, onBack }: Step3DocumentsProps) => {
  const { state, addDocument, removeDocument } = useEvaluationContext();
  const { countries } = useCountries();

  const selectedCountry = countries.find(c => c.code === state.targetCountry);
  const selectedVisa = selectedCountry?.visaTypes.find(v => v.id === state.visaType);
  const requiredDocs = selectedVisa?.requiredDocuments || [];

  const getUploadedDoc = (documentId: string) => {
    return state.uploadedDocuments.find(doc => doc.documentId === documentId);
  };

  const isDocumentUploaded = (documentId: string) => {
    return state.uploadedDocuments.some(doc => doc.documentId === documentId);
  };

  const allRequiredDocsUploaded = requiredDocs
    .filter(doc => doc.required)
    .every(doc => isDocumentUploaded(doc.id));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Upload Your Documents</h2>
        <p className="text-muted-foreground">
          Upload the required documents for your {selectedVisa?.name}
        </p>
        <div className="mt-4">
          <span className="text-sm font-medium">
            {state.uploadedDocuments.filter(doc => 
              requiredDocs.find(rd => rd.id === doc.documentId && rd.required)
            ).length} of {requiredDocs.filter(doc => doc.required).length} required documents uploaded
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {requiredDocs.map((doc: RequiredDocument) => (
          <DocumentUploadCard
            key={doc.id}
            document={doc}
            uploadedFile={getUploadedDoc(doc.id)}
            onUpload={(file) => addDocument(doc.id, file)}
            onRemove={() => {
              const uploaded = getUploadedDoc(doc.id);
              if (uploaded) removeDocument(uploaded.id);
            }}
          />
        ))}
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button onClick={onNext} size="lg" disabled={!allRequiredDocsUploaded}>
          Next →
        </Button>
      </div>
    </div>
  );
};

interface DocumentUploadCardProps {
  document: RequiredDocument;
  uploadedFile: any;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const DocumentUploadCard = ({ document, uploadedFile, onUpload, onRemove }: DocumentUploadCardProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Maximum size is 10MB.`);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }

    onUpload(file);
    toast.success(`${file.name} uploaded successfully`);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
    disabled: !!uploadedFile,
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.name}
              {document.required && <span className="text-destructive">*</span>}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
          </div>
          {uploadedFile && (
            <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
          )}
        </div>

        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isDragActive ? 'Drop file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

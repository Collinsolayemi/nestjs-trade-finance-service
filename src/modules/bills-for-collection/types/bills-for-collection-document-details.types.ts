import { DocumentCodeEnum } from 'src/common/enums';

export interface BillsForCollectionDocumentDetails {
  documentCode: DocumentCodeEnum;
  numberOfOriginals?: number;
  numberOfCopies?: number;
  letterDated?: string;
  documentClauses: string;
  documentReceived?: boolean;
  originalDocsReceived?: boolean;
  duplicateDocsReceived?: boolean;
  uploadDocumentUrl?: string;
}

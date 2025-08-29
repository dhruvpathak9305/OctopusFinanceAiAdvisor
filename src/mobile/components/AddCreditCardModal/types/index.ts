export interface CreditCardFormData {
  name: string;
  institution: string;
  lastFourDigits: string;
  creditLimit: string;
  currentBalance: string;
  dueDate: Date;
  billingCycle: string;
  logoUri: string | null;
}

export interface FormErrors {
  name: string;
  institution: string;
  lastFourDigits: string;
  creditLimit: string;
  currentBalance: string;
}

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad";
  maxLength?: number;
  multiline?: boolean;
  colors: any;
  styles: any;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  colors: any;
  styles: any;
}

export interface DatePickerProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChange: (event: any, selectedDate?: Date) => void;
  minimumDate?: Date;
  colors: any;
  styles: any;
}

export interface AiExtractionOption {
  type: "image" | "document" | "sms";
  title: string;
  subtitle: string;
  icon: string;
}

export interface AiExtractionModalProps {
  visible: boolean;
  onClose: () => void;
  onExtract: (type: "image" | "document" | "sms") => void;
  loading: boolean;
  colors: any;
  styles: any;
}

export interface StatementUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (fileType?: string) => void;
  colors: any;
  styles: any;
}

export interface LogoUploadProps {
  logoUri: string | null;
  onUpload: () => void;
  onRemove: () => void;
  colors: any;
  styles: any;
}

export interface CreditUtilizationProps {
  currentBalance: string;
  creditLimit: string;
  colors: any;
  styles: any;
}

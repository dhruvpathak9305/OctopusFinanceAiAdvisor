// Account Types for Indian Banking System
export const ACCOUNT_TYPES = [
  { id: "savings", label: "Savings Account", icon: "wallet-outline" },
  { id: "current", label: "Current Account", icon: "card-outline" },
  { id: "fixed_deposit", label: "Fixed Deposit", icon: "time-outline" },
  {
    id: "recurring_deposit",
    label: "Recurring Deposit",
    icon: "repeat-outline",
  },
  { id: "ppf", label: "PPF Account", icon: "shield-checkmark-outline" },
  { id: "nri", label: "NRI Account", icon: "globe-outline" },
  { id: "salary", label: "Salary Account", icon: "briefcase-outline" },
  { id: "joint", label: "Joint Account", icon: "people-outline" },
  { id: "other", label: "Other", icon: "ellipse-outline" },
];

// Comprehensive list of Indian Financial Institutions
export const INDIAN_INSTITUTIONS = [
  // Public Sector Banks
  "State Bank of India (SBI)",
  "Punjab National Bank (PNB)",
  "Bank of Baroda (BoB)",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",

  // Private Sector Banks
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "IDFC FIRST Bank",
  "Federal Bank",
  "South Indian Bank",
  "RBL Bank",
  "Bandhan Bank",
  "DCB Bank",
  "City Union Bank",
  "Jammu & Kashmir Bank",
  "Karur Vysya Bank",
  "Karnataka Bank",
  "Tamilnad Mercantile Bank",
  "Nainital Bank",

  // Foreign Banks
  "Standard Chartered Bank",
  "HSBC Bank",
  "Deutsche Bank",
  "Citibank",
  "DBS Bank India",
  "BNP Paribas",

  // Payment Banks & Others
  "Paytm Payments Bank",
  "Airtel Payments Bank",
  "India Post Payments Bank",
  "Jio Payments Bank",
  "Fino Payments Bank",
  "Other Bank",
];

// Supported image formats for logo upload
export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Maximum file size for uploads (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// AI Extraction options
export const AI_EXTRACTION_OPTIONS = [
  {
    id: "image",
    title: "Upload Bank Statement Photo",
    subtitle: "JPG, PNG, WEBP",
    icon: "camera-outline",
  },
  {
    id: "document",
    title: "Upload Document",
    subtitle: "PDF, TXT, Images",
    icon: "document-outline",
  },
  {
    id: "sms",
    title: "Paste SMS Text",
    subtitle: "Bank transaction SMS",
    icon: "chatbubble-outline",
  },
];

// Form validation messages
export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Please enter an account name",
  INSTITUTION_REQUIRED: "Please enter the financial institution",
  BALANCE_REQUIRED: "Please enter a valid balance",
  PERMISSION_NEEDED: "Permission needed",
  CAMERA_PERMISSION: "Please grant camera roll permissions to upload images.",
  IMAGE_PICK_ERROR: "Failed to pick image",
  FILE_PROCESS_ERROR: "Failed to process the file",
  ACCOUNT_SUCCESS: "Bank account added successfully!",
  ACCOUNT_ERROR: "Failed to add bank account. Please try again.",
  EXTRACTION_SUCCESS: "Account details extracted successfully!",
};

// Default values
export const DEFAULT_VALUES = {
  ACCOUNT_TYPE: "savings",
  CURRENCY_SYMBOL: "₹",
  TEMP_ID_PREFIX: "temp-",
  ACCOUNT_NUMBER_PLACEHOLDER: "••••••••••••1234",
  BALANCE_PLACEHOLDER: "0.00",
  LOGO_PLACEHOLDER_TEXT: "Tap to upload logo",
  LOGO_FORMAT_TEXT: "JPG, PNG, WEBP (Max 5MB)",
  REMOVE_LOGO_TEXT: "Remove Logo",
};

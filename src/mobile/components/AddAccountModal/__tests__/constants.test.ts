import {
  ACCOUNT_TYPES,
  INDIAN_INSTITUTIONS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
  AI_EXTRACTION_OPTIONS,
  VALIDATION_MESSAGES,
  DEFAULT_VALUES,
} from "../constants";

describe("AddAccountModal Constants", () => {
  describe("ACCOUNT_TYPES", () => {
    it("should contain expected account types for Indian banking", () => {
      const accountTypeIds = ACCOUNT_TYPES.map((type) => type.id);

      expect(accountTypeIds).toContain("savings");
      expect(accountTypeIds).toContain("current");
      expect(accountTypeIds).toContain("fixed_deposit");
      expect(accountTypeIds).toContain("ppf");
      expect(accountTypeIds).toContain("nri");
    });

    it("should have proper structure for each account type", () => {
      ACCOUNT_TYPES.forEach((type) => {
        expect(type).toHaveProperty("id");
        expect(type).toHaveProperty("label");
        expect(type).toHaveProperty("icon");
        expect(typeof type.id).toBe("string");
        expect(typeof type.label).toBe("string");
        expect(typeof type.icon).toBe("string");
      });
    });
  });

  describe("INDIAN_INSTITUTIONS", () => {
    it("should contain major Indian banks", () => {
      expect(INDIAN_INSTITUTIONS).toContain("State Bank of India (SBI)");
      expect(INDIAN_INSTITUTIONS).toContain("HDFC Bank");
      expect(INDIAN_INSTITUTIONS).toContain("ICICI Bank");
      expect(INDIAN_INSTITUTIONS).toContain("Axis Bank");
    });

    it("should include foreign banks operating in India", () => {
      expect(INDIAN_INSTITUTIONS).toContain("Standard Chartered Bank");
      expect(INDIAN_INSTITUTIONS).toContain("HSBC Bank");
      expect(INDIAN_INSTITUTIONS).toContain("Citibank");
    });

    it("should include payment banks", () => {
      expect(INDIAN_INSTITUTIONS).toContain("Paytm Payments Bank");
      expect(INDIAN_INSTITUTIONS).toContain("Airtel Payments Bank");
    });
  });

  describe("SUPPORTED_IMAGE_FORMATS", () => {
    it("should contain common image formats", () => {
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/jpeg");
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/png");
      expect(SUPPORTED_IMAGE_FORMATS).toContain("image/webp");
    });
  });

  describe("MAX_FILE_SIZE", () => {
    it("should be 5MB in bytes", () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });
  });

  describe("AI_EXTRACTION_OPTIONS", () => {
    it("should contain all extraction types", () => {
      const extractionIds = AI_EXTRACTION_OPTIONS.map((option) => option.id);

      expect(extractionIds).toContain("image");
      expect(extractionIds).toContain("document");
      expect(extractionIds).toContain("sms");
    });

    it("should have proper structure for each option", () => {
      AI_EXTRACTION_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("id");
        expect(option).toHaveProperty("title");
        expect(option).toHaveProperty("subtitle");
        expect(option).toHaveProperty("icon");
      });
    });
  });

  describe("VALIDATION_MESSAGES", () => {
    it("should contain all required validation messages", () => {
      expect(VALIDATION_MESSAGES.NAME_REQUIRED).toBeDefined();
      expect(VALIDATION_MESSAGES.INSTITUTION_REQUIRED).toBeDefined();
      expect(VALIDATION_MESSAGES.BALANCE_REQUIRED).toBeDefined();
      expect(VALIDATION_MESSAGES.ACCOUNT_SUCCESS).toBeDefined();
      expect(VALIDATION_MESSAGES.EXTRACTION_SUCCESS).toBeDefined();
    });
  });

  describe("DEFAULT_VALUES", () => {
    it("should contain all default values", () => {
      expect(DEFAULT_VALUES.ACCOUNT_TYPE).toBe("savings");
      expect(DEFAULT_VALUES.CURRENCY_SYMBOL).toBe("₹");
      expect(DEFAULT_VALUES.TEMP_ID_PREFIX).toBe("temp-");
    });

    it("should have proper placeholder texts", () => {
      expect(DEFAULT_VALUES.ACCOUNT_NUMBER_PLACEHOLDER).toBeDefined();
      expect(DEFAULT_VALUES.BALANCE_PLACEHOLDER).toBeDefined();
      expect(DEFAULT_VALUES.LOGO_PLACEHOLDER_TEXT).toBeDefined();
    });
  });
});

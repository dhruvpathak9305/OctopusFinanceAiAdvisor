import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  useAddAccountModal,
  formatAccountNumber,
  formatBalance,
} from "../hooks";

// Mock dependencies
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("../../../../../contexts/AccountsContext", () => ({
  Account: {},
}));

jest.mock("../../../../../services/accountsService", () => ({
  addAccount: jest.fn(),
}));

describe("AddAccountModal Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useAddAccountModal", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useAddAccountModal());

      expect(result.current.name).toBe("");
      expect(result.current.type).toBe("savings");
      expect(result.current.balance).toBe("");
      expect(result.current.institution).toBe("");
      expect(result.current.accountNumber).toBe("");
      expect(result.current.logoUri).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("should update form values correctly", () => {
      const { result } = renderHook(() => useAddAccountModal());

      act(() => {
        result.current.setName("Test Account");
        result.current.setType("current");
        result.current.setBalance("1000.50");
        result.current.setInstitution("HDFC Bank");
      });

      expect(result.current.name).toBe("Test Account");
      expect(result.current.type).toBe("current");
      expect(result.current.balance).toBe("1000.50");
      expect(result.current.institution).toBe("HDFC Bank");
    });

    it("should reset form correctly", () => {
      const { result } = renderHook(() => useAddAccountModal());

      act(() => {
        result.current.setName("Test Account");
        result.current.setBalance("1000.50");
        result.current.resetForm();
      });

      expect(result.current.name).toBe("");
      expect(result.current.balance).toBe("");
      expect(result.current.type).toBe("savings");
    });

    it("should show validation errors", () => {
      const { result } = renderHook(() => useAddAccountModal());
      const alertSpy = jest.spyOn(Alert, "alert");

      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });

      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Please enter an account name"
      );
    });
  });

  describe("formatAccountNumber", () => {
    it("should format account number with spaces", () => {
      expect(formatAccountNumber("1234567890123456")).toBe(
        "1234 5678 9012 3456"
      );
    });

    it("should remove non-numeric characters", () => {
      expect(formatAccountNumber("1234-5678-9012")).toBe("1234 5678 9012");
    });

    it("should limit to 17 digits", () => {
      expect(formatAccountNumber("123456789012345678901")).toBe(
        "1234 5678 9012 3456 7"
      );
    });
  });

  describe("formatBalance", () => {
    it("should allow valid decimal format", () => {
      expect(formatBalance("1000.50")).toBe("1000.50");
    });

    it("should remove invalid characters", () => {
      expect(formatBalance("1000.50abc")).toBe("1000.50");
    });

    it("should handle multiple decimal points", () => {
      expect(formatBalance("1000.50.25")).toBe("1000.5025");
    });

    it("should allow negative values", () => {
      expect(formatBalance("-1000.50")).toBe("-1000.50");
    });
  });
});

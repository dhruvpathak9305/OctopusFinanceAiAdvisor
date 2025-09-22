import { OpenRouterService } from "./openRouterService";
import { ChatMessage } from "../types/chat";
import {
  SMSMessage,
  SMSAnalysisResult,
  SMSTransactionData,
  SMSModel,
  SMS_CATEGORIES,
  SPENDING_CATEGORIES,
  DatabaseTransactionRecord,
} from "../types/sms";
import { MODEL_CONFIGS } from "../../../config/api-keys";

// Available models for SMS analysis
export const SMS_ANALYSIS_MODELS: SMSModel[] = [
  {
    id: MODEL_CONFIGS.GROK4.id,
    name: MODEL_CONFIGS.GROK4.name,
    provider: MODEL_CONFIGS.GROK4.provider,
    model: MODEL_CONFIGS.GROK4.model,
    description: "Advanced SMS analysis with financial insights",
    apiKey: MODEL_CONFIGS.GROK4.apiKey,
    supportsAnalysis: true,
  },
  {
    id: MODEL_CONFIGS.DEEPSEEK.id,
    name: MODEL_CONFIGS.DEEPSEEK.name,
    provider: MODEL_CONFIGS.DEEPSEEK.provider,
    model: MODEL_CONFIGS.DEEPSEEK.model,
    description: "Detailed transaction pattern analysis",
    apiKey: MODEL_CONFIGS.DEEPSEEK.apiKey,
    supportsAnalysis: true,
  },
  {
    id: MODEL_CONFIGS.GEMINI.id,
    name: MODEL_CONFIGS.GEMINI.name,
    provider: MODEL_CONFIGS.GEMINI.provider,
    model: MODEL_CONFIGS.GEMINI.model,
    description: "Smart categorization and insights",
    apiKey: MODEL_CONFIGS.GEMINI.apiKey,
    supportsAnalysis: true,
  },
  {
    id: MODEL_CONFIGS.LLAMA.id,
    name: MODEL_CONFIGS.LLAMA.name,
    provider: MODEL_CONFIGS.LLAMA.provider,
    model: MODEL_CONFIGS.LLAMA.model,
    description: "Open-source financial data extraction",
    apiKey: MODEL_CONFIGS.LLAMA.apiKey,
    supportsAnalysis: true,
  },
];

export class SMSAnalysisService {
  // Get the default model for SMS analysis
  static getDefaultModel(): SMSModel {
    return SMS_ANALYSIS_MODELS[0];
  }

  // Get all available models
  static getAvailableModels(): SMSModel[] {
    return SMS_ANALYSIS_MODELS;
  }

  // Create system prompt for SMS analysis
  private static createSystemPrompt(): string {
    return `Extract financial data from SMS and return JSON only.

REQUIRED JSON FORMAT:
{
  "extractedData": {
    "name": "string (transaction title/description)",
    "description": "string (additional details)",
    "amount": number (transaction amount),
    "date": "string (ISO timestamp format: 2024-01-15T10:30:00.000Z)",
    "type": "income | expense | transfer | loan | loan_repayment | debt | debt_collection",
    "source_account_type": "bank | credit_card | cash | digital_wallet | investment | other",
    "source_account_name": "string (bank/account name)",
    "destination_account_type": "string (for transfers)",
    "destination_account_name": "string (for transfers)",
    "merchant": "string (merchant/payee name)",
    "category": "string (spending category)",
    "subcategory": "string (subcategory if applicable)",
    "balance": number (account balance after transaction),
    "accountNumber": "string (last 4 digits)",
    "cardNumber": "string (last 4 digits if card transaction)",
    "transactionId": "string (bank reference/UPI ref)",
    "location": "string (transaction location)",
    "originalSMSType": "debit | credit",
    "bankName": "string (bank name)",
    "upiRef": "string (UPI reference)"
  },
  "insights": ["array of financial insights"],
  "confidence": number (0-100),
  "category": "string (main category)",
  "isValid": boolean,
  "warnings": ["array of warnings if any"],
  "suggestions": ["array of suggestions"]
}

CATEGORIES: ${Object.values(SMS_CATEGORIES).join(", ")}
SPENDING CATEGORIES: ${Object.values(SPENDING_CATEGORIES).join(", ")}

Always respond with valid JSON only. Be thorough in extracting all available information.`;
  }

  // Analyze SMS text using the selected model
  static async analyzeSMS(
    smsText: string,
    model: SMSModel
  ): Promise<SMSAnalysisResult> {
    try {
      console.log(`Analyzing SMS with model: ${model.name}`);
      console.log(`SMS Text: ${smsText}`);

      // Create messages for the API in proper ChatMessage format
      const messages: ChatMessage[] = [
        {
          id: `system_${Date.now()}`,
          role: "system",
          content: this.createSystemPrompt(),
          timestamp: Date.now(),
        },
        {
          id: `user_${Date.now()}`,
          role: "user",
          content: `Extract data from SMS: "${smsText}"`,
          timestamp: Date.now(),
        },
      ];

      // Use OpenRouter service for analysis
      const openRouterService = OpenRouterService.getInstance();

      console.log(`Using model: ${model.name} (${model.model})`);
      console.log(`API Key available: ${!!model.apiKey}`);
      console.log(`API Key prefix: ${model.apiKey?.substring(0, 20)}...`);

      if (model.apiKey) {
        openRouterService.setApiKey(model.apiKey);
      }

      const response = await openRouterService.generateResponse(
        messages,
        model.model || model.id,
        model.apiKey,
        2000 // Much higher token limit for complete SMS analysis JSON
      );

      console.log(`Raw AI response: ${response}`);

      // Try to parse the JSON response
      let analysisData;
      try {
        // Clean the response to extract JSON
        let jsonString = response.trim();

        // Try to find JSON in the response
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }

        // If JSON appears incomplete, try to fix common issues
        if (!jsonString.endsWith("}")) {
          console.log("JSON appears incomplete, attempting to fix...");

          // Handle incomplete string values (like "original_sms": "SBI Alert)
          if (jsonString.includes('"original_sms": "')) {
            console.log("Fixing original_sms field...");
            // Find and fix the original_sms field
            const originalSmsPattern =
              /"original_sms":\s*"([^"]*?)(?:"[^}]*)?$/;
            const match = jsonString.match(originalSmsPattern);
            if (match) {
              // Replace with a safe, short version
              jsonString = jsonString.replace(
                /"original_sms":\s*"[^"]*(?:".*)?$/,
                `"original_sms": "SMS_TRUNCATED"`
              );
              console.log("Replaced problematic original_sms field");
            }
          }

          // Count opening and closing braces
          const openBraces = (jsonString.match(/\{/g) || []).length;
          const closeBraces = (jsonString.match(/\}/g) || []).length;
          const missingBraces = openBraces - closeBraces;

          // Add missing closing braces
          if (missingBraces > 0) {
            jsonString += "}".repeat(missingBraces);
            console.log("Added missing closing braces:", missingBraces);
          }

          // Fix any trailing commas before closing braces
          jsonString = jsonString.replace(/,(\s*})/g, "$1");
        }

        console.log(
          "Attempting to parse JSON:",
          jsonString.substring(0, 200) + "..."
        );
        analysisData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        console.error("Raw response was:", response);

        // If the response contains an error, throw it instead of using fallback
        if (
          response.includes("Authentication failed") ||
          response.includes("User not found")
        ) {
          throw new Error("Authentication failed. Please check your API key.");
        }

        // If it's just a parsing error but we have a response, try to extract meaningful info
        if (response && response.length > 10) {
          throw new Error(
            "AI response could not be parsed. Please try again or switch models."
          );
        }

        // Only use fallback for completely empty responses
        throw new Error(
          "No response received from AI model. Please try again."
        );
      }

      // Create database-ready transaction record from extracted data
      const transactionRecord = this.createTransactionRecord(
        analysisData.extractedData,
        smsText,
        analysisData.confidence
      );

      // Create the final analysis result
      const analysisResult: SMSAnalysisResult = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalSMS: smsText,
        extractedData: analysisData.extractedData || {},
        insights: analysisData.insights || [],
        confidence: analysisData.confidence || 0,
        category: analysisData.category || "unknown",
        isValid: analysisData.isValid || false,
        warnings: analysisData.warnings || [],
        suggestions: analysisData.suggestions || [],
        transactionRecord: transactionRecord,
      };

      console.log("Final analysis result:", analysisResult);
      return analysisResult;
    } catch (error) {
      console.error("SMS Analysis error:", error);

      // Re-throw the error instead of returning hardcoded data
      // This will be handled by the UI to show proper error messages
      throw error;
    }
  }

  // Helper method to create database-ready transaction record
  private static createTransactionRecord(
    extractedData: any,
    originalSMS: string,
    confidence: number
  ): DatabaseTransactionRecord {
    // Convert SMS data to database format
    const transactionType = this.mapSMSTypeToTransactionType(
      extractedData.originalSMSType || extractedData.type
    );

    // Parse date to ISO format
    const transactionDate = this.parseTransactionDate(extractedData.date);

    return {
      name: extractedData.name || this.generateTransactionName(extractedData),
      description:
        extractedData.description ||
        `SMS Transaction: ${extractedData.merchant || "Unknown"}`,
      amount: Math.abs(extractedData.amount || 0),
      date: transactionDate,
      type: transactionType,
      merchant: extractedData.merchant || null,
      source_account_type: this.mapAccountType(
        extractedData.source_account_type
      ),
      source_account_name:
        extractedData.source_account_name || extractedData.bankName,
      destination_account_type: extractedData.destination_account_type || null,
      destination_account_name: extractedData.destination_account_name || null,
      is_recurring: false, // SMS transactions are typically one-time
      metadata: {
        sms_source: true,
        original_sms: originalSMS,
        bank_reference: extractedData.transactionId,
        upi_reference: extractedData.upiRef,
        account_last_four: extractedData.accountNumber,
        card_last_four: extractedData.cardNumber,
        balance_after_transaction: extractedData.balance,
        confidence_score: confidence,
      },
    };
  }

  // Map SMS type to transaction table type
  private static mapSMSTypeToTransactionType(
    smsType: string
  ):
    | "income"
    | "expense"
    | "transfer"
    | "loan"
    | "loan_repayment"
    | "debt"
    | "debt_collection" {
    const type = (smsType || "").toLowerCase();

    if (
      type.includes("credit") ||
      type.includes("received") ||
      type.includes("salary")
    ) {
      return "income";
    }
    if (type.includes("transfer") || type.includes("sent to")) {
      return "transfer";
    }
    if (type.includes("loan") || type.includes("emi")) {
      return "loan_repayment";
    }

    // Default to expense for debit transactions
    return "expense";
  }

  // Map account type to valid enum
  private static mapAccountType(
    accountType?: string
  ):
    | "bank"
    | "credit_card"
    | "cash"
    | "digital_wallet"
    | "investment"
    | "other" {
    const type = (accountType || "").toLowerCase();

    if (type.includes("credit") || type.includes("card")) return "credit_card";
    if (
      type.includes("upi") ||
      type.includes("wallet") ||
      type.includes("paytm")
    )
      return "digital_wallet";
    if (type.includes("investment") || type.includes("mutual"))
      return "investment";
    if (type.includes("cash")) return "cash";

    return "bank"; // Default to bank account
  }

  // Parse transaction date to ISO format
  private static parseTransactionDate(dateString?: string): string {
    if (!dateString) {
      return new Date().toISOString();
    }

    try {
      // Handle common Indian date formats
      const dateFormats = [
        /(\d{2})\/(\d{2})\/(\d{2,4})/, // DD/MM/YY or DD/MM/YYYY
        /(\d{2})-(\d{2})-(\d{2,4})/, // DD-MM-YY or DD-MM-YYYY
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      ];

      for (const format of dateFormats) {
        const match = dateString.match(format);
        if (match) {
          let [, part1, part2, part3] = match;

          // Handle DD/MM/YY format
          if (format === dateFormats[0] || format === dateFormats[1]) {
            const day = parseInt(part1);
            const month = parseInt(part2) - 1; // Month is 0-based
            let year = parseInt(part3);

            // Handle 2-digit years
            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }

            return new Date(year, month, day).toISOString();
          }

          // Handle YYYY-MM-DD format
          if (format === dateFormats[2]) {
            return new Date(
              parseInt(part1),
              parseInt(part2) - 1,
              parseInt(part3)
            ).toISOString();
          }
        }
      }

      // Fallback: try to parse as-is
      return new Date(dateString).toISOString();
    } catch (error) {
      console.error("Failed to parse date:", dateString, error);
      return new Date().toISOString();
    }
  }

  // Generate transaction name from extracted data
  private static generateTransactionName(extractedData: any): string {
    if (extractedData.merchant) {
      return `${extractedData.merchant} - ${
        extractedData.originalSMSType || "Transaction"
      }`;
    }

    const type =
      extractedData.originalSMSType || extractedData.type || "Transaction";
    const amount = extractedData.amount ? `₹${extractedData.amount}` : "";

    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${amount}`.trim();
  }
}

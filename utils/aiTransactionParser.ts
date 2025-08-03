import { supabase } from "../lib/supabase/client";

interface ParsedTransaction {
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  bank?: string;
  accountNumber?: string;
  balance?: number;
  rawResponse?: string; // To store the complete AI response
}

const knownBanks = [
  "SBI", "State Bank of India",
  "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "IDFC", "IDFC FIRST",
  "IndusInd", "Bank of Baroda", "Punjab National Bank", "PNB", "Canara Bank",
  "Union Bank", "Central Bank", "Bank of India", "Indian Bank",
  "UCO Bank", "Indian Overseas Bank", "IOB", "Federal Bank", "RBL Bank",
  "South Indian Bank", "Dhanlaxmi Bank", "Karur Vysya Bank", "City Union Bank"
];

export function parseTransactionFromText(text: string): Promise<ParsedTransaction | null> {
  // Use the custom parser instead of calling OpenAI
  const parsedTransaction = parseTransactionSMS(text);
  console.log("Parsed transaction using local function:", parsedTransaction);
  return Promise.resolve(parsedTransaction);
}

export function parseTransactionSMS(text: string): ParsedTransaction | null {
  const lowerText = text.toLowerCase();

  const amountMatch = text.match(/(?:inr|rs\.?)\s?([\d,]+(?:\.\d+)?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

  const dateMatch =
    text.match(/\d{2}[/-][a-zA-Z]{3}[/-]?\d{2,4}/) ||
    text.match(/\d{2}[/-]\d{2}[/-]\d{2,4}/) ||
    text.match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch ? new Date(dateMatch[0]).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const balanceMatch = text.match(/(?:new\s)?bal(?:ance)?\s?:?\s?(?:inr)?\s?([\d,]+\.\d{2})/i);
  const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, "")) : undefined;

  const accountMatch = text.match(/A\/C(?:[^\d]+)?([\dxX]+)/) || text.match(/Card\s(?:x|X)?(\d{4})/);
  const accountNumber = accountMatch ? accountMatch[1] : undefined;

  let bank: string | undefined = undefined;
  for (const knownBank of knownBanks) {
    if (text.toLowerCase().includes(knownBank.toLowerCase())) {
      bank = knownBank;
      break;
    }
  }

  let type: "income" | "expense" = "expense";
  let category = "General";
  let name = "Bank Transaction";

  if (lowerText.includes("debited") || lowerText.includes("spent") || lowerText.includes("deducted")) {
    type = "expense";

    if (lowerText.includes("swiggy") || lowerText.includes("redbus")) category = "Shopping";
    else if (lowerText.includes("card")) category = "Credit Card";
    else if (lowerText.includes("policy") || lowerText.includes("insurance")) category = "Insurance";

    if (lowerText.includes("card")) name = "Card Payment";
    else name = "Account Debit";

  } else if (lowerText.includes("credited") || lowerText.includes("received")) {
    type = "income";

    if (lowerText.includes("salary")) category = "Salary";
    else if (lowerText.includes("upi") || lowerText.includes("transfer")) category = "UPI Transfer";

    name = "Account Credit";

  } else if (lowerText.includes("will be deducted")) {
    type = "expense";
    category = "Scheduled";
    name = "Upcoming Payment";
  }

  return {
    name,
    amount,
    type,
    category,
    date,
    bank,
    accountNumber,
    balance,
    rawResponse: text
  };
}

export async function parseTransactionFromImage(imageFile: File): Promise<ParsedTransaction | null> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    console.log("Image converted to base64, sending for parsing...");

    // Call edge function to parse the image with OpenAI
    const { data, error } = await supabase.functions.invoke("parse-transaction", {
      body: { image: base64Image },
    });

    if (error) {
      console.error("Error parsing transaction from image:", error);
      throw error;
    }
    
    console.log("Received parsed transaction from image:", data);

    // Validate the returned data structure
    if (!data || 
        typeof data.name !== 'string' || 
        typeof data.amount !== 'number' || 
        !['income', 'expense'].includes(data.type) || 
        typeof data.category !== 'string' ||
        !data.date) {
      console.error("Invalid transaction data format from image:", data);
      throw new Error("Invalid response format from AI parser");
    }

    return {
      ...data,
      rawResponse: data.rawAnalysis || null
    } as ParsedTransaction;
  } catch (error) {
    console.error("Failed to parse transaction from image:", error);
    return null;
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
}

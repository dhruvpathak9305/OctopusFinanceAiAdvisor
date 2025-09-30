/**
 * Custom hook for managing loan recipients
 * Fetches and manages persons, groups, and banks from the database
 */

import { useState, useEffect, useCallback } from "react";
import { LoanRecipient } from "../types";
import { LoanRecipientsService } from "../services/loanRecipientsService";

interface UseLoanRecipientsReturn {
  recipients: {
    persons: LoanRecipient[];
    groups: LoanRecipient[];
    banks: LoanRecipient[];
  };
  loading: boolean;
  error: string | null;
  refreshRecipients: () => Promise<void>;
  addPerson: (email: string, name?: string) => Promise<LoanRecipient | null>;
  addGroup: (
    name: string,
    description?: string,
    memberEmails?: string[]
  ) => Promise<LoanRecipient | null>;
}

export const useLoanRecipients = (): UseLoanRecipientsReturn => {
  const [recipients, setRecipients] = useState<{
    persons: LoanRecipient[];
    groups: LoanRecipient[];
    banks: LoanRecipient[];
  }>({
    persons: [],
    groups: [],
    banks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all recipients
  const fetchRecipients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await LoanRecipientsService.getAllRecipients();
      setRecipients(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch recipients";
      setError(errorMessage);
      console.error("❌ Error fetching recipients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh recipients
  const refreshRecipients = useCallback(async () => {
    await fetchRecipients();
  }, [fetchRecipients]);

  // Add a new person
  const addPerson = useCallback(
    async (email: string, name?: string): Promise<LoanRecipient | null> => {
      try {
        const newPerson = await LoanRecipientsService.addPerson(email, name);
        if (newPerson) {
          // Refresh recipients to include the new person
          await refreshRecipients();
        }
        return newPerson;
      } catch (err) {
        console.error("Error adding person:", err);
        return null;
      }
    },
    [refreshRecipients]
  );

  // Add a new group
  const addGroup = useCallback(
    async (
      name: string,
      description?: string,
      memberEmails?: string[]
    ): Promise<LoanRecipient | null> => {
      try {
        const newGroup = await LoanRecipientsService.addGroup(
          name,
          description,
          memberEmails
        );
        if (newGroup) {
          // Refresh recipients to include the new group
          await refreshRecipients();
        }
        return newGroup;
      } catch (err) {
        console.error("Error adding group:", err);
        return null;
      }
    },
    [refreshRecipients]
  );

  // Fetch recipients on mount
  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  return {
    recipients,
    loading,
    error,
    refreshRecipients,
    addPerson,
    addGroup,
  };
};

/**
 * Loan Recipients Service
 * Fetches persons, groups, and banks from the database for loan creation
 */

import { ExpenseSplittingService } from "../../../../../services/expenseSplittingService";
import { fetchAccounts } from "../../../../../services/accountsService";
import { LoanRecipient, RecipientType } from "../types";

export class LoanRecipientsService {
  /**
   * Fetch all persons (individual contacts) from the database
   */
  static async getPersons(): Promise<LoanRecipient[]> {
    try {
      const individuals =
        await ExpenseSplittingService.getExistingIndividuals();

      return individuals.map((person) => ({
        id: person.id,
        name: person.name,
        type: "person" as RecipientType,
        email: person.email,
        balance: 0, // TODO: Calculate actual balance from transactions
      }));
    } catch (error) {
      console.error("Error fetching persons:", error);
      return [];
    }
  }

  /**
   * Fetch all groups from the database
   */
  static async getGroups(): Promise<LoanRecipient[]> {
    try {
      const groups = await ExpenseSplittingService.getUserGroups();

      return await Promise.all(
        groups.map(async (group) => {
          // Get group members to show count
          let memberCount = 0;
          try {
            const members = await ExpenseSplittingService.getGroupMembers(
              group.id
            );
            memberCount = members.length;
          } catch (error) {
            console.error(
              `Error fetching members for group ${group.id}:`,
              error
            );
          }

          return {
            id: group.id,
            name: group.name,
            type: "group" as RecipientType,
            description: group.description,
            memberCount: memberCount,
            balance: 0, // TODO: Calculate actual balance from transactions
          };
        })
      );
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  }

  /**
   * Fetch all bank accounts from the database
   */
  static async getBanks(): Promise<LoanRecipient[]> {
    try {
      const accounts = await fetchAccounts(false); // false = not demo mode

      return accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: "bank" as RecipientType,
        institution: account.institution,
        accountNumber: account.account_number,
        logoUrl: account.logo_url,
        accountType: account.type,
        balance: account.balance || 0,
      }));
    } catch (error) {
      console.error("❌ Error fetching banks:", error);
      return [];
    }
  }

  /**
   * Fetch all recipients (persons, groups, and banks)
   */
  static async getAllRecipients(): Promise<{
    persons: LoanRecipient[];
    groups: LoanRecipient[];
    banks: LoanRecipient[];
  }> {
    try {
      const [persons, groups, banks] = await Promise.all([
        this.getPersons(),
        this.getGroups(),
        this.getBanks(),
      ]);

      return {
        persons,
        groups,
        banks,
      };
    } catch (error) {
      console.error("Error fetching all recipients:", error);
      return {
        persons: [],
        groups: [],
        banks: [],
      };
    }
  }

  /**
   * Add a new person (individual contact)
   */
  static async addPerson(
    email: string,
    name?: string
  ): Promise<LoanRecipient | null> {
    try {
      const newContact = await ExpenseSplittingService.addIndividualContact(
        email,
        name
      );

      return {
        id: newContact.id,
        name: newContact.name,
        type: "person" as RecipientType,
        email: newContact.email,
        balance: 0,
      };
    } catch (error) {
      console.error("Error adding person:", error);
      return null;
    }
  }

  /**
   * Add a new group
   */
  static async addGroup(
    name: string,
    description?: string,
    memberEmails: string[] = []
  ): Promise<LoanRecipient | null> {
    try {
      const newGroup = await ExpenseSplittingService.createGroup(
        name,
        description,
        memberEmails
      );

      return {
        id: newGroup.id,
        name: newGroup.name,
        type: "group" as RecipientType,
        description: newGroup.description,
        memberCount: memberEmails.length + 1, // +1 for creator
        balance: 0,
      };
    } catch (error) {
      console.error("Error adding group:", error);
      return null;
    }
  }
}

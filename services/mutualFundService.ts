/**
 * Mutual Fund Service
 * Integrates with AMFI for NAV data and mutual fund information
 */

import { supabase } from '../lib/supabase/client';
import type { MutualFund, MutualFundNAV } from '../types/portfolio-extended';

export class MutualFundService {
  private static AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

  // =====================================================
  // AMFI DATA FETCHING
  // =====================================================

  /**
   * Fetch and parse all mutual fund NAVs from AMFI
   */
  static async fetchAllNAVs(): Promise<MutualFundNAV[]> {
    try {
      const response = await fetch(this.AMFI_NAV_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      return this.parseAMFIData(text);
    } catch (error) {
      console.error('Error fetching AMFI NAVs:', error);
      throw error;
    }
  }

  /**
   * Parse AMFI NAV text file
   */
  private static parseAMFIData(text: string): MutualFundNAV[] {
    const lines = text.split('\n');
    const funds: MutualFundNAV[] = [];
    let currentFundHouse = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.includes('Mutual Fund')) {
        // Fund house header
        currentFundHouse = trimmedLine;
      } else if (trimmedLine) {
        // NAV data line format:
        // Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
        const parts = line.split(';');
        
        if (parts.length === 6 && parts[0]) {
          funds.push({
            schemeCode: parts[0].trim(),
            isin: parts[1].trim(),
            schemeName: parts[3].trim(),
            nav: parseFloat(parts[4]) || 0,
            date: parts[5].trim(),
            fundHouse: currentFundHouse.replace('Mutual Fund', '').trim(),
          });
        }
      }
    }

    return funds;
  }

  // =====================================================
  // MUTUAL FUND OPERATIONS
  // =====================================================

  /**
   * Get NAV for specific scheme
   */
  static async getSchemeNAV(schemeCode: string): Promise<number | null> {
    try {
      // First try to get from database (cached)
      const cachedNAV = await this.getSchemeNAVFromDB(schemeCode);
      if (cachedNAV) return cachedNAV;

      // If not in cache, fetch from AMFI
      const allNAVs = await this.fetchAllNAVs();
      const scheme = allNAVs.find(f => f.schemeCode === schemeCode);
      
      if (scheme) {
        // Cache it
        await this.updateNAVInDB(scheme);
        return scheme.nav;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching NAV for scheme ${schemeCode}:`, error);
      return null;
    }
  }

  /**
   * Search mutual funds by name
   */
  static async searchMutualFunds(query: string): Promise<MutualFund[]> {
    try {
      // Search in database first (cached data)
      const dbResults = await this.searchMutualFundsInDB(query);
      
      if (dbResults.length > 0) {
        return dbResults;
      }

      // If no results in DB, fetch from AMFI and search
      const allFunds = await this.fetchAllNAVs();
      const lowerQuery = query.toLowerCase();

      const results = allFunds
        .filter(
          fund =>
            fund.schemeName.toLowerCase().includes(lowerQuery) ||
            fund.fundHouse.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 20); // Limit results

      return results.map(fund => ({
        id: fund.schemeCode,
        scheme_code: fund.schemeCode,
        scheme_name: fund.schemeName,
        fund_house: fund.fundHouse,
        isin: fund.isin,
        nav: fund.nav,
        nav_date: fund.date,
        created_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error searching mutual funds:', error);
      return [];
    }
  }

  /**
   * Get mutual fund details
   */
  static async getMutualFundDetails(schemeCode: string): Promise<MutualFund | null> {
    try {
      // Try database first
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('*')
        .eq('scheme_code', schemeCode)
        .single();

      if (!error && data) {
        return data;
      }

      // If not in database, fetch from AMFI
      const allNAVs = await this.fetchAllNAVs();
      const scheme = allNAVs.find(f => f.schemeCode === schemeCode);

      if (!scheme) return null;

      // Create basic MF object
      const mfData: MutualFund = {
        id: scheme.schemeCode,
        scheme_code: scheme.schemeCode,
        scheme_name: scheme.schemeName,
        fund_house: scheme.fundHouse,
        isin: scheme.isin,
        nav: scheme.nav,
        nav_date: scheme.date,
        created_at: new Date().toISOString(),
      };

      // Cache it
      await this.updateNAVInDB(scheme);

      return mfData;
    } catch (error) {
      console.error('Error fetching mutual fund details:', error);
      return null;
    }
  }

  // =====================================================
  // DATABASE OPERATIONS
  // =====================================================

  /**
   * Update cached NAVs in database
   */
  static async updateCachedNAVs(): Promise<number> {
    try {
      const funds = await this.fetchAllNAVs();

      console.log(`Fetched ${funds.length} mutual funds from AMFI`);

      // Batch insert/update in chunks to avoid timeout
      const BATCH_SIZE = 100;
      let updatedCount = 0;

      for (let i = 0; i < funds.length; i += BATCH_SIZE) {
        const batch = funds.slice(i, i + BATCH_SIZE);

        const { error } = await supabase.from('mutual_funds').upsert(
          batch.map(fund => ({
            scheme_code: fund.schemeCode,
            scheme_name: fund.schemeName,
            fund_house: fund.fundHouse,
            isin: fund.isin,
            nav: fund.nav,
            nav_date: fund.date,
            last_updated: new Date().toISOString(),
          })),
          { onConflict: 'scheme_code' }
        );

        if (error) {
          console.error(`Error updating batch ${i / BATCH_SIZE}:`, error);
        } else {
          updatedCount += batch.length;
        }
      }

      console.log(`Updated ${updatedCount} mutual fund NAVs in database`);
      return updatedCount;
    } catch (error) {
      console.error('Error updating cached NAVs:', error);
      throw error;
    }
  }

  /**
   * Get scheme NAV from database (cached)
   */
  private static async getSchemeNAVFromDB(schemeCode: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('nav')
        .eq('scheme_code', schemeCode)
        .single();

      if (error || !data) return null;
      return data.nav;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update single NAV in database
   */
  private static async updateNAVInDB(fund: MutualFundNAV): Promise<void> {
    try {
      await supabase.from('mutual_funds').upsert(
        {
          scheme_code: fund.schemeCode,
          scheme_name: fund.schemeName,
          fund_house: fund.fundHouse,
          isin: fund.isin,
          nav: fund.nav,
          nav_date: fund.date,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'scheme_code' }
      );
    } catch (error) {
      console.error('Error updating NAV in database:', error);
    }
  }

  /**
   * Search mutual funds in database
   */
  private static async searchMutualFundsInDB(query: string): Promise<MutualFund[]> {
    try {
      const { data, error } = await supabase
        .from('mutual_funds')
        .select('*')
        .or(`scheme_name.ilike.%${query}%,fund_house.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching mutual funds in database:', error);
      return [];
    }
  }

  // =====================================================
  // PORTFOLIO INTEGRATION
  // =====================================================

  /**
   * Update NAVs for all mutual fund holdings
   */
  static async updateMutualFundHoldingsPrices(holdingIds: string[]): Promise<void> {
    try {
      // Get all mutual fund holdings
      const { data: holdings, error } = await supabase
        .from('holdings')
        .select('id, symbol')
        .in('id', holdingIds)
        .eq('asset_type', 'mutual_fund');

      if (error) throw error;

      if (!holdings || holdings.length === 0) return;

      // Get unique scheme codes
      const schemeCodes = [...new Set(holdings.map(h => h.symbol))];

      // Fetch current NAVs
      const navPromises = schemeCodes.map(code => this.getSchemeNAV(code));
      const navs = await Promise.allSettled(navPromises);

      // Create a map of scheme code to NAV
      const navMap = new Map<string, number>();
      navs.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          navMap.set(schemeCodes[index], result.value);
        }
      });

      // Update each holding
      for (const holding of holdings) {
        const currentNAV = navMap.get(holding.symbol);
        if (currentNAV) {
          await supabase
            .from('holdings')
            .update({ current_price: currentNAV })
            .eq('id', holding.id);
        }
      }

      console.log(`Updated NAVs for ${holdings.length} mutual fund holdings`);
    } catch (error) {
      console.error('Error updating mutual fund holdings prices:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Categorize mutual fund by name
   */
  static categorizeMutualFund(schemeName: string): {
    category: string;
    subcategory: string;
    risk_level: 'low' | 'medium' | 'high' | 'very_high';
  } {
    const name = schemeName.toLowerCase();

    // Equity funds
    if (
      name.includes('equity') ||
      name.includes('stock') ||
      name.includes('large cap') ||
      name.includes('mid cap') ||
      name.includes('small cap')
    ) {
      return {
        category: 'Equity',
        subcategory: name.includes('large cap')
          ? 'Large Cap'
          : name.includes('mid cap')
          ? 'Mid Cap'
          : name.includes('small cap')
          ? 'Small Cap'
          : 'Multi Cap',
        risk_level: 'high',
      };
    }

    // Debt funds
    if (
      name.includes('debt') ||
      name.includes('bond') ||
      name.includes('income') ||
      name.includes('gilt')
    ) {
      return {
        category: 'Debt',
        subcategory: 'Corporate Bond',
        risk_level: 'low',
      };
    }

    // Hybrid funds
    if (name.includes('hybrid') || name.includes('balanced')) {
      return {
        category: 'Hybrid',
        subcategory: 'Balanced',
        risk_level: 'medium',
      };
    }

    // Index funds
    if (name.includes('index') || name.includes('etf')) {
      return {
        category: 'Index',
        subcategory: 'Index Fund',
        risk_level: 'medium',
      };
    }

    // Default
    return {
      category: 'Other',
      subcategory: 'Other',
      risk_level: 'medium',
    };
  }

  /**
   * Format NAV with 4 decimal places
   */
  static formatNAV(nav: number): string {
    return nav.toFixed(4);
  }
}


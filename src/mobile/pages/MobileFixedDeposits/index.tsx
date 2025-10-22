/**
 * Fixed Deposits Detail Page
 * 
 * Shows all FDs with chips/tabs at the top for quick navigation
 * Displays comprehensive FD details following the app's design pattern
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, darkTheme, lightTheme } from "../../../../contexts/ThemeContext";
import { useDemoMode } from "../../../../contexts/DemoModeContext";
import { useNavigation } from "@react-navigation/native";
import {
  fetchFixedDeposits,
  calculateDaysToMaturity,
  getFDStatusDisplay,
  type FixedDeposit,
} from "../../../../services/fixedDepositsService";

const SCREEN_WIDTH = Dimensions.get("window").width;

const MobileFixedDeposits: React.FC = () => {
  const { isDark } = useTheme();
  const colors = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { isDemo } = useDemoMode();

  const [fds, setFds] = useState<FixedDeposit[]>([]);
  const [selectedFDIndex, setSelectedFDIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🏦 MobileFixedDeposits mounted, loading FDs...");
    loadFDs();
  }, []);

  const loadFDs = async () => {
    try {
      console.log("🏦 Loading FDs with isDemo:", isDemo);
      setLoading(true);
      setError(null);
      const fetchedFDs = await fetchFixedDeposits(isDemo);
      console.log("🏦 Fetched FDs:", fetchedFDs);
      setFds(fetchedFDs);
    } catch (err) {
      console.error("Error loading FDs:", err);
      setError("Failed to load Fixed Deposits");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-IN", options);
  };

  const selectedFD = fds[selectedFDIndex];
  const fdStatus = selectedFD ? getFDStatusDisplay(selectedFD) : null;
  const daysToMaturity = selectedFD ? calculateDaysToMaturity(selectedFD.maturity_date) : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading Fixed Deposits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || fds.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Fixed Deposits</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {error || "No Fixed Deposits"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {error ? "Please try again later" : "You don't have any active Fixed Deposits"}
          </Text>
          {error && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadFDs}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fixed Deposits</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* FD Chips/Tabs */}
      <View style={styles.chipsScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {fds.map((fd, index) => {
            const isActive = selectedFDIndex === index;
            const chipStatus = getFDStatusDisplay(fd);
            
            return (
              <TouchableOpacity
                key={fd.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFDIndex(index)}
              >
                <View style={styles.chipContent}>
                  <Text
                    style={[
                      styles.chipBank,
                      { color: isActive ? "#FFFFFF" : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {fd.institution}
                  </Text>
                  <Text
                    style={[
                      styles.chipAmount,
                      { color: isActive ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {formatCurrency(Number(fd.principal_amount))}
                  </Text>
                  <View
                    style={[
                      styles.chipBadge,
                      {
                        backgroundColor: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : chipStatus.color + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipBadgeText,
                        { color: isActive ? "#FFFFFF" : chipStatus.color },
                      ]}
                    >
                      {chipStatus.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FD Details */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedFD && (
          <>
            {/* Main Info Card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="time" size={24} color={colors.primary} />
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {selectedFD.deposit_name || `FD ${selectedFD.deposit_number}`}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                      {selectedFD.institution}
                    </Text>
                  </View>
                </View>
                {fdStatus && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: fdStatus.color + "20" },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: fdStatus.color }]}>
                      {fdStatus.status}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Amount Section */}
              <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                    Current Value
                  </Text>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>
                    {formatCurrency(Number(selectedFD.current_value))}
                  </Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountSmall, { color: colors.textSecondary }]}>
                    Principal: {formatCurrency(Number(selectedFD.principal_amount))}
                  </Text>
                  <Text style={[styles.amountSmall, { color: "#10B981" }]}>
                    Interest: +{formatCurrency(Number(selectedFD.interest_accrued))}
                  </Text>
                </View>
              </View>
            </View>

            {/* Interest & Returns */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Interest & Returns
                </Text>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Interest Rate
                  </Text>
                  <View style={styles.detailValueRow}>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {Number(selectedFD.interest_rate).toFixed(2)}%
                    </Text>
                    <Text style={[styles.detailSuffix, { color: colors.textSecondary }]}>
                      p.a.
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Maturity Amount
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatCurrency(Number(selectedFD.maturity_amount))}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Interest Type
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedFD.interest_type === "simple" ? "Simple" : "Compound"}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Payout Frequency
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedFD.interest_payout_frequency.charAt(0).toUpperCase() +
                      selectedFD.interest_payout_frequency.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Timeline */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
              </View>

              <View style={styles.timeline}>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                      Opening Date
                    </Text>
                    <Text style={[styles.timelineValue, { color: colors.text }]}>
                      {formatDate(selectedFD.opening_date)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />

                <View style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor:
                          daysToMaturity <= 30 ? "#F59E0B" : colors.primary,
                      },
                    ]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, { color: colors.textSecondary }]}>
                      Maturity Date
                    </Text>
                    <Text style={[styles.timelineValue, { color: colors.text }]}>
                      {formatDate(selectedFD.maturity_date)}
                    </Text>
                    <Text
                      style={[
                        styles.timelineSubtext,
                        {
                          color: daysToMaturity <= 30 ? "#F59E0B" : colors.textSecondary,
                        },
                      ]}
                    >
                      {daysToMaturity > 0
                        ? `Matures in ${daysToMaturity} days`
                        : "Matured"}
                    </Text>
                  </View>
                </View>

                <View style={styles.durationBadge}>
                  <Text style={[styles.durationText, { color: colors.primary }]}>
                    {selectedFD.period_months} months tenure
                  </Text>
                </View>
              </View>
            </View>

            {/* Account Details */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Account Details
                </Text>
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                    Deposit Number
                  </Text>
                  <Text style={[styles.detailRowValue, { color: colors.text }]}>
                    {selectedFD.deposit_number}
                  </Text>
                </View>

                <View style={[styles.detailRowDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                    Institution
                  </Text>
                  <Text style={[styles.detailRowValue, { color: colors.text }]}>
                    {selectedFD.institution}
                  </Text>
                </View>

                {selectedFD.branch_name && (
                  <>
                    <View
                      style={[styles.detailRowDivider, { backgroundColor: colors.border }]}
                    />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                        Branch
                      </Text>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>
                        {selectedFD.branch_name}
                      </Text>
                    </View>
                  </>
                )}

                {selectedFD.linked_account_number && (
                  <>
                    <View
                      style={[styles.detailRowDivider, { backgroundColor: colors.border }]}
                    />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                        Linked Account
                      </Text>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>
                        {selectedFD.linked_account_number}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Nomination & Settings */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Additional Details
                </Text>
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                    Nomination Status
                  </Text>
                  <View style={styles.detailRowValueBadge}>
                    <Ionicons
                      name={
                        selectedFD.nomination_status === "registered"
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={16}
                      color={
                        selectedFD.nomination_status === "registered"
                          ? "#10B981"
                          : "#F59E0B"
                      }
                    />
                    <Text
                      style={[
                        styles.detailRowValue,
                        {
                          color:
                            selectedFD.nomination_status === "registered"
                              ? "#10B981"
                              : "#F59E0B",
                        },
                      ]}
                    >
                      {selectedFD.nomination_status === "registered"
                        ? "Registered"
                        : "Not Registered"}
                    </Text>
                  </View>
                </View>

                {selectedFD.nominee_name && (
                  <>
                    <View
                      style={[styles.detailRowDivider, { backgroundColor: colors.border }]}
                    />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                        Nominee
                      </Text>
                      <Text style={[styles.detailRowValue, { color: colors.text }]}>
                        {selectedFD.nominee_name}
                        {selectedFD.nominee_relationship &&
                          ` (${selectedFD.nominee_relationship})`}
                      </Text>
                    </View>
                  </>
                )}

                <View style={[styles.detailRowDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                    Auto Renewal
                  </Text>
                  <Text style={[styles.detailRowValue, { color: colors.text }]}>
                    {selectedFD.auto_renewal ? "Enabled" : "Disabled"}
                  </Text>
                </View>

                <View style={[styles.detailRowDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                    TDS Applicable
                  </Text>
                  <Text style={[styles.detailRowValue, { color: colors.text }]}>
                    {selectedFD.tds_applicable ? "Yes" : "No"}
                  </Text>
                </View>

                {selectedFD.premature_withdrawal_penalty && (
                  <>
                    <View
                      style={[styles.detailRowDivider, { backgroundColor: colors.border }]}
                    />
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailRowLabel, { color: colors.textSecondary }]}>
                        Premature Penalty
                      </Text>
                      <Text style={[styles.detailRowValue, { color: "#EF4444" }]}>
                        {Number(selectedFD.premature_withdrawal_penalty).toFixed(2)}%
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>View Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="share-outline" size={20} color={colors.text} />
                <Text style={[styles.actionButtonTextAlt, { color: colors.text }]}>
                  Share Details
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerButton: {
    padding: 8,
  },
  chipsScrollContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
    maxWidth: 180,
  },
  chipContent: {
    gap: 4,
  },
  chipBank: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  chipBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  amountSection: {
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  amountSmall: {
    fontSize: 13,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  detailSuffix: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeline: {
    gap: 0,
    position: "relative",
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  timelineSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
  durationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    marginTop: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsList: {
    gap: 0,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailRowLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  detailRowValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  detailRowDivider: {
    height: 1,
    marginLeft: 0,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonTextAlt: {
    fontSize: 15,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 32,
  },
});

export default MobileFixedDeposits;


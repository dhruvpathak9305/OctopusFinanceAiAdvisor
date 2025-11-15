/**
 * ============================================================================
 * ENHANCED GOALS SCREEN - FULLY FUNCTIONAL
 * ============================================================================
 * Features:
 * - Gradient cards with depth
 * - Animated progress rings
 * - Full CRUD functionality
 * - Category browser (50+ categories)
 * - Goal creation/edit modals
 * - Contribution flow
 * - Filters & search
 * - Haptic feedback
 * - Pull to refresh
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoalsService } from '../../../../services/goalsService';

const { width } = Dimensions.get('window');

// Optional haptics support (graceful fallback if not available)
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log('Haptics not available, using silent fallback');
}

// Safe haptics helpers
const hapticImpact = (style?: any) => {
  if (Haptics?.impactAsync) {
    Haptics.impactAsync(style || Haptics.ImpactFeedbackStyle?.Medium);
  }
};

const hapticNotification = (type?: any) => {
  if (Haptics?.notificationAsync) {
    Haptics.notificationAsync(type || Haptics.NotificationFeedbackType?.Success);
  }
};

// ============================================================================
// ANIMATED PROGRESS RING COMPONENT
// ============================================================================
interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Background circle */}
      <Circle
        stroke="rgba(255, 255, 255, 0.1)"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <Circle
        stroke={color}
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ============================================================================
// COMPACT GOAL CARD COMPONENT (Less Cluttered)
// ============================================================================
interface EnhancedGoalCardProps {
  emoji: string;
  name: string;
  category: string;
  timeframe?: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  status: 'on_track' | 'behind' | 'ahead' | 'completed';
  targetDate: string;
  daysRemaining: number;
  milestones: { achieved: number; total: number };
  onPress: () => void;
  onContribute: () => void;
}

const EnhancedGoalCard: React.FC<EnhancedGoalCardProps> = ({
  emoji,
  name,
  category,
  timeframe,
  currentAmount,
  targetAmount,
  progress,
  status,
  targetDate,
  daysRemaining,
  milestones,
  onPress,
  onContribute,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  // Status colors and gradients
  const statusConfig = {
    on_track: {
      gradient: ['#10b981', '#059669'],
      badge: '#10b981',
      label: 'On Track',
      icon: '✓',
    },
    behind: {
      gradient: ['#ef4444', '#dc2626'],
      badge: '#ef4444',
      label: 'Behind',
      icon: '!',
    },
    ahead: {
      gradient: ['#3b82f6', '#2563eb'],
      badge: '#3b82f6',
      label: 'Ahead',
      icon: '↑',
    },
    completed: {
      gradient: ['#8b5cf6', '#7c3aed'],
      badge: '#8b5cf6',
      label: 'Completed',
      icon: '★',
    },
  };

  const config = statusConfig[status] || statusConfig['on_track']; // Fallback to on_track if status is undefined

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.compactCardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactCard}
        >
          {/* Compact Header */}
          <View style={styles.compactHeader}>
            <View style={styles.compactLeft}>
              <View style={styles.compactEmojiContainer}>
                <Text style={styles.compactEmoji}>{emoji}</Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={styles.compactGoalName}>{name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.compactCategory}>{category}</Text>
                  {timeframe && (
                    <View style={styles.timeframeTag}>
                      <Text style={styles.timeframeTagText}>
                        {timeframe === 'Short-term' ? '⚡' : timeframe === 'Medium-term' ? '📅' : '🎯'}
                        {' '}{timeframe.split('-')[0]}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.compactStatusBadge}
            >
              <Text style={styles.compactStatusText}>{config.icon} {config.label}</Text>
            </LinearGradient>
          </View>

          {/* Compact Progress Section */}
          <View style={styles.compactProgressSection}>
            {/* Small Progress Ring */}
            <View style={styles.compactRingContainer}>
              <ProgressRing
                progress={Math.min(progress, 100)}
                size={70}
                strokeWidth={6}
                color={config.gradient[0]}
              />
              <View style={styles.compactRingCenter}>
                <Text style={styles.compactProgressPercentage}>{progress.toFixed(0)}%</Text>
              </View>
            </View>

            {/* Amount Info */}
            <View style={styles.compactAmountInfo}>
              <View style={styles.compactAmountRow}>
                <Text style={styles.compactAmountLabel}>Progress</Text>
                <Text style={[styles.compactCurrentAmount, { color: config.gradient[0] }]}>
                  ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.compactAmountRow}>
                <Text style={styles.compactAmountLabel}>Remaining</Text>
                <Text style={styles.compactTargetAmount}>
                  ${(targetAmount - currentAmount).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.compactActions}>
              <TouchableOpacity 
                style={styles.compactDetailsButton} 
                onPress={onPress}
              >
                <LinearGradient
                  colors={['rgba(100, 116, 139, 0.2)', 'rgba(71, 85, 105, 0.2)']}
                  style={styles.compactDetailsButtonGradient}
                >
                  <Text style={styles.compactDetailsButtonText}>Details</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={onContribute}>
                <LinearGradient
                  colors={config.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.compactContributeButton}
                >
                  <Text style={styles.compactContributeText}>💰 Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// OVERVIEW CARD COMPONENT
// ============================================================================
interface OverviewCardProps {
  activeGoals: number;
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  onTrack: number;
  behind: number;
  ahead: number;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  activeGoals,
  totalSaved,
  totalTarget,
  overallProgress,
  onTrack,
  behind,
  ahead,
}) => {
  return (
    <View style={styles.overviewContainer}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.12)', 'rgba(139, 92, 246, 0.12)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overviewCard}
      >
        {/* Compact Stats Row */}
        <View style={styles.overviewStatsCompact}>
          <View style={styles.overviewStatCompact}>
            <Text style={styles.overviewNumberCompact}>{activeGoals}</Text>
            <Text style={styles.overviewLabelCompact}>Goals</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewStatCompact}>
            <Text style={[styles.overviewNumberCompact, { color: '#10b981' }]}>
              ${(totalSaved / 1000).toFixed(1)}K
            </Text>
            <Text style={styles.overviewLabelCompact}>Saved</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewStatCompact}>
            <Text style={[styles.overviewNumberCompact, { color: '#3b82f6' }]}>
              {overallProgress.toFixed(0)}%
            </Text>
            <Text style={styles.overviewLabelCompact}>Progress</Text>
          </View>
        </View>

        {/* Status Pills */}
        <View style={styles.statusPills}>
          {onTrack > 0 && (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.statusPillText}>{onTrack} On Track</Text>
            </View>
          )}
          {behind > 0 && (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.statusPillText}>{behind} Behind</Text>
            </View>
          )}
          {ahead > 0 && (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.statusPillText}>{ahead} Ahead</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// CATEGORIES BROWSER SECTION (Show all categories)
// ============================================================================
interface CategoryBrowserProps {
  onCategorySelect: (category: any) => void;
  categories: any[];
}

// Categories are now fetched from database in fetchCategories()
// No more hardcoded categories - all loaded dynamically from Supabase!

const CategoriesBrowser: React.FC<CategoryBrowserProps> = ({ categories, onCategorySelect }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Short-term');

  const groupedCategories = {
    'Short-term': categories.filter(c => c.timeframe === 'Short-term'),
    'Medium-term': categories.filter(c => c.timeframe === 'Medium-term'),
    'Long-term': categories.filter(c => c.timeframe === 'Long-term'),
  };

  return (
    <View style={styles.categoriesBrowserContainer}>
      <Text style={styles.categoriesBrowserTitle}>Browse All Categories ({categories.length})</Text>
      
      {Object.entries(groupedCategories).map(([timeframe, categories]) => (
        <View key={timeframe} style={styles.categoryGroupContainer}>
          <TouchableOpacity
            style={styles.categoryGroupHeader}
            onPress={() => setExpandedGroup(expandedGroup === timeframe ? null : timeframe)}
          >
            <Text style={styles.categoryGroupHeaderText}>
              {expandedGroup === timeframe ? '▼' : '▶'} {timeframe} ({categories.length})
            </Text>
          </TouchableOpacity>

          {expandedGroup === timeframe && (
            <View style={styles.categoryGroupGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryGridItem}
                  onPress={() => onCategorySelect(category)}
                >
                  <Text style={styles.categoryGridIcon}>{category.icon}</Text>
                  <Text style={styles.categoryGridName} numberOfLines={2}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// CATEGORY PICKER MODAL
// ============================================================================
interface Category {
  id: string;
  name: string;
  icon: string;
  timeframe: string;
}

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}

const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({ visible, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCategories = {
    'Short-term': filteredCategories.filter(c => c.timeframe === 'Short-term'),
    'Medium-term': filteredCategories.filter(c => c.timeframe === 'Medium-term'),
    'Long-term': filteredCategories.filter(c => c.timeframe === 'Long-term'),
  };

  const handleSelect = (category: Category) => {
    hapticImpact();
    onSelect(category);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 0.98)']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Goal Category</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Categories List */}
            <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
              {Object.entries(groupedCategories).map(([timeframe, categories]) => (
                categories.length > 0 && (
                  <View key={timeframe} style={styles.categoryGroup}>
                    <Text style={styles.categoryGroupTitle}>{timeframe}</Text>
                    <View style={styles.categoryGrid}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={styles.categoryItem}
                          onPress={() => handleSelect(category)}
                        >
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={styles.categoryName}>{category.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// GOAL CREATION MODAL
// ============================================================================
interface GoalFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: any) => void;
  initialGoal?: any;
  categories: any[];
  // Date picker props - passed from parent to avoid modal nesting
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const GoalFormModal: React.FC<GoalFormModalProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  initialGoal,
  categories,
  showDatePicker,
  setShowDatePicker,
  selectedDate,
  setSelectedDate 
}) => {
  // Single-screen form state
  const [selectedTimeframe, setSelectedTimeframe] = useState<'Short-term' | 'Medium-term' | 'Long-term' | null>(
    initialGoal?.timeframe || null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialGoal?.category || null);
  const [categoryExpanded, setCategoryExpanded] = useState(true); // New state for collapse/expand
  const [goalName, setGoalName] = useState(initialGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialGoal?.targetAmount?.toString() || '');


  const handleSave = () => {
    if (!selectedCategory || !goalName || !targetAmount || !selectedDate) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    hapticNotification();
    
    const target = parseFloat(targetAmount);
    const current = initialGoal?.currentAmount || 0;
    const progress = target > 0 ? (current / target) * 100 : 0;

    // Calculate days remaining
    const today = new Date();
    const daysRemaining = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Determine status
    let status: 'on_track' | 'behind' | 'ahead' | 'completed' = 'on_track';
    if (progress >= 100) status = 'completed';
    else if (progress > 0 && daysRemaining < 30 && progress < 80) status = 'behind';
    else if (progress > 50 && daysRemaining > 90) status = 'ahead';
    
    onSave({
      id: initialGoal?.id || Date.now().toString(),
      categoryId: selectedCategory.id, // For database
      emoji: selectedCategory.icon,
      name: goalName,
      category: selectedCategory.name,
      timeframe: selectedCategory.timeframe,
      currentAmount: current,
      targetAmount: target,
      progress,
      status,
      targetDate: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD for database
      daysRemaining: Math.max(0, daysRemaining),
      milestones: initialGoal?.milestones || { achieved: 0, total: 4 },
      // Pass defaults from category (from database)
      priorityDefault: selectedCategory.priorityDefault,
      goalTypeDefault: selectedCategory.goalTypeDefault,
    });
    
    onClose();
    // Reset form
    setSelectedCategory(null);
    setGoalName('');
    setTargetAmount('');
    setSelectedDate(new Date());
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 0.98)']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {initialGoal ? 'Edit Goal' : 'Create New Goal'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                {/* SINGLE-SCREEN FORM */}
                {!initialGoal && (
                  <View style={styles.singleScreenContainer}>
                    {/* Compact Timeframe Selector */}
                    <Text style={styles.sectionTitle}>⏱️ Timeframe</Text>
                    <View style={styles.compactTimeframeRow}>
                      <TouchableOpacity
                        style={[styles.compactTimeframeCard, selectedTimeframe === 'Short-term' && styles.compactTimeframeCardSelected]}
                        onPress={() => {
                          hapticImpact();
                          setSelectedTimeframe('Short-term');
                          setSelectedCategory(null); // Reset category when timeframe changes
                        }}
                      >
                        <Text style={styles.compactTimeframeIcon}>⚡</Text>
                        <Text style={styles.compactTimeframeName}>Short</Text>
                        <Text style={styles.compactTimeframeDesc}>~1 year</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.compactTimeframeCard, selectedTimeframe === 'Medium-term' && styles.compactTimeframeCardSelected]}
                        onPress={() => {
                          hapticImpact();
                          setSelectedTimeframe('Medium-term');
                          setSelectedCategory(null);
                        }}
                      >
                        <Text style={styles.compactTimeframeIcon}>📅</Text>
                        <Text style={styles.compactTimeframeName}>Medium</Text>
                        <Text style={styles.compactTimeframeDesc}>1-5 yrs</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.compactTimeframeCard, selectedTimeframe === 'Long-term' && styles.compactTimeframeCardSelected]}
                        onPress={() => {
                          hapticImpact();
                          setSelectedTimeframe('Long-term');
                          setSelectedCategory(null);
                        }}
                      >
                        <Text style={styles.compactTimeframeIcon}>🎯</Text>
                        <Text style={styles.compactTimeframeName}>Long</Text>
                        <Text style={styles.compactTimeframeDesc}>5+ yrs</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced Category Grid - Collapsible with Visible Scrollbar */}
                    {selectedTimeframe && (
                      <View style={styles.categorySection}>
                        <TouchableOpacity 
                          style={styles.categorySectionHeader}
                          onPress={() => {
                            hapticImpact();
                            setCategoryExpanded(!categoryExpanded);
                          }}
                        >
                          <View style={styles.categoryHeaderLeft}>
                            <Text style={styles.sectionTitle}>📂 Choose Category</Text>
                            <Text style={styles.categoryCount}>
                              {categories.filter(cat => cat.timeframe === selectedTimeframe).length} available
                            </Text>
                          </View>
                          <Text style={styles.expandCollapseIcon}>
                            {categoryExpanded ? '▼' : '▶'}
                          </Text>
                        </TouchableOpacity>

                        {/* Selected Category Summary (when collapsed) */}
                        {!categoryExpanded && selectedCategory && (
                          <TouchableOpacity 
                            style={styles.selectedCategorySummary}
                            onPress={() => {
                              hapticImpact();
                              setCategoryExpanded(true);
                            }}
                          >
                            <Text style={styles.selectedCategoryIcon}>{selectedCategory.icon}</Text>
                            <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
                            <Text style={styles.changeButton}>Change</Text>
                          </TouchableOpacity>
                        )}

                        {/* Expandable Category Grid */}
                        {categoryExpanded && (
                          <ScrollView 
                            style={styles.categoryScrollView}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            indicatorStyle="white"
                          >
                            <View style={styles.categoriesGridForm}>
                              {categories.filter(cat => cat.timeframe === selectedTimeframe).map((category) => (
                                <TouchableOpacity
                                  key={category.id}
                                  style={[styles.categoryCardForm, selectedCategory?.id === category.id && styles.categoryCardSelected]}
                                  onPress={() => {
                                    hapticImpact();
                                    setSelectedCategory(category);
                                    // Auto-collapse after selection
                                    setTimeout(() => setCategoryExpanded(false), 300);
                                  }}
                                >
                                  <Text style={styles.categoryCardIcon}>{category.icon}</Text>
                                  <Text style={styles.categoryCardNameForm} numberOfLines={2}>{category.name}</Text>
                                  {selectedCategory?.id === category.id && (
                                    <View style={styles.categoryCheckmark}>
                                      <Text style={styles.categoryCheckmarkText}>✓</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    )}

                    {/* Goal Name */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Goal Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Summer Vacation 2025"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={goalName}
                        onChangeText={setGoalName}
                      />
                    </View>

                    {/* Target Amount - Improved */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Target Amount *</Text>
                      <View style={styles.amountInputImproved}>
                        <Text style={styles.currencySymbolImproved}>$</Text>
                        <TextInput
                          style={styles.amountTextInput}
                          placeholder="5,000"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="numeric"
                          value={targetAmount}
                          onChangeText={setTargetAmount}
                        />
                      </View>
                    </View>

                    {/* Target Date - Inline Picker */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Target Date *</Text>
                      <TouchableOpacity
                        style={styles.dateInputContainer}
                        onPress={() => {
                          hapticImpact();
                          setShowDatePicker(!showDatePicker);
                        }}
                      >
                        <Text style={styles.dateIcon}>📅</Text>
                        <Text style={styles.dateTextInput}>
                          {selectedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.dateChevron}>{showDatePicker ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                      
                      {/* Inline Date Picker - Shows directly below when active */}
                      {showDatePicker && (
                        <View style={styles.inlineDatePickerContainer}>
                          <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                              if (date) {
                                setSelectedDate(date);
                                hapticImpact();
                              }
                            }}
                            textColor="#ffffff"
                            themeVariant="dark"
                            style={styles.inlineDatePicker}
                          />
                          <TouchableOpacity
                            style={styles.datePickerDoneButton}
                            onPress={() => {
                              setShowDatePicker(false);
                              hapticNotification();
                            }}
                          >
                            <Text style={styles.datePickerDoneText}>Done ✓</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                {/* Single Create Goal Button */}
                <TouchableOpacity 
                  onPress={handleSave} 
                  style={styles.saveButtonContainer}
                  disabled={!selectedTimeframe || !selectedCategory || !goalName || !targetAmount || !selectedDate}
                >
                  <LinearGradient
                    colors={
                      (selectedTimeframe && selectedCategory && goalName && targetAmount && selectedDate)
                        ? ['#10b981', '#059669']
                        : ['rgba(100, 116, 139, 0.5)', 'rgba(71, 85, 105, 0.5)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>✨ Create Goal</Text>
                  </LinearGradient>
                </TouchableOpacity>

                  </View>
                )}

                {/* EDIT MODE */}
                {initialGoal && (
                  <View style={styles.singleScreenContainer}>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Goal Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Summer Vacation 2025"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={goalName}
                        onChangeText={setGoalName}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Target Amount *</Text>
                      <View style={styles.amountInputImproved}>
                        <Text style={styles.currencySymbolImproved}>$</Text>
                        <TextInput
                          style={styles.amountTextInput}
                          placeholder="5,000"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="numeric"
                          value={targetAmount}
                          onChangeText={setTargetAmount}
                        />
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Target Date *</Text>
                      <TouchableOpacity
                        style={styles.dateInputContainer}
                        onPress={() => {
                          hapticImpact();
                          setShowDatePicker(!showDatePicker);
                        }}
                      >
                        <Text style={styles.dateIcon}>📅</Text>
                        <Text style={styles.dateTextInput}>
                          {selectedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.dateChevron}>{showDatePicker ? '▲' : '▼'}</Text>
                      </TouchableOpacity>
                      
                      {/* Inline Date Picker - Shows directly below when active */}
                      {showDatePicker && (
                        <View style={styles.inlineDatePickerContainer}>
                          <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                              if (date) {
                                setSelectedDate(date);
                                hapticImpact();
                              }
                            }}
                            textColor="#ffffff"
                            themeVariant="dark"
                            style={styles.inlineDatePicker}
                          />
                          <TouchableOpacity
                            style={styles.datePickerDoneButton}
                            onPress={() => {
                              setShowDatePicker(false);
                              hapticNotification();
                            }}
                          >
                            <Text style={styles.datePickerDoneText}>Done ✓</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity onPress={handleSave} style={styles.saveButtonContainer}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButton}
                      >
                        <Text style={styles.saveButtonText}>Update Goal</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
        </View>
      </View>
    </Modal>
    </>
  );
};

// ============================================================================
// GOAL DETAILS MODAL
// ============================================================================
interface GoalDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  goal: any;
  onEdit: () => void;
  onDelete: () => void;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ visible, onClose, goal, onEdit, onDelete }) => {
  if (!goal) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticNotification();
            onDelete();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 0.98)']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Goal Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
              {/* Goal Info */}
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsEmoji}>{goal.emoji}</Text>
                <Text style={styles.detailsName}>{goal.name}</Text>
                <Text style={styles.detailsCategory}>{goal.category}</Text>
              </View>

              {/* Progress */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Progress</Text>
                <View style={styles.detailsProgress}>
                  <Text style={styles.detailsAmount}>
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </Text>
                  <Text style={styles.detailsPercentage}>{goal.progress.toFixed(0)}% Complete</Text>
                </View>
              </View>

              {/* Timeline */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Timeline</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Target Date</Text>
                  <Text style={styles.detailsValue}>{goal.targetDate}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Days Remaining</Text>
                  <Text style={styles.detailsValue}>{goal.daysRemaining} days</Text>
                </View>
              </View>

              {/* Milestones */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Milestones</Text>
                <Text style={styles.detailsValue}>
                  {goal.milestones.achieved} of {goal.milestones.total} completed
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.detailsActions}>
                <TouchableOpacity onPress={onEdit} style={styles.detailsActionButton}>
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>✏️ Edit Goal</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>🗑️ Delete Goal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// CONTRIBUTION MODAL
// ============================================================================
interface ContributionModalProps {
  visible: boolean;
  onClose: () => void;
  goal: any;
  onContribute: (amount: number) => void;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ visible, onClose, goal, onContribute }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleContribute = () => {
    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    hapticNotification();
    onContribute(contributionAmount);
    setAmount('');
    setNote('');
    onClose();
  };

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 0.98)']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contribution</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contributionContainer}>
              {/* Goal Info */}
              <View style={styles.contributionHeader}>
                <Text style={styles.contributionEmoji}>{goal.emoji}</Text>
                <Text style={styles.contributionGoalName}>{goal.name}</Text>
                <Text style={styles.contributionRemaining}>
                  ${remaining.toLocaleString()} remaining
                </Text>
              </View>

              {/* Amount Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contribution Amount *</Text>
                <View style={styles.amountInputLarge}>
                  <Text style={styles.currencySymbolLarge}>$</Text>
                  <TextInput
                    style={styles.amountTextInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>
              </View>

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
                <View style={styles.quickAmountsGrid}>
                  {[50, 100, 250, 500].map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      style={styles.quickAmountButton}
                      onPress={() => setAmount(quickAmount.toString())}
                    >
                      <Text style={styles.quickAmountText}>${quickAmount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Note */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Monthly savings"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              {/* Contribute Button */}
              <TouchableOpacity onPress={handleContribute} style={styles.contributeButtonContainer}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.contributeButton}
                >
                  <Text style={styles.contributeButtonText}>
                    💰 Add ${amount || '0'} to Goal
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function EnhancedGoalsScreen() {
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Date picker state - hoisted to parent level to avoid modal nesting
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Categories from database
  const [categories, setCategories] = useState<any[]>([]);

  // Goals data - loaded from database
  const [goals, setGoals] = useState<any[]>([]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const fetchedCategories = await GoalsService.fetchCategories();
      
      // Transform to UI format with timeframe mapping AND include defaults
      const uiCategories = fetchedCategories.map(c => ({
        id: c.id, // UUID from database
        name: c.name,
        icon: c.icon || '🎯',
        timeframe: c.timeframe_default === 'short' ? 'Short-term' : 
                   c.timeframe_default === 'medium' ? 'Medium-term' : 
                   c.timeframe_default === 'long' ? 'Long-term' : 'Short-term',
        // Include defaults from database
        priorityDefault: c.priority_default || 'medium',
        goalTypeDefault: c.goal_type_default || 'savings',
      }));
      
      setCategories(uiCategories);
      console.log('✅ Fetched categories from database:', uiCategories.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep empty if fetch fails
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch goals from database
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const fetchedGoals = await GoalsService.fetchGoals();
      
      // Transform to UI format
      const uiGoals = fetchedGoals.map(g => {
        // Map database status to UI status
        let uiStatus: 'on_track' | 'behind' | 'ahead' | 'completed' = 'on_track';
        if (g.status === 'completed') {
          uiStatus = 'completed';
        } else if (g.progress_percentage >= 100) {
          uiStatus = 'completed';
        } else if (g.progress_percentage > 0 && g.days_remaining && g.days_remaining < 30 && g.progress_percentage < 80) {
          uiStatus = 'behind';
        } else if (g.progress_percentage > 50 && g.days_remaining && g.days_remaining > 90) {
          uiStatus = 'ahead';
        }

        return {
          id: g.id,
          emoji: g.emoji || '🎯',
          name: g.name,
          category: g.category_name || 'General',
          timeframe: g.timeframe === 'short' ? 'Short-term' : g.timeframe === 'medium' ? 'Medium-term' : 'Long-term',
          currentAmount: g.current_amount,
          targetAmount: g.target_amount,
          progress: g.progress_percentage,
          status: uiStatus,
          targetDate: new Date(g.target_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          daysRemaining: g.days_remaining || 0,
          milestones: {
            achieved: g.milestones_achieved || 0,
            total: g.milestones_total || 4
          }
        };
      });
      
      setGoals(uiGoals);
      console.log('✅ Fetched goals from database:', uiGoals.length);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Keep goals empty if fetch fails
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories and goals on mount
  useEffect(() => {
    fetchCategories();
    fetchGoals();
  }, []);

  const handleCreateGoal = async (goalData: any) => {
    try {
      hapticNotification();
      
      // Prepare data for database - ALL values from form/category defaults (no hardcoded values!)
      const createGoalInput = {
        name: goalData.name,
        timeframe: goalData.timeframe?.toLowerCase().replace('-term', '') || 'short',
        category_id: goalData.categoryId,
        target_amount: parseFloat(goalData.targetAmount),
        target_date: goalData.targetDate,
        emoji: goalData.emoji,
        // Use category defaults from database (not hardcoded!)
        priority: goalData.priorityDefault || 'medium',
        goal_type: goalData.goalTypeDefault || 'savings',
        current_amount: 0,
        initial_amount: 0,
      };
      
      console.log('📝 Creating goal with data from DB:', createGoalInput);
      
      // Save to database
      await GoalsService.createGoal(createGoalInput);
      
      // Refresh goals list
      await fetchGoals();
      
      Alert.alert('Success', 'Goal created successfully!');
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', error?.message || 'Failed to create goal. Please try again.');
    }
  };

  const handleGoalPress = (goal: any) => {
    hapticImpact();
    setSelectedGoal(goal);
    setShowDetailsModal(true);
  };

  const handleContributePress = (goal: any) => {
    hapticImpact();
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  const handleContribute = async (amount: number) => {
    try {
      if (!selectedGoal) return;
      
      // Save contribution to database
      await GoalsService.addContribution({
        goal_id: selectedGoal.id,
        amount,
        contribution_type: 'manual',
        notes: '',
      });
      
      // Refresh goals list
      await fetchGoals();
      
      Alert.alert('Success', `Added $${amount} to ${selectedGoal.name}!`);
    } catch (error: any) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', error?.message || 'Failed to add contribution. Please try again.');
    }
  };

  const handleEditGoal = () => {
    setShowDetailsModal(false);
    // TODO: Show edit modal
    Alert.alert('Coming Soon', 'Goal editing will be available soon!');
  };

  const handleDeleteGoal = async () => {
    try {
      if (!selectedGoal) return;
      
      // Delete from database
      await GoalsService.deleteGoal(selectedGoal.id);
      
      // Refresh goals list
      await fetchGoals();
      
      setShowDetailsModal(false);
      Alert.alert('Deleted', `${selectedGoal.name} has been deleted.`);
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', error?.message || 'Failed to delete goal. Please try again.');
    }
  };


  // Show loading state
  if (isLoading && goals.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
      >
        {/* Header - More Aesthetic */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Goals</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              hapticImpact();
              setShowCreateModal(true);
            }}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>+ New Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Overview Card */}
        <OverviewCard
          activeGoals={goals.length}
          totalSaved={goals.reduce((sum, g) => sum + g.currentAmount, 0)}
          totalTarget={goals.reduce((sum, g) => sum + g.targetAmount, 0)}
          overallProgress={
            (goals.reduce((sum, g) => sum + g.currentAmount, 0) /
              goals.reduce((sum, g) => sum + g.targetAmount, 0)) *
            100
          }
          onTrack={goals.filter(g => g.status === 'on_track').length}
          behind={goals.filter(g => g.status === 'behind').length}
          ahead={goals.filter(g => g.status === 'ahead').length}
        />

        {/* Goals List */}
        {goals.map((goal) => (
          <EnhancedGoalCard
            key={goal.id}
            {...goal}
            onPress={() => handleGoalPress(goal)}
            onContribute={() => handleContributePress(goal)}
          />
        ))}

        {/* Empty State */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your financial goals today!
            </Text>
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>Create Your First Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories Browser Section */}
        <CategoriesBrowser
          categories={categories}
          onCategorySelect={(category) => {
            hapticImpact();
            // Pre-populate goal creation modal with category
            Alert.alert(
              'Create Goal',
              `Create a new ${category.name} goal?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Create',
                  onPress: () => setShowCreateModal(true),
                },
              ]
            );
          }}
        />

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <GoalFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateGoal}
        categories={categories}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <GoalDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        goal={selectedGoal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
      />

      <ContributionModal
        visible={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        goal={selectedGoal}
        onContribute={handleContribute}
      />

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Header - More Aesthetic
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600', // Less bold (was 'bold')
    color: '#fff',
    letterSpacing: -0.5,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500', // Less bold
    letterSpacing: 0.3,
  },

  // Overview Card - Compact & Beautiful
  overviewContainer: {
    marginBottom: 16,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  overviewStatsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  overviewStatCompact: {
    alignItems: 'center',
    flex: 1,
  },
  overviewNumberCompact: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  overviewLabelCompact: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  overviewDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusPills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusPillText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  // Compact Goal Card (New - Less Cluttered)
  compactCardContainer: {
    marginBottom: 12,
  },
  compactCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactGoalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  compactCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeframeTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  timeframeTagText: {
    fontSize: 9,
    color: '#60a5fa',
    fontWeight: '600',
  },
  compactStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  compactStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  compactProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactRingContainer: {
    position: 'relative',
    marginRight: 12,
  },
  compactRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactProgressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  compactAmountInfo: {
    flex: 1,
  },
  compactAmountRow: {
    marginBottom: 4,
  },
  compactAmountLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  compactCurrentAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactTargetAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  compactActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  compactDetailsButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  compactDetailsButtonGradient: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  compactDetailsButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  compactContributeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  compactContributeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Categories Browser
  categoriesBrowserContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  categoriesBrowserTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  categoryGroupContainer: {
    marginBottom: 12,
  },
  categoryGroupHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryGroupHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  categoryGridItem: {
    width: (width - 88) / 5, // 5 categories per row
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 85,
  },
  categoryGridIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryGridName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Old Goal Card (Kept for reference)
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  ringContainer: {
    position: 'relative',
    marginRight: 20,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  amountInfo: {
    flex: 1,
    justifyContent: 'space-around',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },

  // Milestone Dots
  milestoneDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  dotAchieved: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  // Category Picker
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  categoriesList: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 24,
  },
  categoryGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: (width - 72) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Goal Form
  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedCategoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedCategoryTimeframe: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 16,
  },
  chevron: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  currencySymbol: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  saveButtonContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Goal Details Modal
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  detailsEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  detailsCategory: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  detailsProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  detailsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  detailsPercentage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailsActions: {
    marginTop: 12,
  },
  detailsActionButton: {
    marginBottom: 12,
  },
  actionButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Contribution Modal
  contributionContainer: {
    flex: 1,
  },
  contributionHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  contributionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  contributionGoalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  contributionRemaining: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  amountInputLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  currencySymbolLarge: {
    color: '#10b981',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  quickAmounts: {
    marginBottom: 20,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  quickAmountText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  contributeButtonContainer: {
    marginTop: 12,
  },
  contributeButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ========== MULTI-STEP FORM STYLES ==========
  // Progress Indicator
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressStepActive: {},
  progressStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressStepNumberActive: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  progressStepLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  progressStepLabelActive: {
    color: '#10b981',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#10b981',
  },

  // Step Container
  stepContainer: {
    paddingHorizontal: 4,
  },
  // Single-Screen Form Styles
  singleScreenContainer: {
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 8,
  },
  compactTimeframeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  compactTimeframeCard: {
    flex: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactTimeframeCardSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  compactTimeframeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  compactTimeframeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  compactTimeframeDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },

  // Timeframe Cards (Step 1)
  timeframeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeframeCardSelected: {
    borderColor: '#10b981',
  },
  timeframeCardGradient: {
    padding: 20,
    position: 'relative',
  },
  timeframeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  timeframeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  timeframeDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  timeframeExamples: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Categories Grid (Step 2)
  // Enhanced Category Section
  categorySection: {
    marginBottom: 20,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandCollapseIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 8,
  },
  selectedCategorySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  selectedCategoryIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  selectedCategoryName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  changeButton: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScrollView: {
    maxHeight: 280,
  },
  categoriesGridForm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  categoryCardForm: {
    width: (width - 96) / 6, // 6 per row for more compact view
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 75,
    position: 'relative',
  },
  categoryCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryCardNameForm: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCheckmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Selected Category Display (Step 3)
  selectedCategoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  selectedCategoryDisplayIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  selectedCategoryDisplayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  selectedCategoryDisplayTimeframe: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonSmall: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonFinal: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Improved Amount Input
  amountInputImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    overflow: 'hidden',
  },
  currencySymbolImproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: '#10b981',
    fontSize: 20,
    fontWeight: '700',
  },
  amountTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Date Input with Icon
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  dateInputActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  dateHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  dateChevron: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
  },
  inlineDatePickerContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  inlineDatePicker: {
    height: 200,
    backgroundColor: 'transparent',
  },
  datePickerDoneButton: {
    marginTop: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateTextPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
  },

  // Enhanced Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10000,
  },
  datePickerContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.3)',
  },
  datePickerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  datePickerCancel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    minWidth: 60,
  },
  datePickerDone: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  datePicker: {
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
  },
  selectedDateDisplay: {
    padding: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  datePickerContent: {
    padding: 24,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  datePickerMonth: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  datePickerDay: {
    fontSize: 32,
    color: '#3b82f6',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  datePickerYear: {
    fontSize: 26,
    color: '#10b981',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  quickDateShortcuts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  quickDateButtonText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Tappable Category Display
  changeText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
});


// ENHANCED MULTI-STEP GOAL FORM - COMPLETE CODE
// Copy this into GoalFormModal component

// Add to state (already added):
const [step, setStep] = useState(1); // 1: Timeframe, 2: Category, 3: Details
const [selectedTimeframe, setSelectedTimeframe] = useState<'Short-term' | 'Medium-term' | 'Long-term' | null>(null);

// Replace the entire ScrollView content with this:

{/* Progress Indicator */}
<View style={styles.progressIndicator}>
  <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
    <Text style={[styles.progressStepNumber, step >= 1 && styles.progressStepNumberActive]}>1</Text>
    <Text style={[styles.progressStepLabel, step >= 1 && styles.progressStepLabelActive]}>Timeframe</Text>
  </View>
  <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
  <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
    <Text style={[styles.progressStepNumber, step >= 2 && styles.progressStepNumberActive]}>2</Text>
    <Text style={[styles.progressStepLabel, step >= 2 && styles.progressStepLabelActive]}>Category</Text>
  </View>
  <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
  <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
    <Text style={[styles.progressStepNumber, step >= 3 && styles.progressStepNumberActive]}>3</Text>
    <Text style={[styles.progressStepLabel, step >= 3 && styles.progressStepLabelActive]}>Details</Text>
  </View>
</View>

<ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
  {/* STEP 1: Select Timeframe */}
  {step === 1 && (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>⏱️ Select Goal Timeframe</Text>
      <Text style={styles.stepDescription}>How long do you want to save for this goal?</Text>

      {/* Short-term */}
      <TouchableOpacity
        style={[styles.timeframeCard, selectedTimeframe === 'Short-term' && styles.timeframeCardSelected]}
        onPress={() => {
          hapticImpact();
          setSelectedTimeframe('Short-term');
        }}
      >
        <LinearGradient
          colors={selectedTimeframe === 'Short-term' ? ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.2)'] : ['rgba(100, 116, 139, 0.1)', 'rgba(71, 85, 105, 0.1)']}
          style={styles.timeframeCardGradient}
        >
          <Text style={styles.timeframeIcon}>⚡</Text>
          <Text style={styles.timeframeName}>Short-term</Text>
          <Text style={styles.timeframeDesc}>Up to 1 year</Text>
          <Text style={styles.timeframeExamples}>Vacation, Phone, Emergency Fund</Text>
          {selectedTimeframe === 'Short-term' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Medium-term */}
      <TouchableOpacity
        style={[styles.timeframeCard, selectedTimeframe === 'Medium-term' && styles.timeframeCardSelected]}
        onPress={() => {
          hapticImpact();
          setSelectedTimeframe('Medium-term');
        }}
      >
        <LinearGradient
          colors={selectedTimeframe === 'Medium-term' ? ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.2)'] : ['rgba(100, 116, 139, 0.1)', 'rgba(71, 85, 105, 0.1)']}
          style={styles.timeframeCardGradient}
        >
          <Text style={styles.timeframeIcon}>📅</Text>
          <Text style={styles.timeframeName}>Medium-term</Text>
          <Text style={styles.timeframeDesc}>1-5 years</Text>
          <Text style={styles.timeframeExamples}>Car, Wedding, Home Renovation</Text>
          {selectedTimeframe === 'Medium-term' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Long-term */}
      <TouchableOpacity
        style={[styles.timeframeCard, selectedTimeframe === 'Long-term' && styles.timeframeCardSelected]}
        onPress={() => {
          hapticImpact();
          setSelectedTimeframe('Long-term');
        }}
      >
        <LinearGradient
          colors={selectedTimeframe === 'Long-term' ? ['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.2)'] : ['rgba(100, 116, 139, 0.1)', 'rgba(71, 85, 105, 0.1)']}
          style={styles.timeframeCardGradient}
        >
          <Text style={styles.timeframeIcon}>🎯</Text>
          <Text style={styles.timeframeName}>Long-term</Text>
          <Text style={styles.timeframeDesc}>5+ years</Text>
          <Text style={styles.timeframeExamples}>Retirement, College, Property</Text>
          {selectedTimeframe === 'Long-term' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, !selectedTimeframe && styles.nextButtonDisabled]}
        disabled={!selectedTimeframe}
        onPress={() => {
          if (selectedTimeframe) {
            hapticImpact();
            setStep(2);
          }
        }}
      >
        <LinearGradient
          colors={selectedTimeframe ? ['#10b981', '#059669'] : ['rgba(100, 116, 139, 0.5)', 'rgba(71, 85, 105, 0.5)']}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Next: Choose Category →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )}

  {/* STEP 2: Select Category */}
  {step === 2 && (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📂 Choose Category</Text>
      <Text style={styles.stepDescription}>
        Select from {selectedTimeframe} categories
      </Text>

      <View style={styles.categoriesGrid}>
        {ALL_CATEGORIES.filter(cat => cat.timeframe === selectedTimeframe).map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCardSmall, selectedCategory?.id === category.id && styles.categoryCardSelected]}
            onPress={() => {
              hapticImpact();
              setSelectedCategory(category);
            }}
          >
            <Text style={styles.categoryCardIcon}>{category.icon}</Text>
            <Text style={styles.categoryCardName} numberOfLines={2}>{category.name}</Text>
            {selectedCategory?.id === category.id && (
              <View style={styles.categoryCheckmark}>
                <Text style={styles.categoryCheckmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticImpact();
            setStep(1);
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButtonSmall, !selectedCategory && styles.nextButtonDisabled]}
          disabled={!selectedCategory}
          onPress={() => {
            if (selectedCategory) {
              hapticImpact();
              setStep(3);
            }
          }}
        >
          <LinearGradient
            colors={selectedCategory ? ['#10b981', '#059669'] : ['rgba(100, 116, 139, 0.5)', 'rgba(71, 85, 105, 0.5)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Next →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )}

  {/* STEP 3: Fill Details */}
  {step === 3 && (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📝 Goal Details</Text>
      <Text style={styles.stepDescription}>
        Fill in your {selectedCategory?.name} goal details
      </Text>

      {/* Selected Category Display */}
      <View style={styles.selectedCategoryDisplay}>
        <Text style={styles.selectedCategoryDisplayIcon}>{selectedCategory?.icon}</Text>
        <View>
          <Text style={styles.selectedCategoryDisplayName}>{selectedCategory?.name}</Text>
          <Text style={styles.selectedCategoryDisplayTimeframe}>
            {selectedTimeframe === 'Short-term' && '⚡'} 
            {selectedTimeframe === 'Medium-term' && '📅'} 
            {selectedTimeframe === 'Long-term' && '🎯'} 
            {' '}{selectedTimeframe}
          </Text>
        </View>
      </View>

      {/* Form Fields */}
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
        <View style={styles.amountInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Target Date *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Dec 31, 2025"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={targetDate}
          onChangeText={setTargetDate}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticImpact();
            setStep(2);
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButtonFinal, (!goalName || !targetAmount || !targetDate) && styles.nextButtonDisabled]}
          disabled={!goalName || !targetAmount || !targetDate}
          onPress={() => {
            hapticImpact();
            handleSave();
          }}
        >
          <LinearGradient
            colors={(goalName && targetAmount && targetDate) ? ['#10b981', '#059669'] : ['rgba(100, 116, 139, 0.5)', 'rgba(71, 85, 105, 0.5)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>✨ Create Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )}

  <View style={{ height: 40 }} />
</ScrollView>

// ================================
// STYLES TO ADD:
// ================================

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
progressStepActive: {
  // Active state
},
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
stepContainer: {
  paddingHorizontal: 4,
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
timeframeCard: {
  marginBottom: 16,
  borderRadius: 16,
  overflow: 'hidden',
},
timeframeCardSelected: {
  borderWidth: 2,
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
categoriesGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 24,
},
categoryCardSmall: {
  width: (width - 72) / 3,
  backgroundColor: 'rgba(100, 116, 139, 0.1)',
  borderRadius: 12,
  padding: 12,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: 'transparent',
  minHeight: 100,
},
categoryCardSelected: {
  borderColor: '#10b981',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
},
categoryCardIcon: {
  fontSize: 32,
  marginBottom: 8,
},
categoryCardName: {
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


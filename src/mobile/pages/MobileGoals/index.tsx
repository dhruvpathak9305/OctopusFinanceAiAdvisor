import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

// Placeholder goal interface
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: 'on_track' | 'behind' | 'completed';
  targetDate: string;
  category: string;
}

// Placeholder hook to simulate useGoals
const useGoals = () => {
  const [isLoading] = useState(false);
  const [error] = useState(null);
  
  // Mock goals data
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7500,
      status: 'on_track',
      targetDate: '2024-12-31',
      category: 'Savings'
    },
    {
      id: '2',
      title: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 2000,
      status: 'behind',
      targetDate: '2024-08-01',
      category: 'Travel'
    },
    {
      id: '3',
      title: 'Car Down Payment',
      targetAmount: 15000,
      currentAmount: 15000,
      status: 'completed',
      targetDate: '2024-06-01',
      category: 'Transportation'
    }
  ];

  const addGoal = () => {
    Alert.alert('Add Goal', 'Add goal functionality coming soon!');
  };

  const updateGoalProgress = () => {
    Alert.alert('Update Goal', 'Update goal functionality coming soon!');
  };

  return { goals, isLoading, error, addGoal, updateGoalProgress };
};

// Goal Card Component
const GoalCard: React.FC<{ goal: Goal; onUpdate: () => void }> = ({ goal, onUpdate }) => {
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  
  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'on_track': return '#3B82F6';
      case 'behind': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'on_track': return 'On Track';
      case 'behind': return 'Behind';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) }]}>
            <Text style={styles.statusText}>{getStatusText(goal.status)}</Text>
          </View>
        </View>
        <Text style={styles.goalCategory}>{goal.category}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.progressSection}>
          <View style={styles.amountRow}>
            <Text style={styles.currentAmount}>${goal.currentAmount.toLocaleString()}</Text>
            <Text style={styles.targetAmount}>of ${goal.targetAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: getStatusColor(goal.status)
                }
              ]} 
            />
          </View>
          
          <View style={styles.progressDetails}>
            <Text style={styles.progressPercentage}>{progressPercentage.toFixed(1)}% Complete</Text>
            <Text style={styles.targetDate}>Target: {goal.targetDate}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
          <Text style={styles.updateButtonText}>Update Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MobileGoals: React.FC = () => {
  const { goals, isLoading, error, addGoal, updateGoalProgress } = useGoals();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const onTrackGoals = goals.filter(g => g.status === 'on_track' || g.status === 'completed').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Goals Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Goals Overview</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.overviewNumber}>{goals.length} Active Goals</Text>
            <Text style={styles.overviewText}>
              You're on track with {onTrackGoals} goals
            </Text>
          </View>
        </View>

        {/* Goals List */}
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={updateGoalProgress}
          />
        ))}

        {/* Goal Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Goal Actions</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.primaryButton} onPress={addGoal}>
                <Text style={styles.primaryButtonText}>Add Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => Alert.alert('Adjust Goals', 'Adjust goals functionality coming soon!')}
              >
                <Text style={styles.secondaryButtonText}>Adjust Goals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1426',
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1426',
    padding: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
  },
  overviewNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  progressSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  targetAmount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  targetDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  updateButton: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  updateButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MobileGoals; 
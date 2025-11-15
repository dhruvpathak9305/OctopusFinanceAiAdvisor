# 🚀 Goals Management System - Quick Start Guide

**Get the Goals feature up and running in 15 minutes**

---

## 🎯 What You'll Build

By the end of this guide, you'll have:
- ✅ Goals database tables set up
- ✅ TypeScript types configured
- ✅ Basic goals service working
- ✅ Simple UI to create and view goals
- ✅ Contribution tracking functional

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Database Setup (5 min)

```bash
# Connect to your Supabase database
psql -h your-db-host.supabase.co -U postgres -d postgres

# Or use Supabase SQL Editor in the dashboard
```

**Run this minimal schema** (copy-paste into SQL editor):

```sql
-- 1. Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  category VARCHAR(50),
  timeframe VARCHAR(20) NOT NULL CHECK (timeframe IN ('short', 'medium', 'long')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  goal_type VARCHAR(50) DEFAULT 'savings' CHECK (goal_type IN ('savings', 'debt_payoff', 'investment', 'purchase')),
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  monthly_target DECIMAL(15, 2),
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN target_amount > 0 THEN (current_amount / target_amount * 100) ELSE 0 END
  ) STORED,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  health_score INTEGER DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  auto_contribute BOOLEAN DEFAULT false,
  auto_amount DECIMAL(15, 2),
  auto_frequency VARCHAR(20),
  linked_account_id UUID,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP,
  CONSTRAINT valid_dates CHECK (target_date >= start_date)
);

-- 2. Create contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(50) DEFAULT 'manual',
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create milestones table
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  milestone_type VARCHAR(20) DEFAULT 'percentage',
  trigger_percentage DECIMAL(5, 2),
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP,
  display_order INTEGER,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contributions" ON goal_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own contributions" ON goal_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own milestones" ON goal_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own milestones" ON goal_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_contributions_goal_id ON goal_contributions(goal_id, contribution_date DESC);
CREATE INDEX idx_milestones_goal_id ON goal_milestones(goal_id, display_order);

-- 7. Create trigger to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals
  SET 
    current_amount = current_amount + NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT ON goal_contributions
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();
```

✅ **Database setup complete!**

---

### Step 2: TypeScript Types (2 min)

Create or update `types/goal.ts`:

```typescript
// types/goal.ts

export type GoalTimeframe = 'short' | 'medium' | 'long';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalType = 'savings' | 'debt_payoff' | 'investment' | 'purchase';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  emoji?: string;
  category?: string;
  timeframe: GoalTimeframe;
  priority: GoalPriority;
  goal_type: GoalType;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  monthly_target?: number;
  progress_percentage: number;
  status: GoalStatus;
  health_score: number;
  auto_contribute: boolean;
  auto_amount?: number;
  auto_frequency?: string;
  linked_account_id?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_type: string;
  contribution_date: string;
  notes?: string;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  name: string;
  milestone_type: string;
  trigger_percentage?: number;
  is_achieved: boolean;
  achieved_at?: string;
  display_order: number;
  icon?: string;
  color?: string;
  created_at: string;
}
```

✅ **Types ready!**

---

### Step 3: Create Service (3 min)

Create `services/goalsService.ts`:

```typescript
// services/goalsService.ts

import { supabase } from '../lib/supabase/client';
import type { Goal, GoalContribution } from '../types/goal';

export class GoalsService {
  // Fetch all goals
  static async fetchGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  // Create new goal
  static async createGoal(goalData: Partial<Goal>): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const newGoal = {
      ...goalData,
      user_id: user.id,
      current_amount: 0,
      status: 'active',
      health_score: 50,
    };
    
    const { data, error } = await supabase
      .from('goals')
      .insert(newGoal)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create default milestones
    await this.createDefaultMilestones(data.id, user.id);
    
    return data;
  }
  
  // Add contribution
  static async addContribution(
    goalId: string, 
    amount: number, 
    notes?: string
  ): Promise<GoalContribution> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('goal_contributions')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        amount,
        notes,
        contribution_type: 'manual',
        contribution_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Create default milestones
  private static async createDefaultMilestones(goalId: string, userId: string) {
    const milestones = [
      { percentage: 25, name: 'Great Start!', icon: '🎉', color: '#3B82F6' },
      { percentage: 50, name: 'Halfway There!', icon: '🚀', color: '#8B5CF6' },
      { percentage: 75, name: 'Almost There!', icon: '⭐', color: '#F59E0B' },
      { percentage: 100, name: 'Goal Achieved!', icon: '🏆', color: '#10B981' },
    ];
    
    await supabase.from('goal_milestones').insert(
      milestones.map((m, i) => ({
        goal_id: goalId,
        user_id: userId,
        name: m.name,
        milestone_type: 'percentage',
        trigger_percentage: m.percentage,
        icon: m.icon,
        color: m.color,
        display_order: i + 1,
      }))
    );
  }
}
```

✅ **Service created!**

---

### Step 4: Create React Hook (2 min)

Create `hooks/useGoals.ts`:

```typescript
// hooks/useGoals.ts

import { useState, useEffect } from 'react';
import { GoalsService } from '../services/goalsService';
import type { Goal } from '../types/goal';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await GoalsService.fetchGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };
  
  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      const newGoal = await GoalsService.createGoal(goalData);
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      throw err;
    }
  };
  
  const addContribution = async (goalId: string, amount: number, notes?: string) => {
    try {
      await GoalsService.addContribution(goalId, amount, notes);
      // Reload goals to get updated progress
      await loadGoals();
    } catch (err) {
      throw err;
    }
  };
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  return {
    goals,
    loading,
    error,
    createGoal,
    addContribution,
    refresh: loadGoals,
  };
}
```

✅ **Hook ready!**

---

### Step 5: Test It Out (3 min)

Update your existing `src/mobile/pages/MobileGoals/index.tsx` to use the real data:

```typescript
// src/mobile/pages/MobileGoals/index.tsx

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useGoals } from '../../../hooks/useGoals';

export default function MobileGoals() {
  const { goals, loading, error, createGoal, addContribution } = useGoals();
  
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading goals...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Goals</Text>
      
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalCard}>
            <Text style={styles.goalName}>{item.emoji} {item.name}</Text>
            <Text style={styles.goalProgress}>
              ${item.current_amount.toLocaleString()} / ${item.target_amount.toLocaleString()}
            </Text>
            <Text style={styles.goalPercentage}>
              {item.progress_percentage.toFixed(1)}% Complete
            </Text>
            
            <TouchableOpacity
              style={styles.contributeButton}
              onPress={() => addContribution(item.id, 100, 'Quick contribution')}
            >
              <Text style={styles.contributeText}>+ Add $100</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No goals yet. Create your first goal!</Text>
        }
      />
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => createGoal({
          name: 'Emergency Fund',
          emoji: '🛡️',
          target_amount: 10000,
          target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timeframe: 'short',
          priority: 'high',
          goal_type: 'savings',
        })}
      >
        <Text style={styles.createText}>+ Create Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#1a1f2e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  goalCard: { 
    backgroundColor: '#252d3f', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  goalName: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 8 },
  goalProgress: { fontSize: 16, color: '#10B981', marginBottom: 4 },
  goalPercentage: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
  contributeButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contributeText: { color: '#fff', fontWeight: '600' },
  createButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  error: { color: '#EF4444', fontSize: 16 },
});
```

✅ **UI connected!**

---

## 🎉 Test Your Setup

1. **Reload your app**
2. **Navigate to Goals tab**
3. **Tap "Create Goal"** → Should create an Emergency Fund goal
4. **Tap "+ Add $100"** → Should add contribution and update progress
5. **See the progress update in real-time!**

---

## 🚀 What's Next?

Now that you have the basics working, you can:

### Immediate Enhancements (30 min each)
1. **Add Progress Ring**: Install `react-native-svg` and create circular progress
2. **Milestone Notifications**: Show celebration when reaching 25%, 50%, 75%, 100%
3. **Goal Details Screen**: Create detailed view with contribution history
4. **Better UI**: Add gradients, animations, and improved styling

### Next Features (1-2 hours each)
1. **Goal Creation Form**: Multi-step wizard for creating goals
2. **Contribution Modal**: Better UX for adding contributions
3. **Automation Rules**: Set up recurring transfers
4. **Analytics Dashboard**: Show insights and predictions

### Advanced Features (1-2 days each)
1. **AI Predictions**: Implement completion forecasting
2. **Health Score**: Calculate and display goal health
3. **Recommendations**: Build optimization suggestions engine
4. **Gamification**: Add achievements and badges

---

## 📚 Full Documentation

For complete implementation details, see:
- [Goals Management System](./GOALS_MANAGEMENT_SYSTEM.md) - Complete feature guide
- [Implementation Plan](./GOALS_IMPLEMENTATION_PLAN.md) - Detailed roadmap
- [Goals Index](./GOALS_INDEX.md) - Documentation index

---

## ❓ Troubleshooting

### "Permission denied" error
→ Check RLS policies are created correctly
→ Verify user is authenticated

### Goals not showing up
→ Check database connection
→ Verify `user_id` matches authenticated user
→ Check `archived_at` is null

### Contributions not updating progress
→ Verify trigger `trigger_update_goal_progress` is created
→ Check contribution amount is positive
→ Look for errors in Supabase logs

### Need help?
→ Check Supabase logs for detailed errors
→ Review the database schema
→ Ensure all tables have RLS enabled

---

## ✅ Checklist

- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] TypeScript types defined
- [ ] Service layer implemented
- [ ] React hook created
- [ ] UI connected and displaying goals
- [ ] Can create new goals
- [ ] Can add contributions
- [ ] Progress updates automatically
- [ ] No console errors

---

**Congratulations!** 🎉 You now have a working Goals Management System!

**Last Updated**: November 14, 2025
**Time to Complete**: ~15 minutes
**Difficulty**: Beginner-Friendly


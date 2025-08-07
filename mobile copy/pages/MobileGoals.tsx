import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { GoalCard } from '../../features/goals/components/GoalCard';
import { useGoals } from '../../features/goals/hooks/useGoals';
import { LoadingSpinner } from '../../common/components/ui/LoadingSpinner';

const MobileGoals: React.FC = () => {
  const { goals, isLoading, error, addGoal, updateGoalProgress } = useGoals();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Goals Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-medium">{goals.length} Active Goals</p>
            <p className="text-sm text-muted-foreground">
              You're on track with {goals.filter(g => g.status === 'on_track' || g.status === 'completed').length} goals
            </p>
          </div>
        </CardContent>
      </Card>

      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onUpdate={updateGoalProgress}
        />
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Goal Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              onClick={() => {
                // TODO: Implement add goal modal
              }}
            >
              Add Goal
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // TODO: Implement adjust goals modal
              }}
            >
              Adjust Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileGoals; 
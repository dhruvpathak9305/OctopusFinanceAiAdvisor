import React from 'react';

const MobileBudget: React.FC = () => {
  return (
    <div className="mobile-budget">
      <div className="grid gap-4">
        <div className="finance-card p-4">
          <h2 className="text-xl font-semibold mb-2">Monthly Budget</h2>
          <p className="text-muted-foreground">Your monthly budget overview will appear here</p>
        </div>

        <div className="finance-card p-4">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <p className="text-muted-foreground">Your budget categories will appear here</p>
        </div>

        <div className="finance-card p-4">
          <h2 className="text-xl font-semibold mb-2">Spending Analysis</h2>
          <p className="text-muted-foreground">Your spending analysis will appear here</p>
        </div>

        <div className="finance-card p-4">
          <h2 className="text-xl font-semibold mb-2">Budget Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-primary p-2 rounded">Set Budget</button>
            <button className="btn-secondary p-2 rounded">Add Category</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBudget; 
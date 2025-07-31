import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';

const MobilePortfolio: React.FC = () => {
  return (
    <div className="mobile-portfolio">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">$25,000</p>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                Chart placeholder
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Stocks</p>
                  <p className="text-lg">60%</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Bonds</p>
                  <p className="text-lg">25%</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Cash</p>
                  <p className="text-lg">10%</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">Other</p>
                  <p className="text-lg">5%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Today</span>
                <span className="text-emerald">+1.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="text-coral">-0.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Month</span>
                <span className="text-emerald">+3.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default">Buy/Sell</Button>
              <Button variant="secondary">Rebalance</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobilePortfolio; 
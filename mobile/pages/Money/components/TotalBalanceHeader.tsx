import React from 'react';
import { Clock, Info } from 'lucide-react';
import { formatINR, formatTimeAgo } from './utils/formatters';

interface TotalBalanceHeaderProps {
  totalBalance: number;
  lastSyncTime: string;
  title?: string;
}

const TotalBalanceHeader: React.FC<TotalBalanceHeaderProps> = ({
  totalBalance,
  lastSyncTime,
  title = 'Total Balance',
}) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
      </div>
      
      {/* Total Balance with Gradient Effect */}
      <div className="relative">
        <p className="text-3xl sm:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {formatINR(totalBalance)}
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <Clock className="h-3 w-3" />
        <span>
          {formatTimeAgo(lastSyncTime)}
          <span className="ml-1">
            •{' '}
            {new Date(lastSyncTime).toLocaleTimeString('en-IN', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </span>
      </div>
    </div>
  );
};

export default TotalBalanceHeader; 
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  List, 
  Grid3X3, 
  Eye, 
  EyeOff,
  ArrowUpDown
} from 'lucide-react';

type ViewMode = 'list' | 'grid';
type SortOption = 'largest' | 'smallest' | 'recent' | 'oldest';

interface ListGridToggleBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  includeGenerational: boolean;
  onToggleGenerational: () => void;
  classFilter: 'all' | 'assets' | 'liabilities';
  onClearFilter: () => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ListGridToggleBar: React.FC<ListGridToggleBarProps> = ({
  viewMode,
  onViewModeChange,
  includeGenerational,
  onToggleGenerational,
  classFilter,
  onClearFilter,
  sortOption,
  onSortChange,
}) => {
  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'largest': return 'Largest First';
      case 'smallest': return 'Smallest First';
      case 'recent': return 'Recently Updated';
      case 'oldest': return 'Oldest First';
      default: return 'Sort';
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left Side - Generational Wealth Toggle and Filter Status */}
      <div className="flex items-center space-x-2">
        {/* Generational Wealth Toggle */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">Generation</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleGenerational}
            className="p-1 h-8 w-8"
            title={includeGenerational ? 'Hide Generational Assets' : 'Show Generational Assets'}
          >
            {includeGenerational ? (
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            ) : (
              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {/* Filter Status Indicator */}
        {classFilter !== 'all' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilter}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            {classFilter === 'assets' ? 'Assets' : 'Liabilities'} ✕
          </Button>
        )}
      </div>
      
      {/* Right Side - View Toggle and Sort */}
      <div className="flex items-center space-x-2">
        {/* View Toggle with Icons */}
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="h-8 sm:h-9 px-2"
          title="List View"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="h-8 sm:h-9 px-2"
          title="Grid View"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2"
              title="Sort Options"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange('largest')}>
              Largest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('smallest')}>
              Smallest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('recent')}>
              Recently Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('oldest')}>
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ListGridToggleBar; 
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddAssetCTAProps {
  onAddAsset: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
  title?: string;
}

const AddAssetCTA: React.FC<AddAssetCTAProps> = ({
  onAddAsset,
  size = 'sm',
  variant = 'outline',
  className = '',
  showText = false,
  title = 'Add New Asset',
}) => {
  const getButtonSize = () => {
    switch (size) {
      case 'lg': return 'p-2 h-10 w-10';
      case 'md': return 'p-1.5 h-8 w-8';
      case 'sm': return 'p-1 h-6 w-6';
      default: return 'p-1 h-8 w-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'lg': return 'w-5 h-5';
      case 'md': return 'w-4 h-4';
      case 'sm': return 'w-3 h-3';
      default: return 'w-4 h-4';
    }
  };

  if (showText) {
    return (
      <Button
        variant={variant}
        size="sm"
        onClick={onAddAsset}
        className={`text-xs sm:text-sm ${className}`}
        title={title}
      >
        <Plus className={`${getIconSize()} mr-2`} />
        Add Asset
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onAddAsset}
      className={`${getButtonSize()} ${className}`}
      title={title}
    >
      <Plus className={getIconSize()} />
    </Button>
  );
};

export default AddAssetCTA; 
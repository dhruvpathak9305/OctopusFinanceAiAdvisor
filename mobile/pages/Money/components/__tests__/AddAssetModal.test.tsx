import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddAssetModal from '../AddAssetModal';

// Mock the ASSET_CATEGORIES
jest.mock('../NetWorthSection', () => ({
  ASSET_CATEGORIES: [
    {
      id: 'liquid',
      name: 'Liquid Assets',
      subcategories: ['Cash & Bank Accounts', 'Money Market & Short-term', 'Digital Wallets']
    },
    {
      id: 'equity',
      name: 'Investments - Equity',
      subcategories: ['Direct Equity', 'Equity Mutual Funds', 'Employee Stock Benefits']
    }
  ]
}));

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onAddAsset: jest.fn(),
  defaultCategory: 'liquid',
  mode: 'asset' as const,
  assetType: 'asset' as const
};

describe('AddAssetModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal correctly when open', () => {
    render(<AddAssetModal {...defaultProps} />);
    
    expect(screen.getByText('Add New Asset')).toBeInTheDocument();
    expect(screen.getByLabelText('Asset Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Value (₹) *')).toBeInTheDocument();
    
    // Check for golden border (by checking dialog classes)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('border-2', 'border-yellow-400');
  });

  it('validates required fields', async () => {
    render(<AddAssetModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Add Asset' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Asset name is required')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid positive amount')).toBeInTheDocument();
      expect(screen.getByText('Please select a subcategory')).toBeInTheDocument();
    });
  });

  it('validates numeric value field', async () => {
    render(<AddAssetModal {...defaultProps} />);
    
    // Fill in name
    fireEvent.change(screen.getByLabelText('Asset Name *'), { target: { value: 'Test Asset' } });
    
    // Enter invalid value
    fireEvent.change(screen.getByLabelText('Value (₹) *'), { target: { value: 'invalid' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Asset' }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive amount')).toBeInTheDocument();
    });
  });

  it('handles toggle switches correctly', () => {
    render(<AddAssetModal {...defaultProps} />);
    
    // Find switches by their purpose (look for visible elements)
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBe(2);
    
    // Both should be checked by default
    switches.forEach(switchElement => {
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('calls onOpenChange when close button is clicked', () => {
    const onOpenChange = jest.fn();
    render(<AddAssetModal {...defaultProps} onOpenChange={onOpenChange} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when cancel button is clicked', () => {
    const onOpenChange = jest.fn();
    render(<AddAssetModal {...defaultProps} onOpenChange={onOpenChange} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows plus buttons for category and subcategory in asset mode', () => {
    render(<AddAssetModal {...defaultProps} />);
    
    // Should have plus buttons next to category and subcategory dropdowns
    const allButtons = screen.getAllByRole('button');
    const plusButtons = allButtons.filter(button => {
      // Check if button contains a plus icon (empty name buttons with specific classes)
      return button.getAttribute('title')?.includes('Add new');
    });
    
    expect(plusButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('handles add category button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<AddAssetModal {...defaultProps} />);
    
    // Find the category plus button
    const categoryPlusButton = screen.getByTitle('Add new category');
    fireEvent.click(categoryPlusButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Add new category', '');
    
    consoleSpy.mockRestore();
  });

  it('handles add subcategory button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<AddAssetModal {...defaultProps} />);
    
    // Find the subcategory plus button
    const subcategoryPlusButton = screen.getByTitle('Add new subcategory');
    fireEvent.click(subcategoryPlusButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Add new subcategory', '');
    
    consoleSpy.mockRestore();
  });

  it('has mobile-responsive styling', () => {
    render(<AddAssetModal {...defaultProps} />);
    
    // Check for mobile-responsive classes
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('max-h-[90vh]');
    
    const title = screen.getByText('Add New Asset');
    expect(title).toHaveClass('text-base', 'sm:text-lg');
    
    // Check for golden border enhancement
    expect(modal).toHaveClass('border-2', 'border-yellow-400');
  });

  it('renders form fields with correct structure', () => {
    render(<AddAssetModal {...defaultProps} />);
    
    // Check that all required fields are present in asset mode
    expect(screen.getByLabelText('Asset Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Category *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subcategory *')).toBeInTheDocument();
    expect(screen.getByLabelText('Value (₹) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes (Optional)')).toBeInTheDocument();
    
    // Check for dropdowns (comboboxes)
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBe(2); // Category and Subcategory
    
    // Check for submit and cancel buttons
    expect(screen.getByRole('button', { name: 'Add Asset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddAssetModal {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Add New Asset')).not.toBeInTheDocument();
  });

  // Category mode tests
  describe('Category Mode', () => {
    const categoryProps = {
      ...defaultProps,
      mode: 'category' as const,
    };

    it('renders category creation modal correctly', () => {
      render(<AddAssetModal {...categoryProps} />);
      
      expect(screen.getByText('Add New Asset Class')).toBeInTheDocument();
      expect(screen.getByLabelText('Category Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Type *')).toBeInTheDocument();
    });

    it('does not show category/subcategory dropdowns in category mode', () => {
      render(<AddAssetModal {...categoryProps} />);
      
      expect(screen.queryByLabelText('Category *')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Subcategory *')).not.toBeInTheDocument();
    });

    it('shows correct submit button text in category mode', () => {
      render(<AddAssetModal {...categoryProps} />);
      
      expect(screen.getByRole('button', { name: 'Create Category' })).toBeInTheDocument();
    });
  });

  // Enhanced Modal Features
  describe('Enhanced Modal Features', () => {
    it('displays golden border with proper styling', () => {
      render(<AddAssetModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('border-2', 'border-yellow-400', 'bg-background');
    });

    it('has proper flex layout for plus buttons', () => {
      render(<AddAssetModal {...defaultProps} />);
      
      // Check that plus buttons have correct titles
      expect(screen.getByTitle('Add new category')).toBeInTheDocument();
      expect(screen.getByTitle('Add new subcategory')).toBeInTheDocument();
    });

    it('maintains responsive design on mobile', () => {
      render(<AddAssetModal {...defaultProps} />);
      
      // Check for responsive text sizing
      const labels = screen.getAllByText(/\*/);
      labels.forEach(label => {
        const labelElement = label.closest('label');
        if (labelElement) {
          expect(labelElement).toHaveClass('text-xs', 'sm:text-sm');
        }
      });
    });

    it('shows proper plus icon placement', () => {
      render(<AddAssetModal {...defaultProps} />);
      
      // Find plus buttons by their titles
      const categoryPlusButton = screen.getByTitle('Add new category');
      const subcategoryPlusButton = screen.getByTitle('Add new subcategory');
      
      expect(categoryPlusButton).toBeInTheDocument();
      expect(subcategoryPlusButton).toBeInTheDocument();
    });
  });
}); 
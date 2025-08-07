import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmountFilterProps {
  onClose: () => void;
  onConfirm: (min: number | undefined, max: number | undefined) => void;
  initialMin?: number;
  initialMax?: number;
}

const AmountFilter: React.FC<AmountFilterProps> = ({
  onClose,
  onConfirm,
  initialMin,
  initialMax
}) => {
  const [activeField, setActiveField] = useState<'min' | 'max'>('min');
  const [minAmount, setMinAmount] = useState(initialMin?.toString() || '');
  const [maxAmount, setMaxAmount] = useState(initialMax?.toString() || '');

  const handleNumberPress = (num: string) => {
    const currentValue = activeField === 'min' ? minAmount : maxAmount;
    const newValue = currentValue + num;
    
    if (activeField === 'min') {
      setMinAmount(newValue);
    } else {
      setMaxAmount(newValue);
    }
  };

  const handleBackspace = () => {
    const currentValue = activeField === 'min' ? minAmount : maxAmount;
    const newValue = currentValue.slice(0, -1);
    
    if (activeField === 'min') {
      setMinAmount(newValue);
    } else {
      setMaxAmount(newValue);
    }
  };

  const handleConfirm = () => {
    const min = minAmount ? parseFloat(minAmount) : undefined;
    const max = maxAmount ? parseFloat(maxAmount) : undefined;
    onConfirm(min, max);
  };

  const NumberButton: React.FC<{ value: string }> = ({ value }) => (
    <Button
      variant="ghost"
      className="flex-1 h-16 text-xl font-medium text-white hover:bg-gray-800"
      onClick={() => handleNumberPress(value)}
    >
      {value}
    </Button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-white">Amount</h2>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div 
            className={cn(
              "p-4 rounded-lg border border-gray-800 cursor-pointer",
              activeField === 'min' && "border-primary"
            )}
            onClick={() => setActiveField('min')}
          >
            <label className="block text-sm text-gray-400 mb-1">Min.</label>
            <input
              type="text"
              className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
              placeholder="0"
              value={minAmount}
              readOnly
            />
          </div>

          <div 
            className={cn(
              "p-4 rounded-lg border border-gray-800 cursor-pointer",
              activeField === 'max' && "border-primary"
            )}
            onClick={() => setActiveField('max')}
          >
            <label className="block text-sm text-gray-400 mb-1">Max.</label>
            <input
              type="text"
              className="w-full bg-transparent text-white text-lg font-medium focus:outline-none"
              placeholder="0"
              value={maxAmount}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Number Pad */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4">
          {/* First Row */}
          <NumberButton value="7" />
          <NumberButton value="8" />
          <NumberButton value="9" />
          <Button
            variant="ghost"
            className="flex-1 h-16 text-xl font-medium text-white hover:bg-gray-800"
            onClick={handleBackspace}
          >
            ⌫
          </Button>

          {/* Second Row */}
          <NumberButton value="4" />
          <NumberButton value="5" />
          <NumberButton value="6" />
          <Button
            variant="ghost"
            className="flex-1 h-16 text-xl font-medium text-white hover:bg-gray-800"
            onClick={() => handleNumberPress('.')}
          >
            .
          </Button>

          {/* Third Row */}
          <NumberButton value="1" />
          <NumberButton value="2" />
          <NumberButton value="3" />
          <Button
            variant="ghost"
            className="flex-1 h-16 text-xl font-medium text-white hover:bg-gray-800"
            onClick={() => handleNumberPress('000')}
          >
            000
          </Button>

          {/* Fourth Row */}
          <NumberButton value="00" />
          <NumberButton value="0" />
          <Button
            variant="ghost"
            className="flex-1 h-16 text-xl font-medium text-white hover:bg-gray-800"
            onClick={() => setActiveField(activeField === 'min' ? 'max' : 'min')}
          >
            Next
          </Button>
          <Button
            variant="default"
            className="flex-1 h-16 text-xl font-medium bg-primary hover:bg-primary/90"
            onClick={handleConfirm}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AmountFilter; 
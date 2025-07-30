import React from 'react';
import { TamaguiProvider, Button, YStack, XStack, Text } from '@tamagui/core';
import { config } from '@tamagui/config/v3';

interface TamaguiButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const TamaguiButton: React.FC<TamaguiButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
}) => {
  return (
    <TamaguiProvider config={config}>
      <Button
        size={size}
        backgroundColor={variant === 'primary' ? '#10B981' : 
                       variant === 'secondary' ? '#1F2937' : 'transparent'}
        borderColor={variant === 'outline' ? '#10B981' : 'transparent'}
        borderWidth={variant === 'outline' ? 1 : 0}
        color={variant === 'outline' ? '#10B981' : '#FFFFFF'}
        onPress={onPress}
        borderRadius={8}
        pressStyle={{
          backgroundColor: variant === 'primary' ? '#059669' : 
                          variant === 'secondary' ? '#374151' : 'rgba(16, 185, 129, 0.1)',
        }}
        hoverStyle={{
          backgroundColor: variant === 'primary' ? '#059669' : 
                          variant === 'secondary' ? '#374151' : 'rgba(16, 185, 129, 0.1)',
        }}
      >
        <Text
          color={variant === 'outline' ? '#10B981' : '#FFFFFF'}
          fontWeight="600"
          fontSize={size === 'small' ? 14 : size === 'large' ? 18 : 16}
        >
          {title}
        </Text>
      </Button>
    </TamaguiProvider>
  );
};

// Example usage with Tamagui utility styling
export const TamaguiExampleCard = () => {
  return (
    <TamaguiProvider config={config}>
      <YStack
        backgroundColor="#1F2937"
        borderRadius={12}
        padding={20}
        marginVertical={8}
        shadowColor="#000"
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={4}
      >
        <XStack alignItems="center" marginBottom={12}>
          <Text fontSize={24} marginRight={12}>🎯</Text>
          <Text fontSize={18} fontWeight="600" color="#FFFFFF">
            Tamagui Styled Component
          </Text>
        </XStack>
        
        <Text fontSize={14} color="#9CA3AF" lineHeight={20} marginBottom={16}>
          This demonstrates Tailwind-like utility styling with Tamagui
        </Text>
        
        <XStack gap={12}>
          <TamaguiButton
            title="Primary"
            onPress={() => console.log('Primary pressed')}
            variant="primary"
          />
          <TamaguiButton
            title="Outline"
            onPress={() => console.log('Outline pressed')}
            variant="outline"
          />
        </XStack>
      </YStack>
    </TamaguiProvider>
  );
}; 
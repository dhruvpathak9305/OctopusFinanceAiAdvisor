/**
 * =============================================================================
 * PARTICLE FIELD COMPONENT
 * =============================================================================
 * 
 * Ambient background with floating particles and gradient orbs
 * Adapts web ParticleField to React Native with Animated API
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const FloatingParticle: React.FC<{ particle: Particle }> = ({ particle }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(particle.opacity);

  useEffect(() => {
    // All animations must be consistent - using Reanimated's worklet-based system
    const randomX = Math.random() * 20 - 10;
    
    translateY.value = withRepeat(
      withSequence(
        withTiming(-30, { 
          duration: particle.duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        withTiming(0, { 
          duration: particle.duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(randomX, { 
          duration: particle.duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        withTiming(0, { 
          duration: particle.duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(particle.opacity * 1.5, { 
          duration: (particle.duration / 2) * 1000 
        }),
        withTiming(particle.opacity, { 
          duration: (particle.duration / 2) * 1000 
        })
      ),
      -1,
      false
    );

    // Cleanup on unmount
    return () => {
      translateY.value = 0;
      translateX.value = 0;
      opacity.value = particle.opacity;
    };
  }, [particle.duration, particle.opacity, particle.id, translateY, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const GradientOrb: React.FC<{ 
  colors: string[];
  position: { top?: string; bottom?: string; left?: string; right?: string };
  size: number;
  duration: number;
}> = ({ colors, position, size, duration }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(50, { 
          duration: duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        withTiming(0, { 
          duration: duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1,
      false
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(30, { 
          duration: duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        }),
        withTiming(0, { 
          duration: duration * 1000, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { 
          duration: (duration / 2) * 1000 
        }),
        withTiming(1, { 
          duration: (duration / 2) * 1000 
        })
      ),
      -1,
      false
    );

    // Cleanup on unmount
    return () => {
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
    };
  }, [duration, translateX, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        position,
        { width: size, height: size },
        animatedStyle,
      ]}
    >
      <BlurView intensity={80} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </BlurView>
    </Animated.View>
  );
};

export const ParticleField: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = [];
    // Match web: 25 particles with specific parameters
    for (let i = 0; i < 25; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1, // Match web
        duration: Math.random() * 15 + 10, // Match web
        delay: Math.random() * 5, // Match web
        opacity: Math.random() * 0.3 + 0.1, // Match web
      });
    }
    setParticles(generated);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Match web: Gradient orbs with specific parameters */}
      <GradientOrb
        colors={['rgba(255, 140, 50, 0.15)', 'transparent']} // Match web primary color
        position={{ top: '10%', left: '-10%' }}
        size={384} // w-96 = 384px
        duration={20} // Match web
      />
      <GradientOrb
        colors={['rgba(245, 166, 35, 0.1)', 'transparent']} // Match web gold color
        position={{ bottom: '20%', right: '-5%' }}
        size={320} // w-80 = 320px
        duration={25} // Match web
      />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});


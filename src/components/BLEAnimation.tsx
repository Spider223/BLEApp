import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BLEAnimationData } from '../types/ble';
import { demoDataGenerator } from '../utils/demoData';

const { width, height } = Dimensions.get('window');

interface BLEAnimationProps {
  data: BLEAnimationData[];
  type: BLEAnimationData['type'];
}

export const BLEAnimation: React.FC<BLEAnimationProps> = ({ data, type }) => {
  const pulseValue = useSharedValue(0);
  const waveValue = useSharedValue(0);
  const dataValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  // Get the latest data value
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;

  // Generate demo data if no real data is available
  useEffect(() => {
    if (data.length === 0) {
      // Start demo data generation
      demoDataGenerator.startGenerating(type, () => {
        // Demo data will be handled by the parent component
      });

      return () => {
        demoDataGenerator.stopGenerating();
      };
    }
  }, [data.length, type]);

  // Pulse animation
  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [pulseValue]);

  // Wave animation
  useEffect(() => {
    waveValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, [waveValue]);

  // Data-driven animation
  useEffect(() => {
    dataValue.value = withSpring(latestValue / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [latestValue, dataValue]);

  // Rotation animation
  useEffect(() => {
    rotationValue.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, [rotationValue]);

  // Pulse circle animation
  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseValue.value,
      [0, 1],
      [1, 1.2],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      pulseValue.value,
      [0, 1],
      [0.8, 0.2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Wave animation
  const waveStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      waveValue.value,
      [0, 1],
      [0, -20],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      waveValue.value,
      [0, 1],
      [1, 1.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity: interpolate(
        waveValue.value,
        [0, 1],
        [0.6, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  // Data visualization
  const dataStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      dataValue.value,
      [0, 1],
      [0.5, 2],
      Extrapolate.CLAMP
    );
    const rotate = interpolate(
      dataValue.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  // Rotating elements
  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationValue.value}deg` }],
    };
  });

  // Get color based on data type
  const getColor = () => {
    switch (type) {
      case 'heartbeat':
        return '#FF6B6B';
      case 'temperature':
        return '#4ECDC4';
      case 'humidity':
        return '#45B7D1';
      case 'pressure':
        return '#96CEB4';
      default:
        return '#FF6B6B';
    }
  };

  // Get icon based on data type
  const getIcon = () => {
    switch (type) {
      case 'heartbeat':
        return '❤️';
      case 'temperature':
        return '🌡️';
      case 'humidity':
        return '💧';
      case 'pressure':
        return '🌪️';
      default:
        return '📊';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background waves */}
      <Animated.View style={[styles.wave, waveStyle, { backgroundColor: getColor() }]} />
      <Animated.View style={[styles.wave, waveStyle, { backgroundColor: getColor() }]} />

      {/* Main pulse circle */}
      <Animated.View style={[styles.pulseCircle, pulseStyle, { borderColor: getColor() }]} />

      {/* Data-driven visualization */}
      <Animated.View style={[styles.dataVisualization, dataStyle]}>
        <Animated.View style={[styles.rotatingElement, rotationStyle]}>
          <View style={[styles.iconContainer, { backgroundColor: getColor() }]}>
            <Animated.Text style={styles.icon}>{getIcon()}</Animated.Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Data value display */}
      <View style={styles.valueContainer}>
        <Animated.Text style={[styles.value, { color: getColor() }]}>
          {latestValue.toFixed(1)}
        </Animated.Text>
        <Animated.Text style={[styles.unit, { color: getColor() }]}>
          {type === 'heartbeat' ? 'BPM' :
           type === 'temperature' ? '°C' :
           type === 'humidity' ? '%' : 'hPa'}
        </Animated.Text>
      </View>

      {/* Data points visualization */}
      <View style={styles.dataPointsContainer}>
        {data.slice(-10).map((point, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dataPoint,
              {
                backgroundColor: getColor(),
                opacity: interpolate(
                  index,
                  [0, 9],
                  [0.3, 1],
                  Extrapolate.CLAMP
                ),
                height: interpolate(
                  point.value,
                  [0, 100],
                  [5, 30],
                  Extrapolate.CLAMP
                ),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  pulseCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  dataVisualization: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 40,
  },
  valueContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginTop: 2,
  },
  dataPointsContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    gap: 2,
  },
  dataPoint: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#FF6B6B',
  },
});
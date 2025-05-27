import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, Dimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const AnimatedGradientBackground = ({ children }) => {
  const translateX = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: width,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated shimmer gradient */}
      <Animated.View
        style={[
          styles.animatedStrip,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(134, 57, 18, 0.91)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Children on top of red background */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  animatedStrip: {
    position: 'absolute',
    width: '150%',
    height: '100%',
    zIndex: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedGradientBackground;

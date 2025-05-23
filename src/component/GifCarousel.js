import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, Dimensions, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const gifs = [
  {
    key: 'face',
    source: require('../../assets/gif/FacetoImage.gif'),
    label: 'Enhance Face',
    screen: 'FaceEnhanceScreen',
  },
  {
    key: 'ghibli',
    // source: require('../assets/gifs/ghiblify.gif'),
    label: 'Ghiblify',
    screen: 'GhibliScreen',
  },
  {
    key: 'colorize',
    // source: require('../assets/gifs/colorizer.gif'),
    label: 'Colorize B&W',
    screen: 'ColorizeScreen',
  },
  {
    key: 'diffusion',
    // source: require('../assets/gifs/text2img.gif'),
    label: 'Text to Image',
    screen: 'Text2ImageScreen',
  },
];

const GifCarousel = () => {
  const scrollViewRef = useRef();
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % gifs.length;
      scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
      setIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {gifs.map((item, i) => (
          <TouchableOpacity key={item.key} onPress={() => handlePress(item.screen)}>
            <View style={styles.card}>
              <Image source={item.source} style={styles.gif} resizeMode="cover" />
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  card: {
    width,
    alignItems: 'center',
    paddingVertical: 10,
  },
  gif: {
    width: width * 0.9,
    height: 250,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GifCarousel;

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {auth} from '../services/Firebase'

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs'); 
    }, 2000); 
    return () => clearTimeout(timer); 
  }, []);

  return (
      <View style={styles.container}>
   <View style={styles.logoWrapper}>
  <LinearGradient
    colors={['#e0e0e0', '#bdbdbd', '#757575']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.logoBackground}
  />
  <Image
    source={require('../../assets/EV_logo.png')}
    style={styles.logo}
  />
</View>
   <Text style={styles.text}>Welcome to AI Image Editor</Text>
</View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center', 
  },
 logoWrapper: {
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},

logoBackground: {
  width: 150,
  height: 150,
  borderRadius: 75,
  position: 'absolute',
  zIndex: 0,
},

logo: {
  width: 200,
  height: 200,
  resizeMode: 'contain',
  zIndex: 1,
},
  text: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5364',
  },
});
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
      <Image
        source={require('../../assets/EV_logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.text}>Welcome to My App</Text>
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
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

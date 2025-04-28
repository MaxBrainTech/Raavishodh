import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {  StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './src/screens/Homescreen';
import FaceEnhancement from './src/screens/FaceEnhancement';
import TextToImage from './src/screens/TextToImage'
import TextToImageDiffusion from './src/screens/TextToImageDiffusion'
import BackgroundRemoval from './src/screens/BackgroundRemoval'
import FaceToImage from './src/screens/FaceToImage'
import SuperResolution from './src/screens/SuperResolution'
import GhiblifyScreen from "./src/screens/GhiblifyScreen"; 
import BwColourization from "./src/screens/BwColourization"; 
import ProfileScreen from "./src/screens/ProfileScreen"; 
import EditProfileScreen from "./src/screens/EditProfileScreen"; 
import PrivacySetting from "./src/screens/PrivacySetting"; 
import Terms from "./src/screens/Terms"; 
import Cookies from "./src/screens/Cookies"; 
import Faq from "./src/screens/Faq"; 
import PhotoRestoration from "./src/screens/PhotoRestoration"; 
import LoginScreen from "./src/screens/LoginScreen"; 
import SignupScreen from "./src/screens/SignupScreen"; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Gradient background for the tab bar
function MyTabBarBackground() {
  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

// Stack for Home
function HomeStack() {
  return (
    
      <Stack.Navigator>
        <Stack.Screen
         name="Home" component={HomeScreen}
        options={{ headerShown: false }}  />

        <Stack.Screen
         name="FaceEnhancement" component={FaceEnhancement}
        options={{ headerShown: false }}  />
     

      <Stack.Screen
      name="TextToImage" component={TextToImage}
      options={{ headerShown: false}} />

      <Stack.Screen
      name='TextToImageDiffusion' component={TextToImageDiffusion}
      options={{ headerShown: false}} />
     
    <Stack.Screen
    name='BackgroundRemoval' component={BackgroundRemoval}
    options={{ headerShown: false}} />

    <Stack.Screen
    name='FaceToImage' component={FaceToImage}
    options={{ headerShown: false}} />

    <Stack.Screen
    name='SuperResolution' component={SuperResolution}
    options={{ headerShown: false}} />

    <Stack.Screen
    name="GhiblifyScreen" component ={GhiblifyScreen}
    options={{ headerShown: false}} />

    <Stack.Screen
    name="BwColourization" component ={BwColourization}
    options={{ headerShown: false}} />

    <Stack.Screen
    name="PhotoRestoration" component ={PhotoRestoration}
    options={{ headerShown: false}} />

    <Stack.Screen
    name="Login" component ={LoginScreen}
    options={{ headerShown: false}} />

    <Stack.Screen
    name="SignUp" component ={SignupScreen}
    options={{ headerShown: false}} />

 </Stack.Navigator>

  );
}
  
// Stack for Enhance
function GhibliStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GhiblifyScreen" component={GhiblifyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Stack for Profile
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="PrivacySetting" component={PrivacySetting}  options={{headerShown: false}} />
      <Stack.Screen name="Terms" component={Terms}  options={{headerShown: false}} />
      <Stack.Screen name="Cookies" component={Cookies}  options={{headerShown: false}} />
      <Stack.Screen name="Faq" component={Faq}  options={{headerShown: false}} />
      <Stack.Screen name="Login" component={LoginScreen}  options={{headerShown: false}} />
      <Stack.Screen name="Signup" component={SignupScreen}  options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarBackground: () => <MyTabBarBackground />,
          tabBarActiveTintColor: '#00d4ff',
          tabBarInactiveTintColor: '#d1d1d1',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'GhibliTab') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Icon name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
        <Tab.Screen name="GhibliTab" component={GhibliStack} options={{ title: 'Ghibli' }} />
        <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
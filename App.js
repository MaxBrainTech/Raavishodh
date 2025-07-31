import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/Firebase';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/Homescreen';
import FaceEnhancement from './src/screens/FaceEnhancement';
import TextToImage from './src/screens/TextToImage';
import TextToImageDiffusion from './src/screens/TextToImageDiffusion';
import BackgroundRemoval from './src/screens/BackgroundRemoval';
import FaceToImage from './src/screens/FaceToImage';
import SuperResolution from './src/screens/SuperResolution';
import GhiblifyScreen from './src/screens/GhiblifyScreen';
import BwColourization from './src/screens/BwColourization';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import PrivacySetting from './src/screens/PrivacySetting';
import Terms from './src/screens/Terms';
import Faq from './src/screens/Faq';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import PhotoRestoration from './src/screens/PhotoRestoration';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Gradient background for tab bar
function MyTabBarBackground() {
  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

// SafeArea Wrapper for Screens
function ScreenWrapper({ children }) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#0d1117' }}
      edges={['top', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
}

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FaceEnhancement" component={FaceEnhancement} />
      <Stack.Screen name="TextToImage" component={TextToImage} />
      <Stack.Screen name="TextToImageDiffusion" component={TextToImageDiffusion} />
      <Stack.Screen name="BackgroundRemoval" component={BackgroundRemoval} />
      <Stack.Screen name="FaceToImage" component={FaceToImage} />
      <Stack.Screen name="SuperResolution" component={SuperResolution} />
      <Stack.Screen name="GhiblifyScreen" component={GhiblifyScreen} />
      <Stack.Screen name="BwColourization" component={BwColourization} />
      <Stack.Screen name="PhotoRestoration" component={PhotoRestoration} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Ghibli Stack
function GhibliStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GhiblifyScreen" component={GhiblifyScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacySetting" component={PrivacySetting} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Faq" component={Faq} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main Tabs with Safe Area
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarBackground: () => <MyTabBarBackground />,
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#d1d1d1',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 10,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'GhibliTab') iconName = focused ? 'sparkles' : 'sparkles-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeTab', state: { routes: [{ name: 'Home' }] } }],
            });
          },
        })}
      />

      <Tab.Screen
        name="GhibliTab"
        component={GhibliStack}
        options={{ title: 'Ghibli' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'GhibliTab', state: { routes: [{ name: 'GhiblifyScreen' }] } }],
            });
          },
        })}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'ProfileTab', state: { routes: [{ name: 'Profile' }] } }],
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <ScreenWrapper>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </ScreenWrapper>
    </SafeAreaProvider>
  );
}

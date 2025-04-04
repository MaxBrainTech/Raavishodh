import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/Homescreen';
import FaceEnhancement from './src/screens/FaceEnhancement';
import TextToImage from './src/screens/TextToImage'
import TextToImageDiffusion from './src/screens/TextToImageDiffusion'
import BackgroundRemoval from './src/screens/BackgroundRemoval'
import FaceToImage from './src/screens/FaceToImage'
import SuperResolution from './src/screens/SuperResolution'

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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

 </Stack.Navigator>
    </NavigationContainer>
  );
}
  
import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth  } from '../services/Firebase';
import LinearGradient from "react-native-linear-gradient";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
    signInWithEmailAndPassword,GoogleAuthProvider,signInWithCredential,
    sendPasswordResetEmail, getAuth, updateProfile
  } from 'firebase/auth';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(false);
    const route = useRoute();
  
    const { redirectTo } = route.params || {};
  
    useEffect(() => {
    GoogleSignin.configure({
      webClientId: '355264972279-u17sv9oe918lj76stnimc1sm9kqs31k8.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async userCredential => {
        const user = userCredential.user;
  
        if (!user.displayName || user.displayName.trim() === '') {
          await updateProfile(user, {});
        }
  
        Alert.alert('Login Success', `Welcome, ${user.displayName || 'User'}!`);
        setUser(user);
        await AsyncStorage.setItem("isLoggedIn", "true");
  
        const redirectTo = route.params?.redirectTo;
   console.log("RedirectTo:", redirectTo);

      setTimeout(() => {
        if (redirectTo) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }, { name: redirectTo, params: { resumeAction: true } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      }, 100);
    })
      .catch(error => {
        const message = error?.message || 'Something went wrong';
        Alert.alert('Login Failed', message);
      });
  };
  
  
    const onGoogleButtonPress = async () => {
      try {
        await GoogleSignin.signOut();
      
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
       
        const signInResult = await GoogleSignin.signIn();
         let idToken = signInResult.data?.idToken || signInResult.idToken;
       
    
        if (!idToken) {
          throw new Error('No ID token found');
        }
    
      const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    await AsyncStorage.setItem("isLoggedIn", "true");

    Alert.alert('Login Success', `Welcome, ${user.displayName || 'User'}!`);

    const redirectTo = route.params?.redirectTo;
    console.log("RedirectTo:", redirectTo);

    setTimeout(() => {
      if (redirectTo) {
        navigation.navigate(redirectTo, { resumeAction: true });
      } else {
        navigation.navigate("HomeTab");
      }
    }, 100);
       
      } catch (error) {
        console.error('Google Sign-In error:', error);
      }
    };
    
    const handleForgotPassword = () => {
      if (!email) {
        Alert.alert('Input Required', 'Please enter your email to reset password.');
        return;
      }
  
      sendPasswordResetEmail(auth, email)
        .then(() => {
          Alert.alert('Reset Email Sent', 'Check your inbox to reset your password.');
        })
        .catch(error => {
          const message = error?.message || 'Something went wrong';
          Alert.alert('Error', message);
        });
    };

    return (
        <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
            <View style={styles.container}>
                <Text style={styles.title}>Sign In</Text>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input} />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    style={styles.input} />

                <TouchableOpacity style={styles.button}
                    onPress={handleLogin} >
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={onGoogleButtonPress}>
                    <Text style={styles.buttonText}>Log In with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.link}>Don't have an account? Signup</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

            </View>
        </LinearGradient>
    );
}
const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#6a11cb',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 30,
        textAlign: 'center',
        color: '#fff'
    },
    link: {
        color: '#fff',
        marginTop: 20,
        textAlign: 'center',
    },
    forgotText: {
        color: '#fff',
        textAlign: 'right',
        marginTop: 20,
        textDecorationLine: 'underline',
    }

});

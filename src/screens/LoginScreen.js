import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth } from '../services/Firebase';
import LinearGradient from 'react-native-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import AlertModal
import AlertModal from '../component/modals/AlertModal';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ visible: false, message: '' });
  const route = useRoute();
  const { redirectTo } = route.params || {};

  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: '' });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '282300022667-cbrqnv08k30j5bglc4pfjchesop925fk.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // Check if already logged in
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        if (redirectTo) {
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo, params: { resumeAction: true } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeTab' }],
          });
        }
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.displayName || user.displayName.trim() === '') {
        await updateProfile(user, {});
      }

      await AsyncStorage.setItem('isLoggedIn', 'true');
      showAlert(`Welcome, ${user.displayName || 'User'}!`);

      // Navigate after small delay so alert is visible
      setTimeout(() => {
        if (redirectTo) {
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo, params: { resumeAction: true } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeTab' }],
          });
        }
      }, 800);
    } catch (error) {
      showAlert(error.message || 'Something went wrong during login.');
      console.error('Email/Password Login Error:', error);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.idToken || signInResult?.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      await AsyncStorage.setItem('isLoggedIn', 'true');
      showAlert(`Welcome, ${user.displayName || 'User'}!`);

      setTimeout(() => {
        if (redirectTo) {
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo, params: { resumeAction: true } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeTab' }],
          });
        }
      }, 800);
    } catch (error) {
      showAlert(error.message || 'Google Sign-In failed.');
      console.error('Google Sign-In error:', error);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      showAlert('Please enter your email to reset password.');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        showAlert('Reset Email Sent. Check your inbox.');
      })
      .catch((error) => {
        showAlert(error?.message || 'Something went wrong while sending reset email.');
        console.error('Reset Password Error:', error);
      });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0d1117', '#8ec5fc']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0d1117', '#8ec5fc']} style={styles.gradient}>
      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        onClose={hideAlert}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
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
    color: '#fff',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

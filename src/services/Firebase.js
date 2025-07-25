import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD1l1Kkj2WV6Enil9VNHsuisQvPPWvcoOA",
  authDomain: "raavishodh-d9591.firebaseapp.com",
  projectId: "raavishodh-d9591",
  storageBucket: "raavishodh-d9591.firebasestorage.app",
  messagingSenderId: "282300022667",
  appId: "1:282300022667:web:0ec8b0413ad9ea3d64798e",
  measurementId: "G-0GKNFZF6RF"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];


let auth;

try {
 auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  }
 catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
   throw error; 
  }
}

export { auth };

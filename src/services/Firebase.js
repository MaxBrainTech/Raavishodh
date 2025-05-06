import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig ={ 
    apiKey: "AIzaSyCc8ewgMJMlrz16lwPxk4tXaPQdSxspLPc",
    authDomain: "airaavishodh-11ccc.firebaseapp.com",
    projectId: "airaavishodh-11ccc",
    storageBucket: "airaavishodh-11ccc.firebasestorage.app",
    messagingSenderId: "355264972279",
    appId: "1:355264972279:web:79810c8375f65e4afddaf2",
    measurementId: "G-LENKJZLJR3"
}
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };
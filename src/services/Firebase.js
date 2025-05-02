import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig ={ 
    apiKey: "AIzaSyCc8ewgMJMlrz16lwPxk4tXaPQdSxspLPc",
    authDomain: "airaavishodh-11ccc.firebaseapp.com",
    projectId: "airaavishodh-11ccc",
    storageBucket: "airaavishodh-11ccc.firebasestorage.app",
    messagingSenderId: "355264972279",
    appId: "1:355264972279:web:79810c8375f65e4afddaf2",
    measurementId: "G-LENKJZLJR3"
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth,GoogleAuthProvider };
import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import LinearGradient from "react-native-linear-gradient";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(false);
    
    const route = useRoute();
     const { redirectTo } = route.params || {};


   useEffect(() =>{
    GoogleSignin.configure({
        webClientId:"741257638758-h38aq37042j37tt82sf7jss3envtid8o.apps.googleusercontent.com",
    })
   },[]);

    const handleLogin = () => {
        auth()
        .signInWithEmailAndPassword( email, password)
            .then(userCredential => {
                Alert.alert('Login Success');
                setUser(userCredential.user);
                if (redirectTo) {
                    navigation.replace(redirectTo);
                } else {
                    navigation.navigate("Home");
                }
                
            })
            .catch(error => {
                const message = error?.message || 'Something went wrong';
                Alert.alert('Login Failed', message);
            });
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            const userCredential = await auth().signInWithCredential(googleCredential);
            Alert.alert('Login Success');
            setUser(userCredential.user);

        if (redirectTo) {
            navigation.navigate(redirectTo);
        } else {
            navigation.navigate('Home');
        }
        } catch (error) {
            console.log('Google Sign-In error:', error);
            const message = error?.message || 'Google Sign-In failed';
            Alert.alert('Login Failed', message);
        }
    };

    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert('Input Required', 'Please enter your email to reset password.');
            return;
        }
    
        auth()
            .sendPasswordResetEmail(email)
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

            <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
                    <Text style={styles.buttonText}>Log In with Google</Text>
                </TouchableOpacity>

             <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
        color:'#fff'
      },
      link: {
        color: '#fff',
        marginTop: 20,
        textAlign: 'center',
      },
      forgotText: {
        color: '#fff',
        textAlign: 'right',
        marginBottom: 10,
        textDecorationLine: 'underline',
    }
    
});

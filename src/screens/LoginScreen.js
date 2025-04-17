import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import auth from "@react-native-firebase/auth";
import LinearGradient from "react-native-linear-gradient";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        auth()
        .signInWithEmailAndPassword( email, password)
            .then(userCredential => {
                Alert.alert('Login Success');
                navigation.navigate('ProfileScreen');
            })
            .catch(error => {
                const message = error?.message || 'Something went wrong';
                Alert.alert('Login Failed', error.message);
            });
    };

    return (
        <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
        <View style={styles.container}>
             <Text style={styles.title}>Sign In</Text>

            <TextInput
                placeholder="Email"
                onChangeText={setEmail}
                style={styles.input} />

            <TextInput
                placeholder="Password"
                onChangeText={setPassword} secureTextEntry
                style={styles.input} />

            <TouchableOpacity style={styles.button}
                onPress={handleLogin} >
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

             <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.link}>Don't have an account? Signup</Text>
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
});

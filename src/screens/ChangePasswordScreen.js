import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { auth } from '../services/Firebase';
import LinearGradient from 'react-native-linear-gradient';

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const reauthenticate = async (currentPassword) => {
    const user = auth.currentUser;
    const cred = auth.EmailAuthProvider.credential(user.email, currentPassword);
    return await user.reauthenticateWithCredential(cred);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      await reauthenticate(currentPassword);
      await auth.currentUser.updatePassword(newPassword);
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Change Password</Text>

        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
          secureTextEntry
          placeholder="Current Password"
          placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
          secureTextEntry
          placeholder="New Password"
          placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
          secureTextEntry
          placeholder="Confirm New Password"
          placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

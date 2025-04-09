import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

export default function EditProfileScreen({ route, navigation }) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Get the current name and email from route params if passed
  const { currentName = 'John Doe', currentEmail = 'john.doe@example.com', onSave } = route.params || {};

  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);

  const handleSave = () => {
    if (onSave) {
      onSave({ updatedName: name, updatedEmail: email });
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      
      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Name</Text>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ccc' }]}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
      />

      <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Email</Text>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ccc' }]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Enter your email"
        placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginTop: 40,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

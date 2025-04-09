import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, useColorScheme, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';


export default function ProfileScreen() {
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150');

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setAvatar(response.assets[0].uri);
      }
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Saved', 'Profile updated successfully!');
  };

  function handleLogout() {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <Animated.View style={styles.profileContainer} entering={FadeInRight.duration(800)}>
        <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {isEditing && (
            <View style={styles.editPhotoOverlay}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <>
            <TextInput
              style={[styles.input, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#666' : '#ccc' }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter Name"
              placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#666' : '#ccc' }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
              placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{name}</Text>
            <Text style={styles.email}>{email}</Text>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={20} color="#007bff" />
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      <View style={styles.optionsContainer}>
        <OptionItem title="Change Password" icon="lock-closed-outline" isDarkMode={isDarkMode} />
        <OptionItem title="Notifications" icon="notifications-outline" isDarkMode={isDarkMode} />
        <OptionItem title="Privacy Policy" 
        icon="shield-checkmark-outline" isDarkMode={isDarkMode}
        onPress={() => navigation.navigate('PrivacySetting')} />
        <OptionItem title="Terms " 
        icon="shield-checkmark-outline" isDarkMode={isDarkMode}
        onPress={() => navigation.navigate('Terms')} />
        <OptionItem title="Cookies " 
        icon="shield-checkmark-outline" isDarkMode={isDarkMode}
        onPress={() => navigation.navigate('Cookies')} />
        <OptionItem title="Faq " 
        icon="shield-checkmark-outline" isDarkMode={isDarkMode}
        onPress={() => navigation.navigate('Faq')} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const OptionItem = ({ title, icon, isDarkMode, onPress }) => {
  return (
    <Animated.View entering={FadeInRight.duration(500)}>
      <TouchableOpacity style={styles.optionItem} onPress={onPress}>
        <Ionicons
          name={icon}
          size={24}
          color={isDarkMode ? '#fff' : '#000'}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
    color: 'gray',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007bff',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    marginTop: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

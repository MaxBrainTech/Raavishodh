import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, useColorScheme, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";
import  {auth}  from '../services/Firebase';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [user, setUser] = useState(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || 'john.doe@example.com');
        setName(currentUser.displayName || 'Guest');
        setAvatar(currentUser.photoURL || 'https://i.pravatar.cc/150');
      } else {
        setUser(null);
        setName('Guest'); 
        setEmail('john.doe@example.com'); 
        setAvatar('https://i.pravatar.cc/150');  
      }
    });
  
    return unsubscribe; 
  }, []);
  

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',style: 'cancel'},
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await auth.signOut();
              console.log('User logged out successfully');

              setUser(null);   
              setName('');    
              setEmail('');    
             

              navigation.replace('Profile'); 
            } catch (error) {
              console.log('Logout Error:', error.message);
              Alert.alert('Logout Error', error.message);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
    <ScrollView contentContainerStyle={styles.container}>
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
  <OptionItem title="Change Password" 
  icon="lock-closed-outline" isDarkMode={isDarkMode} />
  <OptionItem title="Notifications" 
  icon="notifications-outline" isDarkMode={isDarkMode} />
  <OptionItem title="Privacy Policy" 
  icon="shield-checkmark-outline" isDarkMode={isDarkMode}
  onPress={() => navigation.navigate('PrivacySetting')} />
  <OptionItem title="Terms " 
  icon="shield-checkmark-outline" isDarkMode={isDarkMode}
  onPress={() => navigation.navigate('Terms')} />
  <OptionItem title="Faq " 
  icon="shield-checkmark-outline" isDarkMode={isDarkMode}
  onPress={() => navigation.navigate('Faq')} />
  <OptionItem title="LogIn " 
  icon="shield-checkmark-outline" isDarkMode={isDarkMode}
  onPress={() => navigation.navigate('Login')} />
</View>

{auth.currentUser && (
  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
)}

    </ScrollView>
    </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  profileContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    backdropFilter: 'blur(10px)',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 15,
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 5,
    color: '#fff',
  },
  email: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 15,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#60a5fa',
  },
  optionsContainer: {
    gap: 15,
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    backdropFilter: 'blur(5px)',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});





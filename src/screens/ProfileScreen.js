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
  backgroundColor: '#6a11cb',
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





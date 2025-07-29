import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInRight, ZoomIn } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { auth } from '../services/Firebase';

// Modals
import AlertModal from '../component/modals/AlertModal';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [user, setUser] = useState(null);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150');

  // Alert Modal (info)
  const [alertModal, setAlertModal] = useState({ visible: false, message: '' });
  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: '' });

  // Confirm Logout Modal
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || 'john.doe@example.com');
        setName(currentUser.displayName || 'Guest');

        if (currentUser.photoURL) {
          setAvatar(currentUser.photoURL);
        } else {
          const randomSeed = Math.random().toString(36).substring(7);
          setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
        }
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
        showAlert('Image Picker Error: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setAvatar(response.assets[0].uri);
      }
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    showAlert('Profile updated successfully!');
  };

  /** Confirm logout */
  const confirmLogout = () => setConfirmVisible(true);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setName('');
      setEmail('');
      navigation.replace('Profile');
      showAlert('Logged out successfully!');
    } catch (error) {
      showAlert(error.message || 'Logout failed. Please try again.');
    } finally {
      setConfirmVisible(false);
    }
  };

  return (
    <LinearGradient colors={['#0d1117', '#8ec5fc']} style={styles.gradient}>
      {/* Info Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        onClose={hideAlert}
      />

      {/* Confirm Logout Modal */}
      {confirmVisible && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Are you sure you want to logout?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#6B7280' }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.confirmBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleLogout}
              >
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={styles.profileContainer} entering={FadeInRight.duration(800)}>
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Image source={{ uri: 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            )}
            {isEditing && (
              <View style={styles.editPhotoOverlay}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <>
              <TextInput
                style={[
                  styles.input,
                  { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#666' : '#ccc' },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter Name"
                placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
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
          <OptionItem
            title="Change Password"
            icon="lock-closed-outline"
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('ChangePasswordScreen')}
          />
          <OptionItem
            title="Privacy Policy"
            icon="shield-checkmark-outline"
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('PrivacySetting')}
          />
          <OptionItem
            title="Terms"
            icon="shield-checkmark-outline"
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('Terms')}
          />
          <OptionItem
            title="Faq"
            icon="shield-checkmark-outline"
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('Faq')}
          />
        </View>

        <View style={styles.topRightContainer}>
          {auth.currentUser ? (
            <TouchableOpacity onPress={confirmLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Ionicons name="person-circle-outline" size={40} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const OptionItem = ({ title, icon, isDarkMode, onPress }) => {
  return (
    <Animated.View entering={ZoomIn.duration(2000)}>
      <TouchableOpacity style={styles.optionItem} onPress={onPress}>
        <Ionicons
          name={icon}
          size={24}
          color={isDarkMode ? '#fff' : '#38BDF8'}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#fff' }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  topRightContainer: { position: 'absolute', top: 30, right: 30, zIndex: 10 },
  profileContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: '#fff', marginBottom: 15 },
  editPhotoOverlay: { position: 'absolute', bottom: 0, right: 5, backgroundColor: '#007bff', borderRadius: 20, padding: 6 },
  name: { fontSize: 26, fontWeight: '700', marginBottom: 5, color: '#fff' },
  email: { fontSize: 15, color: '#ccc', marginBottom: 15 },
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
  saveButton: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30, marginTop: 10 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  editButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  editText: { marginLeft: 5, fontSize: 16, color: '#60a5fa' },
  optionsContainer: { gap: 15, marginTop: 10 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  optionIcon: { marginRight: 15, backgroundColor: '#BBBBBB', borderRadius: 100, padding: 5 },
  optionText: { fontSize: 14, fontWeight: '500' },

  // Confirm Modal
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  confirmBox: {
    width: '80%',
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  confirmText: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 20 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 15 },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

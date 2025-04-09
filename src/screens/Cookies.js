// CookiePolicyScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CookiePolicyScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Cookie Policy</Text>
        <Text style={[styles.subText, { color: isDarkMode ? '#aaa' : '#555' }]}>Last updated: February 20, 2025</Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>What Are Cookies</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
          They help us provide you with a better experience and understand how you use our service.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Types of Cookies We Use</Text>
        
        <Text style={[styles.sectionSubTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Essential Cookies</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          Required for the operation of our website. They enable basic functions like page navigation and access to secure areas.
        </Text>

        <Text style={[styles.sectionSubTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Analytical Cookies</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          Help us understand how visitors interact with our website by collecting and reporting information anonymously.
        </Text>

        <Text style={[styles.sectionSubTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Functional Cookies</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          Enable enhanced functionality and personalization, such as remembering your preferences and settings.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Managing Cookies</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Updates to This Policy</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          We may update this Cookie Policy to reflect changes in our practices. We will notify you of any significant changes.
        </Text>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Contact Us</Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          If you have questions about our use of cookies, please contact us at:{'\n'}
          Email: vikasgdjp@gmail.com
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionSubTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

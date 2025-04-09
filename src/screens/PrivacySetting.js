// PrivacySettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, { color: isDarkMode ? '#aaa' : '#555' }]}>
          Last updated: February 20, 2025
        </Text>

        <Section title="Introduction" isDarkMode={isDarkMode}>
          We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your information when you use our AI image enhancement services.
        </Section>

        <Section title="Information We Collect" isDarkMode={isDarkMode}>
          • Images you upload for processing{'\n'}
          • Usage data and interaction with our services{'\n'}
          • Technical data including IP address and browser information{'\n'}
          • Account information if you choose to register
        </Section>

        <Section title="How We Use Your Information" isDarkMode={isDarkMode}>
          • To provide and improve our AI image enhancement services{'\n'}
          • To process your requests and transactions{'\n'}
          • To communicate with you about our services{'\n'}
          • To maintain the security of our platform
        </Section>

        <Section title="Data Storage and Security" isDarkMode={isDarkMode}>
          We implement appropriate technical and organizational measures to protect your data. Your images and personal information are stored securely and processed using industry-standard encryption.
        </Section>

        <Section title="Your Rights" isDarkMode={isDarkMode}>
          You have the right to:{'\n'}
          • Access your personal data{'\n'}
          • Correct inaccurate data{'\n'}
          • Request deletion of your data{'\n'}
          • Object to processing of your data{'\n'}
          • Request transfer of your data
        </Section>

        <Section title="Contact Us" isDarkMode={isDarkMode}>
          If you have any questions about this Privacy Policy or our data practices, please contact us at:{'\n\n'}
          Email: vikasgdjp@gmail.com{'\n'}
          Address: MaxAIeditor, Jaipur (India)
        </Section>

        
      </ScrollView>
    </View>
  );
}

function Section({ title, children, isDarkMode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{title}</Text>
      <Text style={[styles.sectionContent, { color: isDarkMode ? '#ccc' : '#333' }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
